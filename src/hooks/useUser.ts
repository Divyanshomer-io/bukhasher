import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { USER_STORAGE_KEY } from '@/lib/constants';

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem(USER_STORAGE_KEY);
    if (storedId) {
      supabase
        .from('users')
        .select('id, name, avatar')
        .eq('id', storedId)
        .single()
        .then(({ data }) => {
          if (data) setUser(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (name: string, avatar: string) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Name is required');

    // Check if name exists
    const { data: existing } = await supabase
      .from('users')
      .select('id, name, avatar')
      .ilike('name_lower', trimmed.toLowerCase())
      .single();

    if (existing) {
      localStorage.setItem(USER_STORAGE_KEY, existing.id);
      setUser(existing);
      return existing;
    }

    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({ name: trimmed, avatar })
      .select('id, name, avatar')
      .single();

    if (error) throw error;
    if (data) {
      localStorage.setItem(USER_STORAGE_KEY, data.id);
      setUser(data);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}
