/** Finds decoded cookie value by name inside raw Cookie header string. */
export function getCookieValue(
	cookieHeader: string | null | undefined,
	cookieName: string,
): string | undefined {
	if (!cookieHeader) {
		return undefined;
	}

	for (const rawCookie of cookieHeader.split(";")) {
		const cookie = rawCookie.trim();
		const separatorIndex = cookie.indexOf("=");

		if (separatorIndex === -1) {
			continue;
		}

		const name = decodeCookiePart(cookie.slice(0, separatorIndex));

		if (name === cookieName) {
			return decodeCookiePart(cookie.slice(separatorIndex + 1));
		}
	}

	return undefined;
}

/** Decodes cookie name or value while preserving malformed encoded text. */
function decodeCookiePart(part: string): string {
	try {
		return decodeURIComponent(part);
	} catch {
		return part;
	}
}
