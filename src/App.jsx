import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import ChatInterface from "./components/ChatInterface";
import SessionControls from "./components/SessionControls";
import SessionSidebar from "./components/SessionSidebar";
import { useEnhancedNewsChat } from "./hooks/useEnhancedNewsChat";

function ChatPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    // Session management
    sessions,
    currentSessionId,
    createNewSession,
    selectSession,
    deleteSession,
    updateSessionTitle,

    // Chat functionality
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    resetSession,
    clearError,

    // Socket status
    isConnected,
  } = useEnhancedNewsChat();

  // Handle URL parameter changes
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      // URL changed, load the session from URL
      selectSession(sessionId);
    } else if (currentSessionId && currentSessionId !== sessionId) {
      // Session changed programmatically, update URL
      navigate(`/chat/${currentSessionId}`, { replace: true });
    }
  }, [sessionId, currentSessionId, navigate, selectSession]);

  // Handle session selection with URL update
  const handleSessionSelect = (newSessionId) => {
    if (newSessionId !== currentSessionId) {
      navigate(`/chat/${newSessionId}`);
      // selectSession will be called by the useEffect above
    }
  };

  // Handle new session creation with URL update
  const handleNewSession = async () => {
    const newSession = await createNewSession();
    if (newSession?.id) {
      navigate(`/chat/${newSession.id}`);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="chat-container min-h-screen flex flex-col">
      {/* Session Sidebar */}
      <SessionSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        onDeleteSession={deleteSession}
        onUpdateSessionTitle={updateSessionTitle}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Header */}
      <div className="chat-header">
        <SessionControls
          messageCount={messages.length}
          isConnected={isConnected}
          currentSessionTitle={
            sessions.find((s) => s.id === currentSessionId)?.title
          }
        />
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
          isStreaming={isStreaming}
          onSendMessage={sendMessage}
          sidebarOpen={sidebarOpen}
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/chat/:sessionId" element={<ChatPage />} />
    </Routes>
  );
}

export default App;
