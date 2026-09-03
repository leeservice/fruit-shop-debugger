const form = document.querySelector("#fruit-form");
const input = document.querySelector("#fruit-name");
const status = document.querySelector("#status");
const items = document.querySelector("#order-items");
const total = document.querySelector("#order-total");

function renderOrder(order) {
  items.replaceChildren(
    ...order.items.map((item) => {
      const row = document.createElement("li");
      row.textContent = `${item.quantity} x ${item.name} - GBP ${(item.quantity * item.price).toFixed(2)}`;
      return row;
    })
  );
  total.textContent = `Total: GBP ${order.total.toFixed(2)}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "";

  try {
    const response = await fetch("/api/order-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fruitName: input.value })
    });
    const result = await response.json();

    if (!response.ok) {
      status.textContent = result.error;
      return;
    }

    renderOrder(result.order);
    input.value = "";
    input.focus();
  } catch {
    status.textContent = "Unable to reach the fruit shop. Try again.";
  }
});