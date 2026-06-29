let _baseUrl = "";

function getDefaultBaseUrl() {
  if (typeof window !== "undefined" && typeof window.location !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:3000`;
    }
    return `${protocol}//${hostname}`;
  }

  return "http://127.0.0.1:3000";
}

if (!_baseUrl) {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_DOMAIN;
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
