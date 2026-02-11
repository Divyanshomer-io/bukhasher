import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  date: string;
  user_id: string;
  food_item: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export function useOrders(date: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, users(name, avatar)')
      .eq('date', date)
      .order('created_at');

    if (data) {
      setOrders(
        data.map((o: any) => ({
          ...o,
          user_name: o.users?.name,
          user_avatar: o.users?.avatar,
        }))
      );
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel(`orders-${date}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `date=eq.${date}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [date, fetchOrders]);

  const addOrder = async (userId: string, foodItem: string) => {
    const { error } = await supabase
      .from('orders')
      .insert({ date, user_id: userId, food_item: foodItem.trim() });
    if (error) throw error;
  };

  const updateOrder = async (orderId: string, foodItem: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ food_item: foodItem.trim() })
      .eq('id', orderId);
    if (error) throw error;
  };

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    if (error) throw error;
  };

  return { orders, loading, addOrder, updateOrder, deleteOrder };
}
