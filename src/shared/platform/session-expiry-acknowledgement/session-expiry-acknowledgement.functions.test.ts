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

vi.mock("@tanstack/react-start/ssr-rpc", () => ({
	createSsrRpc: () => async () => {
		try {
			const { clearExpiredSessionCookies } = await import(
				"./session-expiry-acknowledgement.server"
			);

			return { result: clearExpiredSessionCookies() };
		} catch (error) {
			return { error };
		}
	},
}));

import { APP_SESSION_COOKIE_NAME } from "../app-session/app-session.server";
import { acknowledgeExpiredSession } from "./session-expiry-acknowledgement.functions";

const legacyCookieNames = [
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
];

describe("acknowledgeExpiredSession", () => {
	afterEach(() => {
		setCookieMock.mockClear();
	});

	it("expires app-owned and known Legacy Cookies without requiring a valid backend session", async () => {
		await expect(acknowledgeExpiredSession()).resolves.toEqual({
			clearedCookieNames: [APP_SESSION_COOKIE_NAME, ...legacyCookieNames],
		});

		for (const cookieName of [APP_SESSION_COOKIE_NAME, ...legacyCookieNames]) {
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

		expect(setCookieMock).toHaveBeenCalledTimes(
			[APP_SESSION_COOKIE_NAME, ...legacyCookieNames].length * 2,
		);
	});
});
