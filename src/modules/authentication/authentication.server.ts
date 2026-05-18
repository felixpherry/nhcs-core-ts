import { BackendBoundary } from "#/shared/platform/backend-boundary/backend-boundary";
import type {
	AuthenticationMenuBackendResult,
	AuthenticationMenuItem,
	GetAuthenticationMenusInput,
} from "./authentication.types";

const AUTHENTICATION_MENU_BACKEND_PATH = "/authentication/api/auth/menu";

const backendBoundary = new BackendBoundary();

export async function readAuthenticationMenus({
	menuGroup,
}: GetAuthenticationMenusInput): Promise<readonly AuthenticationMenuItem[]> {
	const backendResult =
		await backendBoundary.private.get<AuthenticationMenuBackendResult>(
			AUTHENTICATION_MENU_BACKEND_PATH,
			{ query: { menuGroup } },
		);

	return backendResult.data;
}
