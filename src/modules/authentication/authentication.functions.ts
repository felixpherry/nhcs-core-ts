import { createServerFn } from "@tanstack/react-start";
import {
	getAuthenticationMenusInputSchema,
	loginAuthenticationInputSchema,
} from "./authentication.schema";

export const login = createServerFn({ method: "POST" })
	.inputValidator(loginAuthenticationInputSchema)
	.handler(async ({ data }) => {
		const { establishAuthenticationSession } = await import(
			"./authentication.server"
		);

		return establishAuthenticationSession(data);
	});

export const getCurrentAuthenticationSession = createServerFn({
	method: "GET",
}).handler(async () => {
	const { readCurrentAuthenticationSession } = await import(
		"./authentication.server"
	);

	return readCurrentAuthenticationSession();
});

export const getAuthenticationMenus = createServerFn({ method: "GET" })
	.inputValidator(getAuthenticationMenusInputSchema)
	.handler(async ({ data }) => {
		const { readAuthenticationMenus } = await import("./authentication.server");

		return readAuthenticationMenus(data);
	});
