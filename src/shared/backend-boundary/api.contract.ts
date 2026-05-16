import type { PublicJsonOptions, PublicJsonPostOptions } from "./api.types";

export type BackendBoundary = {
	readonly public: {
		/**
		 * Calls public NHCS backend GET endpoint.
		 *
		 * Contract:
		 * - accepts relative backend paths only
		 * - uses API_BASE_URL centrally
		 * - unwraps Backend Envelope result/data
		 * - throws typed API errors for backend/session/transport failures
		 */
		get<TPayload = unknown>(
			backendPath: string,
			options?: PublicJsonOptions,
		): Promise<TPayload>;

		/**
		 * Calls public NHCS backend POST endpoint with JSON body.
		 *
		 * Contract:
		 * - accepts relative backend paths only
		 * - uses API_BASE_URL centrally
		 * - unwraps Backend Envelope result/data
		 * - throws typed API errors for backend/session/transport failures
		 */
		post<TPayload = unknown>(
			backendPath: string,
			options?: PublicJsonPostOptions,
		): Promise<TPayload>;
	};
};
