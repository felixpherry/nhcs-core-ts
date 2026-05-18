// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiMissingAppSessionError } from "../backend-boundary/api.errors";
import {
	clearSessionExpiryAcknowledgement,
	isSessionExpiryAcknowledgementError,
	isSessionExpiryAcknowledgementPending,
	SESSION_EXPIRY_ACKNOWLEDGEMENT_STORAGE_KEY,
	setSessionExpiryAcknowledgementPending,
	subscribeToSessionExpiryAcknowledgement,
} from "./session-expiry-acknowledgement.client";

describe("Session Expiry Acknowledgement detector", () => {
	it("detects backend-rejected session expiry structurally", () => {
		expect(
			isSessionExpiryAcknowledgementError({
				kind: "session-expired",
				message: "Session expired",
			}),
		).toBe(true);
		expect(
			isSessionExpiryAcknowledgementError({
				message: "Session expired",
				name: "ApiSessionExpiredError",
			}),
		).toBe(true);
		expect(
			isSessionExpiryAcknowledgementError({
				diagnostics: { envelope: { isGranted: false } },
			}),
		).toBe(true);
	});

	it("does not treat missing App Session as acknowledgement expiry", () => {
		expect(
			isSessionExpiryAcknowledgementError(
				new ApiMissingAppSessionError("App Session is missing.", {}),
			),
		).toBe(false);
	});
});

describe("Session Expiry Acknowledgement latch", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		window.sessionStorage.clear();
		clearSessionExpiryAcknowledgement();
	});

	it("sets, reads, clears, and notifies pending acknowledgement state", () => {
		const listener = vi.fn();
		const unsubscribe = subscribeToSessionExpiryAcknowledgement(listener);

		expect(isSessionExpiryAcknowledgementPending()).toBe(false);
		expect(setSessionExpiryAcknowledgementPending()).toBe(true);
		expect(isSessionExpiryAcknowledgementPending()).toBe(true);
		expect(listener).toHaveBeenCalledWith(true);

		clearSessionExpiryAcknowledgement();

		expect(isSessionExpiryAcknowledgementPending()).toBe(false);
		expect(listener).toHaveBeenLastCalledWith(false);

		unsubscribe();
		setSessionExpiryAcknowledgementPending();
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("keeps repeated sets idempotent while acknowledgement is pending", () => {
		const listener = vi.fn();
		subscribeToSessionExpiryAcknowledgement(listener);

		expect(setSessionExpiryAcknowledgementPending()).toBe(true);
		expect(setSessionExpiryAcknowledgementPending()).toBe(false);

		expect(isSessionExpiryAcknowledgementPending()).toBe(true);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("stores UI state only in browser session storage", () => {
		setSessionExpiryAcknowledgementPending();

		expect(window.sessionStorage.length).toBe(1);
		expect(
			window.sessionStorage.getItem(SESSION_EXPIRY_ACKNOWLEDGEMENT_STORAGE_KEY),
		).toBe("pending");
	});

	it("falls back to in-memory state when session storage fails", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("storage unavailable");
		});
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("storage unavailable");
		});
		vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
			throw new Error("storage unavailable");
		});

		expect(setSessionExpiryAcknowledgementPending()).toBe(true);
		expect(isSessionExpiryAcknowledgementPending()).toBe(true);

		clearSessionExpiryAcknowledgement();

		expect(isSessionExpiryAcknowledgementPending()).toBe(false);
	});
});
