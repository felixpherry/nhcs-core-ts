import { createHmac } from "node:crypto";
import { env } from "#/env";
import type { LegacySessionCookieInput } from "../app-session.types";
import {
	getLegacyCookieName,
	type LegacyCookieField,
	legacyCookieBaseNames,
} from "./legacy-cookie-names.server";

const legacyCookieMaxAgeSeconds = 86_400;
const legacyFlagFields = new Set<LegacyCookieField>([
	"fgCore",
	"fgEss",
	"fgMss",
]);

type LegacyCookieConfig = {
	readonly cookieNameSuffix: string;
	readonly cookieSecret: string;
};

/** Creates Set-Cookie header strings for the full legacy NHCS cookie set. */
export function createLegacySessionCookieHeaders(
	legacyCookies: LegacySessionCookieInput,
): readonly string[] {
	const config = requireLegacyCookieConfig();

	return getLegacyCookieFields().map((field) =>
		serializeLegacyCookie(
			getLegacyCookieName(field, config.cookieNameSuffix),
			signLegacyCookieValue(
				normalizeLegacyCookieValue(field, legacyCookies[field]),
				config.cookieSecret,
			),
		),
	);
}

function getLegacyCookieFields(): readonly LegacyCookieField[] {
	return Object.keys(legacyCookieBaseNames) as LegacyCookieField[];
}

function normalizeLegacyCookieValue(
	field: LegacyCookieField,
	value: string | null,
): string {
	if (value !== null && value !== undefined && value.length > 0) {
		return value;
	}

	return legacyFlagFields.has(field) ? "F" : "null";
}

/** Matches legacy cookie-signature payload format: base64(JSON string) + HMAC. */
function signLegacyCookieValue(value: string, secret: string): string {
	const payload = Buffer.from(JSON.stringify(value), "utf8").toString("base64");
	const signature = createHmac("sha256", secret)
		.update(payload)
		.digest("base64")
		.replace(/=+$/, "");

	return `${payload}.${signature}`;
}

function requireLegacyCookieConfig(): LegacyCookieConfig {
	const cookieNameSuffix = env.COOKIE_NAME_SUFFIX;
	const cookieSecret = env.COOKIE_SECRET;

	if (!cookieNameSuffix) {
		throw new Error("COOKIE_NAME_SUFFIX is not configured.");
	}

	if (!cookieSecret) {
		throw new Error("COOKIE_SECRET is not configured.");
	}

	return { cookieNameSuffix, cookieSecret };
}

function serializeLegacyCookie(name: string, value: string): string {
	const parts = [
		`${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
		`Max-Age=${legacyCookieMaxAgeSeconds}`,
		"Path=/",
	];

	if (env.PARENT_DOMAIN_COOKIE) {
		parts.push(`Domain=${env.PARENT_DOMAIN_COOKIE}`);
	}

	parts.push("HttpOnly");

	if (env.APP_ENV === "production") {
		parts.push("Secure");
	}

	parts.push("SameSite=Lax");

	return parts.join("; ");
}
