# Fruit Shop Debugger Exercise

This small TypeScript Node application is for practising VS Code debugging. 
A browser page sends fruit names to an Express server, which adds them to an in-memory order.

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
- **Debug Vitest Current Test File** runs the currently open test file under the Node debugger. Use this for breakpoints in `test/order.test.ts` or `test/server.test.ts`; the server does not need to be running.

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

## Function Breakpoints

A function breakpoint pauses when a named function is called, without needing to select a source line. Support depends on the language debugger: VS Code's built-in JavaScript debugger (`pwa-node` and `pwa-chrome`) does not support them, so for this app set a line breakpoint on the `addFruitToOrder` call in `src/server.ts` or on its first executable statement in `src/order.ts`. The named function is still useful for demonstrating **Step Into** from the API route.

Students using other languages may be able to use function breakpoints if their debugger supports them (for example, some Java and C# debuggers). In VS Code, add one from **Run and Debug > Breakpoints > Add Function Breakpoint**, then enter a function or method name. Check the relevant debugger's documentation if it does not bind. See the [JavaScript debugger's known issues](https://github.com/microsoft/vscode-js-debug/issues?q=function+breakpoint) for its current status.

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

## Step Out and the Call Stack

1. Start **Debug Fruit Shop Server** and set a breakpoint on the `addFruitToOrder(order, fruitName)` call in [src/server.ts](src/server.ts).
2. Add a fruit in the browser, then use **Step Into** to enter [src/order.ts](src/order.ts).
3. In the **Call Stack** section of Run and Debug, select the API route frame. The editor returns to `server.ts`, where you can inspect route-local values such as `fruitName`.
4. Select the `addFruitToOrder` frame again and use **Step Out**. Execution returns to the route after the function call.

## Logpoints

A logpoint writes to the Debug Console without pausing or changing application code.

1. While debugging the server, open [src/order.ts](src/order.ts) and right-click the gutter beside `return order;`.
2. Select **Add Logpoint** and enter:

```text
Added {fruitName}; order total is {order.total}
```

3. Continue execution and add a fruit. The Debug Console shows the fruit and updated total without stopping at the logpoint.

## Exception breakpoints

The existing unknown-fruit test deliberately expects `addFruitToOrder` to throw. Run that test under the debugger to see where the error originates.

1. Open [test/order.test.ts](test/order.test.ts) and set a line breakpoint inside `it("rejects an unknown fruit", ...)`.
2. In Run and Debug, select **Debug Vitest Current Test File** and press **F5**.
3. In the Breakpoints section, enable **Caught Exceptions**. Resume the test if needed; the debugger pauses when `addFruitToOrder` throws for `durian`.
4. Inspect the call stack and exception, then press **F5** to continue. Vitest completes successfully because the test expects this error.

## Async debugging across browser and server

The browser request and server handler run in separate processes, so use both debug profiles to follow a request end to end.

1. Stop `npm run dev` if it is running. Start **Debug Fruit Shop Server**; this profile starts the server on port 3000.
2. Set a breakpoint in [src/server.ts](src/server.ts) inside the `POST /api/order-items` handler.
3. Start **Debug Fruit Shop in Chrome** as a second debug session. In [public/app.js](public/app.js), set a breakpoint on `const response = await fetch(...)`.
4. Submit a fruit. Inspect `input.value` and the request body before the `await`; use **Step Over** to wait for the response, then inspect `response` and `result`.
5. The Node session pauses at the server breakpoint while the browser request is waiting. Switch to the server session, inspect `request.body` and `fruitName`, then continue to let the browser receive the response.

Do not also run `npm run dev` while using the server debug profile; both would try to use port 3000.

## Debugging tests

The Vitest profile runs the test file in the active editor, not the Express server.

1. Open [test/order.test.ts](test/order.test.ts) or [test/server.test.ts](test/server.test.ts) and set a breakpoint inside a test.
2. Select **Debug Vitest Current Test File** in Run and Debug and press **F5**.
3. VS Code starts Vitest for that file and pauses at the test breakpoint. Step into the code under test, inspect values, and use the Call Stack as usual.

Unit tests do not require the server to be running. Choose **Debug Fruit Shop Server** for server requests, **Debug Fruit Shop in Chrome** for browser code, and **Debug Vitest Current Test File** for tests.

## Checks

```sh
npm test
npm run typecheck
```

## Further reading
See https://code.visualstudio.com/docs/debugtest/debugging