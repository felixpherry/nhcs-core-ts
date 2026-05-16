export type AppSessionMenuGroup = "ESS" | "MSS" | "CORE";

export type AppSession = {
	readonly accessId: string;
	readonly accessToken: string;
	readonly menuGroups: readonly AppSessionMenuGroup[];
	readonly userId: string;
	readonly userLevel: string;
};
