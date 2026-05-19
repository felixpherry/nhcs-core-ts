import type { z } from "zod";
import type {
	authenticationMenuGroupSchema,
	getAuthenticationMenusInputSchema,
	loginAuthenticationInputSchema,
} from "./authentication.schema";

export type AuthenticationMenuGroup = z.infer<
	typeof authenticationMenuGroupSchema
>;

export type LoginAuthenticationInput = z.infer<
	typeof loginAuthenticationInputSchema
>;

export type GetAuthenticationMenusInput = z.infer<
	typeof getAuthenticationMenusInputSchema
>;

export type AuthenticationResult = {
	readonly menuGroups: readonly AuthenticationMenuGroup[];
	readonly userGroup?: string;
	readonly userId: string;
	readonly userLevel: string;
	readonly userName?: string;
};

export type LoginAuthenticationFieldErrors = {
	readonly password?: readonly string[];
	readonly userId?: readonly string[];
};

export type LoginAuthenticationFailure = {
	readonly fieldErrors?: LoginAuthenticationFieldErrors;
	readonly formError: string;
	readonly ok: false;
};

export type LoginAuthenticationSuccess = {
	readonly authentication: AuthenticationResult;
	readonly ok: true;
};

export type LoginAuthenticationOutcome =
	| LoginAuthenticationFailure
	| LoginAuthenticationSuccess;

export type LogoutAuthenticationResult = {
	readonly destination: string;
};

export type AuthenticationLoginBackendResult = {
	readonly accessId: string;
	readonly accessToken: string;
	readonly fgCore?: "T" | "F" | null;
	readonly fgEss?: "T" | "F" | null;
	readonly fgMss?: "T" | "F" | null;
	readonly refreshToken?: string | null;
	readonly userGroup?: string | null;
	readonly userId: string;
	readonly userLevel: string;
	readonly userName?: string | null;
};

export type AuthenticationMenuFeature = {
	readonly featureId?: number;
	readonly menuId?: number;
	readonly menuCode?: string;
	readonly menuName?: string;
	readonly featureCode: string;
	readonly featureName: string;
	readonly isGranted?: boolean;
};

export type AuthenticationMenuItem = {
	readonly menuId: number;
	readonly menuCode: string;
	readonly menuName: string;
	readonly iconMenu?: string | null;
	readonly uri?: string | null;
	readonly urlGuide?: string | null;
	readonly menus?: readonly AuthenticationMenuItem[];
	readonly features?: readonly AuthenticationMenuFeature[];
	readonly isContainer?: "T" | "F";
	readonly isSection?: "T" | "F";
};

export type AuthenticationMenuBackendResult = {
	readonly data: readonly AuthenticationMenuItem[];
	readonly count?: number;
};
