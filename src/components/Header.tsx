import React from 'react';
import { Plus, LogOut, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNewEntry: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewEntry,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavorites,
}) => {
  const { signOut, user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">J</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Journal</h1>
              <p className="text-sm text-slate-500">Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNewEntry}
              className="bg-slate-900 text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-all duration-200 flex items-center space-x-2 shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden md:inline">New Entry</span>
            </button>
            
            <button
              onClick={signOut}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search your entries..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <button
            onClick={onToggleFavorites}
            className={`p-2 rounded-xl transition-all duration-200 flex items-center space-x-2 ${
              showFavoritesOnly 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
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