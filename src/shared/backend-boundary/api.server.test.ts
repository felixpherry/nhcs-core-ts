import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "#/env";
import { api, buildBackendUrl } from "./api.server";

describe("api.public", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it("accepts only relative backend paths", async () => {
		await expect(
			api.public.get("https://backend.example/login"),
		).rejects.toThrow("Backend path must be relative, not absolute.");
		await expect(api.public.post("//backend.example/login")).rejects.toThrow(
			"Backend path must be relative, not protocol-relative.",
		);
		await expect(api.public.get("../login")).rejects.toThrow(
			"Backend path must not contain parent directory segments.",
		);
	});

	it("uses API_BASE_URL centrally", async () => {
		const fetchMock = mockJsonFetch({ result: { ok: true } });

		await api.public.get("/login");

		expect(fetchMock).toHaveBeenCalledWith(
			new URL("login", ensureTrailingSlash(env.API_BASE_URL)).toString(),
			expect.objectContaining({ method: "GET" }),
		);
	});

	it("supports public GET calls", async () => {
		const fetchMock = mockJsonFetch({ result: { ok: true } });

		await api.public.get("/login");

		expect(fetchMock).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ method: "GET" }),
		);
	});

	it("supports public POST calls with JSON body in options", async () => {
		const fetchMock = mockJsonFetch({ result: { ok: true } });

		await api.public.post("/login", {
			body: { password: "secret", username: "nhcs" },
		});

		expect(fetchMock).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				body: JSON.stringify({ password: "secret", username: "nhcs" }),
				method: "POST",
			}),
		);
	});

	it("merges query params with backend path query", async () => {
		const fetchMock = mockJsonFetch({ result: { ok: true } });

		await api.public.get("/login?keep=yes&tenant=old", {
			query: { page: 2, tenant: "new" },
		});

		const calledUrl = getCalledFetchUrl(fetchMock);
		expect(calledUrl.searchParams.get("keep")).toBe("yes");
		expect(calledUrl.searchParams.get("page")).toBe("2");
		expect(calledUrl.searchParams.get("tenant")).toBe("new");
	});

	it("returns result payload from Backend Envelope", async () => {
		mockJsonFetch({ result: { token: "abc" } });

		await expect(api.public.get("/login")).resolves.toEqual({ token: "abc" });
	});

	it("returns data payload from Backend Envelope", async () => {
		mockJsonFetch({ data: { token: "abc" } });

		await expect(api.public.get("/login")).resolves.toEqual({ token: "abc" });
	});

	it("prefers result over data when both exist", async () => {
		mockJsonFetch({ data: { source: "data" }, result: { source: "result" } });

		await expect(api.public.get("/login")).resolves.toEqual({
			source: "result",
		});
	});
});

describe("buildBackendUrl", () => {
	it("builds URLs from relative paths without exposing base URL ownership", () => {
		expect(buildBackendUrl("login")).toBe(
			new URL("login", ensureTrailingSlash(env.API_BASE_URL)).toString(),
		);
	});

	it("merges query params into backend URLs", () => {
		const backendUrl = new URL(
			buildBackendUrl("login?tenant=old", { page: 2, tenant: "new" }),
		);

		expect(backendUrl.searchParams.get("page")).toBe("2");
		expect(backendUrl.searchParams.get("tenant")).toBe("new");
	});
});

function mockJsonFetch(envelope: unknown) {
	const fetchMock = vi
		.fn()
		.mockResolvedValue(new Response(JSON.stringify(envelope)));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function getCalledFetchUrl(fetchMock: ReturnType<typeof mockJsonFetch>) {
	const fetchUrl = fetchMock.mock.calls[0]?.[0];

	if (typeof fetchUrl !== "string") {
		throw new Error("Expected fetch to be called with a URL string.");
	}

	return new URL(fetchUrl);
}

function ensureTrailingSlash(url: string) {
	return url.endsWith("/") ? url : `${url}/`;
}
