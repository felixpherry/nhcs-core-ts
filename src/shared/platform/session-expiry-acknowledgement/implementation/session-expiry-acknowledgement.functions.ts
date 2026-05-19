import { createServerFn } from "@tanstack/react-start";
import { clearExpiredSessionCookies } from "./session-expiry-acknowledgement.server";

export const acknowledgeExpiredSession = createServerFn({
	method: "POST",
}).handler(async () => {
	return clearExpiredSessionCookies();
});
