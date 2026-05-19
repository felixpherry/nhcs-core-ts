import { afterEach, describe, expect, it, vi } from "vitest";
import {
	ApiBusinessError,
	ApiServerDownError,
} from "#/shared/platform/backend-boundary/backend-boundary.protocol";
import type {
	GetAuthenticationMenusInput,
	LoginAuthenticationFailure,
	LoginAuthenticationInput,
	LoginAuthenticationSuccess,
} from "./authentication.types";

const {
	envConfig,
	privateGetMock,
	privatePostMock,
	publicPostMock,
	requestCookieHeader,
	setResponseHeaderMock,
} = vi.hoisted(() => ({
	envConfig: {
		appEnv: "development",
		authSecret: "1234567890123456",
		hcplusLogoutUrl: undefined as string | undefined,
		legacyCookieSecret: "test-legacy-cookie-secret",
		legacyCookieSuffix: "_TEST",
		parentDomainCookie: ".example.test",
		sessionSecret: "test-session-secret-at-least-32-characters",
	},
	privateGetMock: vi.fn(),
	privatePostMock: vi.fn(),
	publicPostMock: vi.fn(),
	requestCookieHeader: { value: undefined as string | null | undefined },
	setResponseHeaderMock: vi.fn(),
}));

vi.mock("#/env", () => ({
	env: {
		API_BASE_URL: "http://backend.example/nhcs",
		get APP_ENV() {
			return envConfig.appEnv;
		},
		get AUTH_SECRET() {
			return envConfig.authSecret;
		},
		get COOKIE_NAME_SUFFIX() {
			return envConfig.legacyCookieSuffix;
		},
		get HCPLUS_LOGOUT_URL() {
			return envConfig.hcplusLogoutUrl;
		},
		get COOKIE_SECRET() {
			return envConfig.legacyCookieSecret;
		},
		get NHCS_SESSION_SECRET() {
			return envConfig.sessionSecret;
		},
		get PARENT_DOMAIN_COOKIE() {
			return envConfig.parentDomainCookie;
		},
	},
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequestHeader: (name: string) =>
		name.toLowerCase() === "cookie" ? requestCookieHeader.value : undefined,
	setResponseHeader: setResponseHeaderMock,
}));

vi.mock("@tanstack/react-start/ssr-rpc", () => ({
	createSsrRpc:
		(functionId?: string) => async (payload: { data?: unknown }) => {
			try {
				const exportName = getServerFunctionExportName(functionId);

				if (
					exportName === "logout" ||
					(typeof payload.data === "object" &&
						payload.data !== null &&
						Object.keys(payload.data).length === 0)
				) {
					return { result: await clearAuthenticationSession() };
				}

				if (
					exportName === "getCurrentAuthenticationSession" ||
					payload.data === undefined
				) {
					return { result: readCurrentAuthenticationSession() };
				}

				if (exportName === "login" || isLoginPayload(payload.data)) {
					const parsedInput = loginAuthenticationInputSchema.safeParse(
						payload.data,
					);

					if (!parsedInput.success) {
						return {
							result: {
								fieldErrors: z.flattenError(parsedInput.error).fieldErrors,
								formError: "Fix highlighted fields and try again.",
								ok: false,
							} satisfies LoginAuthenticationFailure,
						};
					}

					try {
						return {
							result: {
								authentication: await establishAuthenticationSession(
									parsedInput.data,
								),
								ok: true,
							} satisfies LoginAuthenticationSuccess,
						};
					} catch (error) {
						if (error instanceof ApiBusinessError) {
							return {
								result: {
									formError: error.message,
									ok: false,
								} satisfies LoginAuthenticationFailure,
							};
						}

						if (error instanceof ApiServerDownError) {
							return {
								result: {
									formError: "Authentication service unavailable. Try again.",
									ok: false,
								} satisfies LoginAuthenticationFailure,
							};
						}

						throw error;
					}
				}

				return {
					result: await readAuthenticationMenus(
						getAuthenticationMenusInputSchema.parse(payload.data),
					),
				};
			} catch (error) {
				return { error };
			}
		},
}));

vi.mock("#/shared/platform/backend-boundary/backend-boundary", () => ({
	BackendBoundary: class {
		readonly private = {
			get: privateGetMock,
			post: privatePostMock,
		};

		readonly public = {
			post: publicPostMock,
		};
	},
}));

import z from "zod";
import {
	getAuthenticationMenus,
	getCurrentAuthenticationSession,
	login,
	logout,
} from "./authentication.functions";
import {
	getAuthenticationMenusInputSchema,
	loginAuthenticationInputSchema,
} from "./authentication.schema";
import {
	clearAuthenticationSession,
	establishAuthenticationSession,
	readAuthenticationMenus,
	readCurrentAuthenticationSession,
} from "./authentication.server";

function isLoginPayload(data: unknown): boolean {
	return (
		typeof data === "object" &&
		data !== null &&
		"password" in data &&
		"userId" in data
	);
}

function getSetCookieHeadersFromMock(): readonly string[] {
	const setCookieCall = setResponseHeaderMock.mock.calls.find(
		([name]) => name === "Set-Cookie",
	);

	if (!setCookieCall || !Array.isArray(setCookieCall[1])) {
		throw new Error("Expected Set-Cookie response header array.");
	}

	return setCookieCall[1] as readonly string[];
}

function getSetCookieName(header: string): string {
	return decodeURIComponent(header.slice(0, header.indexOf("=")));
}

function cookieHeaderFromSetCookieHeaders(headers: readonly string[]): string {
	return headers.map((header) => header.split(";")[0]).join("; ");
}

function getServerFunctionExportName(functionId?: string): string | undefined {
	if (!functionId) {
		return undefined;
	}

	try {
		const decoded = JSON.parse(
			Buffer.from(functionId, "base64url").toString("utf8"),
		) as { export?: string };

		return decoded.export;
	} catch {
		return functionId;
	}
}

describe("login", () => {
	afterEach(() => {
		publicPostMock.mockReset();
		setResponseHeaderMock.mockReset();
	});

	it("returns actionable field errors before backend contact for invalid input", async () => {
		const invalidInput = {
			password: "secret",
			userId: " abc ",
		} as unknown as LoginAuthenticationInput;

		await expect(login({ data: invalidInput })).resolves.toEqual({
			fieldErrors: {
				userId: ["Too small: expected string to have >=4 characters"],
			},
			formError: "Fix highlighted fields and try again.",
			ok: false,
		});

		expect(publicPostMock).not.toHaveBeenCalled();
	});

	it("returns clear form-safe error for backend auth failures", async () => {
		publicPostMock.mockRejectedValue(
			new ApiBusinessError("Invalid user ID or password.", { status: 200 }),
		);

		await expect(
			login({ data: { password: "secret", userId: "USER-1" } }),
		).resolves.toEqual({
			formError: "Invalid user ID or password.",
			ok: false,
		});
	});

	it("returns clear outage error for backend downtime while preserving retry flow", async () => {
		publicPostMock.mockRejectedValue(
			new ApiServerDownError("fetch failed", { status: 503 }),
		);

		await expect(
			login({ data: { password: "secret", userId: "USER-1" } }),
		).resolves.toEqual({
			formError: "Authentication service unavailable. Try again.",
			ok: false,
		});
	});

	it("returns safe Authentication Result after backend Session Establishment", async () => {
		publicPostMock.mockResolvedValue({
			accessId: "ACCESS-1",
			accessToken: "token-1",
			fgCore: "T",
			fgEss: "T",
			fgMss: "F",
			refreshToken: "refresh-1",
			userGroup: "GROUP-1",
			userId: "USER-1",
			userLevel: "LEVEL-1",
			userName: "Name 1",
		});

		const result = await login({
			data: {
				browser: "Chrome",
				browserVersion: "120",
				ipAddress: "10.0.0.1",
				password: "secret",
				userId: " USER-1 ",
			},
		});

		expect(result).toEqual({
			authentication: {
				menuGroups: ["ESS", "CORE"],
				userGroup: "GROUP-1",
				userId: "USER-1",
				userLevel: "LEVEL-1",
				userName: "Name 1",
			},
			ok: true,
		});
		expect(JSON.stringify(result)).not.toContain("token");
		expect(JSON.stringify(result)).not.toContain("ACCESS-1");
		expect(publicPostMock).toHaveBeenCalledWith(
			"/authentication/api/auth/login",
			{
				body: {
					browser: "Chrome",
					browserVersion: "120",
					ipAddress: "10.0.0.1",
					password: "RyCVJG3NbUw4ejaukvfjuQ==",
					userId: "USER-1",
				},
			},
		);
	});

	it("writes app-owned session cookie and full Legacy Cookies on successful login", async () => {
		publicPostMock.mockResolvedValue({
			accessId: "ACCESS-1",
			accessToken: "token-1",
			fgCore: "T",
			fgEss: "F",
			fgMss: "T",
			refreshToken: "refresh-1",
			userGroup: "GROUP-1",
			userId: "USER-1",
			userLevel: "LEVEL-1",
			userName: "Name 1",
		});

		await login({ data: { password: "secret", userId: "USER-1" } });

		const cookieHeaders = getSetCookieHeadersFromMock();

		expect(cookieHeaders.map(getSetCookieName)).toEqual([
			"nhcs_session",
			"Xyc02D92LQ_TEST",
			"ZTn5qC8jA0_TEST",
			"RfT23qX8n_TEST",
			"Gr9eYd0wZ_TEST",
			"dXc83nF0p_TEST",
			"Qm8LxK01w_TEST",
			"bZtLkX92n_TEST",
			"P0bMlqK31_TEST",
			"JzXkT8cV2_TEST",
			"mKcLw923X_TEST",
		]);
		expect(cookieHeaders[0]).toContain("Max-Age=86400");
		expect(cookieHeaders[0]).toContain("Path=/");
		expect(cookieHeaders[0]).toContain("Domain=.example.test");
		expect(cookieHeaders[0]).toContain("HttpOnly");
		expect(cookieHeaders[0]).toContain("SameSite=Lax");
		expect(cookieHeaders[0]).not.toContain("Secure");
	});
});

describe("logout", () => {
	afterEach(() => {
		privatePostMock.mockReset();
		publicPostMock.mockReset();
		requestCookieHeader.value = undefined;
		setResponseHeaderMock.mockReset();
		envConfig.hcplusLogoutUrl = undefined;
	});

	it("clears app and Legacy Cookies, calls backend logout when session exists, and falls back to authentication", async () => {
		publicPostMock.mockResolvedValue({
			accessId: "ACCESS-1",
			accessToken: "token-1",
			fgCore: "T",
			fgEss: "F",
			fgMss: "F",
			refreshToken: "refresh-1",
			userGroup: "GROUP-1",
			userId: "USER-1",
			userLevel: "LEVEL-1",
			userName: "Name 1",
		});
		await login({ data: { password: "secret", userId: "USER-1" } });
		requestCookieHeader.value = cookieHeaderFromSetCookieHeaders(
			getSetCookieHeadersFromMock(),
		);
		setResponseHeaderMock.mockReset();

		await expect(logout({ data: {} })).resolves.toEqual({
			destination: "/authentication",
		});
		expect(privatePostMock).toHaveBeenCalledWith(
			"/authentication/api/auth/logout?id=ACCESS-1",
		);

		const cookieHeaders = getSetCookieHeadersFromMock();
		expect(cookieHeaders.map(getSetCookieName)).toEqual([
			"nhcs_session",
			"Xyc02D92LQ_TEST",
			"ZTn5qC8jA0_TEST",
			"RfT23qX8n_TEST",
			"Gr9eYd0wZ_TEST",
			"dXc83nF0p_TEST",
			"Qm8LxK01w_TEST",
			"bZtLkX92n_TEST",
			"P0bMlqK31_TEST",
			"JzXkT8cV2_TEST",
			"mKcLw923X_TEST",
		]);
		expect(cookieHeaders[0]).toContain("Max-Age=0");
	});

	it("returns configured HCPlus logout destination when present", async () => {
		envConfig.hcplusLogoutUrl = "https://hcplus.example/Logout.aspx";

		await expect(logout({ data: {} })).resolves.toEqual({
			destination: "https://hcplus.example/Logout.aspx",
		});
		expect(privatePostMock).not.toHaveBeenCalled();
	});
});

describe("getCurrentAuthenticationSession", () => {
	afterEach(() => {
		publicPostMock.mockReset();
		requestCookieHeader.value = undefined;
		setResponseHeaderMock.mockReset();
	});

	it("returns null when no App Session can be read", async () => {
		requestCookieHeader.value = null;

		await expect(getCurrentAuthenticationSession()).resolves.toBeNull();
	});

	it("returns safe Authentication Result from readable App Session", async () => {
		publicPostMock.mockResolvedValue({
			accessId: "ACCESS-1",
			accessToken: "token-1",
			fgCore: "F",
			fgEss: "T",
			fgMss: "T",
			refreshToken: "refresh-1",
			userGroup: "GROUP-1",
			userId: "USER-1",
			userLevel: "LEVEL-1",
			userName: "Name 1",
		});
		await login({ data: { password: "secret", userId: "USER-1" } });
		requestCookieHeader.value = cookieHeaderFromSetCookieHeaders(
			getSetCookieHeadersFromMock(),
		);

		await expect(getCurrentAuthenticationSession()).resolves.toEqual({
			menuGroups: ["ESS", "MSS"],
			userGroup: "GROUP-1",
			userId: "USER-1",
			userLevel: "LEVEL-1",
			userName: "Name 1",
		});
	});
});

describe("getAuthenticationMenus", () => {
	afterEach(() => {
		privateGetMock.mockReset();
	});

	it("returns menu items from the Backend Boundary result wrapper", async () => {
		const menuItems = [
			{
				features: [
					{
						featureCode: "CORE_DASHBOARD",
						featureName: "Open dashboard",
						isGranted: true,
					},
				],
				iconMenu: "dashboard",
				isContainer: "F",
				isSection: "F",
				menuCode: "DASHBOARD",
				menuId: 1,
				menuName: "Dashboard",
				menus: [],
				uri: "/dashboard",
				urlGuide: "",
			},
		];
		privateGetMock.mockResolvedValue({ data: menuItems });

		await expect(
			getAuthenticationMenus({ data: { menuGroup: "CORE" } }),
		).resolves.toEqual(menuItems);

		expect(privateGetMock).toHaveBeenCalledWith(
			"/authentication/api/auth/menu",
			{ query: { menuGroup: "CORE" } },
		);
	});

	it("validates menu group input before calling the Backend Boundary", async () => {
		const invalidInput = {
			menuGroup: "INVALID",
		} as unknown as GetAuthenticationMenusInput;

		await expect(
			getAuthenticationMenus({ data: invalidInput }),
		).rejects.toThrow();

		expect(privateGetMock).not.toHaveBeenCalled();
	});

	it("propagates typed API errors from the Backend Boundary", async () => {
		const apiError = new ApiBusinessError("Menu request rejected", {
			status: 200,
		});
		privateGetMock.mockRejectedValue(apiError);

		await expect(
			getAuthenticationMenus({ data: { menuGroup: "CORE" } }),
		).rejects.toBe(apiError);
	});
});
