import React from 'react';
import { JournalEntry as JournalEntryType } from '../lib/supabase';
import { JournalEntry } from './JournalEntry';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { groupEntriesByDate } from '../utils/dateUtils';

interface JournalListProps {
  entries: JournalEntryType[];
  loading: boolean;
  onEdit: (entry: JournalEntryType) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onNewEntry: () => void;
  searchQuery: string;
  showFavoritesOnly: boolean;
}

export const JournalList: React.FC<JournalListProps> = ({
  entries,
  loading,
  onEdit,
  onDelete,
  onToggleFavorite,
  onNewEntry,
  searchQuery,
  showFavoritesOnly,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Filter entries based on search and favorites
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFavorites = !showFavoritesOnly || entry.is_favorite;
    
    return matchesSearch && matchesFavorites;
  });

  if (filteredEntries.length === 0) {
    return (
      <EmptyState 
        onNewEntry={onNewEntry} 
        isFiltered={searchQuery.length > 0 || showFavoritesOnly}
      />
    );
  }

  const groupedEntries = groupEntriesByDate(filteredEntries);

  return (
    <div className="space-y-8">
      {Object.entries(groupedEntries).map(([date, dateEntries]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 px-1">{date}</h2>
          <div className="space-y-4">
            {dateEntries.map((entry) => (
              <JournalEntry
                key={entry.id}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};