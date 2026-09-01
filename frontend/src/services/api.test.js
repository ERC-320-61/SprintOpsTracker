import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "./api";

function mockFetch(response) {
  const fn = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

const jsonResponse = (body, status = 200) => ({
  ok: status < 400,
  status,
  json: () => Promise.resolve(body),
});

beforeEach(() => {
  vi.stubEnv("VITE_API_BASE_URL", "http://api.test");
});

describe("request()", () => {
  it("builds a /api/v1 URL with filtered query params", async () => {
    const fetchFn = mockFetch(jsonResponse({ items: [] }));
    await request("/projects/SOT/tasks", {
      params: { status: "TODO", limit: 25, assignee_id: null, q: "" },
    });
    expect(fetchFn.mock.calls[0][0]).toBe(
      "http://api.test/api/v1/projects/SOT/tasks?status=TODO&limit=25",
    );
    expect(fetchFn.mock.calls[0][1].method).toBe("GET");
  });

  it("sends a JSON body with Content-Type for writes", async () => {
    const fetchFn = mockFetch(jsonResponse({ id: "1" }, 201));
    await request("/projects/SOT/tasks", { method: "POST", body: { title: "x" } });
    const init = fetchFn.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ title: "x" });
  });

  it("parses the frozen error envelope into an ApiError", async () => {
    mockFetch(
      jsonResponse({ error: { code: "active_sprint_exists", message: "nope" } }, 409),
    );
    const err = await request("/x").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: "active_sprint_exists", message: "nope" });
  });

  it("still throws an ApiError when the body is not an envelope", async () => {
    mockFetch({ ok: false, status: 500, json: () => Promise.reject(new Error("no json")) });
    const err = await request("/x").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 500, code: "unknown" });
  });

  it("returns null for 204 responses", async () => {
    mockFetch({ ok: true, status: 204, json: () => Promise.reject() });
    await expect(request("/x", { method: "DELETE" })).resolves.toBeNull();
  });
});
