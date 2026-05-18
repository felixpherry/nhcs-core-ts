import { setCookie } from "@tanstack/react-start/server";
import { env } from "#/env";
import { AppSession } from "../../app-session/app-session";
import type { ClearExpiredSessionCookiesResult } from "../session-expiry-acknowledgement.types";

const appSessionPlatform = new AppSession();

/** Clears app-owned and Legacy Cookies after user acknowledges backend session expiry. */
export function clearExpiredSessionCookies(): ClearExpiredSessionCookiesResult {
	const clearedCookieNames = getExpiredSessionCookieNames();

	for (const cookieName of clearedCookieNames) {
		expireCookie(cookieName);
	}

	return { clearedCookieNames };
}

function getExpiredSessionCookieNames(): readonly string[] {
	return appSessionPlatform.getSessionCookieNames();
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
