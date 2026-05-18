import type {
	ClearExpiredSessionCookiesResult,
	SessionExpiryAcknowledgementListener,
} from "./session-expiry-acknowledgement.types";

/**
 * Shared Platform contract for Session Expiry Acknowledgement.
 *
 * Client contract:
 * - detects backend-rejected session expiry structurally across serialized errors
 * - does not treat missing/unreadable App Session as acknowledgement expiry
 * - stores browser-session UI state only; never stores credentials or App Session truth
 * - first pending signal wins until acknowledgement is cleared
 * - subscribers receive same-tab pending-state changes
 * - storage failures fall back to in-memory pending state for current runtime
 *
 * Server contract:
 * - acknowledgement does not require a valid App Session or backend session
 * - clears app-owned session cookie plus all known Legacy Cookies
 * - expires host-only and configured domain-scoped cookie variants
 */
export interface SessionExpiryAcknowledgementContract {
	readonly isExpiryError: (error: unknown) => boolean;
	readonly isPending: () => boolean;
	readonly setPending: () => boolean;
	readonly clear: () => void;
	readonly subscribe: (
		listener: SessionExpiryAcknowledgementListener,
	) => () => void;
	readonly acknowledge: () => Promise<ClearExpiredSessionCookiesResult>;
}
