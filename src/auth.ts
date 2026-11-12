import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: { signIn: "/masuk" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.email().transform((s) => s.toLowerCase()),
            password: z.string().min(8).max(128),
          })
          .safeParse(credentials);
        if (!parsed.success) return null;
        const key = "login:" + parsed.data.email;
        const rate = await db.rateLimit.upsert({
          where: { key },
          create: { key },
          update: { count: { increment: 1 } },
        });
        if (Date.now() - rate.windowStart.getTime() > 15 * 60 * 1000)
          await db.rateLimit.update({
            where: { key },
            data: { count: 1, windowStart: new Date() },
          });
        else if (rate.count > 20) return null;
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user || !(await compare(parsed.data.password, user.passwordHash)))
          return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const session = await db.authSession.create({
          data: {
            userId: user.id,
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
          },
        });
        token.sid = session.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.sid === "string") {
        const record = await db.authSession.findUnique({
          where: { id: token.sid },
        });
        if (record && record.expiresAt > new Date())
          session.user.id = record.userId;
        else session.user.id = "";
      } else session.user.id = "";
      return session;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && typeof message.token?.sid === "string")
        await db.authSession.deleteMany({ where: { id: message.token.sid } });
    },
  },
});
