import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	ApiBusinessError,
	ApiForbiddenError,
	ApiServerDownError,
	ApiUnknownError,
	ApiValidationError,
} from "#/shared/platform/backend-boundary/backend-boundary.protocol";
import {
	getAuthenticationMenusInputSchema,
	loginAuthenticationInputSchema,
	logoutAuthenticationInputSchema,
} from "./authentication.schema";
import {
	clearAuthenticationSession,
	establishAuthenticationSession,
	readAuthenticationMenus,
	readCurrentAuthenticationSession,
} from "./authentication.server";
import type {
	LoginAuthenticationFailure,
	LoginAuthenticationOutcome,
} from "./authentication.types";

export const login = createServerFn({ method: "POST" })
	.inputValidator(z.unknown())
	.handler(async ({ data }): Promise<LoginAuthenticationOutcome> => {
		const parsedInput = loginAuthenticationInputSchema.safeParse(data);

		if (!parsedInput.success) {
			return {
				fieldErrors: z.flattenError(parsedInput.error).fieldErrors,
				formError: "Fix highlighted fields and try again.",
				ok: false,
			};
		}

		try {
			const authentication = await establishAuthenticationSession(
				parsedInput.data,
			);

			return {
				authentication,
				ok: true,
			};
		} catch (error) {
			return mapLoginErrorToFailure(error);
		}
	});

export const logout = createServerFn({ method: "POST" })
	.inputValidator(logoutAuthenticationInputSchema)
	.handler(async () => {
		return clearAuthenticationSession();
	});

export const getCurrentAuthenticationSession = createServerFn({
	method: "GET",
}).handler(async () => {
	return readCurrentAuthenticationSession();
});

export const getAuthenticationMenus = createServerFn({ method: "GET" })
	.inputValidator(getAuthenticationMenusInputSchema)
	.handler(async ({ data }) => {
		return readAuthenticationMenus(data);
	});

function mapLoginErrorToFailure(error: unknown): LoginAuthenticationFailure {
	if (
		error instanceof ApiBusinessError ||
		error instanceof ApiForbiddenError ||
		error instanceof ApiValidationError
	) {
		return {
			formError: error.message,
			ok: false,
		};
	}

	if (error instanceof ApiServerDownError) {
		return {
			formError: "Authentication service unavailable. Try again.",
			ok: false,
		};
	}

	if (error instanceof ApiUnknownError) {
		return {
			formError: "Authentication failed. Try again.",
			ok: false,
		};
	}

	throw error;
}
