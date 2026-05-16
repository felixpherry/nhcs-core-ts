import { getCookie } from "@tanstack/react-start/server";
import type { AppSession } from "./app-session.types";
import {
	createSignedAppSessionCookieValue,
	getCookieValue,
	readSignedAppSessionCookieValue,
} from "./app-session.utils";

export type { AppSession } from "./app-session.types";

export const APP_SESSION_COOKIE_NAME = "nhcs_session";

type GetAppSessionOptions = {
	readonly cookieHeader?: string | null;
};

export function getAppSession(
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

export function createAppSessionCookieValue(appSession: AppSession): string {
	return createSignedAppSessionCookieValue(appSession);
}
