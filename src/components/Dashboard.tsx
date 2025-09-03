import React, { useState } from 'react';
import { Header } from './Header';
import { JournalList } from './JournalList';
import { EntryEditor } from './EntryEditor';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { JournalEntry } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
  } = useJournalEntries();

  const handleNewEntry = () => {
    setIsCreating(true);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsCreating(false);
  };

  const handleSaveEntry = async (title: string, content: string) => {
    setSaveLoading(true);
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, title, content);
      } else {
        await createEntry(title, content);
      }
      setIsCreating(false);
      setEditingEntry(null);
    } catch (err) {
      console.error('Failed to save entry:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingEntry(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-200">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onNewEntry={handleNewEntry}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <JournalList
          entries={entries}
          loading={loading}
          onEdit={handleEditEntry}
          onDelete={deleteEntry}
          onToggleFavorite={toggleFavorite}
          onNewEntry={handleNewEntry}
          searchQuery={searchQuery}
          showFavoritesOnly={showFavoritesOnly}
        />
      </main>

      {(isCreating || editingEntry) && (
        <EntryEditor
          entry={editingEntry || undefined}
          onSave={handleSaveEntry}
          onCancel={handleCancelEdit}
          loading={saveLoading}
        />
      )}
    </div>
  );
};