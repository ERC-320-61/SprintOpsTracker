export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function buildUrl(path, params) {
  // VITE_API_BASE_URL unset or empty => same-origin: requests target /api/v1/...
  // on whatever host serves the app (e.g. one domain fronted by CloudFront).
  const origin = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
  const base = `${origin}/api/v1${path}`;
  if (!params) return base;
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ).toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Single entry point for SprintOps API (v0.1) calls.
 *
 * TODO(cognito): when authentication lands, this is the one place that attaches
 * `Authorization: Bearer <token>` to the request and reacts to a 401 response
 * (single re-auth / redirect). Nothing else should touch auth.
 */
export async function request(path, { method = "GET", params, body } = {}) {
  const init = { method, headers: {} };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, params), init);
  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "unknown",
      error?.message ?? `Request failed with status ${response.status}.`,
    );
  }
  return payload;
}
