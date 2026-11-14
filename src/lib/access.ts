import { auth } from "@/auth";
import { db } from "./db";
import { ensure } from "./domain";
import type { Role, User, Project } from "@prisma/client";
export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  return user?.role === "ADMIN" && user.locked ? null : user;
}
export function requireRole(user: User, ...roles: Role[]) {
  ensure(roles.includes(user.role), "Anda tidak memiliki akses.", 403);
}
export function ownsProject(user: User, project: Project) {
  return (
    user.role === "ADMIN" ||
    project.ownerId === user.id
  );
}
