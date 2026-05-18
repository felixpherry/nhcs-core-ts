import type { SessionExpiryAcknowledgementContract } from "../session-expiry-acknowledgement.contract";
import {
	clearSessionExpiryAcknowledgement,
	isSessionExpiryAcknowledgementError,
	isSessionExpiryAcknowledgementPending,
	setSessionExpiryAcknowledgementPending,
	subscribeToSessionExpiryAcknowledgement,
} from "./session-expiry-acknowledgement.client";
import { acknowledgeExpiredSession } from "./session-expiry-acknowledgement.functions";

/** Creates the concrete Session Expiry Acknowledgement implementation behind the main Adapter. */
export function createSessionExpiryAcknowledgementImplementation(): SessionExpiryAcknowledgementContract {
	return {
		acknowledge: acknowledgeExpiredSession,
		clear: clearSessionExpiryAcknowledgement,
		isExpiryError: isSessionExpiryAcknowledgementError,
		isPending: isSessionExpiryAcknowledgementPending,
		setPending: setSessionExpiryAcknowledgementPending,
		subscribe: subscribeToSessionExpiryAcknowledgement,
	};
}
