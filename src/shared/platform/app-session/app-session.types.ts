import type { Flag } from "../../types";

export type AppSessionMenuGroup = "ESS" | "MSS" | "CORE";

export type AppSession = {
	readonly accessId: string;
	readonly accessToken: string;
	readonly menuGroups: readonly AppSessionMenuGroup[];
	readonly userId: string;
	readonly userLevel: string;
};

export type LegacySessionCookieInput = {
	readonly accessId: string | null;
	readonly accessToken: string | null;
	readonly refreshToken: string | null;
	readonly userGroup: string | null;
	readonly userId: string | null;
	readonly userLevel: string | null;
	readonly userName: string | null;
	readonly fgCore: Flag | null;
	readonly fgEss: Flag | null;
	readonly fgMss: Flag | null;
};
