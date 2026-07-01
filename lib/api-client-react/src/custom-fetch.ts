let _baseUrl = "";

function getEnvValue(key: string) {
  const maybeProcess = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return maybeProcess.process?.env?.[key];
}

function getDefaultBaseUrl() {
  if (typeof window !== "undefined" && typeof window.location !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "192.168.2.205") {
      return `${protocol}//${hostname}:3000`;
    }
    return `${protocol}//${hostname}`;
  }

  return "http://192.168.2.205:3000";
}

if (!_baseUrl) {
  const envBaseUrl = getEnvValue("EXPO_PUBLIC_API_URL") ?? getEnvValue("EXPO_PUBLIC_DOMAIN");
  _baseUrl = envBaseUrl
    ? envBaseUrl.startsWith("http")
      ? envBaseUrl
      : `https://${envBaseUrl}`
    : getDefaultBaseUrl();
}

export function setBaseUrl(url: string) {
  _baseUrl = url.replace(/\/$/, "");
}

export async function customFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const fullUrl = _baseUrl + url;
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}
