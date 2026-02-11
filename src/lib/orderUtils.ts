import type { Order } from '@/hooks/useOrders';

export function groupOrders(orders: Order[]): Map<string, number> {
  const grouped = new Map<string, number>();
  for (const order of orders) {
    const normalized = order.food_item.trim().toLowerCase();
    grouped.set(normalized, (grouped.get(normalized) || 0) + 1);
  }
  return grouped;
}

export function generateCopyMessage(orders: Order[]): string {
  const grouped = groupOrders(orders);
  const lines: string[] = ["Today's Order:", ""];
  grouped.forEach((count, item) => {
    // Capitalize first letter
    const display = item.charAt(0).toUpperCase() + item.slice(1);
    lines.push(count > 1 ? `${display} *${count}` : display);
  });
  return lines.join('\n');
}

export function generateDownloadContent(date: string, orders: Order[]): string {
  const lines: string[] = [`Date: ${date}`, ''];

  orders.forEach(o => {
    lines.push(`${o.user_name} - ${o.food_item}`);
  });

  lines.push('', 'Grouped Summary:', '');

  const grouped = groupOrders(orders);
  grouped.forEach((count, item) => {
    const display = item.charAt(0).toUpperCase() + item.slice(1);
    lines.push(count > 1 ? `${display} *${count}` : display);
  });

  return lines.join('\n');
}
