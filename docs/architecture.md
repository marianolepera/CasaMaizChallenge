# Architecture

Screens stay dumb: they do not build query strings, parse destinations, or call `fetch`. The same diagram is embedded in the root [README](../README.md).

## Pipeline

```mermaid
flowchart LR
  CMS["Casa Maiz API<br/>contract 1.1"] --> config["config<br/>base URL + query context"]
  config --> api["api<br/>fetch · errors · abort"]
  api --> cms["cms<br/>Zod + OpenAPI types"]
  cms --> repo["repository<br/>cache · nextChangeAt"]
  cms --> nav["navigation<br/>destinations · tabs"]
  cms --> blocks["blocks<br/>blockType registry"]
  repo --> screens["screens"]
  nav --> screens
  blocks --> screens
  screens --> Home["Home / Menu"]
  screens --> Legal["Privacy"]
  screens --> Reservas["Reservations placeholder"]
```

## Inside `cms`

```mermaid
flowchart TB
  envelope["Content envelope<br/>contractVersion 1.1"] --> bootstrap["bootstrap<br/>nav · flags · alerts · promos · update"]
  envelope --> pages["pages home / menu<br/>layout blocks"]
  envelope --> legal["legal privacy_policy"]
  bootstrap --> flags["feature flags"]
  bootstrap --> alerts["alert frequency<br/>always · once · session"]
  pages --> registry["block registry"]
  registry --> known["cardGrid · carousel · promoRail · …"]
  registry --> unknown["UnknownBlock fallback"]
```

## Layer notes

| Layer | Owns | Does not own |
|---|---|---|
| `src/config` | Base URL, market, audience, semver | Screens |
| `src/api` | Transport, status codes, abort | CMS field meaning |
| `src/cms` | Contract 1.1, parsers, flags, media URLs | Navigation chrome |
| `src/repository` | Persist / expire envelopes | UI copy |
| `src/navigation` | Path → screen, HTTPS check | Layout blocks |
| `src/blocks` | `blockType` → component | Fetch |
| `src/screens` | Loading / empty / retry / banners | Query construction |

Adding another documented CMS block: register a component in `src/blocks/registry.ts`. Home and Menu do not change.

Migrating off contract `1.1`: keep Zod as the runtime gate; bump `SUPPORTED_CONTRACT_VERSION` and fail safe until parsers catch up. OpenAPI types regenerate with `npm run cms:types`.

> Preview: open this file on GitHub (Mermaid renders in the markdown view) or in an editor with a Mermaid preview. Cursor / VS Code: “Markdown: Open Preview”.
