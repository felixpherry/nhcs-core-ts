import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiBusinessError } from "#/shared/platform/backend-boundary/backend-boundary.protocol";
import type {
	GetAuthenticationMenusInput,
	LoginAuthenticationInput,
} from "./authentication.types";

const {
	envConfig,
	privateGetMock,
	publicPostMock,
	requestCookieHeader,
	setResponseHeaderMock,
} = vi.hoisted(() => ({
	envConfig: {
		appEnv: "development",
		authSecret: "1234567890123456",
		legacyCookieSecret: "test-legacy-cookie-secret",
		legacyCookieSuffix: "_TEST",
		parentDomainCookie: ".example.test",
		sessionSecret: "test-session-secret-at-least-32-characters",
	},
	privateGetMock: vi.fn(),
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
					exportName === "getCurrentAuthenticationSession" ||
					payload.data === undefined
				) {
					const { readCurrentAuthenticationSession } = await import(
						"./authentication.server"
					);

					return { result: readCurrentAuthenticationSession() };
				}

				if (exportName === "login" || isLoginPayload(payload.data)) {
					const { loginAuthenticationInputSchema } = await import(
						"./authentication.schema"
					);
					const { establishAuthenticationSession } = await import(
						"./authentication.server"
					);

					return {
						result: await establishAuthenticationSession(
							loginAuthenticationInputSchema.parse(payload.data),
						),
					};
				}

				const { getAuthenticationMenusInputSchema } = await import(
					"./authentication.schema"
				);
				const { readAuthenticationMenus } = await import(
					"./authentication.server"
				);

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
		};

		readonly public = {
			post: publicPostMock,
		};
	},
}));

import {
	getAuthenticationMenus,
	getCurrentAuthenticationSession,
	login,
} from "./authentication.functions";

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

	it("validates user ID before backend contact", async () => {
		const invalidInput = {
			password: "secret",
			userId: " abc ",
		} as unknown as LoginAuthenticationInput;

		await expect(login({ data: invalidInput })).rejects.toThrow();

		expect(publicPostMock).not.toHaveBeenCalled();
	});

	it("validates password before backend contact", async () => {
		const invalidInput = {
			password: "",
			userId: "USER-1",
		} as unknown as LoginAuthenticationInput;

		await expect(login({ data: invalidInput })).rejects.toThrow();

		expect(publicPostMock).not.toHaveBeenCalled();
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
			menuGroups: ["ESS", "CORE"],
			userGroup: "GROUP-1",
			userId: "USER-1",
			userLevel: "LEVEL-1",
			userName: "Name 1",
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
