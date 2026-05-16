import type { BackendBoundary } from "./api.contract";
import { publicJsonGet, publicJsonPost } from "./utils/public-json.server";

export type { BackendBoundary } from "./api.contract";
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

export const api: BackendBoundary = {
	public: {
		get: publicJsonGet,
		post: publicJsonPost,
	},
};
