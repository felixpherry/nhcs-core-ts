import { env } from "#/env";
import {
	ApiBusinessError,
	ApiForbiddenError,
	ApiServerDownError,
	ApiSessionExpiredError,
	ApiUnknownError,
	ApiValidationError,
} from "./api.errors";
import type {
	BackendEnvelope,
	JsonHttpMethod,
	PublicJsonOptions,
	PublicJsonPostOptions,
} from "./api.types";
import {
	buildBackendUrl,
	buildJsonHeaders,
	extractBackendPayload,
	getBackendMessage,
} from "./api.utils";

export {
	ApiBusinessError,
	ApiForbiddenError,
	ApiServerDownError,
	ApiSessionExpiredError,
	ApiUnknownError,
	ApiValidationError,
} from "./api.errors";
export type {
	ApiErrorDiagnostics,
	BackendEnvelope,
	JsonValue,
	PublicJsonOptions,
	PublicJsonPostOptions,
	PublicJsonQuery,
} from "./api.types";

export const api = {
	public: {
		get: <TPayload = unknown>(
			backendPath: string,
			options?: PublicJsonOptions,
		) => publicJson<TPayload>("GET", backendPath, options),
		post: <TPayload = unknown>(
			backendPath: string,
			options?: PublicJsonPostOptions,
		) => publicJson<TPayload>("POST", backendPath, options),
	},
};

async function publicJson<TPayload = unknown>(
	method: JsonHttpMethod,
	backendPath: string,
	options: PublicJsonPostOptions = {},
): Promise<TPayload> {
	const { body, headers, query, ...fetchOptions } = options;
	const url = buildBackendUrl(env.API_BASE_URL, backendPath, query);
	let response: Response;

	try {
		response = await fetch(url, {
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

	const envelope = (await response.json()) as BackendEnvelope<TPayload>;

	if (envelope.isGranted === false) {
		throw new ApiSessionExpiredError(
			getBackendMessage(envelope, "Backend session expired."),
			{ envelope, status: response.status },
		);
	}

	if (response.status === 200 && envelope.isSuccess === false) {
		throw new ApiBusinessError(
			getBackendMessage(
				envelope,
				"Backend rejected request without an error message.",
			),
			{ envelope, status: response.status },
		);
	}

	if (response.status === 400) {
		throw new ApiValidationError(
			getBackendMessage(envelope, "Backend request validation failed."),
			{ envelope, status: response.status },
		);
	}

	if (response.status === 403) {
		throw new ApiForbiddenError(
			getBackendMessage(envelope, "Forbidden Access."),
			{ envelope, status: response.status },
		);
	}

	if (response.status >= 500) {
		throw new ApiServerDownError(
			getBackendMessage(envelope, "Internal Server Error."),
			{ envelope, status: response.status },
		);
	}

	if (response.status !== 200) {
		throw new ApiUnknownError(
			getBackendMessage(envelope, "Backend returned unknown API behavior."),
			{ envelope, status: response.status },
		);
	}

	return extractBackendPayload(envelope) as TPayload;
}
