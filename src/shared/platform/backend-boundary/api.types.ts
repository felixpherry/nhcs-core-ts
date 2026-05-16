import type { StringifiableRecord } from "query-string";

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

export type BackendEnvelope<TPayload = unknown> = {
	statusCode?: number;
	isSuccess?: boolean;
	isGranted?: boolean;
	message?: string | null;
	error?: JsonValue;
	result?: TPayload;
	data?: TPayload;
};

export type ApiErrorDiagnostics<TPayload = unknown> = {
	readonly status?: number;
	readonly envelope?: BackendEnvelope<TPayload>;
	readonly networkError?: unknown;
};

export type JsonHttpMethod = "GET" | "POST";
