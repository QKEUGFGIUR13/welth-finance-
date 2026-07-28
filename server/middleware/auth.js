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

export async function ensureUser(clerkUserId) {
  const existing = await db.user.findUnique({
    where: { clerkUserId },
  });
  if (existing) return existing;

  const user = await clerk.users.getUser(clerkUserId);
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const email = user.emailAddresses[0]?.emailAddress;

  try {
    return await db.user.create({
      data: {
        clerkUserId: user.id,
        name: name || null,
        imageUrl: user.imageUrl,
        email,
      },
    });
  } catch (err) {
    if (err.code !== "P2002") throw err;

    // A page load fires several requests at once, so they can race to create
    // the same user. Whoever loses the race reads the winner's row.
    const raced = await db.user.findUnique({ where: { clerkUserId } });
    if (raced) return raced;

    // Otherwise the email is already taken by a row from a previous Clerk
    // instance. It's the same person, so move their data to the new identity.
    if (!email) throw err;
    return db.user.update({
      where: { email },
      data: { clerkUserId: user.id, name: name || null, imageUrl: user.imageUrl },
    });
  }
}
