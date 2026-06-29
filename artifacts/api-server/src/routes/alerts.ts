import { Router } from "express";
import { db, alertsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { TriggerAlertBody, UpdateAlertBody, UpdateAlertParams, GetAlertParams, GetAlertsQueryParams } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.get("/alerts", async (req, res) => {
  const parsed = GetAlertsQueryParams.safeParse(req.query);
  const status = parsed.success ? parsed.data.status ?? "all" : "all";

  let query = db.select().from(alertsTable).orderBy(desc(alertsTable.timestamp));
  if (status && status !== "all") {
    const rows = await db
      .select()
      .from(alertsTable)
      .where(eq(alertsTable.status, status as "active" | "resolved"))
      .orderBy(desc(alertsTable.timestamp));
    res.json(rows);
    return;
  }
  const rows = await query;
  res.json(rows);
});

router.post("/alerts", async (req, res) => {
  const parsed = TriggerAlertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { type, latitude, longitude, message } = parsed.data;
  const [alert] = await db
    .insert(alertsTable)
    .values({
      id: randomUUID(),
      type,
      status: "active",
      latitude,
      longitude,
      message: message ?? null,
    })
    .returning();
  res.status(201).json(alert);
});

router.get("/alerts/:alertId", async (req, res) => {
  const parsed = GetAlertParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [alert] = await db
    .select()
    .from(alertsTable)
    .where(eq(alertsTable.id, parsed.data.alertId))
    .limit(1);
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json(alert);
});

router.patch("/alerts/:alertId", async (req, res) => {
  const paramsParsed = UpdateAlertParams.safeParse(req.params);
  const bodyParsed = UpdateAlertBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { alertId } = paramsParsed.data;
  const { status } = bodyParsed.data;
  const resolvedAt = status === "resolved" ? new Date() : null;
  const [updated] = await db
    .update(alertsTable)
    .set({ status, resolvedAt })
    .where(eq(alertsTable.id, alertId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  res.json(updated);
});

export default router;
