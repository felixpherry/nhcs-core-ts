import type { ApiErrorDiagnostics } from "./api.types";

export class ApiBusinessError<TPayload = unknown> extends Error {
	readonly kind = "business";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiBusinessError";
		this.diagnostics = diagnostics;
	}
}

export class ApiForbiddenError<TPayload = unknown> extends Error {
	readonly kind = "forbidden";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiForbiddenError";
		this.diagnostics = diagnostics;
	}
}

export class ApiUnknownError<TPayload = unknown> extends Error {
	readonly kind = "unknown";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiUnknownError";
		this.diagnostics = diagnostics;
	}
}

export class ApiValidationError<TPayload = unknown> extends Error {
	readonly kind = "validation";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiValidationError";
		this.diagnostics = diagnostics;
	}
}

export class ApiServerDownError<TPayload = unknown> extends Error {
	readonly kind = "server-down";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	constructor(
		message: string,
		diagnostics: ApiErrorDiagnostics<TPayload>,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = "ApiServerDownError";
		this.diagnostics = diagnostics;
	}
}

export class ApiSessionExpiredError<TPayload = unknown> extends Error {
	readonly kind = "session-expired";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiSessionExpiredError";
		this.diagnostics = diagnostics;
	}
}
