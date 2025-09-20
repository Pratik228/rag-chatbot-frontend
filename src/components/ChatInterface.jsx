import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import NewsSourceCard from "./NewsSourceCard";

const ChatInterface = ({
  messages,
  isLoading,
  isStreaming,
  onSendMessage,
  sidebarOpen,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area with proper spacing for fixed header/footer */}
      <div className="flex-1 overflow-y-auto messages-container chat-main-content">
        {messages.length === 0 ? (
          <div className="welcome-container">
            <h1 className="welcome-title">Welcome to News Chatbot</h1>
            <p className="welcome-subtitle">
              Ask me anything about recent news and current events. I'll search
              through the latest articles to give you informed answers.
            </p>
            <div className="suggestion-buttons">
              {[
                "What's the latest in AI technology?",
                "Tell me about recent political developments",
                "Any updates on climate change?",
                "What's happening in the tech industry?",
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-button"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="message-container">
            {messages.map((message) => (
              <div key={message.id} className={`message-row ${message.role}`}>
                {/* Avatar */}
                <div
                  className={`avatar ${
                    message.role === "user" ? "avatar-user" : "avatar-assistant"
                  }`}
                >
                  {message.role === "user" ? "U" : "AI"}
                </div>

                {/* Message Content */}
                <div className="flex-1">
                  <div
                    className={`${
                      message.role === "user"
                        ? "message-bubble-user"
                        : message.isError
                        ? "message-bubble-error"
                        : "message-bubble-assistant"
                    }`}
                  >
                    <div className="markdown-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    {/* Show sources for assistant messages */}
                    {message.role === "assistant" &&
                      message.sources &&
                      message.sources.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="text-sm font-medium text-gray-300 mb-3">
                            Sources ({message.sources.length})
                          </div>
                          {message.sources.map((source, index) => (
                            <NewsSourceCard key={index} source={source} />
                          ))}
                        </div>
                      )}

                    <div className="text-xs opacity-60 mt-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {(isLoading || isStreaming) && (
              <div className="message-row assistant">
                <div className="avatar avatar-assistant">AI</div>
                <div className="flex-1">
                  <div className="message-bubble-assistant flex items-center gap-3">
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                    <span className="text-gray-400">
                      {isStreaming
                        ? "Streaming response..."
                        : "Searching news articles..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area */}
      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <form onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message News Chatbot..."
              className="chat-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
