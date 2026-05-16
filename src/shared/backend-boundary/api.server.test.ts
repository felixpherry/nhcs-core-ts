import { afterEach, describe, expect, it, vi } from "vitest";
import { env } from "#/env";
import {
	ApiBusinessError,
	ApiForbiddenError,
	ApiServerDownError,
	ApiSessionExpiredError,
	ApiUnknownError,
	ApiValidationError,
} from "./api.errors";
import { api } from "./api.server";
import { buildBackendUrl } from "./api.utils";

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

	it("maps isGranted false to a session-expired API error before isSuccess handling", async () => {
		const envelope = {
			isGranted: false,
			isSuccess: false,
			message: "Session expired",
			result: { reason: "expired" },
		};
		mockJsonFetch(envelope);

		const error = await catchApiError(() => api.public.get("/profile"));

		expect(error).toBeInstanceOf(ApiSessionExpiredError);
		const apiError = error as ApiSessionExpiredError;
		expect(apiError.kind).toBe("session-expired");
		expect(apiError.message).toBe("Session expired");
		expect(apiError.diagnostics).toMatchObject({ status: 200, envelope });
	});

	it("maps HTTP 200 with isSuccess false to a business API error", async () => {
		const envelope = {
			error: { code: "DUPLICATE" },
			isGranted: true,
			isSuccess: false,
			message: "Employee already exists",
			result: { employeeId: "E-1" },
		};
		mockJsonFetch(envelope);

		const error = await catchApiError(() => api.public.post("/employees"));

		expect(error).toBeInstanceOf(ApiBusinessError);
		const apiError = error as ApiBusinessError;
		expect(apiError.kind).toBe("business");
		expect(apiError.message).toBe("Employee already exists");
		expect(apiError.diagnostics).toMatchObject({ status: 200, envelope });
	});

	it("uses a clear fallback when business failure has no backend message", async () => {
		const envelope = {
			error: { code: "UNKNOWN_BUSINESS_FAILURE" },
			isGranted: true,
			isSuccess: false,
		};
		mockJsonFetch(envelope);

		const error = await catchApiError(() => api.public.post("/employees"));

		expect(error).toBeInstanceOf(ApiBusinessError);
		expect((error as ApiBusinessError).message).toBe(
			"Backend rejected request without an error message.",
		);
	});

	it("maps HTTP 400 to a validation API error", async () => {
		const envelope = {
			error: { field: "employeeId" },
			isGranted: true,
			isSuccess: false,
			message: "Invalid employee id",
		};
		mockJsonFetch(envelope, { status: 400 });

		const error = await catchApiError(() => api.public.get("/employees"));

		expect(error).toBeInstanceOf(ApiValidationError);
		const apiError = error as ApiValidationError;
		expect(apiError.kind).toBe("validation");
		expect(apiError.message).toBe("Invalid employee id");
		expect(apiError.diagnostics).toMatchObject({ status: 400, envelope });
	});

	it("maps HTTP 403 to a forbidden API error", async () => {
		const envelope = {
			error: { permission: "employee.read" },
			isGranted: true,
			isSuccess: false,
			message: "Forbidden",
		};
		mockJsonFetch(envelope, { status: 403 });

		const error = await catchApiError(() => api.public.get("/employees"));

		expect(error).toBeInstanceOf(ApiForbiddenError);
		const apiError = error as ApiForbiddenError;
		expect(apiError.kind).toBe("forbidden");
		expect(apiError.message).toBe("Forbidden");
		expect(apiError.diagnostics).toMatchObject({ status: 403, envelope });
	});

	it("maps HTTP 500 to a server-down API error", async () => {
		const envelope = {
			error: { traceId: "trace-1" },
			isGranted: true,
			isSuccess: false,
			message: "Internal Server Error",
		};
		mockJsonFetch(envelope, { status: 500 });

		const error = await catchApiError(() => api.public.get("/employees"));

		expect(error).toBeInstanceOf(ApiServerDownError);
		const apiError = error as ApiServerDownError;
		expect(apiError.kind).toBe("server-down");
		expect(apiError.message).toBe("Internal Server Error");
		expect(apiError.diagnostics).toMatchObject({ status: 500, envelope });
	});

	it("maps HTTP 5xx statuses to server-down with internal server error fallback", async () => {
		const envelope = {
			error: { traceId: "trace-2" },
			isGranted: true,
			isSuccess: false,
		};
		mockJsonFetch(envelope, { status: 503 });

		const error = await catchApiError(() => api.public.get("/employees"));

		expect(error).toBeInstanceOf(ApiServerDownError);
		const apiError = error as ApiServerDownError;
		expect(apiError.kind).toBe("server-down");
		expect(apiError.message).toBe("Internal server error.");
		expect(apiError.diagnostics).toMatchObject({ status: 503, envelope });
	});

	it("maps network failure to a server-down API error with diagnostics", async () => {
		const networkError = new TypeError("fetch failed");
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));

		const error = await catchApiError(() => api.public.get("/employees"));

		expect(error).toBeInstanceOf(ApiServerDownError);
		const apiError = error as ApiServerDownError;
		expect(apiError.kind).toBe("server-down");
		expect(apiError.message).toBe("Unable to reach backend service.");
		expect(apiError.cause).toBe(networkError);
		expect(apiError.diagnostics.networkError).toBe(networkError);
	});

	it("maps unknown non-200 HTTP statuses to an unknown API error", async () => {
		const envelope = {
			error: { statusCode: 418 },
			isGranted: true,
			isSuccess: false,
			message: "Unsupported backend status",
		};
		mockJsonFetch(envelope, { status: 418 });

		const error = await catchApiError(() => api.public.get("/employees"));

		expect(error).toBeInstanceOf(ApiUnknownError);
		const apiError = error as ApiUnknownError;
		expect(apiError.kind).toBe("unknown");
		expect(apiError.message).toBe("Unsupported backend status");
		expect(apiError.diagnostics).toMatchObject({ status: 418, envelope });
	});
});

describe("buildBackendUrl", () => {
	it("builds URLs from relative paths without exposing base URL ownership", () => {
		expect(buildBackendUrl(env.API_BASE_URL, "login")).toBe(
			new URL("login", ensureTrailingSlash(env.API_BASE_URL)).toString(),
		);
	});

	it("merges query params into backend URLs", () => {
		const backendUrl = new URL(
			buildBackendUrl(env.API_BASE_URL, "login?tenant=old", {
				page: 2,
				tenant: "new",
			}),
		);

		expect(backendUrl.searchParams.get("page")).toBe("2");
		expect(backendUrl.searchParams.get("tenant")).toBe("new");
	});
});

async function catchApiError(call: () => Promise<unknown>): Promise<unknown> {
	try {
		await call();
	} catch (error) {
		return error;
	}

	throw new Error("Expected API call to throw.");
}

function mockJsonFetch(envelope: unknown, init?: ResponseInit) {
	const fetchMock = vi
		.fn()
		.mockResolvedValue(new Response(JSON.stringify(envelope), init));
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
