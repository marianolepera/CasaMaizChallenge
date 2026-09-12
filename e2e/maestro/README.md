# Visual regression

Local coverage for Home, Menu, Privacy, and dark mode. iOS is the default; Android uses ADB (`VISUAL_PLATFORM=android`) and goldens under `goldens/android/`. There is no CI emulator job.

Flows wait on stable `testID`s, not CMS copy. After each flow, [`takeScreenshot`](https://docs.maestro.dev/reference/commands-available/takescreenshot) records a Maestro artifact and `simctl` writes a stable PNG for [pixelmatch](https://github.com/mapbox/pixelmatch).

## Install

Maestro is a CLI, not an npm package:

```sh
# https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli
# Pin 2.0.10: Maestro 2.1+ hangs on Xcode 26 / iOS 26 with no output.
# https://github.com/mobile-dev-inc/maestro/issues/3137
export MAESTRO_VERSION=2.0.10
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

Needs [Java 17+](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli). The install script puts the binary in `~/.maestro/bin` — add that to `PATH` or open a new terminal. Confirm with `maestro --version` (`2.0.10`).

If `test:visual` prints `Running 01-home...` and the Simulator never moves, Maestro is stuck starting the XCUITest driver (common on **Xcode 26.6** — the log stops after “Selected device”). Reboot the Mac, keep a single **iOS 18** Simulator booted, then retry. Maestro 2.1+ hangs even earlier on this stack; do not upgrade past 2.0.10 until [issue 3137](https://github.com/mobile-dev-inc/maestro/issues/3137) is fixed for your Xcode.

## Run

1. Boot the **same** iPhone Simulator you used to create the goldens (size and scale change every pixel).
2. Start Metro (`npm start`) and install the app (`npm run ios`).
3. First time, or after an intentional UI change:

```sh
npm run test:visual:update
```

That copies `e2e/maestro/output/*.png` into `e2e/maestro/goldens/`. Commit those four PNGs.

On Android (when the iOS XCUITest driver hangs on Xcode 26), use a **4 KB page-size** AVD (`CasaMaizMaestro`, API 35). `Flare_Stone` is a 16 KB image and Maestro 2.0.10 cannot start its driver there. Then:

```sh
npm run test:visual:android:update
npm run test:visual:android
```

Goldens go to `e2e/maestro/goldens/android/`.

4. Later comparisons (iOS):

```sh
npm run test:visual
```

A failing run writes highlighted diffs to `e2e/maestro/diffs/` (gitignored, same as `output/`).

## When to update goldens

Update only when **you** changed layout, theme, glass, or cards and the diff matches that change.

Do **not** update because:

- the live CMS changed a headline, image, or promo
- the status bar clock moved (the comparer already crops the top **180 px**)
- a dismissible alert or recommended-update banner appeared (flows tap those away when present)

If `test:visual` fails after a CMS publish and the app code did not change, treat it as content drift. Re-run `test:visual:update` only if you still want the new content as the baseline.

## Thresholds

| Knob | Default | Env override |
|---|---|---|
| Status-bar crop | `180` px | `VISUAL_CROP_TOP` |
| Max differing pixels | `1.5%` | `VISUAL_MAX_DIFF` (ratio, e.g. `0.02`) |

Example:

```sh
VISUAL_CROP_TOP=220 VISUAL_MAX_DIFF=0.02 npm run test:visual
```

## Flows

| File | What it asserts |
|---|---|
| `01-home.yaml` | Home `cms-page-layout` |
| `02-menu.yaml` | Menu tab + `cms-menu-search` |
| `03-privacy.yaml` | `casamaiz://legal/privacy_policy` |
| `04-dark.yaml` | Appearance toggle on Home |

iOS `appId` is `org.reactjs.native.example.CasaMaizChallenge`. Android is `com.casamaizchallenge` (`APP_ID` in the flows).
