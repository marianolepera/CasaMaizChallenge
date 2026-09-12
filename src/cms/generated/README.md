# OpenAPI types vs Zod

`openapi.ts` is generated (`npm run cms:types`) from the published [Casa Maiz OpenAPI spec](https://payload-cms-poc-seven.vercel.app/api/openapi.json). It is compile-time only: TypeScript erases it. Nothing in this folder runs on the phone.

Zod parsers (`envelope`, `page`, `bootstrap`, `form`, …) are the runtime contract. They accept `unknown` JSON, keep the fields the app uses, tolerate extra keys, and fail safely on a bad `contractVersion` or a malformed envelope.

OpenAPI is the published shape. Zod is what we trust after a network response. The spec can be stricter than what we accept (optional/null fields, incomplete blocks) so a generated type is never used as a runtime parser.

See [openapi-typescript](https://openapi-ts.dev/introduction).
