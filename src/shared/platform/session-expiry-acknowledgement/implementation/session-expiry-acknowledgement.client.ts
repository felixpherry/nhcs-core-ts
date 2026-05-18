import { SESSION_EXPIRY_ACKNOWLEDGEMENT_STORAGE_KEY } from "../session-expiry-acknowledgement.protocol";
import type { SessionExpiryAcknowledgementListener } from "../session-expiry-acknowledgement.types";

const pendingStorageValue = "pending";

let memoryPending = false;
const listeners = new Set<SessionExpiryAcknowledgementListener>();

/** Detects backend-rejected Session Expiry Acknowledgement errors across serialization boundaries. */
export function isSessionExpiryAcknowledgementError(error: unknown): boolean {
	if (!isRecord(error)) {
		return false;
	}

	if (error.kind === "session-expired") {
		return true;
	}

	if (error.name === "ApiSessionExpiredError") {
		return true;
	}

	return hasBackendRejectedEnvelope(error);
}

/** Reads pending acknowledgement state from browser session storage or fallback memory. */
export function isSessionExpiryAcknowledgementPending(): boolean {
	const storage = getSessionStorage();

	if (!storage) {
		return memoryPending;
	}

	try {
		return (
			storage.getItem(SESSION_EXPIRY_ACKNOWLEDGEMENT_STORAGE_KEY) ===
			pendingStorageValue
		);
	} catch {
		return memoryPending;
	}
}

/** Marks acknowledgement pending. Returns true only for first pending signal. */
export function setSessionExpiryAcknowledgementPending(): boolean {
	if (isSessionExpiryAcknowledgementPending()) {
		return false;
	}

	memoryPending = true;
	const storage = getSessionStorage();

	if (storage) {
		try {
			storage.setItem(
				SESSION_EXPIRY_ACKNOWLEDGEMENT_STORAGE_KEY,
				pendingStorageValue,
			);
		} catch {
			// Memory fallback keeps current runtime behavior predictable.
		}
	}

	notifyListeners(true);

	return true;
}

/** Clears pending acknowledgement state from browser session storage and fallback memory. */
export function clearSessionExpiryAcknowledgement(): void {
	const wasPending = isSessionExpiryAcknowledgementPending();
	memoryPending = false;
	const storage = getSessionStorage();

	if (storage) {
		try {
			storage.removeItem(SESSION_EXPIRY_ACKNOWLEDGEMENT_STORAGE_KEY);
		} catch {
			// Memory fallback already cleared.
		}
	}

	if (wasPending) {
		notifyListeners(false);
	}
}

/** Subscribes to same-tab acknowledgement latch changes. */
export function subscribeToSessionExpiryAcknowledgement(
	listener: SessionExpiryAcknowledgementListener,
): () => void {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

function notifyListeners(pending: boolean): void {
	for (const listener of listeners) {
		listener(pending);
	}
}

function getSessionStorage(): Storage | null {
	if (typeof window === "undefined") {
		return null;
	}

	return window.sessionStorage;
}

function hasBackendRejectedEnvelope(error: Record<string, unknown>): boolean {
	const diagnostics = error.diagnostics;

	if (!isRecord(diagnostics)) {
		return false;
	}

	const envelope = diagnostics.envelope;

	return isRecord(envelope) && envelope.isGranted === false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
