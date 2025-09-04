import React from 'react';
import { BookOpen, Search } from 'lucide-react';

interface EmptyStateProps {
  onNewEntry: () => void;
  isFiltered?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewEntry, isFiltered }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        {isFiltered ? (
          <>
            <Search className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No entries found
            </h3>
            <p className="text-slate-400 mb-6">
              No journal entries match your current search or filter criteria.
            </p>
          </>
        ) : (
          <>
            <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              Start your journaling journey
            </h3>
            <p className="text-slate-400 mb-6">
              You haven't written any journal entries yet. Create your first entry to begin capturing your thoughts and experiences.
            </p>
            <button
              onClick={onNewEntry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Write your first entry
            </button>
          </>
        )}
      </div>
    </div>
  );
};