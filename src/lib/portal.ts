import { db } from "./db";
import { serialize } from "./utils";
import type { User, Prisma } from "@prisma/client";
export async function loadPortal(user: User) {
  const admin = user.role === "ADMIN";
  const investor = user.role === "INVESTOR";
  const projectWhere: Prisma.ProjectWhereInput = admin
    ? {}
    : user.role === "NELAYAN"
      ? { ownerId: user.id }
      : { offering: { publishedAt: { not: null } } };
  const offerings = await db.offering.findMany({
    where: investor
      ? { publishedAt: { not: null } }
      : { project: projectWhere },
    include: {
      project: {
        include: {
          cooperative: true,
          scores: { orderBy: { createdAt: "desc" }, take: 1 },
          owner: { select: { id: true, name: true } },
        },
      },
      prospectuses: { orderBy: { version: "desc" } },
      agreement: { include: { stages: { orderBy: { number: "asc" } } } },
    },
    orderBy: { createdAt: "asc" },
  });
  const projects = investor
    ? []
    : await db.project.findMany({
        where: projectWhere,
        include: {
          cooperative: true,
          owner: { select: { id: true, name: true } },
          scores: { orderBy: { createdAt: "desc" }, take: 1 },
          documents: { select: { id: true, name: true, kind: true } },
          reports: {
            include: {
              documents: { select: { id: true, name: true } },
              distributions: true,
            },
            orderBy: { createdAt: "desc" },
          },
          offering: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
      });
  const wallet = await db.account.findFirst({ where: { userId: user.id } });
  const transactions = await db.journal.findMany({
    where: admin
      ? {}
      : { lines: { some: { accountId: wallet?.id ?? "none" } } },
    include: {
      lines: {
        select: {
          amount: true,
          accountId: true,
          account: { select: { kind: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const orders = investor
    ? await db.subscription.findMany({
        where: { investorId: user.id },
        include: {
          offering: {
            include: {
              project: { select: { title: true, category: true } },
              agreement: { include: { distributions: true } },
            },
          },
        },
        orderBy: { acceptedAt: "desc" },
      })
    : [];
  const kyc = await db.kycCase.findUnique({ where: { userId: user.id } });
  const kycQueue = admin
    ? await db.kycCase.findMany({
        where: { status: { in: ["DIAJUKAN", "PERLU_PERBAIKAN"] } },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
              documents: {
                where: { kind: "KYC" },
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];
  const alerts = await db.securityAlert.findMany({
    where: admin ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const audits = await db.audit.findMany({
    where: admin ? {} : { actorId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const assignments = await db.assignment.findMany({
    where: admin
      ? {}
      : { fisherId: user.id, active: true },
    include: {
      fisher: {
        select: { id: true, name: true, location: true, verified: true },
      },
      facilitator: { select: { id: true, name: true } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  const cooperatives = await db.cooperative.findMany({
    where: {
      active: true,
      ...(user.role === "NELAYAN"
        ? { memberships: { some: { userId: user.id, active: true } } }
        : {}),
    },
    select: { id: true, name: true },
  });
  const people = admin
    ? await db.user.findMany({
        where: {
          OR: [{ role: "NELAYAN" }, { role: "ADMIN", locked: false }],
        },
        select: { id: true, name: true, role: true },
      })
    : [];
  const documents = await db.document.findMany({
    where: { ownerId: user.id, kind: "KYC" },
    select: { id: true, name: true },
  });
  return serialize({
    now: new Date(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
      locked: user.locked,
      location: user.location,
      kusuka: user.kusuka,
    },
    wallet,
    offerings,
    projects,
    orders,
    transactions,
    kyc,
    kycQueue,
    alerts,
    audits,
    assignments,
    cooperatives,
    people,
    documents,
  });
}
export type PortalData = Awaited<ReturnType<typeof loadPortal>>;
