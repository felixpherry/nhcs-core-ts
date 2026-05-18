import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppSession as AppSessionData } from "./app-session.types";

const { envConfig } = vi.hoisted(() => ({
	envConfig: {
		legacyCookieSecret: "test-legacy-cookie-secret",
		legacyCookieSuffix: "_TEST",
	},
}));

vi.mock("#/env", () => ({
	env: {
		get COOKIE_NAME_SUFFIX() {
			return envConfig.legacyCookieSuffix;
		},
		get COOKIE_SECRET() {
			return envConfig.legacyCookieSecret;
		},
		NHCS_SESSION_SECRET: "test-session-secret-at-least-32-characters",
	},
}));

import { AppSession } from "./app-session";
import { APP_SESSION_COOKIE_NAME } from "./app-session.protocol";

const appSessionPlatform = new AppSession();

afterEach(() => {
	envConfig.legacyCookieSuffix = "_TEST";
});

const legacyCookieBaseNames = {
	accessId: "Xyc02D92LQ",
	accessToken: "ZTn5qC8jA0",
	fgCore: "P0bMlqK31",
	fgEss: "JzXkT8cV2",
	fgMss: "mKcLw923X",
	userId: "dXc83nF0p",
	userLevel: "Qm8LxK01w",
} as const;

type LegacyCookieField = keyof typeof legacyCookieBaseNames;

type LegacyCookieValues = Partial<Record<LegacyCookieField, string>>;

function createLegacyCookieHeader(values: LegacyCookieValues): string {
	return Object.entries(values)
		.map(([field, value]) => {
			const cookieName = `${legacyCookieBaseNames[field as LegacyCookieField]}${envConfig.legacyCookieSuffix}`;

			return `${cookieName}=${encodeURIComponent(signLegacyCookieValue(value))}`;
		})
		.join("; ");
}

function createLegacyCookieHeaderForAppSession(
	appSession: AppSessionData,
	flags: Pick<LegacyCookieValues, "fgCore" | "fgEss" | "fgMss"> = {
		fgCore: "F",
		fgEss: "T",
		fgMss: "F",
	},
): string {
	return createLegacyCookieHeader({
		accessId: appSession.accessId,
		accessToken: appSession.accessToken,
		...flags,
		userId: appSession.userId,
		userLevel: appSession.userLevel,
	});
}

function signLegacyCookieValue(value: string): string {
	const payload = Buffer.from(JSON.stringify(value), "utf8").toString("base64");
	const signature = createHmac("sha256", envConfig.legacyCookieSecret)
		.update(payload)
		.digest("base64")
		.replace(/=+$/, "");

	return `${payload}.${signature}`;
}

describe("App Session internal cookie", () => {
	it("returns normalized App Session from valid signed nhcs_session cookie", () => {
		const appSession = {
			accessId: "ACCESS-1",
			accessToken: "token-1",
			menuGroups: ["ESS"],
			userId: "USER-1",
			userLevel: "LEVEL-1",
		} satisfies AppSessionData;
		const cookieValue = appSessionPlatform.createCookieValue(appSession);

		expect(
			appSessionPlatform.get({
				cookieHeader: `${APP_SESSION_COOKIE_NAME}=${cookieValue}`,
			}),
		).toEqual(appSession);
	});

	it("returns null when nhcs_session cookie is missing", () => {
		expect(appSessionPlatform.get({ cookieHeader: null })).toBeNull();
		expect(
			appSessionPlatform.get({ cookieHeader: "other_cookie=value" }),
		).toBeNull();
	});

	it("returns null when nhcs_session cookie value is invalid", () => {
		expect(
			appSessionPlatform.get({
				cookieHeader: `${APP_SESSION_COOKIE_NAME}=not-a-signed-session`,
			}),
		).toBeNull();
	});

	it("returns null when signed nhcs_session cookie is tampered", () => {
		const cookieValue = appSessionPlatform.createCookieValue({
			accessId: "ACCESS-1",
			accessToken: "token-1",
			menuGroups: ["CORE"],
			userId: "USER-1",
			userLevel: "LEVEL-1",
		});
		const tamperedCookieValue = `${cookieValue.slice(0, -1)}${
			cookieValue.endsWith("a") ? "b" : "a"
		}`;

		expect(
			appSessionPlatform.get({
				cookieHeader: `${APP_SESSION_COOKIE_NAME}=${tamperedCookieValue}`,
			}),
		).toBeNull();
	});
});

describe("App Session Legacy Cookies fallback", () => {
	it("returns normalized App Session from valid Legacy Cookies when nhcs_session cookie is missing", () => {
		const appSession = {
			accessId: "ACCESS-1",
			accessToken: "token-1",
			menuGroups: ["ESS"],
			userId: "USER-1",
			userLevel: "LEVEL-1",
		} satisfies AppSessionData;

		expect(
			appSessionPlatform.get({
				cookieHeader: createLegacyCookieHeaderForAppSession(appSession),
			}),
		).toEqual(appSession);
	});

	it("returns normalized menu groups from Legacy Cookies flags", () => {
		expect(
			appSessionPlatform.get({
				cookieHeader: createLegacyCookieHeader({
					accessId: "ACCESS-1",
					accessToken: "token-1",
					fgCore: "T",
					fgEss: "F",
					fgMss: "T",
					userId: "USER-1",
					userLevel: "LEVEL-1",
				}),
			}),
		).toEqual({
			accessId: "ACCESS-1",
			accessToken: "token-1",
			menuGroups: ["MSS", "CORE"],
			userId: "USER-1",
			userLevel: "LEVEL-1",
		});
	});

	it("prefers valid nhcs_session cookie over valid Legacy Cookies", () => {
		const internalSession = {
			accessId: "INTERNAL-ACCESS",
			accessToken: "internal-token",
			menuGroups: ["CORE"],
			userId: "INTERNAL-USER",
			userLevel: "INTERNAL-LEVEL",
		} satisfies AppSessionData;
		const legacySession = {
			accessId: "LEGACY-ACCESS",
			accessToken: "legacy-token",
			menuGroups: ["ESS"],
			userId: "LEGACY-USER",
			userLevel: "LEGACY-LEVEL",
		} satisfies AppSessionData;
		const internalCookieValue =
			appSessionPlatform.createCookieValue(internalSession);

		expect(
			appSessionPlatform.get({
				cookieHeader: `${APP_SESSION_COOKIE_NAME}=${internalCookieValue}; ${createLegacyCookieHeaderForAppSession(legacySession)}`,
			}),
		).toEqual(internalSession);
	});

	it("falls back to valid Legacy Cookies when nhcs_session cookie is unusable", () => {
		const legacySession = {
			accessId: "ACCESS-1",
			accessToken: "token-1",
			menuGroups: ["ESS"],
			userId: "USER-1",
			userLevel: "LEVEL-1",
		} satisfies AppSessionData;

		expect(
			appSessionPlatform.get({
				cookieHeader: `${APP_SESSION_COOKIE_NAME}=not-a-signed-session; ${createLegacyCookieHeaderForAppSession(legacySession)}`,
			}),
		).toEqual(legacySession);
	});

	it("returns null when a Legacy Cookie value is invalid", () => {
		expect(
			appSessionPlatform.get({
				cookieHeader: [
					`${legacyCookieBaseNames.accessId}${envConfig.legacyCookieSuffix}=not-a-signed-cookie`,
					createLegacyCookieHeader({
						accessToken: "token-1",
						fgCore: "F",
						fgEss: "T",
						fgMss: "F",
						userId: "USER-1",
						userLevel: "LEVEL-1",
					}),
				].join("; "),
			}),
		).toBeNull();
	});

	it("returns null when a Legacy Cookie signature is tampered", () => {
		const legacySession = {
			accessId: "ACCESS-1",
			accessToken: "token-1",
			menuGroups: ["ESS"],
			userId: "USER-1",
			userLevel: "LEVEL-1",
		} satisfies AppSessionData;
		const cookieHeader = createLegacyCookieHeaderForAppSession(legacySession);
		const tamperedCookieHeader = `${cookieHeader.slice(0, -1)}${
			cookieHeader.endsWith("a") ? "b" : "a"
		}`;

		expect(
			appSessionPlatform.get({
				cookieHeader: tamperedCookieHeader,
			}),
		).toBeNull();
	});

	it("returns null when a required Legacy Cookie is missing", () => {
		expect(
			appSessionPlatform.get({
				cookieHeader: createLegacyCookieHeader({
					accessId: "ACCESS-1",
					accessToken: "token-1",
					fgCore: "F",
					fgEss: "T",
					fgMss: "F",
					userId: "USER-1",
				}),
			}),
		).toBeNull();
	});
});

describe("App Session cookie protocol", () => {
	it("lists app-owned and known Legacy Cookies for session cleanup", () => {
		expect(appSessionPlatform.getSessionCookieNames()).toEqual([
			APP_SESSION_COOKIE_NAME,
			"Xyc02D92LQ_TEST",
			"ZTn5qC8jA0_TEST",
			"dXc83nF0p_TEST",
			"Qm8LxK01w_TEST",
			"P0bMlqK31_TEST",
			"JzXkT8cV2_TEST",
			"mKcLw923X_TEST",
			"RfT23qX8n_TEST",
			"Gr9eYd0wZ_TEST",
			"bZtLkX92n_TEST",
		]);
	});

	it("lists only app-owned cookie when Legacy Cookie suffix is missing", () => {
		envConfig.legacyCookieSuffix = "";

		expect(appSessionPlatform.getSessionCookieNames()).toEqual([
			APP_SESSION_COOKIE_NAME,
		]);
	});
});
