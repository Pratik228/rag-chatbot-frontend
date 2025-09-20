import React from "react";
import ChatInterface from "./components/ChatInterface";
import SessionControls from "./components/SessionControls";
import { useNewsChat } from "./hooks/useNewsChat";

function App() {
  const { messages, isLoading, error, sendMessage, resetSession, clearError } =
    useNewsChat();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header with session controls */}
      <SessionControls
        onReset={resetSession}
        isLoading={isLoading}
        messageCount={messages.length}
      />

      {/* Error banner */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main chat interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <p className="text-xs text-gray-500 text-center">
          RAG News Chatbot - Ask me about recent news and current events
        </p>
      </div>
    </div>
  );
}

export default App;
