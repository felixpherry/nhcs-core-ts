# Legacy Cookies compatibility contract

Legacy Cookies are signed shared cookies created by older NHCS apps. This app reads them only inside the App Session boundary, then normalizes them to `AppSession`.

## Source evidence

`/home/felixp/dev/NHCS_Frontend` is not present in the workspace. Compatible legacy behavior was confirmed from these present repos:

- `/home/felixp/dev/NHCS_Core/utils/cookies.ts` — custom `cookie-signature` based signing/parsing and obfuscated cookie names.
- `/home/felixp/dev/NHCS_Core/api/authentication.ts` — login writes the legacy cookie set.
- `/home/felixp/dev/NHCS_Core/store/auth.ts` — backend header derivation.
- `/home/felixp/dev/NHCS_ESS_MSS/app/cookies.server.ts` — Remix `createCookie` legacy cookie definitions.
- `/home/felixp/dev/NHCS_ESS_MSS/app/utils/auth/main.server.ts` — parsed cookie fields, authentication check, and backend header derivation.
- `/home/felixp/dev/NHCS_ESS_MSS/app/routes/_auth+/authentication/_index.tsx` — login writes the legacy cookie set.

## Cookie names

Actual cookie name is `baseName + COOKIE_NAME_SUFFIX` with no delimiter added by code. The suffix value must include any intended delimiter, e.g. `_DEV`.

| Logical field | Base cookie name | Needed by normalized App Session |
| --- | --- | --- |
| `accessId` | `Xyc02D92LQ` | yes — backend session identity |
| `accessToken` | `ZTn5qC8jA0` | yes — backend bearer token |
| `userId` | `dXc83nF0p` | yes — backend session identity |
| `userLevel` | `Qm8LxK01w` | yes — backend session identity |
| `fgCore` | `P0bMlqK31` | yes — derives `menuGroups` |
| `fgEss` | `JzXkT8cV2` | yes — derives `menuGroups` |
| `fgMss` | `mKcLw923X` | yes — derives `menuGroups` |
| `refreshToken` | `RfT23qX8n` | no |
| `userGroup` | `Gr9eYd0wZ` | no |
| `userName` | `bZtLkX92n` | no |

A Legacy Cookies fallback can create an App Session only when `accessId`, `accessToken`, `userId`, `userLevel`, `fgCore`, `fgEss`, and `fgMss` are all present, verified, decoded, non-empty, and not the literal fallback value `null`.

## Suffix rules

- Legacy apps append `COOKIE_NAME_SUFFIX` directly to each base name.
- ESS/MSS treats missing suffix as empty string: `${name}${process.env.COOKIE_NAME_SUFFIX ?? ''}`.
- Legacy Core has a precedence bug: `name + process.env.COOKIE_NAME_SUFFIX || ''`, so a missing suffix becomes names ending in `undefined`.
- New app compatibility requires `COOKIE_NAME_SUFFIX` to be configured and non-empty before reading or writing Legacy Cookies.
- Use the same suffix across apps in the same deployment environment.

## Environment variables

| Variable | Required for | Meaning |
| --- | --- | --- |
| `COOKIE_SECRET` | read/write Legacy Cookies | Shared HMAC secret used by `cookie-signature`. Distinct from `NHCS_SESSION_SECRET` and `AUTH_SECRET`. |
| `COOKIE_NAME_SUFFIX` | read/write Legacy Cookies | Non-empty suffix appended to every base cookie name. |
| `PARENT_DOMAIN_COOKIE` | write/clear Legacy Cookies | Shared parent domain used on `Set-Cookie`. Not needed to parse an incoming `Cookie` header. |
| `APP_ENV` | write Legacy Cookies | `production` enables the `Secure` cookie attribute. |

Legacy Cookie compatibility must not reuse `NHCS_SESSION_SECRET`; that secret signs only the app-owned `nhcs_session` cookie.

## Signing and verification

Both inspected legacy apps produce compatible values for string cookie payloads:

1. JSON-string encode the raw value. For strings this is the raw value wrapped in quotes, e.g. `"USER-1"`.
2. Standard Base64 encode the JSON string, e.g. `"USER-1"` becomes `IlVTRVItMSI=`.
3. Sign the Base64 payload with `cookie-signature.sign(payload, COOKIE_SECRET)`.
4. Store the signed value in the cookie. `Set-Cookie` serialization may URL-encode characters such as `=`, `/`, or `+`; incoming cookie parsing must decode before verification.
5. Verify with `cookie-signature.unsign(signedValue, COOKIE_SECRET)`.
6. If verification fails, treat the Legacy Cookie as invalid and do not create an App Session from it.
7. Base64 decode the unsigned payload, parse/remove the JSON string quotes, and use the decoded string field value.

`cookie-signature` signs as:

```text
<payload>.<base64(hmac-sha256(payload, COOKIE_SECRET)) without trailing = padding>
```

Example test vector:

```text
COOKIE_SECRET = test-legacy-cookie-secret
raw value     = USER-1
payload       = IlVTRVItMSI=
signed value  = IlVTRVItMSI=.wyOx1kbId9jrZguzqsqk28z9puFcktTdzW9OGWtAV5M
```

## Normalized App Session mapping

| App Session field | Legacy cookie field | Usage |
| --- | --- | --- |
| `accessToken` | `accessToken` | `Authorization: Bearer ${accessToken}` |
| `userId` | `userId` | `user-id` first segment and `user-login-id` value |
| `accessId` | `accessId` | `user-id` second segment |
| `userLevel` | `userLevel` | `user-id` third segment |
| `menuGroups` | `fgEss`, `fgMss`, `fgCore` | navlink rendering and product access |

Backend Session Headers derived from a Legacy Cookies App Session:

```text
Authorization: Bearer <accessToken>
user-id: <userId>_<accessId>_<userLevel>
user-login-id: <userId>
```

Legacy Core only sends `Authorization` and `user-id`; ESS/MSS also sends `user-login-id`. This app should include all three headers because the Backend Boundary contract requires them and ESS/MSS confirms the `user-login-id` value.

Legacy flag mapping for normalized navigation access:

```text
fgEss === "T"  -> menuGroups includes "ESS"
fgMss === "T"  -> menuGroups includes "MSS"
fgCore === "T" -> menuGroups includes "CORE"
```

The normalized order is `ESS`, then `MSS`, then `CORE`, matching legacy login/redirect precedence.
