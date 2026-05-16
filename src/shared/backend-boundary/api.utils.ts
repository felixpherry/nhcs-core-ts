import queryString from "query-string";
import type {
	BackendEnvelope,
	PublicJsonOptions,
	PublicJsonQuery,
} from "./api.types";

export function buildBackendUrl(
	baseUrl: string,
	backendPath: string,
	query?: PublicJsonQuery,
): string {
	assertRelativeBackendPath(backendPath);

	const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
	const pathWithQuery = queryString.stringifyUrl({ url: backendPath, query });
	const path = pathWithQuery.startsWith("/")
		? pathWithQuery.slice(1)
		: pathWithQuery;

	return new URL(path, normalizedBaseUrl).toString();
}

export function getBackendMessage(
	envelope: BackendEnvelope,
	fallbackMessage: string,
): string {
	if (typeof envelope.message === "string" && envelope.message.length > 0) {
		return envelope.message;
	}

	return fallbackMessage;
}

export function extractBackendPayload<TPayload = unknown>(
	envelope: BackendEnvelope<TPayload>,
): TPayload | undefined {
	if (Object.hasOwn(envelope, "result")) {
		// TODO: Usually .result.data
		return envelope.result;
	}

	return envelope.data;
}

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

function assertRelativeBackendPath(backendPath: string): void {
	if (backendPath.trim() !== backendPath || backendPath.length === 0) {
		throw new Error("Backend path must be a non-empty relative path.");
	}

	if (backendPath.startsWith("//")) {
		throw new Error("Backend path must be relative, not protocol-relative.");
	}

	if (hasParentPathSegment(backendPath)) {
		throw new Error("Backend path must not contain parent directory segments.");
	}

	try {
		const parsedUrl = new URL(backendPath);
		if (parsedUrl.protocol) {
			throw new Error("Backend path must be relative, not absolute.");
		}
	} catch (error) {
		if (error instanceof TypeError) {
			return;
		}

		throw error;
	}
}

function hasParentPathSegment(backendPath: string): boolean {
	const [path = ""] = backendPath.split(/[?#]/);

	return path.split("/").some((segment) => decodePathSegment(segment) === "..");
}

function decodePathSegment(segment: string): string {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}
