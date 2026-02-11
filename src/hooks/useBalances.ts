import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BalanceEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number; // positive = you owe them, negative = they owe you
}

export function useBalances(currentUserId: string | undefined) {
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) { setLoading(false); return; }

    const fetch = async () => {
      // Get all balances involving current user
      const { data: rows } = await supabase
        .from('balances')
        .select('user_a, user_b, net_amount')
        .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`);

      if (!rows || rows.length === 0) { setBalances([]); setLoading(false); return; }

      const otherIds = new Set<string>();
      rows.forEach(r => {
        if (r.user_a !== currentUserId) otherIds.add(r.user_a);
        if (r.user_b !== currentUserId) otherIds.add(r.user_b);
      });

      const { data: users } = await supabase
        .from('users')
        .select('id, name, avatar')
        .in('id', Array.from(otherIds));

      const userMap = new Map(users?.map(u => [u.id, u]) || []);

      const entries: BalanceEntry[] = [];
      rows.forEach(r => {
        const net = Number(r.net_amount);
        if (Math.abs(net) < 0.01) return;

        if (r.user_a === currentUserId) {
          // net positive = user_a owes user_b, so I owe them
          const other = userMap.get(r.user_b);
          if (other) entries.push({ userId: r.user_b, userName: other.name, userAvatar: other.avatar, amount: net });
        } else {
          // user_b is me, net positive = user_a owes me (they owe me)
          const other = userMap.get(r.user_a);
          if (other) entries.push({ userId: r.user_a, userName: other.name, userAvatar: other.avatar, amount: -net });
        }
      });

      setBalances(entries);
      setLoading(false);
    };

    fetch();

    const channel = supabase
      .channel('balances-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'balances' }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  return { balances, loading };
}
