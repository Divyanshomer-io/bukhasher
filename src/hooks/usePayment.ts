import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  date: string;
  paid_by: string;
  total_amount: number;
  payer_name?: string;
  payer_avatar?: string;
}

export interface SplitDetail {
  user_id: string;
  amount: number;
}

export function usePayment(date: string) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayment = useCallback(async () => {
    const { data } = await supabase
      .from('day_payments')
      .select('*, users(name, avatar)')
      .eq('date', date)
      .single();

    if (data) {
      setPayment({
        ...data,
        total_amount: Number(data.total_amount),
        payer_name: (data as any).users?.name,
        payer_avatar: (data as any).users?.avatar,
      });

      const { data: splits } = await supabase
        .from('split_details')
        .select('user_id, amount')
        .eq('day_payment_id', data.id);

      if (splits) {
        setSplitDetails(splits.map(s => ({ ...s, amount: Number(s.amount) })));
      }
    } else {
      setPayment(null);
      setSplitDetails([]);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchPayment();

    const channel = supabase
      .channel(`payments-${date}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'day_payments', filter: `date=eq.${date}` },
        () => fetchPayment()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [date, fetchPayment]);

  const splitBill = async (
    payerId: string,
    totalAmount: number,
    splits: SplitDetail[]
  ) => {
    // Insert day payment
    const { data: paymentData, error: payError } = await supabase
      .from('day_payments')
      .insert({ date, paid_by: payerId, total_amount: totalAmount })
      .select()
      .single();

    if (payError) throw payError;

    // Insert split details
    const { error: splitError } = await supabase
      .from('split_details')
      .insert(
        splits.map(s => ({
          day_payment_id: paymentData.id,
          user_id: s.user_id,
          amount: s.amount,
        }))
      );

    if (splitError) throw splitError;

    // Update balances
    for (const split of splits) {
      if (split.user_id === payerId) continue;

      const [userA, userB] =
        split.user_id < payerId
          ? [split.user_id, payerId]
          : [payerId, split.user_id];

      // net_amount positive means user_a owes user_b
      const adjustment =
        split.user_id < payerId ? split.amount : -split.amount;

      const { data: existing } = await supabase
        .from('balances')
        .select('id, net_amount')
        .eq('user_a', userA)
        .eq('user_b', userB)
        .single();

      if (existing) {
        await supabase
          .from('balances')
          .update({ net_amount: Number(existing.net_amount) + adjustment })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('balances')
          .insert({ user_a: userA, user_b: userB, net_amount: adjustment });
      }
    }
  };

  return { payment, splitDetails, loading, splitBill };
}
