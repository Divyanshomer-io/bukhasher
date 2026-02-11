import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Order } from '@/hooks/useOrders';

interface OrderListProps {
  orders: Order[];
  currentUserId: string;
  isSplit: boolean;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

export function OrderList({ orders, currentUserId, isSplit, onEdit, onDelete }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-muted-foreground font-body"
      >
        <p className="text-4xl mb-2">🍽️</p>
        <p>No orders yet. Be the first!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass rounded-xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{order.user_avatar}</span>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">{order.user_name}</p>
                <p className="text-base text-foreground">{order.food_item}</p>
              </div>
            </div>
            {order.user_id === currentUserId && !isSplit && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => onEdit(order)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive"
                  onClick={() => onDelete(order.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
