// Resource shapes are deliberately NOT declared here (no `resources` field below).
// This app looks up translation keys dynamically at runtime in several places (Zod
// validation messages, backend error-code maps) where the key is a plain `string`,
// not a literal known at the call site — a strict `resources`-based union type for
// `t()` would reject those dynamic lookups. `defaultNS` alone still gives every
// `t()` call basic namespace-aware typing without that friction.
//
// `export {}` is required: without it this file has no top-level import/export and
// TypeScript treats it as a global script, which — under this project's `bundler`
// module resolution — makes the `declare module 'i18next'` block below corrupt every
// other file's default import of 'i18next' (its type collapses to the bare module
// namespace, losing `.use`/`.init`/etc.) instead of just augmenting it.
export {}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
  }
}
