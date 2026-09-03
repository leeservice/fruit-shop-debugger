# Fruit Shop Debugger Exercise

This small TypeScript Node application is for practising VS Code debugging. A browser page sends fruit names to an Express server, which adds them to an in-memory order.

## Run the application

Use Node.js 20 or later.

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. Enter `apple`, `banana`, `mango`, or `orange`, then select **Add fruit**. The order only lasts until the server restarts.

## Start a debugger

Open Run and Debug in VS Code, then select one of the configurations in [.vscode/launch.json](.vscode/launch.json).

- **Debug Fruit Shop Server** starts the TypeScript server directly under the Node debugger. Start here for server breakpoints in [src/server.ts](src/server.ts) and [src/order.ts](src/order.ts).
- **Debug Fruit Shop in Chrome** opens the page in a debug-enabled Chrome instance. Start the server first with `npm run dev`, then use this configuration for browser breakpoints in [public/app.js](public/app.js).

The important launch configuration fields are:

| Field | Purpose |
| --- | --- |
| `name` | The label displayed in the Run and Debug configuration menu. |
| `type` | The debugger to use: `pwa-node` for the Node server or `pwa-chrome` for Chrome. These are the current built-in JavaScript debugger types. |
| `request` | `launch` starts a fresh debug target. `attach` connects to one already running. |
| `url` | The browser address Chrome opens. It belongs to the browser configuration. |
| `webRoot` | The local directory corresponding to scripts loaded by the browser. It lets VS Code map breakpoints to `public/app.js`. |

## Line breakpoints, Step Over, and Step Into

1. Start **Debug Fruit Shop Server**.
2. Open [src/server.ts](src/server.ts) and set a line breakpoint on the `fruitName` assignment in the `POST /api/order-items` handler.
3. Add `apple` in the browser. VS Code pauses before validation. Inspect `request.body` and `fruitName` in the Variables panel.
4. Use **Step Over** to execute the next statement without entering a function. Observe the validation branch and move to the `addFruitToOrder` call.
5. Use **Step Into** on `addFruitToOrder(order, fruitName)`. VS Code opens [src/order.ts](src/order.ts), where you can step over the lookup and total calculation one statement at a time.
6. Continue with **F5** and add `apple` again to see the existing item quantity change.

## Watch expressions

While paused in the server debugger, open the Watch section and add these expressions one at a time:

```text
fruitName
fruitPrice
existingItem
newItem
order.items
order.total
```

`fruitPrice`, `existingItem`, and `newItem` are only in scope while paused inside `addFruitToOrder`; `existingItem` and `newItem` are available on different sides of the duplicate-item branch. Step through the function and watch `order.total` update after the reduce calculation.

## Conditional breakpoint

1. Remove all breakpoints, then in [src/server.ts](src/server.ts), find the `if (fruitName === "mango")` branch.
2. Right-click its breakpoint gutter and choose **Edit Breakpoint**.
3. Set the condition to:

```js
fruitName === "mango"
```

4. Add `apple` and then `mango`. The debugger ignores apple and pauses only for mango.

## Method/Function Breakpoints (Not available for Node / JS apps)
A function breakpoint pauses execution whenever a specified function or method is called, without requiring you to select a particular source line. This is useful when a function has many callers, when you want to investigate every invocation, or when you do not yet know which line inside it is relevant. Support depends on the debugger and language: for example, some VS Code debuggers can bind a function breakpoint to a method name, while the built-in JavaScript debugger does not, so check the debugger documentation and use a line breakpoint at the function’s first executable statement when function breakpoints are unavailable.

To add a function breakpoint, you would open the 'Breakpoints' section of the Run & Debug menu and click the + to add the function name. Method/Function breakpoints are commonly supported in Java, C# and .net for example.

## Debug Console

The Debug Console evaluates JavaScript in the current paused stack frame. It is useful for inspecting an expression without editing source code.

Pause in the API route or `addFruitToOrder`, open Debug Console, and run:

```js
fruitName
order.total
order.items
addFruitToOrder(order, "orange")
```

The final expression changes the in-memory order. It is intentional for this exercise, but in a real system use the Debug Console carefully because expressions can call code and mutate state. Resume execution to see the next request use the changed order.

## Browser breakpoint

1. Start `npm run dev`, then choose **Debug Fruit Shop in Chrome**.
2. Set a breakpoint in [public/app.js](public/app.js) on `const response = await fetch(...)`.
3. Submit a fruit. Inspect `input.value` in the 'Watch' section of Run and Debug, Step Over the `fetch` call, and inspect `result` after the response is decoded.

## Checks

```sh
npm test
npm run typecheck
```

## Further reading
See https://code.visualstudio.com/docs/debugtest/debugging