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
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
          <span className="text-amber-700">Generating your daily prompt...</span>
        </div>
      </div>
    );
  }

  if (error && !dailyPrompt) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Lightbulb size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Unable to load daily prompt</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={refreshPrompt}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-xl transition-all duration-200"
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
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Lightbulb size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Today's Writing Prompt</h3>
              <p className="text-sm text-amber-700">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <p className="text-amber-800 leading-relaxed mb-4 text-lg">
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
          className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-xl transition-all duration-200 ml-4"
          title="Generate new prompt"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};