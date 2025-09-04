import React, { useState } from 'react';
import { Lightbulb, RefreshCw, X, Edit3 } from 'lucide-react';
import { usePrompts } from '../hooks/usePrompts';

interface PromptCardProps {
  onUsePrompt: (prompt: string) => void;
  onClose: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ onUsePrompt, onClose }) => {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const { generatePrompt, loading } = usePrompts();

  const handleGeneratePrompt = async () => {
    const prompt = await generatePrompt();
    if (prompt) {
      setCurrentPrompt(prompt);
    }
  };

  const handleUsePrompt = () => {
    if (currentPrompt) {
      onUsePrompt(currentPrompt);
      onClose();
    }
  };

  React.useEffect(() => {
    handleGeneratePrompt();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-xl border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Lightbulb size={20} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Writing Prompt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-xl transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
              <span className="ml-3 text-slate-300">Generating your prompt...</span>
            </div>
          ) : currentPrompt ? (
            <div className="space-y-6">
              <div className="bg-slate-700 rounded-xl p-4">
                <p className="text-slate-200 leading-relaxed">{currentPrompt}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleUsePrompt}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Edit3 size={18} />
                  <span>Use This Prompt</span>
                </button>
                
                <button
                  onClick={handleGeneratePrompt}
                  disabled={loading}
                  className="p-3 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-xl transition-all duration-200"
                  title="Generate new prompt"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-300 mb-4">Unable to generate a prompt right now.</p>
              <button
                onClick={handleGeneratePrompt}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};