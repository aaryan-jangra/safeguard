// AUTO-GENERATED react-query hooks from openapi.yaml
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";
import type {
  HealthStatus, User, RegisterUserRequest, Contact, CreateContactRequest,
  LocationUpdate, LocationRecord, Alert, TriggerAlertRequest, UpdateAlertRequest,
  Recording, CreateRecordingRequest, DashboardSummary, ActivityItem,
} from "./api";

// ─── Query keys ────────────────────────────────────────────────────────────
export const getHealthCheckQueryKey = () => ["/api/healthz"] as const;
export const getMeQueryKey = () => ["/api/users/me"] as const;
export const getContactsQueryKey = () => ["/api/contacts"] as const;
export const getLatestLocationQueryKey = () => ["/api/location/latest"] as const;
export const getLocationHistoryQueryKey = (hours?: number) => ["/api/location/history", { hours }] as const;
export const getAlertsQueryKey = (status?: string) => ["/api/alerts", { status }] as const;
export const getAlertQueryKey = (alertId: string) => ["/api/alerts", alertId] as const;
export const getRecordingsQueryKey = () => ["/api/recordings"] as const;
export const getRecordingQueryKey = (recordingId: string) => ["/api/recordings", recordingId] as const;
export const getGetDashboardSummaryQueryKey = () => ["/api/dashboard/summary"] as const;
export const getGetRecentActivityQueryKey = (params?: { limit?: number }) => ["/api/dashboard/recent-activity", params] as const;

// ─── Health ────────────────────────────────────────────────────────────────
export function useHealthCheck(options?: UseQueryOptions<HealthStatus>) {
  return useQuery<HealthStatus>({
    queryKey: getHealthCheckQueryKey(),
    queryFn: () => customFetch<HealthStatus>("/api/healthz"),
    ...options,
  });
}

// ─── Users ────────────────────────────────────────────────────────────────
export function useGetMe(options?: UseQueryOptions<User>) {
  return useQuery<User>({
    queryKey: getMeQueryKey(),
    queryFn: () => customFetch<User>("/api/users/me"),
    ...options,
  });
}

export function useRegisterUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterUserRequest) =>
      customFetch<User>("/api/users/register", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getMeQueryKey() }),
  });
}

// ─── Contacts ─────────────────────────────────────────────────────────────
export function useGetContacts(options?: UseQueryOptions<Contact[]>) {
  return useQuery<Contact[]>({
    queryKey: getContactsQueryKey(),
    queryFn: () => customFetch<Contact[]>("/api/contacts"),
    ...options,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateContactRequest) =>
      customFetch<Contact>("/api/contacts", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getContactsQueryKey() }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) =>
      customFetch<void>(`/api/contacts/${contactId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getContactsQueryKey() }),
  });
}

// ─── Location ─────────────────────────────────────────────────────────────
export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LocationUpdate) =>
      customFetch<LocationRecord>("/api/location", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getLatestLocationQueryKey() });
      qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    },
  });
}

export function useGetLatestLocation(options?: UseQueryOptions<LocationRecord>) {
  return useQuery<LocationRecord>({
    queryKey: getLatestLocationQueryKey(),
    queryFn: () => customFetch<LocationRecord>("/api/location/latest"),
    ...options,
  });
}

export function useGetLocationHistory(params?: { hours?: number }, options?: UseQueryOptions<LocationRecord[]>) {
  return useQuery<LocationRecord[]>({
    queryKey: getLocationHistoryQueryKey(params?.hours),
    queryFn: () => {
      const qs = params?.hours ? `?hours=${params.hours}` : "";
      return customFetch<LocationRecord[]>(`/api/location/history${qs}`);
    },
    ...options,
  });
}

// ─── Alerts ───────────────────────────────────────────────────────────────
export function useGetAlerts(params?: { status?: string }, options?: UseQueryOptions<Alert[]>) {
  return useQuery<Alert[]>({
    queryKey: getAlertsQueryKey(params?.status),
    queryFn: () => {
      const qs = params?.status ? `?status=${params.status}` : "";
      return customFetch<Alert[]>(`/api/alerts${qs}`);
    },
    ...options,
  });
}

export function useGetAlert(alertId: string, options?: UseQueryOptions<Alert>) {
  return useQuery<Alert>({
    queryKey: getAlertQueryKey(alertId),
    queryFn: () => customFetch<Alert>(`/api/alerts/${alertId}`),
    enabled: !!alertId,
    ...options,
  });
}

export function useTriggerAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: TriggerAlertRequest) =>
      customFetch<Alert>("/api/alerts", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getAlertsQueryKey() });
      qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    },
  });
}

export function useUpdateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, body }: { alertId: string; body: UpdateAlertRequest }) =>
      customFetch<Alert>(`/api/alerts/${alertId}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (_data, { alertId }) => {
      qc.invalidateQueries({ queryKey: getAlertsQueryKey() });
      qc.invalidateQueries({ queryKey: getAlertQueryKey(alertId) });
      qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    },
  });
}

// ─── Recordings ───────────────────────────────────────────────────────────
export function useGetRecordings(options?: UseQueryOptions<Recording[]>) {
  return useQuery<Recording[]>({
    queryKey: getRecordingsQueryKey(),
    queryFn: () => customFetch<Recording[]>("/api/recordings"),
    ...options,
  });
}

export function useGetRecording(recordingId: string, options?: UseQueryOptions<Recording>) {
  return useQuery<Recording>({
    queryKey: getRecordingQueryKey(recordingId),
    queryFn: () => customFetch<Recording>(`/api/recordings/${recordingId}`),
    enabled: !!recordingId,
    ...options,
  });
}

export function useCreateRecording() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRecordingRequest) =>
      customFetch<Recording>("/api/recordings", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getRecordingsQueryKey() }),
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────
export function useGetDashboardSummary(options?: UseQueryOptions<DashboardSummary>) {
  return useQuery<DashboardSummary>({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => customFetch<DashboardSummary>("/api/dashboard/summary"),
    ...options,
  });
}

export function useGetRecentActivity(params?: { limit?: number }, options?: UseQueryOptions<ActivityItem[]>) {
  return useQuery<ActivityItem[]>({
    queryKey: getGetRecentActivityQueryKey(params),
    queryFn: () => {
      const qs = params?.limit ? `?limit=${params.limit}` : "";
      return customFetch<ActivityItem[]>(`/api/dashboard/recent-activity${qs}`);
    },
    ...options,
  });
}
