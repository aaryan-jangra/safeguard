import { z } from "zod";

/* Health */

export const HealthCheckResponse = z.object({
  status: z.string(),
});

/* Users */

export const RegisterUserBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

/* Contacts */

export const CreateContactBody = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  relationship: z.string().optional(),
});

export const DeleteContactParams = z.object({
  contactId: z.string(),
});

/* Alerts */

export const TriggerAlertBody = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  type: z.enum(["sos", "fall", "tamper", "manual"]).optional(),
  message: z.string().optional(),
});

export const UpdateAlertBody = z.object({
  status: z.enum(["active", "resolved"]).optional(),
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
});

export const GetLocationHistoryQueryParams = z.object({
  userId: z.string().optional(),
  limit: z.coerce.number().optional(),
});

/* Recordings */

export const CreateRecordingBody = z.object({
  alertId: z.string().optional(),
  url: z.string().optional(),
});

export const GetRecordingParams = z.object({
  id: z.string(),
});