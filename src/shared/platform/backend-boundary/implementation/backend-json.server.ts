import { env } from "#/env";
import { ApiServerDownError } from "../api.errors";
import type { JsonHttpMethod, PublicJsonPostOptions } from "../api.types";
import {
	extractBackendPayload,
	readBackendEnvelope,
	throwIfBackendFailure,
} from "./backend-envelope";
import { buildBackendUrl } from "./backend-url";
import { buildJsonHeaders } from "./json-headers";

type BackendJsonRequest = {
	readonly method: JsonHttpMethod;
	readonly backendPath: string;
	readonly options?: PublicJsonPostOptions;
};

/** Sends JSON request to NHCS backend and returns normalized Backend Envelope payload. */
export async function sendBackendJson<TPayload = unknown>({
	method,
	backendPath,
	options = {},
}: BackendJsonRequest): Promise<TPayload> {
	const { query, ...requestOptions } = options;
	const url = buildBackendUrl(env.API_BASE_URL, backendPath, query);
	const response = await fetchJsonOrThrow(url, method, requestOptions);
	const envelope = await readBackendEnvelope<TPayload>(response);

	throwIfBackendFailure(response, envelope);

	return extractBackendPayload(envelope) as TPayload;
}

/** Performs backend fetch and maps transport failure to server-down API error. */
async function fetchJsonOrThrow(
	url: string,
	method: JsonHttpMethod,
	options: Omit<PublicJsonPostOptions, "query">,
): Promise<Response> {
	const { body, headers, ...fetchOptions } = options;

	try {
		return await fetch(url, {
			...fetchOptions,
			method,
			headers: buildJsonHeaders(headers),
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch (networkError) {
		throw new ApiServerDownError(
			"Unable to reach backend service.",
			{ networkError },
			{ cause: networkError },
		);
	}
}
