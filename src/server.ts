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
    // Set a line breakpoint here by clicking the gutter to the left of this line
    // then inspect fruitName in Variables or Watch.
    const fruitName =
      typeof request.body.fruitName === "string" ? request.body.fruitName.trim().toLowerCase() : "";

    if (!fruitName || !isKnownFruit(fruitName)) {
      return response.status(400).json({ error: "Choose apple, banana, mango, or orange." });
    }

    // Right click the gutter breakpoint area to the left of this line
    // Try a conditional breakpoint here with: fruitName === "mango"
    // The breakpoint will activate and you'll be able to step over
    if (fruitName === "mango") {
      console.log("Premium fruit added");
    }

    // Step Into this call
    //  OR set a line breakpoint for addFruitToOrder to see when the method is called.
    const updatedOrder = addFruitToOrder(order, fruitName);

    return response.status(201).json({ order: updatedOrder });
  });

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().listen(3000, () => {
    console.log("Fruit Shop is running at http://localhost:3000");
  });
}