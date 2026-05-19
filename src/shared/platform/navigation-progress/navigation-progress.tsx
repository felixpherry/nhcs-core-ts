import { useRouterState } from "@tanstack/react-router";
import NProgress from "nprogress";
import { useEffect, useMemo } from "react";

export interface NavigationProgressProps {
	delayMs?: number;
	minimumVisibleMs?: number;
}

class NavigationProgressController {
	private readonly delayMs: number;
	private readonly minimumVisibleMs: number;
	private readonly progress = NProgress;
	private startTimeoutId: ReturnType<typeof setTimeout> | null = null;
	private stopTimeoutId: ReturnType<typeof setTimeout> | null = null;
	private visibleSince: number | null = null;

	constructor({
		delayMs,
		minimumVisibleMs,
	}: Required<NavigationProgressProps>) {
		this.delayMs = delayMs;
		this.minimumVisibleMs = minimumVisibleMs;
		this.progress.configure({ showSpinner: false });
	}

	setPending(isPending: boolean) {
		if (isPending) {
			this.cancelStop();

			if (this.visibleSince !== null || this.startTimeoutId !== null) {
				return;
			}

			this.startTimeoutId = setTimeout(() => {
				this.startTimeoutId = null;
				this.visibleSince = Date.now();
				this.progress.start();
			}, this.delayMs);

			return;
		}

		this.cancelStart();

		if (this.visibleSince === null || this.stopTimeoutId !== null) {
			return;
		}

		const elapsedMs = Date.now() - this.visibleSince;
		const remainingMs = Math.max(this.minimumVisibleMs - elapsedMs, 0);

		this.stopTimeoutId = setTimeout(() => {
			this.stopTimeoutId = null;
			this.visibleSince = null;
			this.progress.done();
		}, remainingMs);
	}

	cleanup() {
		this.cancelStart();
		this.cancelStop();

		if (this.visibleSince !== null) {
			this.visibleSince = null;
			this.progress.done();
		}
	}

	private cancelStart() {
		if (this.startTimeoutId === null) {
			return;
		}

		clearTimeout(this.startTimeoutId);
		this.startTimeoutId = null;
	}

	private cancelStop() {
		if (this.stopTimeoutId === null) {
			return;
		}

		clearTimeout(this.stopTimeoutId);
		this.stopTimeoutId = null;
	}
}

export function NavigationProgress({
	delayMs = 120,
	minimumVisibleMs = 240,
}: NavigationProgressProps) {
	const isPending = useRouterState({
		select: (state) => state.status === "pending",
	});
	const controller = useMemo(
		() => new NavigationProgressController({ delayMs, minimumVisibleMs }),
		[delayMs, minimumVisibleMs],
	);

	useEffect(() => {
		controller.setPending(isPending);
	}, [controller, isPending]);

	useEffect(() => () => controller.cleanup(), [controller]);

	return null;
}
