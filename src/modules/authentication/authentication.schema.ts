import { z } from "zod";

export const authenticationMenuGroupSchema = z.enum(["CORE", "ESS", "MSS"]);

export const getAuthenticationMenusInputSchema = z.object({
	menuGroup: authenticationMenuGroupSchema,
});
