import React from 'react';
import { AlertTriangle, Phone, MessageSquare, X, Heart } from 'lucide-react';

interface CrisisWarningProps {
  onClose: () => void;
  severity: 'low' | 'medium' | 'high';
  indicators: string[];
}

export const CrisisWarning: React.FC<CrisisWarningProps> = ({ onClose, severity, indicators }) => {
  const getSeverityStyles = () => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-900/90',
          border: 'border-red-500',
          icon: 'text-red-400',
          button: 'bg-red-600 hover:bg-red-700',
        };
      case 'medium':
        return {
          bg: 'bg-orange-900/90',
          border: 'border-orange-500',
          icon: 'text-orange-400',
          button: 'bg-orange-600 hover:bg-orange-700',
        };
      default:
        return {
          bg: 'bg-yellow-900/90',
          border: 'border-yellow-500',
          icon: 'text-yellow-400',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className={`${styles.bg} backdrop-blur-sm rounded-2xl w-full max-w-lg shadow-xl border ${styles.border}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center`}>
                <AlertTriangle size={24} className={styles.icon} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">We're Here for You</h3>
                <p className="text-slate-200 text-sm">Your safety and wellbeing matter</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
              <p className="text-slate-200 leading-relaxed">
                It sounds like you might be going through a really difficult time. Please know that you're not alone, and there are people who want to help.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <Heart size={18} className="text-red-400" />
                <span>Crisis Support Resources</span>
              </h4>
              
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center space-x-3 mb-2">
                    <Phone size={20} className="text-green-400" />
                    <div>
                      <p className="font-semibold text-white">Call 988</p>
                      <p className="text-sm text-slate-300">24/7 Suicide & Crisis Lifeline</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    Free, confidential support for people in distress and those around them.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center space-x-3 mb-2">
                    <MessageSquare size={20} className="text-blue-400" />
                    <div>
                      <p className="font-semibold text-white">Text 988</p>
                      <p className="text-sm text-slate-300">Crisis Text Line</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    Text-based crisis support available 24/7.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
              <p className="text-blue-200 text-sm leading-relaxed">
                <strong>Remember:</strong> Crisis feelings are temporary, even when they feel overwhelming. 
                Professional counselors are trained to help you work through these difficult moments.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="tel:988"
                className={`flex-1 ${styles.button} text-white py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium`}
              >
                <Phone size={18} />
                <span>Call 988 Now</span>
              </a>
              <a
                href="sms:988"
                className="flex-1 bg-slate-700 text-slate-200 py-3 px-4 rounded-xl hover:bg-slate-600 transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
              >
                <MessageSquare size={18} />
                <span>Text 988</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full text-slate-400 hover:text-slate-200 py-2 text-sm transition-colors"
            >
              Close this message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};