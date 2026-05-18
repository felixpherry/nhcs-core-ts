import { getRequestHeader } from "@tanstack/react-start/server";
import type { GetAppSessionOptions } from "../app-session.contract";
import { APP_SESSION_COOKIE_NAME } from "../app-session.protocol";
import type { AppSession } from "../app-session.types";
import { getCookieValue } from "./cookie-header";
import { readLegacyCookiesAppSession } from "./legacy-cookies.server";
import { readSignedAppSessionCookieValue } from "./signed-app-session-cookie.server";

/** Reads normalized App Session from current request cookies or supplied Cookie header. */
export function readAppSession(
	options: GetAppSessionOptions = {},
): AppSession | null {
	const cookieHeader = Object.hasOwn(options, "cookieHeader")
		? options.cookieHeader
		: getRequestHeader("cookie");
	const appSessionCookieValue = getCookieValue(
		cookieHeader,
		APP_SESSION_COOKIE_NAME,
	);

	if (appSessionCookieValue) {
		const appSession = readSignedAppSessionCookieValue(appSessionCookieValue);

		if (appSession) {
			return appSession;
		}
	}

	return readLegacyCookiesAppSession(cookieHeader);
}
