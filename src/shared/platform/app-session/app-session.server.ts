import type {
	CreateAppSessionCookieValue,
	GetAppSession,
} from "./app-session.contract";
import { readAppSession } from "./implementation/read-app-session.server";
import { createSignedAppSessionCookieValue } from "./implementation/signed-app-session-cookie.server";

export type {
	CreateAppSessionCookieValue,
	GetAppSession,
	GetAppSessionOptions,
} from "./app-session.contract";
export { APP_SESSION_COOKIE_NAME } from "./app-session.contract";
export type { AppSession } from "./app-session.types";

export const getAppSession: GetAppSession = readAppSession;

export const createAppSessionCookieValue: CreateAppSessionCookieValue =
	createSignedAppSessionCookieValue;
