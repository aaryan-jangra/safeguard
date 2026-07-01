import { z } from "zod";

/* Health */

export const HealthCheckResponse = z.object({
  status: z.string(),
});

/* Users */

export const RegisterUserBody = z.object({
  name: z.string().min(1),
  deviceId: z.string().min(1),
  phone: z.string().optional(),
});

/* Contacts */

export const CreateContactBody = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  relationship: z.string().min(1),
});

export const DeleteContactParams = z.object({
  contactId: z.string(),
});

/* Alerts */

export const TriggerAlertBody = z.object({
  latitude: z.number(),
  longitude: z.number(),
  type: z.enum(["sos", "fall", "tamper", "manual"]),
  message: z.string().optional(),
});

export const UpdateAlertBody = z.object({
  status: z.enum(["active", "resolved"]),
});

export const UpdateAlertParams = z.object({
  alertId: z.string(),
});

export const GetAlertParams = z.object({
  alertId: z.string(),
});

export const GetAlertsQueryParams = z.object({
  status: z.enum(["active", "resolved", "all"]).optional(),
  userId: z.string().optional(),
});

/* Dashboard */

export const GetRecentActivityQueryParams = z.object({
  limit: z.coerce.number().optional(),
});

/* Location */

export const UpdateLocationBody = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
});

export const GetLocationHistoryQueryParams = z.object({
  hours: z.coerce.number().optional(),
  userId: z.string().optional(),
  limit: z.coerce.number().optional(),
});

/* Recordings */

export const CreateRecordingBody = z.object({
  alertId: z.string(),
  filename: z.string().optional(),
  duration: z.number(),
  size: z.number(),
  url: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export const GetRecordingParams = z.object({
  recordingId: z.string(),
});
