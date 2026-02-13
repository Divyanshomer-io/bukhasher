import { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBalances } from '@/hooks/useBalances';
import { SettleDialog } from '@/components/SettleDialog';

interface BalanceSummaryProps {
  userId: string;
  userName?: string;
}

export function BalanceSummary({ userId, userName }: BalanceSummaryProps) {
  const { balances, loading } = useBalances(userId);
  const [settleTarget, setSettleTarget] = useState<{
    toUserId: string;
    toUserName: string;
    toUserAvatar: string;
    amount: number;
  } | null>(null);

  if (loading) return null;

  const youOwe = balances.filter(b => b.amount > 0);
  const owedToYou = balances.filter(b => b.amount < 0);

  if (youOwe.length === 0 && owedToYou.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        All settled up! 🎉
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {youOwe.length > 0 && (
          <div>
            <h4 className="font-display font-semibold text-sm text-destructive mb-2">You owe:</h4>
            {youOwe.map(b => (
              <div key={b.userId} className="flex items-center gap-2 py-1">
                <span className="text-lg">{b.userAvatar}</span>
                <span className="flex-1 text-sm text-foreground">{b.userName}</span>
                <span className="font-display font-bold text-destructive">₹{b.amount.toFixed(2)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-7 text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    setSettleTarget({
                      toUserId: b.userId,
                      toUserName: b.userName,
                      toUserAvatar: b.userAvatar,
                      amount: b.amount,
                    })
                  }
                >
                  <Banknote className="h-3 w-3" /> Settle
                </Button>
              </div>
            ))}
          </div>
        )}
        {owedToYou.length > 0 && (
          <div>
            <h4 className="font-display font-semibold text-sm text-accent mb-2">Others owe you:</h4>
            {owedToYou.map(b => (
              <div key={b.userId} className="flex items-center gap-2 py-1">
                <span className="text-lg">{b.userAvatar}</span>
                <span className="flex-1 text-sm text-foreground">{b.userName}</span>
                <span className="font-display font-bold text-accent">₹{Math.abs(b.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {settleTarget && (
        <SettleDialog
          open={!!settleTarget}
          onOpenChange={(open) => { if (!open) setSettleTarget(null); }}
          fromUserId={userId}
          fromUserName={userName || 'You'}
          toUserId={settleTarget.toUserId}
          toUserName={settleTarget.toUserName}
          toUserAvatar={settleTarget.toUserAvatar}
          owedAmount={settleTarget.amount}
        />
      )}
    </>
  );
}
