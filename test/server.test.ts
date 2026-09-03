import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";

describe("POST /api/order-items", () => {
  it("adds a fruit through the API", async () => {
    const response = await request(createApp())
      .post("/api/order-items")
      .send({ fruitName: "mango" });

    expect(response.status).toBe(201);
    expect(response.body.order.total).toBe(1.5);
  });

  it("rejects a missing or unknown fruit", async () => {
    const app = createApp();

    await request(app)
      .post("/api/order-items")
      .send({ fruitName: "" })
      .expect(400)
      .expect({ error: "Choose apple, banana, mango, or orange." });
    await request(app)
      .post("/api/order-items")
      .send({ fruitName: "durian" })
      .expect(400)
      .expect({ error: "Choose apple, banana, mango, or orange." });
  });
});