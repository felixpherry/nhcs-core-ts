import type { BackendBoundary } from "./api.contract";
import {
	privateJsonGet,
	privateJsonPost,
} from "./implementation/private-json.server";
import {
	publicJsonGet,
	publicJsonPost,
} from "./implementation/public-json.server";

export type { BackendBoundary } from "./api.contract";
export {
	ApiBusinessError,
	ApiForbiddenError,
	ApiMissingAppSessionError,
	ApiServerDownError,
	ApiSessionExpiredError,
	ApiUnknownError,
	ApiValidationError,
} from "./api.errors";
export type {
	ApiErrorDiagnostics,
	BackendEnvelope,
	JsonValue,
	PrivateJsonOptions,
	PrivateJsonPostOptions,
	PublicJsonOptions,
	PublicJsonPostOptions,
	PublicJsonQuery,
} from "./api.types";

export const api: BackendBoundary = {
	private: {
		get: privateJsonGet,
		post: privateJsonPost,
	},
	public: {
		get: publicJsonGet,
		post: publicJsonPost,
	},
};
