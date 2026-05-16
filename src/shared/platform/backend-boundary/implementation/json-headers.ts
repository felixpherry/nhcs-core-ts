import type { PublicJsonOptions } from "../api.types";

/** Builds JSON request headers while preserving caller-provided header overrides. */
export function buildJsonHeaders(
	headers: PublicJsonOptions["headers"],
): Headers {
	const jsonHeaders = new Headers(headers);

	if (!jsonHeaders.has("accept")) {
		jsonHeaders.set("accept", "application/json");
	}

	if (!jsonHeaders.has("content-type")) {
		jsonHeaders.set("content-type", "application/json");
	}

	return jsonHeaders;
}
