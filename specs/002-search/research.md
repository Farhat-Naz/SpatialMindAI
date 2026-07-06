# Research: Intelligent Search & Geospatial Intelligence

**Feature**: 002-search
**Date**: 2026-07-07

All decisions below are derived from the project constitution
(`.specify/memory/constitution.md` v2.0.0), the clarified feature spec
(`spec.md`), and the existing Phase 1 codebase. No unresolved
`NEEDS CLARIFICATION` markers remain in the spec — this document instead
records the *implementation-pattern* decisions needed to move from spec to design.

---

## Decision 1: Search UI Primitive

**Decision**: shadcn/ui `Command` component (built on `cmdk`), installed via the
shadcn CLI, with `loop` enabled.

**Rationale**: Constitution Principle VI mandates preferring shadcn/ui (Radix)
primitives over hand-rolled interactive controls, since they ship correct ARIA and
focus-trap behavior. `cmdk` additionally exposes a `loop` prop that directly
implements the wrap-around keyboard behavior resolved in the spec's Clarifications
(Down from last result → first; Up from first → last), removing the need for custom
keyboard-navigation code.

**Alternatives considered**: Hand-rolled `<input>` + `<ul role="listbox">` (rejected —
duplicates ARIA/focus-management work Radix/cmdk already solves correctly);
`react-select`/`downshift` (rejected — not part of the mandated shadcn/ui stack, would
add a second, inconsistent interaction pattern alongside existing shadcn components).

---

## Decision 2: `useDebounce` Ownership

**Decision**: Implement `useDebounce` in `src/shared/hooks/useDebounce.ts`, not inside
`features/search/hooks/`. The feature re-exports it from its own `hooks/index.ts` for
call-site convenience.

**Rationale**: Constitution Principle I forbids code duplication and requires shared,
feature-agnostic logic to live in `shared/`. A generic debounce hook has no
search-specific behavior and will very likely be needed by other future features
(e.g., a filter input elsewhere) — placing it in `features/search/` would risk a
second, duplicate implementation appearing later, which the constitution explicitly
prohibits.

**Note on naming/folder deviation**: The originally requested folder list included a
`hooks/useDebounce.ts` inside the feature. This decision keeps the *re-export* there
(so `import { useDebounce } from '@/features/search/hooks'` still works) while the
canonical implementation lives in `shared/`, satisfying both the request and
Principle I. Similarly, this plan uses `store/` (singular) rather than the requested
`stores/`, to match Constitution Principle XII's explicit folder-naming convention —
per Governance, the constitution supersedes a conflicting instruction where the two
differ on a non-substantive naming detail.

---

## Decision 3: Provider Abstraction

**Decision**: Define a `GeocodingProvider` interface (`search`, `reverseGeocode`) in
`features/search/api/provider.types.ts`; implement `NominatimProvider` as the default;
select via a `getGeocodingProvider()` factory called only from the two Route Handlers.

**Rationale**: The spec's Out of Scope explicitly excludes multi-provider support
*this phase*, but Constitution Principle XVIII and the spec's own "Future
Extensibility" ask require the architecture to support a provider swap later without
touching client code. An interface + factory is the minimal pattern that satisfies
both: zero extra complexity now (only one implementation exists), zero rework later
(new providers implement the same interface).

**Alternatives considered**: Hardcoding Nominatim calls directly in the Route
Handlers (rejected — would require editing both Route Handlers, not just adding a
class, when a provider is swapped, and couples validation logic to provider-specific
request shape); a plugin-registry pattern with dynamic provider discovery (rejected —
over-engineered for a single-provider phase; YAGNI).

---

## Decision 4: Recent-Search Persistence

**Decision**: Zustand `persist` middleware, `localStorage` key
`spatialMind:recentSearches`, capped at 10 entries, same pattern as Phase 1's
`themeStore`.

**Rationale**: The project has no server-side account system yet (confirmed in
spec Assumptions), and Phase 1 already established the `persist` + `localStorage`
pattern for user preferences (theme, sidebar). Reusing it keeps persistence handling
consistent across the codebase rather than introducing a second mechanism (e.g., a
raw `localStorage.setItem` call) for the same concern.

**Alternatives considered**: IndexedDB (rejected — unnecessary complexity for a
10-item list); a server-side endpoint backed by cookies/sessions (rejected — no auth
system exists; out of scope per spec).

---

## Decision 5: Upstream Rate-Limit Compliance

**Decision**: A per-process, in-memory sliding-window limiter in front of the
`NominatimProvider`, paired with a short-TTL response cache (a few seconds) for
identical `(query, limit)` or `(lat, lng)` requests, enforced inside the Route
Handlers before any outbound call.

**Rationale**: Nominatim's usage policy caps usage at ~1 request/second and requires
the request to be attributable to the calling application. Enforcing this
server-side (rather than trusting client-side debounce/React Query staleTime alone)
is the only way to guarantee compliance regardless of how many browser tabs or users
hit the same Next.js instance.

**Known limitation**: This approach is scoped to a single Next.js server instance.
If the app is later deployed across multiple serverless instances/regions, the
in-memory limiter/cache would need to move to a shared store (e.g., Upstash Redis) to
remain effective — flagged under Future Extensibility in `plan.md` rather than solved
now, since Phase 1's scale/scope is explicitly single-instance.

**Alternatives considered**: Relying solely on client-side debounce (rejected —
does not prevent multiple concurrent users/tabs from collectively exceeding the
upstream limit); a third-party rate-limiting service (rejected — unjustified
operational complexity for this phase's scale).

---

## Decision 6: Route Handler Input Validation

**Decision**: Zod schemas for all four query parameters (`q`, `limit`, `lat`, `lng`),
applied at the top of each Route Handler before any other logic runs.

**Rationale**: Constitution Principle IX explicitly names Zod as the example schema
validator and mandates validating all Route Handler input before use. Zod's
`safeParse` maps directly onto the spec's `INVALID_QUERY`/`INVALID_COORDINATES` error
codes without custom validation code.

**Alternatives considered**: Manual `if` validation (rejected — more error-prone and
harder to keep in sync with the documented constraints than a declarative schema);
`yup`/`io-ts` (rejected — Zod is the constitution's named example and has no
functional gap for this use case).

---

## Decision 7: React Query Key & Cache Strategy

**Decision**: Centralized key factory (`services/queryKeys.ts`) producing
`['search', query, limit]` and `['reverseGeocode', lat, lng]`; `staleTime` of 30 s for
search, 5 min for reverse geocode.

**Rationale**: Constitution Principle IV requires centralized query keys to prevent
cache collisions. The asymmetric stale times reflect how often the underlying data
actually changes in practice: place-name search results are effectively static within
a session, and a fixed coordinate's address never changes, so both can be cached
longer than a typical "live" query without risking staleness bugs — while still
bounding memory growth via React Query's default cache garbage collection.

**Alternatives considered**: A single shared stale time for both (rejected — either
under-caches reverse-geocode, needlessly stressing the upstream limiter, or
over-caches search results relative to how "live" the suggestion UX should feel).

---

## Decision 8: Error Response Shape

**Decision**: Both Route Handlers return `{ error: { code, message } }` on failure,
matching the shape already specified in `spec.md`'s API Requirements section, with a
shared `SearchApiError` type in `features/search/types/search.types.ts`.

**Rationale**: A single, typed error envelope lets client-side error handling
(`SearchErrorState`, `ReverseGeocodePopup`) branch on `error.code` uniformly across
both endpoints, satisfying Constitution Principle XIV's requirement for typed error
responses rather than ad hoc shapes per endpoint.

**Alternatives considered**: HTTP status code alone with no body (rejected — provides
no machine-readable distinction between, e.g., `RATE_LIMITED` and
`PROVIDER_UNAVAILABLE`, both of which the client must handle differently).
