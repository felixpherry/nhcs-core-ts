import { createCipheriv } from "node:crypto";
import { setResponseHeader } from "@tanstack/react-start/server";
import { env } from "#/env";
import { AppSession } from "#/shared/platform/app-session/app-session";
import { APP_SESSION_COOKIE_NAME } from "#/shared/platform/app-session/app-session.protocol";
import type {
	AppSession as AppSessionData,
	AppSessionMenuGroup,
} from "#/shared/platform/app-session/app-session.types";
import { BackendBoundary } from "#/shared/platform/backend-boundary/backend-boundary";
import type { Flag } from "#/shared/types";
import type {
	AuthenticationLoginBackendResult,
	AuthenticationMenuBackendResult,
	AuthenticationMenuItem,
	AuthenticationResult,
	GetAuthenticationMenusInput,
	LoginAuthenticationInput,
} from "./authentication.types";

const AUTHENTICATION_LOGIN_BACKEND_PATH = "/authentication/api/auth/login";
const AUTHENTICATION_MENU_BACKEND_PATH = "/authentication/api/auth/menu";
const sessionCookieMaxAgeSeconds = 86_400;
const zeroInitializationVector = Buffer.alloc(16, 0);

const appSessionPlatform = new AppSession();
const backendBoundary = new BackendBoundary();

export async function establishAuthenticationSession(
	input: LoginAuthenticationInput,
): Promise<AuthenticationResult> {
	const backendResult =
		await backendBoundary.public.post<AuthenticationLoginBackendResult>(
			AUTHENTICATION_LOGIN_BACKEND_PATH,
			{
				body: {
					browser: input.browser,
					browserVersion: input.browserVersion,
					ipAddress: input.ipAddress,
					password: encryptPasswordForLegacyBackend(input.password),
					userId: input.userId,
				},
			},
		);

	writeSessionCookies(backendResult);

	return mapBackendLoginResultToAuthenticationResult(backendResult);
}

export function readCurrentAuthenticationSession(): AuthenticationResult | null {
	const appSession = appSessionPlatform.get();

	if (!appSession) {
		return null;
	}

	return mapAppSessionToAuthenticationResult(appSession);
}

export async function readAuthenticationMenus({
	menuGroup,
}: GetAuthenticationMenusInput): Promise<readonly AuthenticationMenuItem[]> {
	const backendResult =
		await backendBoundary.private.get<AuthenticationMenuBackendResult>(
			AUTHENTICATION_MENU_BACKEND_PATH,
			{ query: { menuGroup } },
		);

	return backendResult.data;
}

function writeSessionCookies(
	backendResult: AuthenticationLoginBackendResult,
): void {
	const appSession = mapBackendLoginResultToAppSession(backendResult);
	const appSessionCookieValue =
		appSessionPlatform.createCookieValue(appSession);
	const setCookieHeaders = [
		serializeAppSessionCookieHeader(appSessionCookieValue),
		...appSessionPlatform.createLegacyCookieHeaders({
			accessId: backendResult.accessId,
			accessToken: backendResult.accessToken,
			fgCore: backendResult.fgCore ?? null,
			fgEss: backendResult.fgEss ?? null,
			fgMss: backendResult.fgMss ?? null,
			refreshToken: backendResult.refreshToken ?? null,
			userGroup: backendResult.userGroup ?? null,
			userId: backendResult.userId,
			userLevel: backendResult.userLevel,
			userName: backendResult.userName ?? null,
		}),
	];

	setResponseHeader("Set-Cookie", setCookieHeaders);
}

function mapBackendLoginResultToAppSession(
	backendResult: AuthenticationLoginBackendResult,
): AppSessionData {
	return withoutUndefinedProperties({
		accessId: backendResult.accessId,
		accessToken: backendResult.accessToken,
		menuGroups: getMenuGroupsFromBackendFlags(backendResult),
		userGroup: normalizeOptionalBackendString(backendResult.userGroup),
		userId: backendResult.userId,
		userLevel: backendResult.userLevel,
		userName: normalizeOptionalBackendString(backendResult.userName),
	});
}

function serializeAppSessionCookieHeader(cookieValue: string): string {
	const parts = [
		`${encodeURIComponent(APP_SESSION_COOKIE_NAME)}=${encodeURIComponent(cookieValue)}`,
		`Max-Age=${sessionCookieMaxAgeSeconds}`,
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

function mapAppSessionToAuthenticationResult(
	appSession: AppSessionData,
): AuthenticationResult {
	return withoutUndefinedProperties({
		menuGroups: appSession.menuGroups,
		userGroup: appSession.userGroup,
		userId: appSession.userId,
		userLevel: appSession.userLevel,
		userName: appSession.userName,
	});
}

function mapBackendLoginResultToAuthenticationResult(
	backendResult: AuthenticationLoginBackendResult,
): AuthenticationResult {
	return withoutUndefinedProperties({
		menuGroups: getMenuGroupsFromBackendFlags(backendResult),
		userGroup: normalizeOptionalBackendString(backendResult.userGroup),
		userId: backendResult.userId,
		userLevel: backendResult.userLevel,
		userName: normalizeOptionalBackendString(backendResult.userName),
	});
}

function getMenuGroupsFromBackendFlags(
	backendResult: AuthenticationLoginBackendResult,
): AppSessionMenuGroup[] {
	const menuGroupFlags = [
		[backendResult.fgEss, "ESS"],
		[backendResult.fgMss, "MSS"],
		[backendResult.fgCore, "CORE"],
	] as const satisfies readonly (readonly [
		Flag | null | undefined,
		AppSessionMenuGroup,
	])[];

	return menuGroupFlags.flatMap(([flag, menuGroup]) =>
		flag === "T" ? [menuGroup] : [],
	);
}

function normalizeOptionalBackendString(
	value: string | null | undefined,
): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}

	const trimmedValue = value.trim();

	return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function encryptPasswordForLegacyBackend(password: string): string {
	const authSecret = env.AUTH_SECRET;

	if (!authSecret) {
		throw new Error("AUTH_SECRET is not configured.");
	}

	const key = Buffer.from(authSecret, "utf8");
	const algorithm = getLegacyAesAlgorithm(key.length);
	const cipher = createCipheriv(algorithm, key, zeroInitializationVector);

	return Buffer.concat([
		cipher.update(password, "utf8"),
		cipher.final(),
	]).toString("base64");
}

function getLegacyAesAlgorithm(keyLengthBytes: number) {
	if (keyLengthBytes === 16) {
		return "aes-128-cbc";
	}

	if (keyLengthBytes === 24) {
		return "aes-192-cbc";
	}

	if (keyLengthBytes === 32) {
		return "aes-256-cbc";
	}

	throw new Error("AUTH_SECRET must be 16, 24, or 32 UTF-8 bytes.");
}

function withoutUndefinedProperties<TObject extends Record<string, unknown>>(
	value: TObject,
): TObject {
	return Object.fromEntries(
		Object.entries(value).filter(
			([, propertyValue]) => propertyValue !== undefined,
		),
	) as TObject;
}
