# Performance notes

These are engineering notes for the Casa Maiz client, not a lab report. There are **no Systrace traces, FPS captures, or TTI numbers** in this repo. Decisions below come from the live CMS layout (short Home/Menu pages) and from React Native constraints in a CLI app (no Expo, no FlashList, no Reanimated).

How to measure on a device: [React Native Profiling](https://reactnative.dev/docs/profiling) (Perf Monitor, JS FPS, and Android Systrace / iOS Instruments).

## What we optimized

### Page body is a `ScrollView`, not a virtualized feed

`CmsPageScreen` wraps `PageLayout`, which maps `data.layout` in CMS order. Every block mounts. That is intentional: the published Home/Menu payloads are a handful of `blockType`s, not an infinite list. Adding FlashList or LegendList would fight the assessment defaults and would not change first paint on these pages.

Horizontal rails (`carousel`, `promoRail`) **are** `FlatList`s, with `renderItem` created once via `useCallback`. `cardGrid` maps its cards in a `View` because the menu grid is short and two-column, not a windowed feed.

### Images

`resolveCmsImage` prefers Payload `sizes.medium` (then small / large / thumbnail) so list thumbs are not the original upload. After a network or cache hit, `useCmsPage` calls `prefetchPageImages`: same URIs as `CmsImage`, deduped, `Image.prefetch`, `Promise.allSettled`. Prefetch is fire-and-forget and must not throw; a failed prefetch still renders the page.

`Image.prefetch` is the native disk/memory cache, not an extra JS `fetch` of the CMS JSON.

### Cache and stale work

The repository persists the last successful envelope (not `preview`, not already-expired). Reads past `nextChangeAt` are `expired` and are not shown as current content. Page, bootstrap, and legal requests take an `AbortSignal`; unmount or a newer request aborts the previous `fetch` so a late response cannot overwrite UI.

### Motion

The appearance switch animates `transform` and `opacity` with `useNativeDriver`. If Reduce Motion is on, duration is `0`. iOS glass is off when Reduce Transparency is on. There is no Reanimated worklet on the UI thread.

## What still runs on the JS thread

- **Nested lists.** Horizontal `FlatList`s sit inside the page `ScrollView`. React Native can warn about nested VirtualizedLists. We kept it: rails are few items and the alternative (unvirtualized `map` in a row) is worse for a long promo.
- **Menu search.** `filterLayoutByQuery` runs on every keystroke and builds a new `cardGrid` when dishes match. Fine for the current card count; it would need a different model if the CMS sent hundreds of items.
- **Prefetch fan-out.** All page image URIs start at once after parse. That competes with first paint on a slow radio; we accepted it so the hero is warm on the next visit.

## What we did not measure

We did not record JS FPS, Time to Interactive, or a Systrace of Home vs Menu. If a reviewer needs numbers, use the Perf Monitor on a **release** build (Debug Metro + software-GL emulators lie) and the steps in the [profiling guide](https://reactnative.dev/docs/profiling).

Things that would show up if we profiled and they were slow: image decode of un-sized CMS assets, JS layout of a much larger `cardGrid`, and the first Maestro/Android driver install (unrelated to app FPS).
