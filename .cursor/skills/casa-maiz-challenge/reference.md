# Casa Maiz content contract

Default base URL: `https://payload-cms-poc-seven.vercel.app` (must stay configurable).

Docs: https://payload-cms-poc-seven.vercel.app/api/docs  
OpenAPI: https://payload-cms-poc-seven.vercel.app/api/openapi.json

Mobile content version: **1.1**. Public content: `/api/content/v1`. No auth for assessment operations.

## Required query context (every content GET)

| Param | Value |
|---|---|
| `platform` | `ios` or `android` from `Platform.OS` |
| `market` | `MX` |
| `audience` | `guest` |
| `appVersion` | installed app semver, e.g. `1.0.0` (`1` or `v1.0` is invalid) |

Build this in the CMS client only.

## Endpoints

- `GET /api/content/v1/bootstrap`
- `GET /api/content/v1/pages/{slug}` — `home`, `menu`
- `GET /api/content/v1/legal/{key}` — `privacy_policy`
- `POST /api/form-submissions` — **do not call** the shared public environment; mock if implementing `formBlock`
- `GET /api/media/file/{filename}` — also support absolute CDN URLs on media objects

## Envelope

Success includes `contractVersion`, `data`, optional `nextChangeAt`, `preview`, `resolvedContext`. App supports `contractVersion` `1.1` only.

Errors may be a top-level `error` string or an `errors` array (400, 401, 403, 404, 500). Show user-safe messages; keep technical detail for debugging, not the UI.

## Seed destinations (labels come from CMS)

| Path | Screen |
|---|---|
| `/` | Home |
| `/menu` | Menu |
| `/reservas` | Local placeholder |
| `/legal/privacy_policy` | Privacy legal content |

## Blocks

Live Home/Menu have included: `cardGrid`, `carousel`, `promoRail`, `textBlock`, `restaurantCTA`, `imageBlock`.

Documented union also includes: `restaurantHero`, `cta`, `content`, `mediaBlock`, `archive`, `formBlock`. Safe fallback is enough for documented blocks not present in the live payload.
