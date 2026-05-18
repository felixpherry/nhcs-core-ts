import { env } from "#/env";
import { APP_SESSION_COOKIE_NAME } from "../app-session.protocol";

export const legacyCookieBaseNames = {
	accessId: "Xyc02D92LQ",
	accessToken: "ZTn5qC8jA0",
	fgCore: "P0bMlqK31",
	fgEss: "JzXkT8cV2",
	fgMss: "mKcLw923X",
	userId: "dXc83nF0p",
	userLevel: "Qm8LxK01w",
} as const;

export type LegacyCookieField = keyof typeof legacyCookieBaseNames;

const legacySessionCookieBaseNames = [
	legacyCookieBaseNames.accessId,
	legacyCookieBaseNames.accessToken,
	legacyCookieBaseNames.userId,
	legacyCookieBaseNames.userLevel,
	legacyCookieBaseNames.fgCore,
	legacyCookieBaseNames.fgEss,
	legacyCookieBaseNames.fgMss,
	"RfT23qX8n",
	"Gr9eYd0wZ",
	"bZtLkX92n",
] as const;

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

	return legacySessionCookieBaseNames.map((baseName) => `${baseName}${suffix}`);
}
