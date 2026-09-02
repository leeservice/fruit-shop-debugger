# Fruit Shop Debugger Exercise Design

## Goal

Create a minimal TypeScript Node application that helps students practice the VS Code debugger while adding fruit to an in-memory order.

## Scope

- `npm run dev` starts an Express server at `http://localhost:3000` using `tsx watch`.
- A static browser page provides a fruit-name input, an Add button, and a rendered order list.
- Browser JavaScript calls `POST /api/order-items` with the selected fruit name and refreshes the displayed order from the response.
- The server validates the request, derives a fruit price, calls a named `addFruitToOrder` helper, and returns the updated order.
- No persistence, accounts, payments, or production concerns are included; the order is deliberately in memory.

## Debugging Demonstrations

- Source comments mark a request-route breakpoint, an `addFruitToOrder` breakpoint, and variables to add to VS Code's Watch panel: `fruitName`, `fruitPrice`, `newItem`, and `order.total`.
- The walkthrough instructs students to use Step Over at simple assignments and Step Into on the `addFruitToOrder` call, then observe values change in Variables and Watch.
- A premium-fruit branch checks whether `fruitName === "mango"`, providing a predictable conditional-breakpoint exercise.
- `addFruitToOrder` remains a named exported function so students can demonstrate a VS Code function breakpoint without relying on a source-line breakpoint.
- A README explains using the Debug Console to inspect expressions, call functions, and identify scope/value changes while paused.

## VS Code Configuration

- `.vscode/launch.json` provides a Node launch configuration for the TypeScript server and a Chrome launch configuration for the browser page.
- Comments and the README explain the `type`, `request`, `name`, `url`, and `webRoot` fields, including that `url` and `webRoot` apply to the browser configuration rather than the Node process.

## Structure

- `src/server.ts`: Express setup, static-file hosting, and the API route.
- `src/order.ts`: fruit catalog, validation, price calculation, and `addFruitToOrder`.
- `public/index.html`, `public/app.js`, `public/styles.css`: intentionally simple client interface.
- `test/order.test.ts`: API-independent unit tests for order behavior.
- `README.md`: setup instructions and step-by-step debugger exercises.

## Error Handling

- Empty and unknown fruit names result in a `400` JSON response with a clear message.
- The client displays a request error near the input and keeps the existing rendered order.

## Verification

- Automated tests confirm known fruits can be added, totals update, duplicate items accumulate quantity, and unknown fruit names are rejected.
- A build typechecks the TypeScript source.
- A smoke request verifies the development server accepts a fruit and returns the updated order.