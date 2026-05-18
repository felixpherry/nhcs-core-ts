import { afterEach, describe, expect, it, vi } from "vitest";

const { setCookieMock } = vi.hoisted(() => ({
	setCookieMock: vi.fn(),
}));

vi.mock("#/env", () => ({
	env: {
		APP_ENV: "production",
		COOKIE_NAME_SUFFIX: "_TEST",
		PARENT_DOMAIN_COOKIE: ".example.org",
	},
}));

vi.mock("@tanstack/react-start/server", () => ({
	setCookie: setCookieMock,
}));

import { AppSession } from "../../app-session/app-session";
import { clearExpiredSessionCookies } from "./session-expiry-acknowledgement.server";

const appSessionPlatform = new AppSession();

describe("clearExpiredSessionCookies", () => {
	afterEach(() => {
		setCookieMock.mockClear();
	});

	it("expires app-owned and known Legacy Cookies without requiring a valid backend session", () => {
		const sessionCookieNames = appSessionPlatform.getSessionCookieNames();

		expect(clearExpiredSessionCookies()).toEqual({
			clearedCookieNames: sessionCookieNames,
		});

		for (const cookieName of sessionCookieNames) {
			expect(setCookieMock).toHaveBeenCalledWith(
				cookieName,
				"",
				expect.objectContaining({
					httpOnly: true,
					maxAge: 0,
					path: "/",
					sameSite: "lax",
					secure: true,
				}),
			);
			expect(setCookieMock).toHaveBeenCalledWith(
				cookieName,
				"",
				expect.objectContaining({
					domain: ".example.org",
					httpOnly: true,
					maxAge: 0,
					path: "/",
					sameSite: "lax",
					secure: true,
				}),
			);
		}

		expect(setCookieMock).toHaveBeenCalledTimes(sessionCookieNames.length * 2);
	});
});
