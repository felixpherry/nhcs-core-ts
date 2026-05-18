import type { AppSessionContract } from "./app-session.contract";
import { createAppSessionImplementation } from "./implementation/app-session-implementation.server";

/** Main Adapter for App Session platform behaviour. */
export class AppSession implements AppSessionContract {
	private readonly implementation = createAppSessionImplementation();

	readonly get: AppSessionContract["get"] = this.implementation.get;

	readonly createCookieValue: AppSessionContract["createCookieValue"] =
		this.implementation.createCookieValue;

	readonly createLegacyCookieHeaders: AppSessionContract["createLegacyCookieHeaders"] =
		this.implementation.createLegacyCookieHeaders;

	readonly getSessionCookieNames: AppSessionContract["getSessionCookieNames"] =
		this.implementation.getSessionCookieNames;
}
