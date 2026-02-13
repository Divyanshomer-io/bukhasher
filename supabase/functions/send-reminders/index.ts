import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get all balances with non-zero amounts
  const { data: balances } = await supabase
    .from('balances')
    .select('user_a, user_b, net_amount');

  if (!balances || balances.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Get all users for names
  const userIds = new Set<string>();
  balances.forEach(b => { userIds.add(b.user_a); userIds.add(b.user_b); });

  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .in('id', Array.from(userIds));

  const userMap = new Map(users?.map(u => [u.id, u.name]) || []);

  let sent = 0;

  for (const b of balances) {
    const net = Number(b.net_amount);
    if (Math.abs(net) < 0.01) continue;

    // Determine who owes whom
    // net positive = user_a owes user_b
    const debtorId = net > 0 ? b.user_a : b.user_b;
    const creditorId = net > 0 ? b.user_b : b.user_a;
    const amount = Math.abs(net);
    const creditorName = userMap.get(creditorId) || 'someone';

    // Check if reminder sent in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', debtorId)
      .eq('type', 'REMINDER')
      .gte('created_at', since)
      .limit(1);

    if (recent && recent.length > 0) continue;

    // Send reminder
    await supabase.from('notifications').insert({
      user_id: debtorId,
      type: 'REMINDER',
      message: `yo you still owe ₹${amount.toFixed(0)} to ${creditorName} 💀 settle up bestie`,
      amount,
    });

    sent++;
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
