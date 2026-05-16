import { z } from "zod";
import type { AppSession } from "../app-session.types";

const appSessionSchema = z.object({
	accessId: nonEmptyString(),
	accessToken: nonEmptyString(),
	userId: nonEmptyString(),
	userLevel: nonEmptyString(),
});

/** Validates unknown data as normalized App Session and throws on invalid shape. */
export function parseAppSession(value: unknown): AppSession {
	return appSessionSchema.parse(value);
}

/** Validates unknown data as normalized App Session and returns null on invalid shape. */
export function safeParseAppSession(value: unknown): AppSession | null {
	const parsedSession = appSessionSchema.safeParse(value);

	return parsedSession.success ? parsedSession.data : null;
}

/** Builds string validator that rejects empty or whitespace-only values. */
function nonEmptyString() {
	return z.string().refine((value) => value.trim().length > 0);
}
