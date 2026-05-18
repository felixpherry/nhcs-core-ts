export type SessionExpiryAcknowledgementListener = (pending: boolean) => void;

export type ClearExpiredSessionCookiesResult = {
	readonly clearedCookieNames: readonly string[];
};
