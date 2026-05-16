import { describe, expect, it, vi } from "vitest";

vi.mock("#/env", () => ({
	env: {
		NHCS_SESSION_SECRET: "test-session-secret-at-least-32-characters",
	},
}));

import {
	APP_SESSION_COOKIE_NAME,
	createAppSessionCookieValue,
	getAppSession,
} from "./app-session.server";

describe("App Session internal cookie", () => {
	it("returns normalized App Session from valid signed nhcs_session cookie", () => {
		const appSession = {
			accessId: "ACCESS-1",
			accessToken: "token-1",
			userId: "USER-1",
			userLevel: "LEVEL-1",
		};
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
