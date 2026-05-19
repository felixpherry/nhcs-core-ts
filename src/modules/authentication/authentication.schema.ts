import { z } from "zod";

export const authenticationMenuGroupSchema = z.enum(["CORE", "ESS", "MSS"]);

export const loginAuthenticationInputSchema = z.object({
	browser: z.string().max(100).optional().default(""),
	browserVersion: z.string().max(100).optional().default(""),
	ipAddress: z.string().max(100).optional().default(""),
	password: z.string().min(1).max(255),
	userId: z.string().trim().min(4).max(100),
});

export const logoutAuthenticationInputSchema = z.object({});

export const getAuthenticationMenusInputSchema = z.object({
	menuGroup: authenticationMenuGroupSchema,
});
