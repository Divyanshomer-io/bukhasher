import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Copy, Download, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderList } from '@/components/OrderList';
import { SplitBillDialog } from '@/components/SplitBillDialog';
import { useOrders, Order } from '@/hooks/useOrders';
import { usePayment } from '@/hooks/usePayment';
import { useUser } from '@/hooks/useUser';
import { generateCopyMessage, generateDownloadContent } from '@/lib/orderUtils';
import { toast } from 'sonner';

export default function DayOrder() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const { orders, loading, addOrder, updateOrder, deleteOrder } = useOrders(date!);
  const { payment, splitBill } = usePayment(date!);
  const [foodItem, setFoodItem] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [splitOpen, setSplitOpen] = useState(false);

  useEffect(() => {
    if (!user && !userLoading) navigate('/');
  }, [user, userLoading, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-5xl">🐯</span>
      </div>
    );
  }

  const myOrder = orders.find(o => o.user_id === user.id);
  const isSplit = !!payment;
  const dateObj = parseISO(date!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodItem.trim()) return;

    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, foodItem);
        setEditingOrder(null);
        toast.success('Order updated! ✏️');
      } else {
        await addOrder(user.id, foodItem);
        toast.success('Order added! 🍗');
      }
      setFoodItem('');
    } catch (err: any) {
      if (err.message?.includes('duplicate')) {
        toast.error('You already ordered today!');
      } else {
        toast.error(err.message || 'Failed');
      }
    }
  };

  const handleCopy = () => {
    const msg = generateCopyMessage(orders);
    navigator.clipboard.writeText(msg);
    toast.success('Copied to clipboard! 📋');
  };

  const handleDownload = () => {
    const content = generateDownloadContent(date!, orders);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bukhasher-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded! 📥');
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFoodItem(order.food_item);
  };

  const handleDelete = async (orderId: string) => {
    if (isSplit) { toast.error("Can't delete after split!"); return; }
    await deleteOrder(orderId);
    toast.success('Order deleted! 🗑️');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              📅 {format(dateObj, 'EEEE, MMM d')}
            </h1>
            <p className="text-sm text-muted-foreground">{format(dateObj, 'yyyy')}</p>
          </div>
        </motion.div>

        {/* Payment status */}
        {isSplit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="gradient-accent rounded-xl p-3 text-center"
          >
            <p className="font-display font-bold text-accent-foreground">
              ✅ Paid by {payment.payer_avatar} {payment.payer_name} — ₹{payment.total_amount}
            </p>
          </motion.div>
        )}

        {/* Add/Edit order form */}
        {!isSplit && (!myOrder || editingOrder) && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2"
          >
            <Input
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="What are you eating? 🍕"
              className="flex-1 rounded-xl h-11 bg-card"
            />
            <Button type="submit" className="rounded-xl gradient-primary text-primary-foreground h-11 px-5">
              {editingOrder ? '✏️ Save' : '➕ Add'}
            </Button>
          </motion.form>
        )}

        {/* Orders list */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <OrderList
            orders={orders}
            currentUserId={user.id}
            isSplit={isSplit}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Action buttons */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            <Button onClick={handleCopy} variant="outline" className="rounded-xl h-11 gap-2">
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button onClick={handleDownload} variant="outline" className="rounded-xl h-11 gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
            {!isSplit && (
              <Button
                onClick={() => setSplitOpen(true)}
                className="col-span-2 rounded-xl h-11 gap-2 gradient-primary text-primary-foreground"
              >
                <Scissors className="h-4 w-4" /> Split Bill 💰
              </Button>
            )}
          </motion.div>
        )}
      </div>

      <SplitBillDialog
        open={splitOpen}
        onOpenChange={setSplitOpen}
        orders={orders}
        onSplit={splitBill}
      />
    </div>
  );
}
