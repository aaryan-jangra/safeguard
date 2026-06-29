import { Router } from "express";
import { db, recordingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateRecordingBody, GetRecordingParams } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.get("/recordings", async (_req, res) => {
  const rows = await db
    .select()
    .from(recordingsTable)
    .orderBy(desc(recordingsTable.createdAt));
  res.json(rows);
});

router.post("/recordings", async (req, res) => {
  const parsed = CreateRecordingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { alertId, filename, duration, size, url, thumbnailUrl } = parsed.data;
  const [rec] = await db
    .insert(recordingsTable)
    .values({
      id: randomUUID(),
      alertId,
      filename: filename ?? null,
      duration,
      size,
      url: url ?? null,
      thumbnailUrl: thumbnailUrl ?? null,
    })
    .returning();
  res.status(201).json(rec);
});

router.get("/recordings/:recordingId", async (req, res) => {
  const parsed = GetRecordingParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [rec] = await db
    .select()
    .from(recordingsTable)
    .where(eq(recordingsTable.id, parsed.data.recordingId))
    .limit(1);
  if (!rec) {
    res.status(404).json({ error: "Recording not found" });
    return;
  }
  res.json(rec);
});

export default router;
