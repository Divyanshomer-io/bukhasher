import { supabase } from '@/integrations/supabase/client';

export function useSettle() {
  const settlePayment = async (
    fromUserId: string,
    toUserId: string,
    amount: number,
    fromUserName: string,
    toUserName: string
  ) => {
    // Insert settlement record
    const { error: settleError } = await supabase
      .from('settlements')
      .insert({ from_user_id: fromUserId, to_user_id: toUserId, amount });

    if (settleError) throw settleError;

    // Update balance between the two users
    const [userA, userB] =
      fromUserId < toUserId ? [fromUserId, toUserId] : [toUserId, fromUserId];

    // If fromUser pays toUser, debt is reduced
    // net_amount positive = user_a owes user_b
    const adjustment = fromUserId < toUserId ? -amount : amount;

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
    }

    // Send notification to receiver
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: toUserId,
      type: 'PAYMENT_SETTLED',
      message: `${fromUserName} paid you ₹${amount.toFixed(0)} 💸 debt cleared fam`,
      amount,
    });
    if (notifError) {
      console.error('Failed to insert settlement notification:', notifError);
    }
  };

  return { settlePayment };
}
