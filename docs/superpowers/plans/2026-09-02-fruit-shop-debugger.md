# Fruit Shop Debugger Exercise Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal TypeScript Express fruit shop that students can use to learn VS Code Node and browser debugging.

**Architecture:** A static browser client submits a fruit name to one Express API endpoint. The API delegates order state, validation, and price calculations to a focused `order.ts` module with an in-memory order; that module intentionally supplies named function and conditional-branch debugging targets.

**Tech Stack:** Node.js, TypeScript, Express, `tsx`, Vitest, Supertest, static HTML/CSS/browser JavaScript.

## Global Constraints

- `npm run dev` must serve the application at `http://localhost:3000` using `tsx watch`.
- The client must use `fetch` to call `POST /api/order-items` and render the returned order.
- Keep state in memory; do not add persistence, accounts, payments, or additional user flows.
- The source and README must teach line, conditional, and function breakpoints, Step Over, Step Into, watches, and the Debug Console.
- `.vscode/launch.json` must define Node and Chrome launch configurations and explain `type`, `request`, `name`, `url`, and `webRoot`.

---

## File Structure

- `package.json`: dependency manifest and scripts for development, test, and typecheck.
- `tsconfig.json`: strict TypeScript compiler settings for source and tests.
- `src/order.ts`: order types, fruit catalog, validation, price calculation, and exported `addFruitToOrder`.
- `src/server.ts`: Express application, static files, and the order-items API route.
- `public/index.html`: fruit form, status region, and order-list structure.
- `public/app.js`: client-side request, error handling, and order rendering.
- `public/styles.css`: compact readable layout.
- `test/order.test.ts`: isolated behavior tests for the order module.
- `test/server.test.ts`: HTTP contract tests for the Express API.
- `.vscode/launch.json`: server and Chrome debug configurations.
- `README.md`: setup and debugger workshop instructions.

### Task 1: Set Up the Testable TypeScript Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

**Interfaces:**
- Produces: `npm run dev`, `npm test`, and `npm run typecheck` commands used by every later task.

- [ ] **Step 1: Create the package manifest**

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^5.1.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.3",
    "@types/node": "^24.0.0",
    "supertest": "^7.1.1",
    "tsx": "^4.20.3",
    "typescript": "^5.8.3",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Create strict compiler configuration**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src", "test"]
}
```

- [ ] **Step 3: Add ignored generated files**

```gitignore
node_modules/
dist/
coverage/
```

- [ ] **Step 4: Install dependencies and validate the baseline**

Run: `npm install && npm run typecheck`

Expected: dependencies install and TypeScript exits successfully before source files exist.

### Task 2: Implement and Test the Order Domain

**Files:**
- Create: `src/order.ts`
- Create: `test/order.test.ts`

**Interfaces:**
- Produces: `Order`, `OrderItem`, `createOrder()`, `addFruitToOrder(order, fruitName)`, and `isKnownFruit(fruitName)` for the server.

- [ ] **Step 1: Write failing order-module tests**

```ts
import { addFruitToOrder, createOrder } from "../src/order.js";

test("adds an apple and updates the total", () => {
  const order = createOrder();
  const updatedOrder = addFruitToOrder(order, "apple");

  expect(updatedOrder.items).toEqual([{ name: "apple", quantity: 1, price: 0.8 }]);
  expect(updatedOrder.total).toBe(0.8);
});

test("increments quantity when the fruit is already in the order", () => {
  const order = addFruitToOrder(createOrder(), "banana");
  const updatedOrder = addFruitToOrder(order, "banana");

  expect(updatedOrder.items[0].quantity).toBe(2);
  expect(updatedOrder.total).toBe(1);
});

test("rejects an unknown fruit", () => {
  expect(() => addFruitToOrder(createOrder(), "durian")).toThrow("Unknown fruit: durian");
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- test/order.test.ts`

Expected: FAIL because `src/order.ts` does not exist.

- [ ] **Step 3: Implement the smallest order domain**

```ts
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  items: OrderItem[];
  total: number;
}

const fruitPrices: Record<string, number> = { apple: 0.8, banana: 0.5, mango: 1.5, orange: 0.7 };

export function createOrder(): Order {
  return { items: [], total: 0 };
}

export function isKnownFruit(fruitName: string): boolean {
  return fruitName in fruitPrices;
}

export function addFruitToOrder(order: Order, fruitName: string): Order {
  const fruitPrice = fruitPrices[fruitName];
  if (fruitPrice === undefined) throw new Error(`Unknown fruit: ${fruitName}`);
  const existingItem = order.items.find((item) => item.name === fruitName);
  if (existingItem) existingItem.quantity += 1;
  else order.items.push({ name: fruitName, quantity: 1, price: fruitPrice });
  order.total = Number(order.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2));
  return order;
}
```

- [ ] **Step 4: Run the focused test and typecheck**

Run: `npm test -- test/order.test.ts && npm run typecheck`

Expected: PASS, with the order total matching added item prices.

### Task 3: Expose the Order Through Express

**Files:**
- Create: `src/server.ts`
- Create: `test/server.test.ts`

**Interfaces:**
- Consumes: `createOrder(): Order`, `isKnownFruit(fruitName: string): boolean`, `addFruitToOrder(order: Order, fruitName: string): Order`.
- Produces: `createApp(): Express` for Supertest and a server listening on port `3000` when `src/server.ts` runs directly.

- [ ] **Step 1: Write failing API tests**

```ts
import request from "supertest";
import { createApp } from "../src/server.js";

test("adds a fruit through the API", async () => {
  const response = await request(createApp()).post("/api/order-items").send({ fruitName: "mango" });

  expect(response.status).toBe(201);
  expect(response.body.order.total).toBe(1.5);
});

test("rejects a missing or unknown fruit", async () => {
  const app = createApp();
  await request(app).post("/api/order-items").send({ fruitName: "" }).expect(400);
  await request(app).post("/api/order-items").send({ fruitName: "durian" }).expect(400);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- test/server.test.ts`

Expected: FAIL because `src/server.ts` does not exist.

- [ ] **Step 3: Implement the API and static hosting**

```ts
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { addFruitToOrder, createOrder, isKnownFruit } from "./order.js";

const publicDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public");

export function createApp() {
  const app = express();
  const order = createOrder();
  app.use(express.json());
  app.use(express.static(publicDirectory));
  app.post("/api/order-items", (request, response) => {
    const fruitName = typeof request.body.fruitName === "string" ? request.body.fruitName.trim().toLowerCase() : "";
    if (!fruitName || !isKnownFruit(fruitName)) return response.status(400).json({ error: "Choose apple, banana, mango, or orange." });
    if (fruitName === "mango") console.log("Premium fruit added");
    const updatedOrder = addFruitToOrder(order, fruitName);
    return response.status(201).json({ order: updatedOrder });
  });
  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().listen(3000, () => console.log("Fruit Shop is running at http://localhost:3000"));
}
```

- [ ] **Step 4: Run API tests and perform a development-server smoke check**

Run: `npm test -- test/server.test.ts && npm run typecheck`

Expected: PASS. Then run `npm run dev` and submit `{"fruitName":"apple"}` to `POST http://localhost:3000/api/order-items`; expect a `201` response containing an apple item and a `0.8` total.

### Task 4: Build the Browser Interaction

**Files:**
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`

**Interfaces:**
- Consumes: `POST /api/order-items` with `{ "fruitName": string }` and `{ "order": { "items": OrderItem[], "total": number } }` responses.
- Produces: a browser UI at `http://localhost:3000` that adds fruit and renders an order.

- [ ] **Step 1: Create semantic page structure**

```html
<main>
  <h1>Fruit Shop</h1>
  <form id="fruit-form">
    <label for="fruit-name">Fruit</label>
    <input id="fruit-name" name="fruitName" required />
    <button type="submit">Add fruit</button>
  </form>
  <p id="status" role="status"></p>
  <h2>Your order</h2>
  <ul id="order-items"></ul>
  <p id="order-total">Total: GBP 0.00</p>
</main>
<script type="module" src="/app.js"></script>
```

- [ ] **Step 2: Implement submission and rendering**

```js
const form = document.querySelector("#fruit-form");
const input = document.querySelector("#fruit-name");
const status = document.querySelector("#status");
const items = document.querySelector("#order-items");
const total = document.querySelector("#order-total");

function renderOrder(order) {
  items.replaceChildren(...order.items.map((item) => {
    const row = document.createElement("li");
    row.textContent = `${item.quantity} x ${item.name} - GBP ${(item.quantity * item.price).toFixed(2)}`;
    return row;
  }));
  total.textContent = `Total: GBP ${order.total.toFixed(2)}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "";
  const response = await fetch("/api/order-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fruitName: input.value }) });
  const result = await response.json();
  if (!response.ok) { status.textContent = result.error; return; }
  renderOrder(result.order);
  input.value = "";
  input.focus();
});
```

- [ ] **Step 3: Add compact readable styling**

```css
body { font-family: Georgia, serif; max-width: 42rem; margin: 3rem auto; padding: 0 1rem; color: #1f2a24; background: #f5f7ee; }
form { display: flex; gap: 0.75rem; align-items: end; }
input, button { font: inherit; padding: 0.5rem; }
button { background: #28724d; border: 1px solid #185035; color: #fff; cursor: pointer; }
#status { min-height: 1.5rem; color: #a4251b; }
```

- [ ] **Step 4: Manually verify the browser flow**

Run: `npm run dev`

Expected: entering `apple` displays `1 x apple` and `Total: GBP 0.80`; entering `durian` shows the API error without clearing the existing order.

### Task 5: Add Debugger Configuration and Workshop Guide

**Files:**
- Create: `.vscode/launch.json`
- Create: `README.md`
- Modify: `src/order.ts`
- Modify: `src/server.ts`

**Interfaces:**
- Consumes: the server entry point at `src/server.ts`, browser application at `http://localhost:3000`, named `addFruitToOrder` function, and `mango` conditional branch.
- Produces: executable VS Code debug profiles and an end-to-end student exercise.

- [ ] **Step 1: Add source comments at debugging targets**

```ts
// Breakpoint exercise: pause here to inspect the normalized fruitName variable.
const fruitName = typeof request.body.fruitName === "string" ? request.body.fruitName.trim().toLowerCase() : "";

// Conditional breakpoint exercise: set the condition to fruitName === "mango".
if (fruitName === "mango") console.log("Premium fruit added");

// Function breakpoint exercise: set a function breakpoint named addFruitToOrder, then Step Over assignments and Step Into this function.
const updatedOrder = addFruitToOrder(order, fruitName);
```

- [ ] **Step 2: Add commented launch configurations**

```jsonc
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Fruit Shop Server",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Fruit Shop in Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/public"
    }
  ]
}
```

- [ ] **Step 3: Write the README workshop sequence**

Include these exact sections: prerequisites and `npm install`; starting `npm run dev`; selecting server/Chrome profiles in Run and Debug; an explanation of `type`, `request`, `name`, `url`, and `webRoot`; line-breakpoint, Step Over, Step Into, Watch, conditional-breakpoint, and function-breakpoint exercises; Debug Console examples `fruitName`, `order.total`, `order.items`, and `addFruitToOrder(order, "orange")`; test and typecheck commands.

- [ ] **Step 4: Run all automated checks and the debug exercises**

Run: `npm test && npm run typecheck`

Expected: all tests and strict typechecking pass. Start the server debug profile, add `mango`, confirm the conditional breakpoint pauses, and add the named function breakpoint `addFruitToOrder` to confirm it pauses without a source-line breakpoint.

## Plan Review

- Spec coverage: Tasks 1-4 cover the TypeScript app, localhost development command, fetch client, rendering, order API, validation, error state, and automated checks. Task 5 covers every requested VS Code debugger topic and launch-configuration field.
- Placeholder scan: no unfinished markers or deferred implementation language remain.
- Type consistency: all later uses of `Order`, `OrderItem`, `createOrder`, `isKnownFruit`, `addFruitToOrder`, API request body, and API response match their Task 2 definitions.