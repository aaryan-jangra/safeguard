import { Router } from "express";
import { db, locationsTable } from "@workspace/db";
import { desc, gte } from "drizzle-orm";
import { UpdateLocationBody, GetLocationHistoryQueryParams } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.post("/location", async (req, res) => {
  const parsed = UpdateLocationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { latitude, longitude, accuracy, altitude, speed, heading } = parsed.data;
  const [loc] = await db
    .insert(locationsTable)
    .values({
      id: randomUUID(),
      latitude,
      longitude,
      accuracy: accuracy ?? null,
      altitude: altitude ?? null,
      speed: speed ?? null,
      heading: heading ?? null,
    })
    .returning();
  res.status(201).json(loc);
});

router.get("/location/latest", async (_req, res) => {
  const [latest] = await db
    .select()
    .from(locationsTable)
    .orderBy(desc(locationsTable.timestamp))
    .limit(1);
  if (!latest) {
    res.status(404).json({ error: "No location data" });
    return;
  }
  res.json(latest);
});

router.get("/location/history", async (req, res) => {
  const parsed = GetLocationHistoryQueryParams.safeParse(req.query);
  const hours = parsed.success && parsed.data.hours != null ? parsed.data.hours : 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const records = await db
    .select()
    .from(locationsTable)
    .where(gte(locationsTable.timestamp, since))
    .orderBy(desc(locationsTable.timestamp));
  res.json(records);
});

export default router;
