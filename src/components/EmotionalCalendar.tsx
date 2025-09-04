import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, Heart, Brain, RotateCcw, Trash2 } from 'lucide-react';
import { useEmotionalAnalysis, EmotionalAnalysis } from '../hooks/useEmotionalAnalysis';
import { LoadingSpinner } from './LoadingSpinner';

export const EmotionalCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [analyses, setAnalyses] = useState<EmotionalAnalysis[]>([]);
  const [selectedDay, setSelectedDay] = useState<EmotionalAnalysis | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { analyzeEmotions, clearCache, loading, error } = useEmotionalAnalysis();

  const getEmotionalColor = (score: number): string => {
    // Dark blue (sad) to light blue (happy) gradient
    const intensity = Math.max(0, Math.min(1, (score - 1) / 9));
    const hue = 210; // Blue hue
    const saturation = 70;
    const lightness = 20 + (intensity * 50); // 20% to 70% lightness
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const loadEmotionalData = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    
    const results = await analyzeEmotions(startDate, endDate);
    setAnalyses(results);
  };

  useEffect(() => {
    loadEmotionalData();
  }, [currentDate]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const analysis = analyses.find(a => a.date === dateStr);
      days.push({ day, analysis });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDay(null);
  };

  const handleClearCache = async () => {
    const success = await clearCache();
    if (success) {
      setAnalyses([]);
      setSelectedDay(null);
      setShowClearConfirm(false);
      // Force reload data after clearing cache
      setTimeout(async () => {
        await loadEmotionalData();
      }, 100);
    }
  };

  const handleClearConfirm = () => {
    setShowClearConfirm(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth();
  const averageScore = analyses.length > 0 
    ? analyses.reduce((sum, a) => sum + a.emotional_score, 0) / analyses.length 
    : 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-slate-800 rounded-2xl w-full overflow-hidden shadow-xl border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Brain size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Emotional Journey</h2>
                <p className="text-blue-100 text-sm">Track your emotional patterns over time</p>
              </div>
            </div>
            
            <button
              onClick={handleClearConfirm}
              className="p-2 text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
              title="Clear analysis cache"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h3 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Stats */}
          {analyses.length > 0 && (
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>Average: {averageScore.toFixed(1)}/10</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>{analyses.length} days analyzed</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex">
          {/* Calendar */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-slate-300">Analyzing emotions...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadEmotionalData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((dayData, index) => (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                        dayData
                          ? dayData.analysis
                            ? 'hover:scale-105 shadow-sm border-2 border-transparent hover:border-blue-300'
                            : 'text-slate-500 hover:bg-slate-700'
                          : ''
                      }`}
                      style={{
                        backgroundColor: dayData?.analysis 
                          ? getEmotionalColor(dayData.analysis.emotional_score)
                          : 'transparent',
                        color: dayData?.analysis 
                          ? dayData.analysis.emotional_score > 5 ? '#1e293b' : '#ffffff'
                          : undefined
                      }}
                      onClick={() => dayData?.analysis && setSelectedDay(dayData.analysis)}
                    >
                      {dayData?.day}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex items-center justify-center space-x-4">
                  <span className="text-sm text-slate-300">Emotional Scale:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getEmotionalColor(1) }}></div>
                    <span className="text-xs text-slate-400">Sad</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getEmotionalColor(5) }}></div>
                    <span className="text-xs text-slate-400">Neutral</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getEmotionalColor(10) }}></div>
                    <span className="text-xs text-slate-400">Happy</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          {selectedDay && (
            <div className="w-80 bg-slate-700 p-6 border-l border-slate-600">
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">
                  {new Date(selectedDay.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h4>
                <div className="flex items-center space-x-2 mb-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: getEmotionalColor(selectedDay.emotional_score) }}
                  ></div>
                  <span className="font-medium">
                    {selectedDay.emotional_score}/10
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-200 mb-2">Dominant Emotions</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedDay.dominant_emotions.map((emotion, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm capitalize border border-blue-700/30"
                      >
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-200 mb-2">Summary</h5>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedDay.summary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clear Cache Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-xl border border-slate-700">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Trash2 size={20} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Clear Analysis Cache</h3>
              </div>
              
              <p className="text-slate-300 mb-6">
                This will delete all cached emotional analysis data and regenerate it from your journal entries. This action cannot be undone.
              </p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClearCache}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-all duration-200"
                >
                  Clear Cache
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-slate-700 text-slate-200 py-3 px-4 rounded-xl hover:bg-slate-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};