import React, { useState } from 'react';
import { Edit3, Trash2, Heart, Calendar, MoreVertical, Lightbulb } from 'lucide-react';
import { JournalEntry as JournalEntryType } from '../lib/supabase';
import { formatDate, formatTime } from '../utils/dateUtils';

interface JournalEntryProps {
  entry: JournalEntryType;
  onEdit: (entry: JournalEntryType) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export const JournalEntry: React.FC<JournalEntryProps> = ({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      onDelete(entry.id);
    }
  };

  return (
    <article className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-slate-700 transition-colors">
            {entry.title || 'Untitled Entry'}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{formatDate(entry.created_at)}</span>
            </div>
            <span>{formatTime(entry.created_at)}</span>
            {entry.updated_at !== entry.created_at && (
              <span className="text-xs">• edited</span>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20 min-w-40">
                <button
                  onClick={() => {
                    onToggleFavorite(entry.id, !entry.is_favorite);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center space-x-2"
                >
                  <Heart 
                    size={16} 
                    className={entry.is_favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'} 
                  />
                  <span>{entry.is_favorite ? 'Remove from favorites' : 'Add to favorites'}</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(entry);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center space-x-2"
                >
                  <Edit3 size={16} className="text-slate-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        {entry.prompt && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Lightbulb size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-800 mb-1">Prompt</p>
                <p className="text-sm text-amber-700">{entry.prompt}</p>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap line-clamp-3">
          {entry.content}
        </p>
      </div>

      {entry.is_favorite && (
        <div className="mt-4 flex items-center space-x-1 text-red-500">
          <Heart size={16} className="fill-current" />
          <span className="text-xs font-medium">Favorite</span>
        </div>
      )}
    </article>
  );
};