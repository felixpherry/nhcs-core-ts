import type { AppSessionContract } from "../app-session.contract";
import { createLegacySessionCookieHeaders } from "./legacy-cookie-headers.server";
import { getSessionCookieNames } from "./legacy-cookie-names.server";
import { readAppSession } from "./read-app-session.server";
import { createSignedAppSessionCookieValue } from "./signed-app-session-cookie.server";

/** Creates the concrete App Session implementation behind the main Adapter. */
export function createAppSessionImplementation(): AppSessionContract {
	return {
		createCookieValue: createSignedAppSessionCookieValue,
		createLegacyCookieHeaders: createLegacySessionCookieHeaders,
		get: readAppSession,
		getSessionCookieNames,
	};
}
