import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  onNewEntry: () => void;
  isFiltered?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewEntry, isFiltered = false }) => {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <BookOpen size={32} className="text-slate-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {isFiltered ? 'No entries found' : 'Start your first journal entry'}
      </h3>
      
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        {isFiltered 
          ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
          : 'Capture your thoughts, experiences, and memories. Your journey begins with a single entry.'
        }
      </p>

      {!isFiltered && (
        <button
          onClick={onNewEntry}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-sm"
        >
          <Plus size={20} />
          <span>Write your first entry</span>
        </button>
      )}
    </div>
  );
};