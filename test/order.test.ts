import { describe, expect, it } from "vitest";
import { addFruitToOrder, createOrder } from "../src/order.js";

describe("addFruitToOrder", () => {
  it("adds an apple and updates the total", () => {
    const order = createOrder();
    const updatedOrder = addFruitToOrder(order, "apple");

    expect(updatedOrder.items).toEqual([{ name: "apple", quantity: 1, price: 0.8 }]);
    expect(updatedOrder.total).toBe(0.8);
  });

  it("increments quantity when the fruit is already in the order", () => {
    const order = addFruitToOrder(createOrder(), "banana");
    const updatedOrder = addFruitToOrder(order, "banana");

    expect(updatedOrder.items[0].quantity).toBe(2);
    expect(updatedOrder.total).toBe(1);
  });

  it("rejects an unknown fruit", () => {
    expect(() => addFruitToOrder(createOrder(), "durian")).toThrow("Unknown fruit: durian");
  });
});