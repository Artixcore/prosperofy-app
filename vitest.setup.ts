import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// `@testing-library/react` auto-cleans up only when run under Jest's globals or
// vitest's `globals: true`. We don't enable globals here, so cleanup must be
// wired manually — without this, sequential `render()` calls in a single test
// file pollute the DOM and cause "found multiple elements" failures.
afterEach(() => {
  cleanup();
});
