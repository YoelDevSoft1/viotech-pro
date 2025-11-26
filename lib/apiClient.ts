import { buildApiUrl } from "./api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "./auth";

type ApiFetchOptions = {
  path: string;
  method?: string;
  body?: any;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: HeadersInit;
  cache?: RequestCache;
  auth?: boolean;
};

export type ApiError = Error & {
  status?: number;
  payload?: unknown;
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const buildUrl = (path: string, query?: ApiFetchOptions["query"]) => {
  const base = isAbsoluteUrl(path) ? path : buildApiUrl(path);
  if (!query) return base;
  const url = new URL(base);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
};

const getValidToken = async (): Promise<string | null> => {
  let token = getAccessToken();
  if (!token) return null;
  if (isTokenExpired(token)) {
    token = await refreshAccessToken();
  }
  return token;
};

export async function apiFetch<T = any>(options: ApiFetchOptions): Promise<T> {
  const {
    path,
    method = "GET",
    body,
    query,
    headers = {},
    cache = "no-store",
    auth = true,
  } = options;

  const url = buildUrl(path, query);
  const doRequest = async (token?: string) => {
    const computedHeaders = new Headers(headers);
    if (auth && token) computedHeaders.set("Authorization", `Bearer ${token}`);
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (body && !isFormData && !computedHeaders.has("Content-Type")) {
      computedHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      method,
      headers: computedHeaders,
      body: body
        ? isFormData
          ? body
          : typeof body === "string"
            ? body
            : JSON.stringify(body)
        : undefined,
      cache,
      credentials: "include",
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const err: ApiError = new Error(
        (payload as any)?.error ||
          (payload as any)?.message ||
          `Request failed (${response.status})`,
      );
      err.status = response.status;
      err.payload = payload;
      throw err;
    }
    return payload as T;
  };

  let tokenToUse: string | null = null;
  if (auth) {
    tokenToUse = await getValidToken();
  }

  try {
    return await doRequest(tokenToUse || undefined);
  } catch (error) {
    const status = (error as ApiError).status;
    if (auth && status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return await doRequest(refreshed);
      }
      await logout();
    }
    throw error;
  }
}
