import React, { useState } from 'react';
import { Header } from './Header';
import { JournalList } from './JournalList';
import { EntryEditor } from './EntryEditor';
import { DailyPrompt } from './DailyPrompt';
import { EmotionalCalendar } from './EmotionalCalendar';
import { CrisisWarning } from './CrisisWarning';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { JournalEntry } from '../lib/supabase';

type View = 'journal' | 'calendar';

export const Dashboard: React.FC = () => {
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentView, setCurrentView] = useState<View>('journal');

  const {
    entries,
    loading,
    error,
    crisisDetected,
    setCrisisDetected,
    createEntry,
    createEntryWithPrompt,
    updateEntry,
    deleteEntry,
    toggleFavorite,
  } = useJournalEntries();

  const handleNewEntry = () => {
    setIsCreating(true);
    setEditingEntry(null);
  };

  const handleUseDailyPrompt = (prompt: string) => {
    setIsCreating(true);
    setEditingEntry(null);
    setPromptToUse(prompt);
  };

  const [promptToUse, setPromptToUse] = useState<string>('');

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
        if (promptToUse) {
          await createEntryWithPrompt(title, content, promptToUse);
          setPromptToUse('');
        } else {
          await createEntry(title, content);
        }
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
    setPromptToUse('');
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    // Close any open editors when switching views
    setIsCreating(false);
    setEditingEntry(null);
    setPromptToUse('');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-sm border border-red-500/30">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (currentView === 'calendar') {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header
          onNewEntry={handleNewEntry}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
          onViewChange={handleViewChange}
          currentView={currentView}
        />
        <EmotionalCalendar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        onNewEntry={handleNewEntry}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        onViewChange={handleViewChange}
        currentView={currentView}
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <DailyPrompt onUsePrompt={handleUseDailyPrompt} />
        
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

      {crisisDetected && (
        <CrisisWarning
          onClose={() => setCrisisDetected(null)}
          severity={crisisDetected.severity}
          indicators={crisisDetected.detected_indicators}
        />
      )}

      {(isCreating || editingEntry) && (
        <EntryEditor
          entry={editingEntry || (promptToUse ? { 
            id: '', 
            title: '', 
            content: '', 
            prompt: promptToUse,
            user_id: '', 
            created_at: '', 
            updated_at: '', 
            is_favorite: false 
          } as JournalEntry : undefined)}
          onSave={handleSaveEntry}
          onCancel={handleCancelEdit}
          loading={saveLoading}
        />
      )}

    </div>
  );
};