export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  items: OrderItem[];
  total: number;
}

const fruitPrices: Record<string, number> = {
  apple: 0.8,
  banana: 0.5,
  mango: 1.5,
  orange: 0.7
};

export function createOrder(): Order {
  return { items: [], total: 0 };
}

export function isKnownFruit(fruitName: string): boolean {
  return fruitName in fruitPrices;
}

export function addFruitToOrder(order: Order, fruitName: string): Order {
  // Set a line breakpoint here, then add fruitPrice and order.total to Watch.
  const fruitPrice = fruitPrices[fruitName];

  if (fruitPrice === undefined) {
    throw new Error(`Unknown fruit: ${fruitName}`);
  }

  // Step Over this lookup and inspect existingItem before adding a duplicate fruit.
  const existingItem = order.items.find((item) => item.name === fruitName);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Add newItem to Watch, then Step Over the push to see order.items change.
    const newItem: OrderItem = { name: fruitName, quantity: 1, price: fruitPrice };
    order.items.push(newItem);
  }

  // Step Over this calculation and watch order.total update.
  order.total = Number(
    order.items.reduce((sum, item) => sum + item.quantity * item.price, 0).toFixed(2)
  );

  return order;
}