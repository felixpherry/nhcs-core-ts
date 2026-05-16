import type {
	PrivateJsonOptions,
	PrivateJsonPostOptions,
	PublicJsonOptions,
	PublicJsonPostOptions,
} from "./api.types";

export type BackendBoundary = {
	readonly private: {
		/**
		 * Calls protected NHCS backend GET endpoint.
		 *
		 * Contract:
		 * - accepts relative backend paths only
		 * - reads App Session from current request
		 * - throws session-expired API error before backend contact when session is missing
		 * - includes Backend Session Headers derived from App Session
		 * - unwraps Backend Envelope result/data
		 * - throws typed API errors for backend/session/transport failures
		 */
		get<TPayload = unknown>(
			backendPath: string,
			options?: PrivateJsonOptions,
		): Promise<TPayload>;

		/**
		 * Calls protected NHCS backend POST endpoint with JSON body.
		 *
		 * Contract:
		 * - accepts relative backend paths only
		 * - reads App Session from current request
		 * - throws session-expired API error before backend contact when session is missing
		 * - includes Backend Session Headers derived from App Session
		 * - unwraps Backend Envelope result/data
		 * - throws typed API errors for backend/session/transport failures
		 */
		post<TPayload = unknown>(
			backendPath: string,
			options?: PrivateJsonPostOptions,
		): Promise<TPayload>;
	};

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
