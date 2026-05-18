import { env } from "#/env";
import { APP_SESSION_COOKIE_NAME } from "../app-session.protocol";

export const legacyCookieBaseNames = {
	accessId: "Xyc02D92LQ",
	accessToken: "ZTn5qC8jA0",
	refreshToken: "RfT23qX8n",
	userGroup: "Gr9eYd0wZ",
	userId: "dXc83nF0p",
	userLevel: "Qm8LxK01w",
	userName: "bZtLkX92n",
	fgCore: "P0bMlqK31",
	fgEss: "JzXkT8cV2",
	fgMss: "mKcLw923X",
} as const;

export type LegacyCookieField = keyof typeof legacyCookieBaseNames;

export const legacyAppSessionCookieFields = [
	"accessId",
	"accessToken",
	"userId",
	"userLevel",
	"fgCore",
	"fgEss",
	"fgMss",
] as const satisfies readonly LegacyCookieField[];

/** Returns app-owned and Legacy Cookie names that carry session continuity. */
export function getSessionCookieNames(): readonly string[] {
	return [APP_SESSION_COOKIE_NAME, ...getLegacySessionCookieNames()];
}

/** Builds one Legacy Cookie name from known legacy field and configured suffix. */
export function getLegacyCookieName(
	field: LegacyCookieField,
	cookieNameSuffix: string,
): string {
	return `${legacyCookieBaseNames[field]}${cookieNameSuffix}`;
}

function getLegacySessionCookieNames(): readonly string[] {
	const suffix = env.COOKIE_NAME_SUFFIX;

	if (!suffix) {
		return [];
	}

	return Object.values(legacyCookieBaseNames).map(
		(baseName) => `${baseName}${suffix}`,
	);
}
