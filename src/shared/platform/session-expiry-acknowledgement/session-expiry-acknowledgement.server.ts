import { setCookie } from "@tanstack/react-start/server";
import { env } from "#/env";
import { APP_SESSION_COOKIE_NAME } from "../app-session/app-session.server";
import type { ClearExpiredSessionCookiesResult } from "./session-expiry-acknowledgement.contract";

const legacyCookieBaseNames = [
	"Xyc02D92LQ",
	"ZTn5qC8jA0",
	"dXc83nF0p",
	"Qm8LxK01w",
	"P0bMlqK31",
	"JzXkT8cV2",
	"mKcLw923X",
	"RfT23qX8n",
	"Gr9eYd0wZ",
	"bZtLkX92n",
] as const;

/** Clears app-owned and Legacy Cookies after user acknowledges backend session expiry. */
export function clearExpiredSessionCookies(): ClearExpiredSessionCookiesResult {
	const clearedCookieNames = getExpiredSessionCookieNames();

	for (const cookieName of clearedCookieNames) {
		expireCookie(cookieName);
	}

	return { clearedCookieNames };
}

function getExpiredSessionCookieNames(): string[] {
	return [APP_SESSION_COOKIE_NAME, ...getLegacyCookieNames()];
}

function getLegacyCookieNames(): string[] {
	const suffix = env.COOKIE_NAME_SUFFIX;

	if (!suffix) {
		return [];
	}

	return legacyCookieBaseNames.map((baseName) => `${baseName}${suffix}`);
}

function expireCookie(cookieName: string): void {
	const options = getExpiredCookieOptions();

	setCookie(cookieName, "", options);

	if (env.PARENT_DOMAIN_COOKIE) {
		setCookie(cookieName, "", {
			...options,
			domain: env.PARENT_DOMAIN_COOKIE,
		});
	}
}

function getExpiredCookieOptions() {
	return {
		expires: new Date(0),
		httpOnly: true,
		maxAge: 0,
		path: "/",
		sameSite: "lax" as const,
		secure: env.APP_ENV === "production",
	};
}
