import queryString from "query-string";
import type { PublicJsonQuery } from "../api.types";

/** Builds absolute backend URL from configured base URL, safe relative path, and query params. */
export function buildBackendUrl(
	baseUrl: string,
	backendPath: string,
	query?: PublicJsonQuery,
): string {
	assertRelativeBackendPath(backendPath);

	const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
	const pathWithQuery = queryString.stringifyUrl({ url: backendPath, query });
	const path = pathWithQuery.startsWith("/")
		? pathWithQuery.slice(1)
		: pathWithQuery;

	return new URL(path, normalizedBaseUrl).toString();
}

/** Rejects backend paths that can escape configured Backend Boundary base URL. */
function assertRelativeBackendPath(backendPath: string): void {
	if (backendPath.trim() !== backendPath || backendPath.length === 0) {
		throw new Error("Backend path must be a non-empty relative path.");
	}

	if (backendPath.startsWith("//")) {
		throw new Error("Backend path must be relative, not protocol-relative.");
	}

	if (hasParentPathSegment(backendPath)) {
		throw new Error("Backend path must not contain parent directory segments.");
	}

	try {
		const parsedUrl = new URL(backendPath);
		if (parsedUrl.protocol) {
			throw new Error("Backend path must be relative, not absolute.");
		}
	} catch (error) {
		if (error instanceof TypeError) {
			return;
		}

		throw error;
	}
}

/** Detects decoded parent directory segment in backend path portion. */
function hasParentPathSegment(backendPath: string): boolean {
	const [path = ""] = backendPath.split(/[?#]/);

	return path.split("/").some((segment) => decodePathSegment(segment) === "..");
}

/** Decodes path segment while preserving malformed encoded text. */
function decodePathSegment(segment: string): string {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}
