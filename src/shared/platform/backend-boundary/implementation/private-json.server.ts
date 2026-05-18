import { getAppSession } from "../../app-session/app-session.server";
import { ApiMissingAppSessionError } from "../api.errors";
import type { PrivateJsonOptions, PrivateJsonPostOptions } from "../api.types";
import { sendBackendJson } from "./backend-json.server";
import { buildBackendSessionHeaders } from "./backend-session-headers";

/** Sends private GET request through Backend Boundary and returns normalized payload. */
export async function privateJsonGet<TPayload = unknown>(
	backendPath: string,
	options?: PrivateJsonOptions,
): Promise<TPayload> {
	const appSession = getAppSession();

	if (!appSession) {
		throw new ApiMissingAppSessionError(
			"App Session is missing or unreadable.",
			{},
		);
	}

	return sendBackendJson<TPayload>({
		method: "GET",
		backendPath,
		options: {
			...options,
			headers: buildBackendSessionHeaders(appSession, options?.headers),
		},
	});
}

/** Sends private POST request through Backend Boundary and returns normalized payload. */
export async function privateJsonPost<TPayload = unknown>(
	backendPath: string,
	options?: PrivateJsonPostOptions,
): Promise<TPayload> {
	const appSession = getAppSession();

	if (!appSession) {
		throw new ApiMissingAppSessionError(
			"App Session is missing or unreadable.",
			{},
		);
	}

	return sendBackendJson<TPayload>({
		method: "POST",
		backendPath,
		options: {
			...options,
			headers: buildBackendSessionHeaders(appSession, options?.headers),
		},
	});
}
