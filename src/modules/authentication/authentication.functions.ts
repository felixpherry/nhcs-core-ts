import { createServerFn } from "@tanstack/react-start";
import { getAuthenticationMenusInputSchema } from "./authentication.schema";

export const getAuthenticationMenus = createServerFn({ method: "GET" })
	.inputValidator(getAuthenticationMenusInputSchema)
	.handler(async ({ data }) => {
		const { readAuthenticationMenus } = await import("./authentication.server");

		return readAuthenticationMenus(data);
	});
