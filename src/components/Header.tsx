import React from 'react';
import { Plus, LogOut, Search, Filter, Brain, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type View = 'journal' | 'calendar';

interface HeaderProps {
  onNewEntry: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onViewChange: (view: View) => void;
  currentView: View;
}

export const Header: React.FC<HeaderProps> = ({
  onNewEntry,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavorites,
  onViewChange,
  currentView,
}) => {
  const { signOut, user } = useAuth();

  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <img 
                src="/writing-png-6.png" 
                alt="Dear Diary Logo" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(70%) sepia(100%) saturate(2000%) hue-rotate(180deg) brightness(1.2) contrast(1.1)'
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Tangerine, cursive' }}>Dear Diary</h1>
              <p className="text-sm text-slate-400">Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-700 rounded-xl p-1">
              <button
                onClick={() => onViewChange('journal')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  currentView === 'journal'
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen size={16} />
                <span>Entries</span>
              </button>
              <button
                onClick={() => onViewChange('calendar')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  currentView === 'calendar'
                    ? 'bg-slate-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Brain size={16} />
                <span>Emotions</span>
              </button>
            </div>

            <button
              onClick={onNewEntry}
              className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden md:inline">New Entry</span>
            </button>
            
            <button
              onClick={signOut}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-700 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search your entries..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
            />
          </div>
          
          <button
            onClick={onToggleFavorites}
            className={`p-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
              showFavoritesOnly 
                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
            title={showFavoritesOnly ? 'Show all entries' : 'Show favorites only'}
          >
            <Filter size={18} />
            {showFavoritesOnly && (
              <span className="text-sm font-medium hidden sm:inline">Favorites</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};