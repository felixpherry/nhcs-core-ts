import queryString, { type StringifiableRecord } from "query-string";
import { env } from "#/env";

export type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };

export type PublicJsonQuery = StringifiableRecord;

export type PublicJsonOptions = Omit<RequestInit, "body" | "method"> & {
	query?: PublicJsonQuery;
};

export type PublicJsonPostOptions = PublicJsonOptions & {
	body?: JsonValue;
};

// TODO: Move to separate file and export it. Type is also incomplete
type BackendEnvelope = {
	result?: unknown;
	data?: unknown;
};

type JsonHttpMethod = "GET" | "POST";

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
	const response = await fetch(buildBackendUrl(backendPath, query), {
		...fetchOptions,
		method,
		headers: buildJsonHeaders(headers),
		body: body === undefined ? undefined : JSON.stringify(body),
	});

	const envelope = (await response.json()) as BackendEnvelope;

	return extractBackendPayload(envelope) as TPayload;
}

export function buildBackendUrl(
	backendPath: string,
	query?: PublicJsonQuery,
): string {
	assertRelativeBackendPath(backendPath);

	const baseUrl = env.API_BASE_URL.endsWith("/")
		? env.API_BASE_URL
		: `${env.API_BASE_URL}/`;
	const pathWithQuery = queryString.stringifyUrl({ url: backendPath, query });
	const path = pathWithQuery.startsWith("/")
		? pathWithQuery.slice(1)
		: pathWithQuery;

	return new URL(path, baseUrl).toString();
}

export function extractBackendPayload(envelope: BackendEnvelope): unknown {
	if (Object.hasOwn(envelope, "result")) {
		// TODO: Usually .result.data
		return envelope.result;
	}

	return envelope.data;
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

// TODO: Extract to different file
function buildJsonHeaders(headers: PublicJsonOptions["headers"]): Headers {
	const jsonHeaders = new Headers(headers);

	if (!jsonHeaders.has("accept")) {
		jsonHeaders.set("accept", "application/json");
	}

	if (!jsonHeaders.has("content-type")) {
		jsonHeaders.set("content-type", "application/json");
	}

	return jsonHeaders;
}
