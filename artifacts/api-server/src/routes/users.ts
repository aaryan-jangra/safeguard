import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterUserBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.post("/users/register", async (req, res) => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { name, deviceId, phone } = parsed.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.deviceId, deviceId))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(usersTable)
      .set({ name, phone: phone ?? null })
      .where(eq(usersTable.deviceId, deviceId))
      .returning();
    res.json(updated);
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({ id: randomUUID(), name, deviceId, phone: phone ?? null })
    .returning();
  res.json(user);
});

router.get("/users/me", async (req, res) => {
  const users = await db.select().from(usersTable).limit(1);
  if (users.length === 0) {
    res.status(404).json({ error: "No user registered" });
    return;
  }
  res.json(users[0]);
});

export default router;
