---
name: casa-maiz-challenge
description: Casa Maiz CMS-driven React Native CLI architecture, Payload content contract 1.1, block registry, bootstrap navigation, cache, and assessment constraints. Use when building screens, API client, navigation, CMS blocks, bootstrap, cache, or when Vercel React Native skills conflict with this project.
---

# Casa Maiz Challenge

This project is a **React Native CLI** (not Expo) client of a published Payload CMS. Content, navigation, promotions, labels, and flags come from the API. Hardcoded editorial content is a failing submission.

For API paths, query context, destinations, and block types, see [reference.md](reference.md).

## When Vercel RN skills conflict

Use Vercel skills for Pressable, list item memoization, native stack, and avoiding work on the render path.

Do **not** follow Vercel defaults for Expo, `expo-image`, NativeWind, FlashList/LegendList, `react-native-bottom-tabs`, Reanimated, or monorepo layout.

## Architecture

Keep these boundaries. Screens must not fetch, build query strings, or parse destinations.

```
config → api transport → runtime validation/models → repository/cache
       → app state → destination resolver → block registry → screens
```

Suggested `src/` layout:

- `config` — base URL, market, audience, version
- `api` — HTTP, errors, cancellation
- `cms` — envelope, contract 1.1, media URL resolution
- `repository` — persist last success, `nextChangeAt`
- `navigation` — CMS destinations → native screens
- `blocks` — `blockType` → component map + unknown fallback
- `screens` / `components` — presentation only

## CMS client

- Independently testable. No React render path.
- Every content GET adds the four context params from one helper.
- Handle non-2xx, malformed JSON, and extra fields (tolerate non-breaking additions).
- Support request cancellation or ignore stale responses.
- Resolve media: absolute URLs unchanged; relative paths against the API base.

Types: handwritten or generated OpenAPI **plus** runtime validation of fields the app uses (e.g. Zod). Explain the choice in the README.

## Pages and blocks

Home and Menu render `data.layout` through a registry. Adding a documented block must not require rewriting a screen.

Unknown, incomplete, or future `blockType` values render a safe fallback and must be covered by an automated test.

## Bootstrap

`GET /bootstrap` is app configuration: CMS navigation, promotions, feature flags, operational/maintenance notices, recommended or required updates, and alerts (placement, trigger, dismissible, actions, page targeting). Missing optional fields must not make the app unusable.

## Navigation

Drive native navigation from `bootstrap.navigation`. Route CMS actions through one destination resolver.

- Home, Menu, Privacy must work (Privacy uses `/legal/privacy_policy`).
- Reservations may be a local placeholder (`/reservas`).
- Unsupported internal destinations fail safely.
- Validate external URLs before opening.
- iOS back gesture and Android system back.

## Resilience

Provide loading, empty, retryable network error, pull-to-refresh, offline/stale, unsupported contract, and page-not-found states.

If there is no cache and the network fails, show retry — never a blank screen. Cached content that is still valid stays reachable; expired `nextChangeAt` content must not be shown as current.

## Accessibility and platform

- Roles, labels, states, 44pt targets, Dynamic Type, dark mode, Reduce Motion, keyboard avoidance for forms.
- Safe areas. Do not force iOS patterns onto Android or the reverse.

## Testing (minimum)

Assert user-observable behavior with stable selectors:

1. Query-context construction
2. Contract-version validation
3. One successful block render
4. Unknown-block handling
5. One cache, error, or offline fallback
6. One bootstrap-driven behavior

Never send test submissions to the shared public form API.

## Implementation order

1. Config + CMS client + contract check + tests
2. Home from live `layout` + unknown-block fallback
3. Cache / offline / retry states
4. CMS navigation + Menu + Privacy
5. Bootstrap flags, alerts, promotions, update notice
6. README, remaining tests, polish
