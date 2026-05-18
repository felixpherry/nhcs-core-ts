import { AppSession } from "../../app-session/app-session";
import type { BackendBoundaryContract } from "../backend-boundary.contract";
import { ApiMissingAppSessionError } from "../backend-boundary.protocol";
import type {
	PrivateJsonOptions,
	PrivateJsonPostOptions,
	PublicJsonOptions,
	PublicJsonPostOptions,
} from "../backend-boundary.types";
import { sendBackendJson } from "./backend-json.server";
import { buildBackendSessionHeaders } from "./backend-session-headers";

/** Creates the concrete Backend Boundary implementation behind the main Adapter. */
export function createBackendBoundaryImplementation(): BackendBoundaryContract {
	const appSessionPlatform = new AppSession();

	async function privateJsonGet<TPayload = unknown>(
		backendPath: string,
		options?: PrivateJsonOptions,
	): Promise<TPayload> {
		return sendPrivateBackendJson<TPayload>("GET", backendPath, options);
	}

	async function privateJsonPost<TPayload = unknown>(
		backendPath: string,
		options?: PrivateJsonPostOptions,
	): Promise<TPayload> {
		return sendPrivateBackendJson<TPayload>("POST", backendPath, options);
	}

	function publicJsonGet<TPayload = unknown>(
		backendPath: string,
		options?: PublicJsonOptions,
	): Promise<TPayload> {
		return sendBackendJson<TPayload>({ method: "GET", backendPath, options });
	}

	function publicJsonPost<TPayload = unknown>(
		backendPath: string,
		options?: PublicJsonPostOptions,
	): Promise<TPayload> {
		return sendBackendJson<TPayload>({ method: "POST", backendPath, options });
	}

	async function sendPrivateBackendJson<TPayload = unknown>(
		method: "GET" | "POST",
		backendPath: string,
		options?: PrivateJsonPostOptions,
	): Promise<TPayload> {
		const appSession = appSessionPlatform.get();

		if (!appSession) {
			throw new ApiMissingAppSessionError(
				"App Session is missing or unreadable.",
				{},
			);
		}

		return sendBackendJson<TPayload>({
			method,
			backendPath,
			options: {
				...options,
				headers: buildBackendSessionHeaders(appSession, options?.headers),
			},
		});
	}

	return {
		private: {
			get: privateJsonGet,
			post: privateJsonPost,
		},
		public: {
			get: publicJsonGet,
			post: publicJsonPost,
		},
	};
}
