import { Router } from "express";
import { db, contactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateContactBody, DeleteContactParams } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.get("/contacts", async (_req, res) => {
  const contacts = await db
    .select()
    .from(contactsTable)
    .orderBy(contactsTable.createdAt);
  res.json(contacts);
});

router.post("/contacts", async (req, res) => {
  const parsed = CreateContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { name, phone, email, relationship } = parsed.data;
  const [contact] = await db
    .insert(contactsTable)
    .values({ id: randomUUID(), name, phone, email: email ?? null, relationship })
    .returning();
  res.status(201).json(contact);
});

router.delete("/contacts/:contactId", async (req, res) => {
  const parsed = DeleteContactParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db.delete(contactsTable).where(eq(contactsTable.id, parsed.data.contactId));
  res.status(204).send();
});

export default router;
