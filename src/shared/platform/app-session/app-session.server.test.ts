import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { AppSession } from "./app-session.server";

const { legacyCookieSecret, legacyCookieSuffix } = vi.hoisted(() => ({
	legacyCookieSecret: "test-legacy-cookie-secret",
	legacyCookieSuffix: "_TEST",
}));

vi.mock("#/env", () => ({
	env: {
		COOKIE_NAME_SUFFIX: legacyCookieSuffix,
		COOKIE_SECRET: legacyCookieSecret,
		NHCS_SESSION_SECRET: "test-session-secret-at-least-32-characters",
	},
}));

import {
	APP_SESSION_COOKIE_NAME,
	createAppSessionCookieValue,
	getAppSession,
} from "./app-session.server";

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
			const cookieName = `${legacyCookieBaseNames[field as LegacyCookieField]}${legacyCookieSuffix}`;

			return `${cookieName}=${encodeURIComponent(signLegacyCookieValue(value))}`;
		})
		.join("; ");
}

function createLegacyCookieHeaderForAppSession(
	appSession: AppSession,
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
	const signature = createHmac("sha256", legacyCookieSecret)
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
		} satisfies AppSession;
		const cookieValue = createAppSessionCookieValue(appSession);

		expect(
			getAppSession({
				cookieHeader: `${APP_SESSION_COOKIE_NAME}=${cookieValue}`,
			}),
		).toEqual(appSession);
	});

	it("returns null when nhcs_session cookie is missing", () => {
		expect(getAppSession({ cookieHeader: null })).toBeNull();
		expect(getAppSession({ cookieHeader: "other_cookie=value" })).toBeNull();
	});

	it("returns null when nhcs_session cookie value is invalid", () => {
		expect(
			getAppSession({
				cookieHeader: `${APP_SESSION_COOKIE_NAME}=not-a-signed-session`,
			}),
		).toBeNull();
	});

	it("returns null when signed nhcs_session cookie is tampered", () => {
		const cookieValue = createAppSessionCookieValue({
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
			getAppSession({
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
		} satisfies AppSession;

		expect(
			getAppSession({
				cookieHeader: createLegacyCookieHeaderForAppSession(appSession),
			}),
		).toEqual(appSession);
	});

	it("returns normalized menu groups from Legacy Cookies flags", () => {
		expect(
			getAppSession({
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
		} satisfies AppSession;
		const legacySession = {
			accessId: "LEGACY-ACCESS",
			accessToken: "legacy-token",
			menuGroups: ["ESS"],
			userId: "LEGACY-USER",
			userLevel: "LEGACY-LEVEL",
		} satisfies AppSession;
		const internalCookieValue = createAppSessionCookieValue(internalSession);

		expect(
			getAppSession({
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
		} satisfies AppSession;

		expect(
			getAppSession({
				cookieHeader: `${APP_SESSION_COOKIE_NAME}=not-a-signed-session; ${createLegacyCookieHeaderForAppSession(legacySession)}`,
			}),
		).toEqual(legacySession);
	});

	it("returns null when a Legacy Cookie value is invalid", () => {
		expect(
			getAppSession({
				cookieHeader: [
					`${legacyCookieBaseNames.accessId}${legacyCookieSuffix}=not-a-signed-cookie`,
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
		} satisfies AppSession;
		const cookieHeader = createLegacyCookieHeaderForAppSession(legacySession);
		const tamperedCookieHeader = `${cookieHeader.slice(0, -1)}${
			cookieHeader.endsWith("a") ? "b" : "a"
		}`;

		expect(
			getAppSession({
				cookieHeader: tamperedCookieHeader,
			}),
		).toBeNull();
	});

	it("returns null when a required Legacy Cookie is missing", () => {
		expect(
			getAppSession({
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
