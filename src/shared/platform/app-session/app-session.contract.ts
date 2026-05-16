import type { AppSession } from "./app-session.types";

export const APP_SESSION_COOKIE_NAME = "nhcs_session";

export type GetAppSessionOptions = {
	readonly cookieHeader?: string | null;
};

/**
 * Reads normalized App Session from app-owned signed session cookie.
 *
 * Contract:
 * - returns null when session cookie is missing, invalid, or tampered
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
