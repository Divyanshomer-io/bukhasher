import { motion } from 'framer-motion';
import { useBalances } from '@/hooks/useBalances';

interface BalanceSummaryProps {
  userId: string;
}

export function BalanceSummary({ userId }: BalanceSummaryProps) {
  const { balances, loading } = useBalances(userId);

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
  );
}
