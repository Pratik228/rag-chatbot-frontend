import { useState, useCallback } from "react";
import { chatAPI } from "../services/api";

export const useNewsChat = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  // Send a message to the chat
  const sendMessage = useCallback(
    async (message) => {
      if (!message.trim()) return;

      // Add user message to the chat
      const userMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        // Call the backend API
        const response = await chatAPI.sendMessage(message, sessionId);

        // Update session ID if provided
        if (response.session_id && response.session_id !== sessionId) {
          setSessionId(response.session_id);
        }

        // Add assistant response to the chat
        const assistantMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: response.response || response.message,
          sources: response.sources || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message. Please try again.");

        // Add error message to chat
        const errorMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          isError: true,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  // Reset the chat session
  const resetSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await chatAPI.resetSession();
      setMessages([]);
      setSessionId(null);
    } catch (err) {
      console.error("Error resetting session:", err);
      setError("Failed to reset session.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    sessionId,
    error,
    sendMessage,
    resetSession,
    clearError,
  };
};
