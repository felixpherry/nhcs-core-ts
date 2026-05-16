import type { ApiErrorDiagnostics } from "./api.types";

/** Represents backend business-rule failure carried by Backend Envelope. */
export class ApiBusinessError<TPayload = unknown> extends Error {
	readonly kind = "business";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	/** Creates business API error with backend diagnostics. */
	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiBusinessError";
		this.diagnostics = diagnostics;
	}
}

/** Represents backend forbidden response for current caller. */
export class ApiForbiddenError<TPayload = unknown> extends Error {
	readonly kind = "forbidden";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	/** Creates forbidden API error with backend diagnostics. */
	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiForbiddenError";
		this.diagnostics = diagnostics;
	}
}

/** Represents backend behavior that does not match known Backend Boundary rules. */
export class ApiUnknownError<TPayload = unknown> extends Error {
	readonly kind = "unknown";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	/** Creates unknown API error with backend diagnostics. */
	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiUnknownError";
		this.diagnostics = diagnostics;
	}
}

/** Represents backend validation failure for caller input. */
export class ApiValidationError<TPayload = unknown> extends Error {
	readonly kind = "validation";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	/** Creates validation API error with backend diagnostics. */
	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiValidationError";
		this.diagnostics = diagnostics;
	}
}

/** Represents backend outage or network failure. */
export class ApiServerDownError<TPayload = unknown> extends Error {
	readonly kind = "server-down";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	/** Creates server-down API error with backend or network diagnostics. */
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

/** Represents missing, expired, or rejected backend session. */
export class ApiSessionExpiredError<TPayload = unknown> extends Error {
	readonly kind = "session-expired";
	readonly diagnostics: ApiErrorDiagnostics<TPayload>;

	/** Creates session-expired API error with backend diagnostics. */
	constructor(message: string, diagnostics: ApiErrorDiagnostics<TPayload>) {
		super(message);
		this.name = "ApiSessionExpiredError";
		this.diagnostics = diagnostics;
	}
}
