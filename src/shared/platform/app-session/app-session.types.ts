export type AppSessionMenuGroup = "ESS" | "MSS" | "CORE";

export type AppSession = {
	readonly accessId: string;
	readonly accessToken: string;
	readonly menuGroups: readonly AppSessionMenuGroup[];
	readonly userId: string;
	readonly userLevel: string;
};

export type LegacySessionCookieFlag = "T" | "F";

export type LegacySessionCookieInput = {
	readonly accessId: string | null;
	readonly accessToken: string | null;
	readonly refreshToken: string | null;
	readonly userGroup: string | null;
	readonly userId: string | null;
	readonly userLevel: string | null;
	readonly userName: string | null;
	readonly fgCore: LegacySessionCookieFlag | null;
	readonly fgEss: LegacySessionCookieFlag | null;
	readonly fgMss: LegacySessionCookieFlag | null;
};
