import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { env } from "#/env";
import type { AppSession } from "./app-session.types";

const signedCookieSeparator = ".";

const appSessionSchema = z.object({
	accessId: nonEmptyString(),
	accessToken: nonEmptyString(),
	userId: nonEmptyString(),
	userLevel: nonEmptyString(),
});

export function createSignedAppSessionCookieValue(
	appSession: AppSession,
): string {
	const parsedSession = appSessionSchema.parse(appSession);
	const payload = encodeBase64Url(JSON.stringify(parsedSession));
	const signature = signCookiePayload(payload, requireSessionSecret());

	return `${payload}${signedCookieSeparator}${signature}`;
}

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
		const parsedSession = appSessionSchema.safeParse(parsedJson);

		return parsedSession.success ? parsedSession.data : null;
	} catch {
		return null;
	}
}

export function getCookieValue(
	cookieHeader: string | null | undefined,
	cookieName: string,
): string | undefined {
	if (!cookieHeader) {
		return undefined;
	}

	for (const rawCookie of cookieHeader.split(";")) {
		const cookie = rawCookie.trim();
		const separatorIndex = cookie.indexOf("=");

		if (separatorIndex === -1) {
			continue;
		}

		const name = decodeCookiePart(cookie.slice(0, separatorIndex));

		if (name === cookieName) {
			return decodeCookiePart(cookie.slice(separatorIndex + 1));
		}
	}

	return undefined;
}

function signCookiePayload(payload: string, secret: string): string {
	return createHmac("sha256", secret).update(payload).digest("base64url");
}

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

function requireSessionSecret(): string {
	const secret = env.NHCS_SESSION_SECRET;

	if (!secret) {
		throw new Error("NHCS_SESSION_SECRET is not configured.");
	}

	return secret;
}

function decodeCookiePart(part: string): string {
	try {
		return decodeURIComponent(part);
	} catch {
		return part;
	}
}

function encodeBase64Url(value: string): string {
	return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
	return Buffer.from(value, "base64url").toString("utf8");
}

function nonEmptyString() {
	return z.string().refine((value) => value.trim().length > 0);
}
