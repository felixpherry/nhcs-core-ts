import type { AppSession as AppSessionData } from "./app-session.types";

export type GetAppSessionOptions = {
	readonly cookieHeader?: string | null;
};

export interface AppSessionContract {
	/**
	 * Reads normalized App Session from app-owned signed session cookie or Legacy Cookies.
	 *
	 * Contract:
	 * - prefers valid app-owned nhcs_session cookie over Legacy Cookies
	 * - falls back to valid Legacy Cookies when nhcs_session is missing or unusable
	 * - returns null when no valid App Session can be read
	 * - exposes normalized menuGroups for navlink rendering
	 * - reads current request cookies by default
	 * - accepts explicit Cookie header for tests/server adapters
	 */
	get(options?: GetAppSessionOptions): AppSessionData | null;

	/**
	 * Creates app-owned signed session cookie value from normalized App Session.
	 *
	 * Contract:
	 * - validates required App Session fields
	 * - signs payload with NHCS_SESSION_SECRET
	 * - throws when App Session secret is not configured
	 */
	createCookieValue(appSession: AppSessionData): string;

	/**
	 * Lists app-owned and Legacy Cookie names that carry session continuity.
	 *
	 * Contract:
	 * - always includes the app-owned nhcs_session cookie
	 * - includes all known Legacy Cookies when COOKIE_NAME_SUFFIX is configured
	 * - does not read, validate, or expose cookie values
	 * - does not require a valid App Session or Legacy Cookie secret
	 */
	getSessionCookieNames(): readonly string[];
}
