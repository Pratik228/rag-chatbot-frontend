import React from "react";
import { Newspaper, Sparkles } from "lucide-react";

const SessionControls = ({ messageCount = 0 }) => {
  return (
    <div className="header-content">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="header-icon-container">
            <Newspaper className="w-5 h-5" />
            <Sparkles className="w-3 h-3 header-sparkle" />
          </div>
          <h1 className="header-title">News Chatbot</h1>
        </div>
      </div>
    </div>
  );
};

export default SessionControls;
