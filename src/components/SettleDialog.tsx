import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useSettle } from '@/hooks/useSettle';

interface SettleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  toUserAvatar: string;
  owedAmount: number;
}

export function SettleDialog({
  open,
  onOpenChange,
  fromUserId,
  fromUserName,
  toUserId,
  toUserName,
  toUserAvatar,
  owedAmount,
}: SettleDialogProps) {
  const [amount, setAmount] = useState(owedAmount.toFixed(2));
  const [loading, setLoading] = useState(false);
  const { settlePayment } = useSettle();

  const handleSettle = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { toast.error('Enter a valid amount'); return; }
    if (num > owedAmount + 0.01) { toast.error("Can't pay more than you owe"); return; }

    setLoading(true);
    try {
      await settlePayment(fromUserId, toUserId, num, fromUserName, toUserName);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      toast.success(`Paid ₹${num.toFixed(0)} to ${toUserName}! 🎉`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Settlement failed');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">💸 Settle Up</DialogTitle>
        </DialogHeader>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="text-center space-y-2">
            <span className="text-4xl">{toUserAvatar}</span>
            <p className="text-sm text-muted-foreground">
              You owe <span className="font-bold text-foreground">{toUserName}</span>
            </p>
            <p className="font-display font-bold text-2xl text-destructive">₹{owedAmount.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl h-12 text-lg text-center"
              step="0.01"
            />
          </div>

          <Button
            onClick={handleSettle}
            disabled={loading}
            className="w-full rounded-xl h-11 gradient-primary text-primary-foreground"
          >
            {loading ? '...' : `Pay ₹${parseFloat(amount || '0').toFixed(0)} 💰`}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
