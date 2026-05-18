import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "#/env";
import type { AppSession, AppSessionMenuGroup } from "../app-session.types";
import { safeParseAppSession } from "./app-session-schema";
import { getCookieValue } from "./cookie-header";
import {
	getLegacyCookieName,
	type LegacyCookieField,
	legacyAppSessionCookieFields,
} from "./legacy-cookie-names.server";

type LegacyAppSessionCookieField =
	(typeof legacyAppSessionCookieFields)[number];
type LegacyCookieValues = Record<LegacyAppSessionCookieField, string | null>;

type LegacyCookieConfig = {
	readonly cookieNameSuffix: string;
	readonly cookieSecret: string;
};

/** Reads normalized App Session from verified Legacy Cookies. */
export function readLegacyCookiesAppSession(
	cookieHeader: string | null | undefined,
): AppSession | null {
	if (!cookieHeader) {
		return null;
	}

	const config = getLegacyCookieConfig();

	if (!config) {
		return null;
	}

	const legacyValues = readLegacyCookieValues(cookieHeader, config);

	if (Object.values(legacyValues).some(isMissingLegacyValue)) {
		return null;
	}

	return safeParseAppSession({
		accessId: legacyValues.accessId,
		accessToken: legacyValues.accessToken,
		menuGroups: getMenuGroupsFromLegacyFlags(legacyValues),
		userId: legacyValues.userId,
		userLevel: legacyValues.userLevel,
	});
}

/** Reads required Legacy Cookie compatibility config when present and usable. */
function getLegacyCookieConfig(): LegacyCookieConfig | null {
	const cookieNameSuffix = env.COOKIE_NAME_SUFFIX;
	const cookieSecret = env.COOKIE_SECRET;

	if (!cookieNameSuffix || !cookieSecret) {
		return null;
	}

	return { cookieNameSuffix, cookieSecret };
}

/** Reads all Legacy Cookie values required for an App Session. */
function readLegacyCookieValues(
	cookieHeader: string,
	config: LegacyCookieConfig,
): LegacyCookieValues {
	return Object.fromEntries(
		legacyAppSessionCookieFields.map((field) => [
			field,
			readLegacyCookieValue(cookieHeader, field, config),
		]),
	) as LegacyCookieValues;
}

/** Reads one verified Legacy Cookie field from the Cookie header. */
function readLegacyCookieValue(
	cookieHeader: string,
	field: LegacyCookieField,
	config: LegacyCookieConfig,
): string | null {
	const cookieName = getLegacyCookieName(field, config.cookieNameSuffix);
	const signedValue = getCookieValue(cookieHeader, cookieName);

	if (!signedValue) {
		return null;
	}

	const payload = unsignLegacyCookieValue(signedValue, config.cookieSecret);

	if (!payload) {
		return null;
	}

	return decodeLegacyCookiePayload(payload);
}

/** Converts Legacy Cookies product flags into normalized navigation menu groups. */
function getMenuGroupsFromLegacyFlags(
	legacyValues: LegacyCookieValues,
): AppSessionMenuGroup[] {
	const menuGroupFlags = [
		["fgEss", "ESS"],
		["fgMss", "MSS"],
		["fgCore", "CORE"],
	] as const satisfies readonly (readonly [
		LegacyAppSessionCookieField,
		AppSessionMenuGroup,
	])[];

	return menuGroupFlags.flatMap(([field, menuGroup]) =>
		legacyValues[field] === "T" ? [menuGroup] : [],
	);
}

/** Verifies cookie-signature value and returns unsigned payload. */
function unsignLegacyCookieValue(
	signedValue: string,
	secret: string,
): string | null {
	const separatorIndex = signedValue.lastIndexOf(".");

	if (separatorIndex <= 0 || separatorIndex === signedValue.length - 1) {
		return null;
	}

	const payload = signedValue.slice(0, separatorIndex);
	const signature = signedValue.slice(separatorIndex + 1);

	return hasValidLegacySignature(payload, signature, secret) ? payload : null;
}

/** Compares cookie-signature HMAC without leaking timing. */
function hasValidLegacySignature(
	payload: string,
	signature: string,
	secret: string,
): boolean {
	const expectedSignature = createHmac("sha256", secret)
		.update(payload)
		.digest("base64")
		.replace(/=+$/, "");
	const actual = Buffer.from(signature);
	const expected = Buffer.from(expectedSignature);

	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Decodes the Legacy Cookie payload as a JSON string. */
function decodeLegacyCookiePayload(payload: string): string | null {
	try {
		const decodedValue = Buffer.from(payload, "base64").toString("utf8");
		const parsedValue = JSON.parse(decodedValue);

		return typeof parsedValue === "string" ? parsedValue : null;
	} catch {
		return null;
	}
}

/** Rejects absent fields and legacy login's literal null fallback. */
function isMissingLegacyValue(value: unknown): boolean {
	return (
		typeof value !== "string" || value.trim().length === 0 || value === "null"
	);
}
