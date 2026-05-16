import { getCookie } from "@tanstack/react-start/server";
import {
	APP_SESSION_COOKIE_NAME,
	type GetAppSessionOptions,
} from "../app-session.contract";
import type { AppSession } from "../app-session.types";
import { getCookieValue } from "./cookie-header";
import { readSignedAppSessionCookieValue } from "./signed-app-session-cookie.server";

/** Reads normalized App Session from current request cookies or supplied Cookie header. */
export function readAppSession(
	options: GetAppSessionOptions = {},
): AppSession | null {
	const cookieValue = Object.hasOwn(options, "cookieHeader")
		? getCookieValue(options.cookieHeader, APP_SESSION_COOKIE_NAME)
		: getCookie(APP_SESSION_COOKIE_NAME);

	if (!cookieValue) {
		return null;
	}

	return readSignedAppSessionCookieValue(cookieValue);
}
