import { api } from "#/shared/platform/backend-boundary/api.server";
import type {
	AuthenticationMenuBackendResult,
	AuthenticationMenuItem,
	GetAuthenticationMenusInput,
} from "./authentication.types";

const AUTHENTICATION_MENU_BACKEND_PATH = "/authentication/api/auth/menu";

export async function readAuthenticationMenus({
	menuGroup,
}: GetAuthenticationMenusInput): Promise<readonly AuthenticationMenuItem[]> {
	const backendResult = await api.private.get<AuthenticationMenuBackendResult>(
		AUTHENTICATION_MENU_BACKEND_PATH,
		{ query: { menuGroup } },
	);

	return backendResult.data;
}
