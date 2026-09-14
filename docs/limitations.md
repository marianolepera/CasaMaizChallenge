# Known limitations and next steps

What the app deliberately does not do today, and what would improve with more time.

## Known limitations

- **Page body is a `ScrollView`.** Live Home/Menu layouts are a handful of blocks, not a virtualized feed of mixed `blockType`s.
- **Documented blocks missing from the live payload** (`cta`, `content`, `mediaBlock`, `archive`) render the unknown-block fallback instead of dedicated UI.
- **`formBlock` is mocked.** It builds the OpenAPI body shape and never POSTs to the shared `POST /api/form-submissions` endpoint.
- **Reservations has no transaction API.** `/reservas` opens a local placeholder screen only — no fake booking or payment flow.
- **App version is the shipped binary semver (`1.0.0`).** There is no live App Store / Play lookup for the `appVersion` query param.
- **Maestro visual regression is reliable on Android.** iOS XCUITest hangs on Xcode 26.6 ([Maestro #3137](https://github.com/mobile-dev-inc/maestro/issues/3137)).
- **No checked-in perf numbers.** There are no Systrace traces, FPS captures, or TTI figures in this repo (see [performance.md](performance.md)).
- **No VoiceOver / TalkBack recording** checked in (see [accessibility.md](accessibility.md)).

## With more time

- **Crash and content telemetry** — surface contract mismatches, failed fetches, and unknown `blockType`s without logging full CMS payloads.
- **Release-build profiling on device** — Perf Monitor / Instruments / Systrace on Home and Menu (not Debug Metro + software-GL emulators).
- **Required-update store URL** — deep-link to the store only if the CMS provides a URL on the update notice.
- **iOS Maestro / visual regression** — unblock when the XCUITest hang is fixed, or swap to a supported iOS driver path.
- **Richer block coverage** — dedicated components for documented types that appear in the contract but not yet in live payloads (`cta`, `content`, `mediaBlock`, `archive`).
- **Virtualized page body** — only if the CMS starts shipping long mixed layouts where a `ScrollView` of all blocks hurts first paint.
- **Real form submission** — against a non-shared / assessment-safe endpoint if the CMS ever exposes one that this client is allowed to write to.
- **Reservations** — wire to a real booking API if one is documented; keep the placeholder until then.
