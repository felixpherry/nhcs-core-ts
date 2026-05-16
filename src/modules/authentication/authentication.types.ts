import type { z } from "zod";
import type {
	authenticationMenuGroupSchema,
	getAuthenticationMenusInputSchema,
} from "./authentication.schema";

export type AuthenticationMenuGroup = z.infer<
	typeof authenticationMenuGroupSchema
>;

export type GetAuthenticationMenusInput = z.infer<
	typeof getAuthenticationMenusInputSchema
>;

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
