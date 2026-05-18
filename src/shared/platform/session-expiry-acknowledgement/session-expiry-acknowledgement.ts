import { createSessionExpiryAcknowledgementImplementation } from "./implementation/session-expiry-acknowledgement-implementation";
import type { SessionExpiryAcknowledgementContract } from "./session-expiry-acknowledgement.contract";

/** Main Adapter for Session Expiry Acknowledgement platform behaviour. */
export class SessionExpiryAcknowledgement
	implements SessionExpiryAcknowledgementContract
{
	private readonly implementation =
		createSessionExpiryAcknowledgementImplementation();

	readonly isExpiryError: SessionExpiryAcknowledgementContract["isExpiryError"] =
		this.implementation.isExpiryError;

	readonly isPending: SessionExpiryAcknowledgementContract["isPending"] =
		this.implementation.isPending;

	readonly setPending: SessionExpiryAcknowledgementContract["setPending"] =
		this.implementation.setPending;

	readonly clear: SessionExpiryAcknowledgementContract["clear"] =
		this.implementation.clear;

	readonly subscribe: SessionExpiryAcknowledgementContract["subscribe"] =
		this.implementation.subscribe;

	readonly acknowledge: SessionExpiryAcknowledgementContract["acknowledge"] =
		this.implementation.acknowledge;
}
