import { useState, useEffect } from 'react';
import { supabase, JournalEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useJournalEntries = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (title: string, content: string) => {
    return createEntryWithPrompt(title, content);
  };

  const createEntryWithPrompt = async (title: string, content: string, prompt?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            title,
            content,
            prompt: prompt || '',
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      throw err;
    }
  };

  const updateEntry = async (id: string, title: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => prev.map(entry => entry.id === id ? data : entry));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({ is_favorite: isFavorite })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setEntries(prev => prev.map(entry => entry.id === id ? data : entry));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update favorite');
      throw err;
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  return {
    entries,
    loading,
    error,
    createEntry,
    createEntryWithPrompt,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    refetch: fetchEntries,
  };
};