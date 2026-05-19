// @vitest-environment jsdom

import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { driver, useRouterStateMock } = vi.hoisted(() => ({
	driver: {
		configure: vi.fn(),
		start: vi.fn(),
		done: vi.fn(),
	},
	useRouterStateMock: vi.fn<() => boolean>(),
}));

vi.mock("@tanstack/react-router", () => ({
	useRouterState: useRouterStateMock,
}));

vi.mock("nprogress", () => ({
	default: driver,
}));

import { NavigationProgress } from "./navigation-progress";

describe("NavigationProgress", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllTimers();
		driver.configure.mockClear();
		driver.start.mockClear();
		driver.done.mockClear();
		useRouterStateMock.mockReset();
	});

	it("starts NProgress only after pending state delay", () => {
		vi.useFakeTimers();
		useRouterStateMock.mockReturnValue(true);

		render(<NavigationProgress delayMs={120} minimumVisibleMs={240} />);

		expect(driver.start).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(119);
		});

		expect(driver.start).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(1);
		});

		expect(driver.start).toHaveBeenCalledTimes(1);
	});

	it("cancels delayed start for fast navigation", () => {
		vi.useFakeTimers();
		useRouterStateMock.mockReturnValue(true);

		const view = render(
			<NavigationProgress delayMs={120} minimumVisibleMs={240} />,
		);

		act(() => {
			vi.advanceTimersByTime(80);
		});

		useRouterStateMock.mockReturnValue(false);
		view.rerender(<NavigationProgress delayMs={120} minimumVisibleMs={240} />);

		act(() => {
			vi.advanceTimersByTime(120);
		});

		expect(driver.start).not.toHaveBeenCalled();
		expect(driver.done).not.toHaveBeenCalled();
	});

	it("keeps NProgress visible for minimum duration once shown", () => {
		vi.useFakeTimers();
		useRouterStateMock.mockReturnValue(true);

		const view = render(
			<NavigationProgress delayMs={120} minimumVisibleMs={240} />,
		);

		act(() => {
			vi.advanceTimersByTime(120);
		});

		expect(driver.start).toHaveBeenCalledTimes(1);

		act(() => {
			vi.advanceTimersByTime(50);
		});

		useRouterStateMock.mockReturnValue(false);
		view.rerender(<NavigationProgress delayMs={120} minimumVisibleMs={240} />);

		expect(driver.done).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(189);
		});

		expect(driver.done).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(1);
		});

		expect(driver.done).toHaveBeenCalledTimes(1);
	});
});
