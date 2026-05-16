import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "#/env";
import type { AppSession } from "../app-session.types";
import { parseAppSession, safeParseAppSession } from "./app-session-schema";

const signedCookieSeparator = ".";

/** Serializes, validates, and signs normalized App Session for app-owned cookie storage. */
export function createSignedAppSessionCookieValue(
	appSession: AppSession,
): string {
	const parsedSession = parseAppSession(appSession);
	const payload = encodeBase64Url(JSON.stringify(parsedSession));
	const signature = signCookiePayload(payload, requireSessionSecret());

	return `${payload}${signedCookieSeparator}${signature}`;
}

/** Verifies app-owned cookie value and returns normalized App Session when valid. */
export function readSignedAppSessionCookieValue(
	cookieValue: string,
): AppSession | null {
	const [payload, signature, ...rest] = cookieValue.split(
		signedCookieSeparator,
	);

	if (!payload || !signature || rest.length > 0) {
		return null;
	}

	if (!hasValidSignature(payload, signature, requireSessionSecret())) {
		return null;
	}

	try {
		const parsedJson = JSON.parse(decodeBase64Url(payload));

		return safeParseAppSession(parsedJson);
	} catch {
		return null;
	}
}

/** Signs encoded cookie payload with configured App Session secret. */
function signCookiePayload(payload: string, secret: string): string {
	return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Compares provided cookie signature against expected HMAC without timing leak. */
function hasValidSignature(
	payload: string,
	signature: string,
	secret: string,
): boolean {
	const expectedSignature = signCookiePayload(payload, secret);
	const actual = Buffer.from(signature);
	const expected = Buffer.from(expectedSignature);

	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Reads required App Session secret or fails fast during session cookie work. */
function requireSessionSecret(): string {
	const secret = env.NHCS_SESSION_SECRET;

	if (!secret) {
		throw new Error("NHCS_SESSION_SECRET is not configured.");
	}

	return secret;
}

/** Encodes text as base64url for cookie-safe payload storage. */
function encodeBase64Url(value: string): string {
	return Buffer.from(value, "utf8").toString("base64url");
}

/** Decodes base64url cookie payload back to text. */
function decodeBase64Url(value: string): string {
	return Buffer.from(value, "base64url").toString("utf8");
}
