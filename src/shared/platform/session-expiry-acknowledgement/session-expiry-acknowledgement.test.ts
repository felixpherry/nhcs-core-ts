// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

const { acknowledgeExpiredSessionMock } = vi.hoisted(() => ({
	acknowledgeExpiredSessionMock: vi.fn(async () => ({
		clearedCookieNames: ["nhcs_session"],
	})),
}));

vi.mock("./implementation/session-expiry-acknowledgement.functions", () => ({
	acknowledgeExpiredSession: acknowledgeExpiredSessionMock,
}));

import { ApiMissingAppSessionError } from "../backend-boundary/backend-boundary.protocol";
import { SessionExpiryAcknowledgement } from "./session-expiry-acknowledgement";
import { SESSION_EXPIRY_ACKNOWLEDGEMENT_STORAGE_KEY } from "./session-expiry-acknowledgement.protocol";

const sessionExpiryAcknowledgement = new SessionExpiryAcknowledgement();

describe("Session Expiry Acknowledgement detector", () => {
	it("detects backend-rejected session expiry structurally", () => {
		expect(
			sessionExpiryAcknowledgement.isExpiryError({
				kind: "session-expired",
				message: "Session expired",
			}),
		).toBe(true);
		expect(
			sessionExpiryAcknowledgement.isExpiryError({
				message: "Session expired",
				name: "ApiSessionExpiredError",
			}),
		).toBe(true);
		expect(
			sessionExpiryAcknowledgement.isExpiryError({
				diagnostics: { envelope: { isGranted: false } },
			}),
		).toBe(true);
	});

	it("does not treat missing App Session as acknowledgement expiry", () => {
		expect(
			sessionExpiryAcknowledgement.isExpiryError(
				new ApiMissingAppSessionError("App Session is missing.", {}),
			),
		).toBe(false);
	});
});

describe("Session Expiry Acknowledgement latch", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		window.sessionStorage.clear();
		sessionExpiryAcknowledgement.clear();
	});

	it("sets, reads, clears, and notifies pending acknowledgement state", () => {
		const listener = vi.fn();
		const unsubscribe = sessionExpiryAcknowledgement.subscribe(listener);

		expect(sessionExpiryAcknowledgement.isPending()).toBe(false);
		expect(sessionExpiryAcknowledgement.setPending()).toBe(true);
		expect(sessionExpiryAcknowledgement.isPending()).toBe(true);
		expect(listener).toHaveBeenCalledWith(true);

		sessionExpiryAcknowledgement.clear();

		expect(sessionExpiryAcknowledgement.isPending()).toBe(false);
		expect(listener).toHaveBeenLastCalledWith(false);

		unsubscribe();
		sessionExpiryAcknowledgement.setPending();
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it("keeps repeated sets idempotent while acknowledgement is pending", () => {
		const listener = vi.fn();
		sessionExpiryAcknowledgement.subscribe(listener);

		expect(sessionExpiryAcknowledgement.setPending()).toBe(true);
		expect(sessionExpiryAcknowledgement.setPending()).toBe(false);

		expect(sessionExpiryAcknowledgement.isPending()).toBe(true);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("stores UI state only in browser session storage", () => {
		sessionExpiryAcknowledgement.setPending();

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

		expect(sessionExpiryAcknowledgement.setPending()).toBe(true);
		expect(sessionExpiryAcknowledgement.isPending()).toBe(true);

		sessionExpiryAcknowledgement.clear();

		expect(sessionExpiryAcknowledgement.isPending()).toBe(false);
	});
});

describe("Session Expiry Acknowledgement acknowledgement", () => {
	afterEach(() => {
		acknowledgeExpiredSessionMock.mockClear();
	});

	it("delegates acknowledgement to the server function adapter", async () => {
		await expect(sessionExpiryAcknowledgement.acknowledge()).resolves.toEqual({
			clearedCookieNames: ["nhcs_session"],
		});

		expect(acknowledgeExpiredSessionMock).toHaveBeenCalledTimes(1);
	});
});
