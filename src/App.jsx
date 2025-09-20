import React from "react";
import ChatInterface from "./components/ChatInterface";
import SessionControls from "./components/SessionControls";
import { useNewsChat } from "./hooks/useNewsChat";

function App() {
  const { messages, isLoading, error, sendMessage, resetSession, clearError } =
    useNewsChat();

  return (
    <div className="chat-container min-h-screen flex flex-col">
      {/* Header */}
      <div className="chat-header">
        <SessionControls messageCount={messages.length} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
        />
      </div>

      {/* Footer */}
      <div className="chat-footer">
        <p className="footer-text">
          RAG News Chatbot • Powered by AI and real-time news data
        </p>
      </div>
    </div>
  );
}

export default App;
