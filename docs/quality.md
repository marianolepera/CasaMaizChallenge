# Type-check, lint, and test

From the repo root after `npm install`:

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm test            # Jest
```

| Command | What it runs | Pass means |
|---|---|---|
| `npm run typecheck` | TypeScript (`tsc --noEmit`) | No type errors |
| `npm run lint` | ESLint (project config) | No lint errors |
| `npm test` | Jest unit tests | All tests pass |

Optional (not required for the three above):

```sh
npm run cms:types              # regenerate OpenAPI types
npm run test:visual:android    # Maestro + pixelmatch — see e2e/maestro/README.md
```
