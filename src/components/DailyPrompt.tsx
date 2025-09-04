import React from 'react';
import { Lightbulb, RefreshCw, Edit3 } from 'lucide-react';
import { useDailyPrompt } from '../hooks/useDailyPrompt';

interface DailyPromptProps {
  onUsePrompt: (prompt: string) => void;
}

export const DailyPrompt: React.FC<DailyPromptProps> = ({ onUsePrompt }) => {
  const { dailyPrompt, loading, error, refreshPrompt } = useDailyPrompt();

  const handleUsePrompt = () => {
    if (dailyPrompt) {
      onUsePrompt(dailyPrompt);
    }
  };

  if (loading && !dailyPrompt) {
    return (
      <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-amber-400 rounded-full animate-spin" />
          <span className="text-amber-300">Generating your daily prompt...</span>
        </div>
      </div>
    );
  }

  if (error && !dailyPrompt) {
    return (
      <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-700/30 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-900/30 rounded-xl flex items-center justify-center">
              <Lightbulb size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-300">Unable to load daily prompt</h3>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
          <button
            onClick={refreshPrompt}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-xl transition-all duration-200"
            title="Try again"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    );
  }

  if (!dailyPrompt) return null;

  return (
    <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Lightbulb size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-200">Today's Writing Prompt</h3>
              <p className="text-sm text-amber-300">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <p className="text-amber-100 leading-relaxed mb-4 text-lg">
            {dailyPrompt}
          </p>
          
          <button
            onClick={handleUsePrompt}
            className="bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-all duration-200 flex items-center space-x-2 shadow-sm"
          >
            <Edit3 size={16} />
            <span>Write about this</span>
          </button>
        </div>
        
        <button
          onClick={refreshPrompt}
          disabled={loading}
          className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded-xl transition-all duration-200 ml-4"
          title="Generate new prompt"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};