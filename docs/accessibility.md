# Accessibility notes

Engineering checklist for the Casa Maiz client — not an audit report with scores. There is no VoiceOver/TalkBack recording checked in. Use the steps below on a device or simulator.

Official starting points: [React Native Accessibility](https://reactnative.dev/docs/accessibility), [iOS Accessibility](https://developer.apple.com/accessibility/), [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility).

## What the app does

### Roles, labels, and states

- Interactive controls use `accessibilityRole` (`button`, `switch`, `alert`, `header`, `image`, `list`, `progressbar` where it fits).
- Alerts and offline banners expose a spoken label built from CMS title/message.
- Appearance control is a `switch` with `accessibilityState.checked` and label “Modo oscuro”.
- Tabs use CMS labels as `tabBarAccessibilityLabel`.
- Images set `accessibilityLabel` from media `alt` when the CMS provides it; decorative / missing alt stay non-focusable as images.
- `politeStatusRole()` uses iOS `status` and avoids Android’s invalid `status` role ([RN AccessibilityRole](https://reactnative.dev/docs/accessibility#accessibilityrole)).

### Touch targets

Theme `minTouchTarget` is **44**. Buttons, the appearance control, tab items, and dismiss controls size to that floor.

### Dynamic Type

Shared `Text` defaults to `allowFontScaling` with `maxFontSizeMultiplier: 2` so large text grows without unbounded layout blow-ups.

### Dark mode and motion

- System / user appearance preference via `ThemeProvider`.
- Reduce Motion: appearance animation duration `0` (`useNativeDriver` for `transform` / `opacity`).
- Reduce Transparency: iOS glass chrome off (`useGlassChrome`).

### Forms and keyboard

`formBlock` (mocked submit) lives in a screen `ScrollView` with `keyboardShouldPersistTaps`, `keyboardDismissMode`, and `automaticallyAdjustKeyboardInsets` so fields stay reachable above the keyboard.

### Errors

User-facing copy is actionable (“Reintentar”); technical detail stays in `CmsError` for debugging, not on the banner.

## How to check

| Check | iOS | Android |
|---|---|---|
| Larger text | Settings → Accessibility → Display & Text Size | Settings → Accessibility → Font size |
| Dark mode | Appearance control in app, or system Dark | Same |
| Reduce Motion | Accessibility → Motion | Remove animations |
| Reduce Transparency | Accessibility → Display | N/A (glass is iOS) |
| Screen reader | VoiceOver | TalkBack |
| Touch targets | Look for clipped hit areas around CTAs / dismiss | Same + ripple |

Automated coverage today asserts roles/helpers in Jest (`accessibilityRole`, glass probes, alert banners). It does not replace a VoiceOver pass on Home, Menu, Privacy, and an alert dismiss.
