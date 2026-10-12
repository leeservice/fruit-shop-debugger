# Debugging Exercise Enhancements Design

## Goal

Extend the Fruit Shop exercise with practical VS Code debugging topics beyond the existing line and conditional breakpoints, Step Over/Into, watches, and Debug Console. Keep the lessons concrete and avoid adding debug-only behavior to the running app.

## Current Context

The repository has Node and Chrome launch profiles in `.vscode/launch.json`, an asynchronous browser `fetch` flow in `public/app.js`, an Express route in `src/server.ts`, and unit tests in `test/order.test.ts` and `test/server.test.ts`. The order unit tests already exercise an unknown-fruit exception. The README is the main student guide.

There are pre-existing uncommitted changes in the README, package manifests, and earlier design/plan documents. Implementation must preserve them and avoid including them in any commit.

## Design

Add five guided topics to the README:

1. **Step Out and Call Stack:** Pause in the API route, Step Into `addFruitToOrder`, inspect the active frames in the Call Stack, select the route frame to view its context, then use Step Out to return from the function.
2. **Logpoints:** Add a logpoint at an order-processing line and emit useful values such as `fruitName` and `order.total` without pausing or changing source code.
3. **Exception breakpoints:** Enable the JavaScript debugger's caught-exceptions breakpoint, run the existing unknown-fruit test under the test profile, and observe the pause where `addFruitToOrder` throws. Explain that the test intentionally expects this exception.
4. **Async debugging:** Use the Chrome profile to pause before and after `await fetch(...)`, inspect the request/result, and describe that server-side execution runs in a separate Node debug session. The learner can run the server profile and Chrome profile at the same time; the server profile owns port 3000, so do not also start `npm run dev`.
5. **Debugging tests:** Add a `Debug Vitest Current Test File` Node launch configuration. It should run the currently open test file, provide stable test-debug behavior with a single forked worker, and attach the debugger to child processes where required. The guide will explain opening a test file, selecting this profile in Run and Debug, setting a breakpoint, and pressing F5. This profile launches Vitest rather than the Express server and does not require the server to be running for unit tests.

Use the current fruit shop code and test cases; do not add an endpoint, new application behavior, dependencies, or a dedicated error fixture. The existing unknown-fruit test is the deterministic exception target.

## Alternatives Considered

- **README-only instructions:** Simpler, but leaves test debugging without a discoverable launch target.
- **Add a deliberate error route to the app:** Makes an exception visible through the browser, but adds behavior solely for the lesson and complicates the exercise.
- **Recommended: document the five topics and add a Vitest launch profile:** Reuses existing app behavior and tests while making test debugging reproducible from VS Code.

## Files in Scope

- `README.md`: Add the guided exercises and explain how the three launch targets differ.
- `.vscode/launch.json`: Add a Vitest profile without changing the current server or Chrome profiles.

No application source, tests, dependency manifests, or prior specs/plans should be changed for this work.

## Validation and Acceptance Criteria

- Existing Node and Chrome debug configurations remain unchanged and valid.
- The Vitest profile launches the currently open test file under the Node debugger, with a breakpoint in that test and the unknown-fruit exception target reachable.
- The README gives concrete actions and expected observations for all five topics, including which profile to select and whether the server must be running.
- `npm test` and `npm run typecheck` continue to pass.
- Existing unrelated/uncommitted changes remain untouched and are not included in the design-spec commit or subsequent implementation commit.
