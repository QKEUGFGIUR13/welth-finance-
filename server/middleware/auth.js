import { createClerkClient } from "@clerk/express";
import { db } from "../lib/prisma.js";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export function requireUserId(req, res, next) {
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function getDbUser(clerkUserId) {
  return db.user.findUnique({
    where: { clerkUserId },
  });
}

export async function ensureUser(clerkUserId) {
  const existing = await db.user.findUnique({
    where: { clerkUserId },
  });
  if (existing) return existing;

  const user = await clerk.users.getUser(clerkUserId);
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return db.user.create({
    data: {
      clerkUserId: user.id,
      name: name || null,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0]?.emailAddress,
    },
  });
}
