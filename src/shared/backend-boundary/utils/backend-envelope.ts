import {
	ApiBusinessError,
	ApiForbiddenError,
	ApiServerDownError,
	ApiSessionExpiredError,
	ApiUnknownError,
	ApiValidationError,
} from "../api.errors";
import type { BackendEnvelope } from "../api.types";

/** Reads backend response body as NHCS Backend Envelope. */
export async function readBackendEnvelope<TPayload = unknown>(
	response: Response,
): Promise<BackendEnvelope<TPayload>> {
	return (await response.json()) as BackendEnvelope<TPayload>;
}

/** Throws typed API error when Backend Envelope or HTTP status indicates failure. */
export function throwIfBackendFailure<TPayload = unknown>(
	response: Response,
	envelope: BackendEnvelope<TPayload>,
): void {
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
			getBackendMessage(envelope, "Internal server error."),
			{ envelope, status: response.status },
		);
	}

	if (response.status !== 200) {
		throw new ApiUnknownError(
			getBackendMessage(envelope, "Backend returned unknown API behavior."),
			{ envelope, status: response.status },
		);
	}
}

/** Extracts normalized payload from Backend Envelope, preferring result over data. */
export function extractBackendPayload<TPayload = unknown>(
	envelope: BackendEnvelope<TPayload>,
): TPayload | undefined {
	if (Object.hasOwn(envelope, "result")) {
		// TODO: Usually .result.data
		return envelope.result;
	}

	return envelope.data;
}

/** Chooses backend-provided message when present, otherwise fallback message. */
function getBackendMessage(
	envelope: BackendEnvelope,
	fallbackMessage: string,
): string {
	if (typeof envelope.message === "string" && envelope.message.length > 0) {
		return envelope.message;
	}

	return fallbackMessage;
}
