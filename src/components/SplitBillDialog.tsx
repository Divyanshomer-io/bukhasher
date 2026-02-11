import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import type { Order } from '@/hooks/useOrders';
import type { SplitDetail } from '@/hooks/usePayment';

interface SplitBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: Order[];
  onSplit: (payerId: string, total: number, splits: SplitDetail[]) => Promise<void>;
}

export function SplitBillDialog({ open, onOpenChange, orders, onSplit }: SplitBillDialogProps) {
  const [step, setStep] = useState(1);
  const [payerId, setPayerId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [splits, setSplits] = useState<{ user_id: string; name: string; avatar: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // Get unique users from orders
  const uniqueUsers = Array.from(
    new Map(orders.map(o => [o.user_id, { id: o.user_id, name: o.user_name || '', avatar: o.user_avatar || '' }])).values()
  );

  useEffect(() => {
    if (step === 3 && totalAmount) {
      const total = parseFloat(totalAmount);
      const perPerson = Math.round((total / uniqueUsers.length) * 100) / 100;
      setSplits(uniqueUsers.map(u => ({ user_id: u.id, name: u.name, avatar: u.avatar, amount: perPerson })));
    }
  }, [step, totalAmount]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onSplit(
        payerId,
        parseFloat(totalAmount),
        splits.map(s => ({ user_id: s.user_id, amount: s.amount }))
      );
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      toast.success('Bill split done! 🎉');
      onOpenChange(false);
      setStep(1);
      setPayerId('');
      setTotalAmount('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to split');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">💰 Split the Bill</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm text-muted-foreground">Who paid?</p>
            <Select value={payerId} onValueChange={setPayerId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select payer..." />
              </SelectTrigger>
              <SelectContent>
                {uniqueUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.avatar} {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setStep(2)}
              disabled={!payerId}
              className="w-full rounded-xl gradient-primary text-primary-foreground"
            >
              Next →
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm text-muted-foreground">Total bill amount (₹)</p>
            <Input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter amount..."
              className="rounded-xl h-12 text-lg"
              step="0.01"
            />
            <Button
              onClick={() => setStep(3)}
              disabled={!totalAmount || parseFloat(totalAmount) <= 0}
              className="w-full rounded-xl gradient-primary text-primary-foreground"
            >
              Next →
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm text-muted-foreground">Individual amounts (editable)</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {splits.map((s, i) => (
                <div key={s.user_id} className="flex items-center gap-3">
                  <span className="text-xl">{s.avatar}</span>
                  <span className="flex-1 text-sm font-medium text-foreground">{s.name}</span>
                  <Input
                    type="number"
                    value={s.amount}
                    onChange={(e) => {
                      const next = [...splits];
                      next[i] = { ...next[i], amount: parseFloat(e.target.value) || 0 };
                      setSplits(next);
                    }}
                    className="w-24 rounded-lg text-right"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full rounded-xl gradient-primary text-primary-foreground"
            >
              {loading ? '...' : 'Confirm Split 🎉'}
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
