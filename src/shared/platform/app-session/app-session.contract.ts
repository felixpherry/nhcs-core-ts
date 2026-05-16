import type { AppSession } from "./app-session.types";

export const APP_SESSION_COOKIE_NAME = "nhcs_session";

export type GetAppSessionOptions = {
	readonly cookieHeader?: string | null;
};

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
export type GetAppSession = (
	options?: GetAppSessionOptions,
) => AppSession | null;

/**
 * Creates app-owned signed session cookie value from normalized App Session.
 *
 * Contract:
 * - validates required App Session fields
 * - signs payload with NHCS_SESSION_SECRET
 * - throws when App Session secret is not configured
 */
export type CreateAppSessionCookieValue = (appSession: AppSession) => string;
