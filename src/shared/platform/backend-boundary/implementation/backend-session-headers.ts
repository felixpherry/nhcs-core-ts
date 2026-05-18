import type { AppSession } from "../../app-session/app-session.types";
import type { PublicJsonOptions } from "../backend-boundary.types";

/** Builds NHCS Backend Session Headers from normalized App Session. */
export function buildBackendSessionHeaders(
	appSession: AppSession,
	headers?: PublicJsonOptions["headers"],
): Headers {
	const backendHeaders = new Headers(headers);

	backendHeaders.set("authorization", `Bearer ${appSession.accessToken}`);
	backendHeaders.set(
		"user-id",
		`${appSession.userId}_${appSession.accessId}_${appSession.userLevel}`,
	);
	backendHeaders.set("user-login-id", appSession.userId);

	return backendHeaders;
}
