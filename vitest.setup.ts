import "@testing-library/jest-dom/vitest";

// With `globals: true` (see vitest.config.ts), @testing-library/react registers
// its own afterEach cleanup automatically, so sequential render() calls in a
// single test file no longer pollute the DOM. Do not call lifecycle hooks at the
// top level of this setup file: under Vitest 4 that throws "failed to find the
// current suite".
