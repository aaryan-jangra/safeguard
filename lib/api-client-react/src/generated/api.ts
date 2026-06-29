// AUTO-GENERATED from openapi.yaml — do not edit manually
// Run `pnpm codegen` in lib/api-spec to regenerate

export type HealthStatus = { status: string };

export type User = {
  id: string;
  name: string;
  deviceId: string;
  phone?: string;
  createdAt: string;
};

export type RegisterUserRequest = {
  name: string;
  deviceId: string;
  phone?: string;
};

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  createdAt: string;
};

export type CreateContactRequest = {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
};

export type LocationUpdate = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
};

export type LocationRecord = {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
};

export type AlertType = "sos" | "fall" | "tamper" | "manual";
export type AlertStatus = "active" | "resolved";

export type Alert = {
  id: string;
  type: AlertType;
  status: AlertStatus;
  latitude: number;
  longitude: number;
  message?: string;
  resolvedAt?: string;
  timestamp: string;
};

export type TriggerAlertRequest = {
  type: AlertType;
  latitude: number;
  longitude: number;
  message?: string;
};

export type UpdateAlertRequest = { status: AlertStatus };

export type Recording = {
  id: string;
  alertId: string;
  filename?: string;
  duration: number;
  size: number;
  url?: string;
  thumbnailUrl?: string;
  createdAt: string;
};

export type CreateRecordingRequest = {
  alertId: string;
  filename?: string;
  duration: number;
  size: number;
  url?: string;
  thumbnailUrl?: string;
};

export type DashboardSummary = {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  totalRecordings: number;
  isTracking: boolean;
  lastSeenAt: string;
  lastLocation?: LocationRecord;
};

export type ActivityItemType = "alert" | "location" | "recording";

export type ActivityItem = {
  id: string;
  type: ActivityItemType;
  description: string;
  latitude?: number;
  longitude?: number;
  alertType?: string;
  timestamp: string;
};
