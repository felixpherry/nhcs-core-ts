import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiBusinessError } from "#/shared/platform/backend-boundary/backend-boundary.protocol";
import type { GetAuthenticationMenusInput } from "./authentication.types";

const { privateGetMock } = vi.hoisted(() => ({
	privateGetMock: vi.fn(),
}));

vi.mock("@tanstack/react-start/ssr-rpc", () => ({
	createSsrRpc: () => async (payload: { data?: unknown }) => {
		try {
			const { getAuthenticationMenusInputSchema } = await import(
				"./authentication.schema"
			);
			const { readAuthenticationMenus } = await import(
				"./authentication.server"
			);

			return {
				result: await readAuthenticationMenus(
					getAuthenticationMenusInputSchema.parse(payload.data),
				),
			};
		} catch (error) {
			return { error };
		}
	},
}));

vi.mock("#/shared/platform/backend-boundary/backend-boundary", () => ({
	BackendBoundary: class {
		readonly private = {
			get: privateGetMock,
		};
	},
}));

import { getAuthenticationMenus } from "./authentication.functions";

describe("getAuthenticationMenus", () => {
	afterEach(() => {
		privateGetMock.mockReset();
	});

	it("returns menu items from the Backend Boundary result wrapper", async () => {
		const menuItems = [
			{
				features: [
					{
						featureCode: "CORE_DASHBOARD",
						featureName: "Open dashboard",
						isGranted: true,
					},
				],
				iconMenu: "dashboard",
				isContainer: "F",
				isSection: "F",
				menuCode: "DASHBOARD",
				menuId: 1,
				menuName: "Dashboard",
				menus: [],
				uri: "/dashboard",
				urlGuide: "",
			},
		];
		privateGetMock.mockResolvedValue({ data: menuItems });

		await expect(
			getAuthenticationMenus({ data: { menuGroup: "CORE" } }),
		).resolves.toEqual(menuItems);

		expect(privateGetMock).toHaveBeenCalledWith(
			"/authentication/api/auth/menu",
			{ query: { menuGroup: "CORE" } },
		);
	});

	it("validates menu group input before calling the Backend Boundary", async () => {
		const invalidInput = {
			menuGroup: "INVALID",
		} as unknown as GetAuthenticationMenusInput;

		await expect(
			getAuthenticationMenus({ data: invalidInput }),
		).rejects.toThrow();

		expect(privateGetMock).not.toHaveBeenCalled();
	});

	it("propagates typed API errors from the Backend Boundary", async () => {
		const apiError = new ApiBusinessError("Menu request rejected", {
			status: 200,
		});
		privateGetMock.mockRejectedValue(apiError);

		await expect(
			getAuthenticationMenus({ data: { menuGroup: "CORE" } }),
		).rejects.toBe(apiError);
	});
});
