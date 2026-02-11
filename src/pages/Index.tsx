import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { LoginForm } from '@/components/LoginForm';
import { CalendarView } from '@/components/CalendarView';
import { BalanceSummary } from '@/components/BalanceSummary';
import { MEME_QUOTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default function Index() {
  const { user, loading, login, logout } = useUser();
  const navigate = useNavigate();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(MEME_QUOTES[Math.floor(Math.random() * MEME_QUOTES.length)]);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <span className="text-5xl">🐯</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <motion.h1
            className="text-5xl sm:text-6xl font-display font-bold gradient-text"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            🐯 BukhaSher
          </motion.h1>
          <p className="text-sm text-muted-foreground font-display">
            "Created by – Divyanshu Lila"
          </p>
          <motion.p
            key={quote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base text-muted-foreground italic"
          >
            {quote}
          </motion.p>
        </motion.div>

        {/* Auth section */}
        {!user ? (
          <LoginForm onLogin={login} />
        ) : (
          <>
            {/* Logged in header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{user.avatar}</span>
                <div>
                  <p className="font-display font-bold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Ready to order!</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="rounded-xl">
                <LogOut className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Calendar */}
            <div>
              <h2 className="font-display font-bold text-lg mb-3 text-foreground">📅 Pick a Day</h2>
              <CalendarView onSelectDate={(date) => navigate(`/day/${date}`)} />
            </div>

            {/* Balance summary */}
            <div>
              <h2 className="font-display font-bold text-lg mb-3 text-foreground">💳 My Balances</h2>
              <div className="glass rounded-2xl p-4">
                <BalanceSummary userId={user.id} />
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6"
        >
          <p className="text-sm text-muted-foreground italic">
            "Built for hungry legends." 🍕
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
