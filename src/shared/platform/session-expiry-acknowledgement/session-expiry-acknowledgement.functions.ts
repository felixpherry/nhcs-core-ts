import { createServerFn } from "@tanstack/react-start";

export const acknowledgeExpiredSession = createServerFn({
	method: "POST",
}).handler(async () => {
	const { clearExpiredSessionCookies } = await import(
		"./session-expiry-acknowledgement.server"
	);

	return clearExpiredSessionCookies();
});
