const FALLBACK_BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
  "https://denver-unbrooded-miley.ngrok-free.dev/api";

const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const ensureApiSuffix = (value: string) => {
  const normalized = stripTrailingSlashes(value);
  if (normalized.toLowerCase().endsWith("/api")) {
    return normalized;
  }
  return `${normalized}/api`;
};

const getBaseUrl = () => {
  return ensureApiSuffix(FALLBACK_BACKEND_API_URL);
};

export const buildApiUrl = (path = "") => {
  const base = getBaseUrl();
  if (!path) return base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
