import React, { useState, useEffect } from 'react';
import { Save, X, Calendar, Lightbulb } from 'lucide-react';
import { JournalEntry } from '../lib/supabase';
import { formatDate } from '../utils/dateUtils';

interface EntryEditorProps {
  entry?: JournalEntry;
  onSave: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const EntryEditor: React.FC<EntryEditorProps> = ({
  entry,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [prompt, setPrompt] = useState(entry?.prompt || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const originalTitle = entry?.title || '';
    const originalContent = entry?.content || '';
    const originalPrompt = entry?.prompt || '';
    setHasChanges(title !== originalTitle || content !== originalContent || prompt !== originalPrompt);
  }, [title, content, prompt, entry]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    await onSave(title.trim(), content.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (hasChanges) {
        handleSave();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-slate-500">
              <Calendar size={16} />
              <span className="text-sm">
                {entry ? formatDate(entry.created_at) : formatDate(new Date().toISOString())}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {prompt && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb size={14} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 mb-1">Writing Prompt</p>
                  <p className="text-amber-700 text-sm leading-relaxed">{prompt}</p>
                </div>
              </div>
            </div>
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Entry title..."
            className="w-full text-2xl font-bold text-slate-900 placeholder-slate-400 border-none outline-none mb-6 resize-none"
            autoFocus
          />
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind today?"
            className="w-full h-80 text-slate-700 placeholder-slate-400 border-none outline-none resize-none leading-relaxed text-lg"
          />
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
          <p className="text-xs text-slate-500 text-center">
            Press <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">Cmd+S</kbd> to save or <kbd className="px-2 py-1 bg-slate-200 rounded text-xs">Esc</kbd> to cancel
          </p>
        </div>
      </div>
    </div>
  );
};