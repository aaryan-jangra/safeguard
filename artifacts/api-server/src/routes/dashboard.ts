import { Router } from "express";
import { db, alertsTable, locationsTable, recordingsTable } from "@workspace/db";
import { eq, count, desc, sql, gte } from "drizzle-orm";
import { GetRecentActivityQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const [totalAlertsRow] = await db.select({ count: count() }).from(alertsTable);
  const [activeAlertsRow] = await db
    .select({ count: count() })
    .from(alertsTable)
    .where(eq(alertsTable.status, "active"));
  const [resolvedAlertsRow] = await db
    .select({ count: count() })
    .from(alertsTable)
    .where(eq(alertsTable.status, "resolved"));
  const [totalRecordingsRow] = await db.select({ count: count() }).from(recordingsTable);

  const [latestLocation] = await db
    .select()
    .from(locationsTable)
    .orderBy(desc(locationsTable.timestamp))
    .limit(1);

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const isTracking = latestLocation
    ? latestLocation.timestamp > fiveMinutesAgo
    : false;

  res.json({
    totalAlerts: Number(totalAlertsRow?.count ?? 0),
    activeAlerts: Number(activeAlertsRow?.count ?? 0),
    resolvedAlerts: Number(resolvedAlertsRow?.count ?? 0),
    totalRecordings: Number(totalRecordingsRow?.count ?? 0),
    isTracking,
    lastSeenAt: latestLocation?.timestamp ?? new Date().toISOString(),
    lastLocation: latestLocation ?? null,
  });
});

router.get("/dashboard/recent-activity", async (req, res) => {
  const parsed = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = parsed.success && parsed.data.limit != null ? parsed.data.limit : 20;

  const recentAlerts = await db
    .select()
    .from(alertsTable)
    .orderBy(desc(alertsTable.timestamp))
    .limit(limit);

  const recentLocations = await db
    .select()
    .from(locationsTable)
    .orderBy(desc(locationsTable.timestamp))
    .limit(Math.ceil(limit / 2));

  const recentRecordings = await db
    .select()
    .from(recordingsTable)
    .orderBy(desc(recordingsTable.createdAt))
    .limit(Math.ceil(limit / 4));

  type ActivityItem = {
    id: string;
    type: "alert" | "location" | "recording";
    description: string;
    latitude?: number | null;
    longitude?: number | null;
    alertType?: string | null;
    timestamp: Date;
  };

  const items: ActivityItem[] = [
    ...recentAlerts.map((a) => ({
      id: a.id,
      type: "alert" as const,
      description: `${a.type.toUpperCase()} alert triggered`,
      latitude: a.latitude,
      longitude: a.longitude,
      alertType: a.type,
      timestamp: a.timestamp,
    })),
    ...recentLocations.map((l) => ({
      id: l.id,
      type: "location" as const,
      description: `Location ping at ${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)}`,
      latitude: l.latitude,
      longitude: l.longitude,
      alertType: null,
      timestamp: l.timestamp,
    })),
    ...recentRecordings.map((r) => ({
      id: r.id,
      type: "recording" as const,
      description: `Video recording — ${Math.floor(r.duration / 60)}m ${r.duration % 60}s`,
      latitude: null,
      longitude: null,
      alertType: null,
      timestamp: r.createdAt,
    })),
  ];

  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  res.json(items.slice(0, limit));
});

export default router;
