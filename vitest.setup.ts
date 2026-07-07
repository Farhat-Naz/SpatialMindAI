import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// `afterEach`/`describe`/`it` are imported per-file (no vitest `globals: true`
// config), so @testing-library/react's own auto-cleanup detection never
// fires. Unmount after every test here instead, so renders across `it()`
// blocks in the same file don't accumulate in the document.
afterEach(() => {
  cleanup()
})

// jsdom does not implement ResizeObserver; cmdk (shadcn's Command component)
// relies on it to measure the results list. Stub it globally so any test
// rendering a `Command` tree doesn't need to repeat this per-file.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

// jsdom does not implement scrollIntoView either; cmdk calls it when the
// keyboard-highlighted item changes.
if (typeof Element.prototype.scrollIntoView === "undefined") {
  Element.prototype.scrollIntoView = function scrollIntoView() {}
}
