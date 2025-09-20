import React from "react";
import { RotateCcw, Trash2 } from "lucide-react";

const SessionControls = ({ onReset, isLoading, messageCount = 0 }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-gray-900">News Chatbot</h1>
        {messageCount > 0 && (
          <span className="text-sm text-gray-500">
            ({messageCount} messages)
          </span>
        )}
      </div>

      <button
        onClick={onReset}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Reset conversation"
      >
        {isLoading ? (
          <RotateCcw className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
        Reset
      </button>
    </div>
  );
};

export default SessionControls;
