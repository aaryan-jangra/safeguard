// AUTO-GENERATED react-query hooks from openapi.yaml
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";
import type {
  ActivityItem,
  Alert,
  Contact,
  CreateContactRequest,
  CreateRecordingRequest,
  DashboardSummary,
  HealthStatus,
  LocationRecord,
  LocationUpdate,
  Recording,
  RegisterUserRequest,
  TriggerAlertRequest,
  UpdateAlertRequest,
  User,
} from "./api";

type QueryOptions<TData> = UseQueryOptions<TData> | { query?: UseQueryOptions<TData> };
type MutationOptions<TData, TVariables> = {
  mutation?: UseMutationOptions<TData, Error, TVariables>;
};
type ContactMutationInput =
  | CreateContactRequest
  | { body?: CreateContactRequest; data?: CreateContactRequest };
type DeleteContactInput = string | { contactId: string };
type UpdateAlertInput = {
  alertId: string;
  body?: UpdateAlertRequest;
  data?: UpdateAlertRequest;
};

function getQueryOptions<TData>(options?: QueryOptions<TData>) {
  return options && "query" in options ? options.query : options;
}

function getContactBody(input: ContactMutationInput) {
  if ("body" in input || "data" in input) return input.body ?? input.data;
  return input;
}

function getContactId(input: DeleteContactInput) {
  return typeof input === "string" ? input : input.contactId;
}

// Query keys
export const getHealthCheckQueryKey = () => ["/api/healthz"] as const;
export const getMeQueryKey = () => ["/api/users/me"] as const;
export const getContactsQueryKey = () => ["/api/contacts"] as const;
export const getGetContactsQueryKey = () => getContactsQueryKey();
export const getLatestLocationQueryKey = () => ["/api/location/latest"] as const;
export const getLocationHistoryQueryKey = (hours?: number) =>
  ["/api/location/history", { hours }] as const;
export const getAlertsQueryKey = (status?: string) => ["/api/alerts", { status }] as const;
export const getGetAlertsQueryKey = (status?: string) => getAlertsQueryKey(status);
export const getAlertQueryKey = (alertId: string) => ["/api/alerts", alertId] as const;
export const getGetAlertQueryKey = (alertId: string) => getAlertQueryKey(alertId);
export const getRecordingsQueryKey = () => ["/api/recordings"] as const;
export const getGetRecordingsQueryKey = () => getRecordingsQueryKey();
export const getRecordingQueryKey = (recordingId: string) =>
  ["/api/recordings", recordingId] as const;
export const getGetDashboardSummaryQueryKey = () => ["/api/dashboard/summary"] as const;
export const getGetRecentActivityQueryKey = (params?: { limit?: number }) =>
  ["/api/dashboard/recent-activity", params] as const;

// Health
export function useHealthCheck(options?: QueryOptions<HealthStatus>) {
  return useQuery<HealthStatus>({
    queryKey: getHealthCheckQueryKey(),
    queryFn: () => customFetch<HealthStatus>("/api/healthz"),
    ...getQueryOptions(options),
  });
}

// Users
export function useGetMe(options?: QueryOptions<User>) {
  return useQuery<User>({
    queryKey: getMeQueryKey(),
    queryFn: () => customFetch<User>("/api/users/me"),
    ...getQueryOptions(options),
  });
}

export function useRegisterUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterUserRequest) =>
      customFetch<User>("/api/users/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getMeQueryKey() }),
  });
}

// Contacts
export function useGetContacts(options?: QueryOptions<Contact[]>) {
  return useQuery<Contact[]>({
    queryKey: getContactsQueryKey(),
    queryFn: () => customFetch<Contact[]>("/api/contacts"),
    ...getQueryOptions(options),
  });
}

export function useCreateContact(options?: MutationOptions<Contact, ContactMutationInput>) {
  const qc = useQueryClient();
  return useMutation({
    ...options?.mutation,
    mutationFn: (input: ContactMutationInput) =>
      customFetch<Contact>("/api/contacts", {
        method: "POST",
        body: JSON.stringify(getContactBody(input)),
      }),
    onSuccess: async (data, variables, context, mutation) => {
      await qc.invalidateQueries({ queryKey: getContactsQueryKey() });
      await options?.mutation?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

export function useDeleteContact(options?: MutationOptions<void, DeleteContactInput>) {
  const qc = useQueryClient();
  return useMutation({
    ...options?.mutation,
    mutationFn: (input: DeleteContactInput) =>
      customFetch<void>(`/api/contacts/${getContactId(input)}`, { method: "DELETE" }),
    onSuccess: async (data, variables, context, mutation) => {
      await qc.invalidateQueries({ queryKey: getContactsQueryKey() });
      await options?.mutation?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

// Location
export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LocationUpdate) =>
      customFetch<LocationRecord>("/api/location", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: getLatestLocationQueryKey() });
      qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    },
  });
}

export function useGetLatestLocation(options?: QueryOptions<LocationRecord>) {
  return useQuery<LocationRecord>({
    queryKey: getLatestLocationQueryKey(),
    queryFn: () => customFetch<LocationRecord>("/api/location/latest"),
    ...getQueryOptions(options),
  });
}

export function useGetLocationHistory(
  params?: { hours?: number },
  options?: QueryOptions<LocationRecord[]>,
) {
  return useQuery<LocationRecord[]>({
    queryKey: getLocationHistoryQueryKey(params?.hours),
    queryFn: () => {
      const qs = params?.hours ? `?hours=${params.hours}` : "";
      return customFetch<LocationRecord[]>(`/api/location/history${qs}`);
    },
    ...getQueryOptions(options),
  });
}

// Alerts
export function useGetAlerts(params?: { status?: string }, options?: QueryOptions<Alert[]>) {
  return useQuery<Alert[]>({
    queryKey: getAlertsQueryKey(params?.status),
    queryFn: () => {
      const qs = params?.status ? `?status=${params.status}` : "";
      return customFetch<Alert[]>(`/api/alerts${qs}`);
    },
    ...getQueryOptions(options),
  });
}

export function useGetAlert(alertId: string, options?: QueryOptions<Alert>) {
  return useQuery<Alert>({
    queryKey: getAlertQueryKey(alertId),
    queryFn: () => customFetch<Alert>(`/api/alerts/${alertId}`),
    enabled: !!alertId,
    ...getQueryOptions(options),
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

export function useUpdateAlert(options?: MutationOptions<Alert, UpdateAlertInput>) {
  const qc = useQueryClient();
  return useMutation({
    ...options?.mutation,
    mutationFn: ({ alertId, body, data }: UpdateAlertInput) =>
      customFetch<Alert>(`/api/alerts/${alertId}`, {
        method: "PATCH",
        body: JSON.stringify(body ?? data),
      }),
    onSuccess: async (data, variables, context, mutation) => {
      await qc.invalidateQueries({ queryKey: getAlertsQueryKey() });
      await qc.invalidateQueries({ queryKey: getAlertQueryKey(variables.alertId) });
      await qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      await options?.mutation?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

// Recordings
export function useGetRecordings(options?: QueryOptions<Recording[]>) {
  return useQuery<Recording[]>({
    queryKey: getRecordingsQueryKey(),
    queryFn: () => customFetch<Recording[]>("/api/recordings"),
    ...getQueryOptions(options),
  });
}

export function useGetRecording(recordingId: string, options?: QueryOptions<Recording>) {
  return useQuery<Recording>({
    queryKey: getRecordingQueryKey(recordingId),
    queryFn: () => customFetch<Recording>(`/api/recordings/${recordingId}`),
    enabled: !!recordingId,
    ...getQueryOptions(options),
  });
}

export function useCreateRecording() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRecordingRequest) =>
      customFetch<Recording>("/api/recordings", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: getRecordingsQueryKey() }),
  });
}

// Dashboard
export function useGetDashboardSummary(options?: QueryOptions<DashboardSummary>) {
  return useQuery<DashboardSummary>({
    queryKey: getGetDashboardSummaryQueryKey(),
    queryFn: () => customFetch<DashboardSummary>("/api/dashboard/summary"),
    ...getQueryOptions(options),
  });
}

export function useGetRecentActivity(
  params?: { limit?: number },
  options?: QueryOptions<ActivityItem[]>,
) {
  return useQuery<ActivityItem[]>({
    queryKey: getGetRecentActivityQueryKey(params),
    queryFn: () => {
      const qs = params?.limit ? `?limit=${params.limit}` : "";
      return customFetch<ActivityItem[]>(`/api/dashboard/recent-activity${qs}`);
    },
    ...getQueryOptions(options),
  });
}
