import type { PublicJsonOptions, PublicJsonPostOptions } from "../api.types";
import { sendBackendJson } from "./backend-json.server";

/** Sends unauthenticated GET request through Backend Boundary and returns normalized payload. */
export function publicJsonGet<TPayload = unknown>(
	backendPath: string,
	options?: PublicJsonOptions,
): Promise<TPayload> {
	return sendBackendJson<TPayload>({ method: "GET", backendPath, options });
}

/** Sends unauthenticated POST request through Backend Boundary and returns normalized payload. */
export function publicJsonPost<TPayload = unknown>(
	backendPath: string,
	options?: PublicJsonPostOptions,
): Promise<TPayload> {
	return sendBackendJson<TPayload>({ method: "POST", backendPath, options });
}
