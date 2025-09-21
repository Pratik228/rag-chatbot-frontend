import { useState, useCallback, useEffect } from "react";
import { useSocket } from "./useSocket";
import { chatAPI } from "../services/api";

export const useEnhancedNewsChat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [error, setError] = useState(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const {
    socket,
    isConnected,
    joinSession,
    leaveSession,
    sendMessage: socketSendMessage,
    createSession: socketCreateSession,
  } = useSocket();

  // Load sessions on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoadingSessions(true);

        // Load sessions and restore session in parallel for better performance
        const [sessionsData] = await Promise.allSettled([
          loadSessions(),
          // Restore last session from localStorage
          (async () => {
            const savedSessionId = localStorage.getItem("currentSessionId");
            if (savedSessionId) {
              setCurrentSessionId(savedSessionId);
              // Don't load messages immediately - let the URL routing handle it
            }
          })(),
        ]);
      } catch (err) {
        console.error("Error initializing app:", err);
        setError("Failed to initialize application");
      } finally {
        setIsLoadingSessions(false);
      }
    };

    initializeApp();
  }, []);

  // Listen for Socket.IO session updates
  useEffect(() => {
    if (socket) {
      const handleSessionUpdate = (data) => {
        if (data.session) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.session.id ? { ...s, ...data.session } : s
            )
          );
        }
      };

      const handleSessionTitleUpdate = (data) => {
        if (data.sessionId && data.title) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === data.sessionId ? { ...s, title: data.title } : s
            )
          );
        }
      };

      socket.on("session-updated", handleSessionUpdate);
      socket.on("session-title-updated", handleSessionTitleUpdate);

      return () => {
        socket.off("session-updated", handleSessionUpdate);
        socket.off("session-title-updated", handleSessionTitleUpdate);
      };
    }
  }, [socket]);

  // Join/leave session rooms when current session changes
  useEffect(() => {
    if (currentSessionId && isConnected) {
      joinSession(currentSessionId);

      return () => {
        leaveSession(currentSessionId);
      };
    }
  }, [currentSessionId, isConnected, joinSession, leaveSession]);

  // Save current session to localStorage
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem("currentSessionId", currentSessionId);
    }
  }, [currentSessionId]);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/sessions`
      );

      if (!response.ok) {
        console.warn(`Failed to load sessions: ${response.status}`);
        setSessions([]);
        return;
      }

      const data = await response.json();
      const newSessions = data.sessions || [];
      setSessions(newSessions);
    } catch (err) {
      // Set empty sessions array if backend is not available
      setSessions([]);
    }
  }, []);

  // Load messages for a specific session
  const loadSessionMessages = useCallback(async (sessionId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/chat/sessions/${sessionId}/history`
      );

      if (!response.ok) {
        console.warn(`Failed to load session ${sessionId}: ${response.status}`);
        setMessages([]);
        return;
      }

      const data = await response.json();

      // Check multiple possible data structures from backend
      let messages = [];

      if (data.history && Array.isArray(data.history)) {
        // Backend returns { history: [...] }
        messages = data.history;
      } else if (data.messages && Array.isArray(data.messages)) {
        // If messages are at root level
        messages = data.messages;
      } else if (data.session && Array.isArray(data.session)) {
        // If session is an array of messages
        messages = data.session;
      } else if (
        data.session &&
        data.session.messages &&
        Array.isArray(data.session.messages)
      ) {
        // If session has a messages property
        messages = data.session.messages;
      } else if (Array.isArray(data)) {
        // If data itself is an array of messages
        messages = data;
      }

      if (messages.length > 0) {
        const formattedMessages = messages.map((msg) => ({
          id: msg.id || Date.now() + Math.random(),
          role: msg.type || msg.role, // Backend uses 'type', frontend expects 'role'
          content: msg.content,
          sources: msg.sources || [],
          timestamp: new Date(msg.timestamp),
          isError: msg.isError || false,
        }));
        setMessages(formattedMessages);
      } else {
        // Session exists but no messages yet

        // If session has messageCount > 0, try to get messages from history endpoint
        if (data.session && data.session.messageCount > 0) {
          try {
            const historyResponse = await fetch(
              `${
                import.meta.env.VITE_API_BASE_URL
              }/api/chat/history/${sessionId}`
            );
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();

              let historyMessages = [];
              if (Array.isArray(historyData)) {
                historyMessages = historyData;
              } else if (
                historyData.messages &&
                Array.isArray(historyData.messages)
              ) {
                historyMessages = historyData.messages;
              }

              if (historyMessages.length > 0) {
                const formattedMessages = historyMessages.map((msg) => ({
                  id: msg.id || Date.now() + Math.random(),
                  role: msg.type || msg.role, // Backend uses 'type', frontend expects 'role'
                  content: msg.content,
                  sources: msg.sources || [],
                  timestamp: new Date(msg.timestamp),
                  isError: msg.isError || false,
                }));
                setMessages(formattedMessages);
                return; // Exit early since we found messages
              }
            }
          } catch (historyErr) {
            console.log("History endpoint failed:", historyErr);
          }
        }

        setMessages([]);
      }
    } catch (err) {
      console.error("Error loading session messages:", err);
      setMessages([]);
    }
  }, []);

  // Create a new session
  const createNewSession = useCallback(
    async (title = null) => {
      try {
        if (isConnected) {
          // Use Socket.IO for real-time session creation
          return new Promise((resolve, reject) => {
            socketCreateSession(
              title,
              (data) => {
                const newSession = data.session;
                setSessions((prev) => [newSession, ...prev]);
                setCurrentSessionId(newSession.id);
                setMessages([]);
                setError(null);
                resolve(newSession);
              },
              (error) => {
                console.error("Error creating session via socket:", error);
                setError("Failed to create new session");
                reject(error);
              }
            );
          });
        } else {
          // Fallback to HTTP API
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/chat/sessions`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Transform backend response to match frontend expectations
          const newSession = {
            id: data.sessionId,
            title: data.title || "New Chat",
            createdAt: data.timestamp || new Date().toISOString(),
            lastActivity: data.timestamp || new Date().toISOString(),
            messageCount: 0,
          };

          setSessions((prev) => [newSession, ...prev]);
          setCurrentSessionId(newSession.id);
          setMessages([]);
          setError(null);

          // Refresh sessions after a delay to get any auto-generated title
          setTimeout(() => {
            loadSessions();
          }, 500);

          return newSession;
        }
      } catch (err) {
        console.error("Error creating session:", err);
        setError("Failed to create new session");
        throw err;
      }
    },
    [isConnected, socketCreateSession]
  );

  // Select a session
  const selectSession = useCallback(
    async (sessionId) => {
      if (sessionId === currentSessionId) return;
      setCurrentSessionId(sessionId);
      setMessages([]);
      setError(null);

      try {
        await loadSessionMessages(sessionId);
      } catch (err) {
        console.error("Failed to load session messages:", err);
        setError("Failed to load session messages");
      }
    },
    [currentSessionId, loadSessionMessages]
  );

  // Delete a session
  const deleteSession = useCallback(
    async (sessionId) => {
      try {
        if (isConnected && socket) {
          // Use Socket.IO for real-time deletion
          return new Promise((resolve, reject) => {
            const handleSessionDeleted = (data) => {
              if (data.sessionId === sessionId) {
                setSessions((prev) => prev.filter((s) => s.id !== sessionId));

                // If deleting current session, clear current session and navigate to home
                if (sessionId === currentSessionId) {
                  setCurrentSessionId(null);
                  setMessages([]);
                  localStorage.removeItem("currentSessionId");
                }

                socket.off("session-deleted", handleSessionDeleted);
                socket.off("session-error", handleSessionError);
                resolve();
              }
            };

            const handleSessionError = (error) => {
              console.error("Socket.IO delete error:", error);
              setError("Failed to delete session");
              socket.off("session-deleted", handleSessionDeleted);
              socket.off("session-error", handleSessionError);
              reject(error);
            };

            socket.on("session-deleted", handleSessionDeleted);
            socket.on("session-error", handleSessionError);
            socket.emit("delete-session", { sessionId });
          });
        } else {
          // Fallback to HTTP API with correct parameter
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/api/chat/sessions/${sessionId}?deleteSession=true`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          setSessions((prev) => prev.filter((s) => s.id !== sessionId));

          // If deleting current session, clear current session and navigate to home
          if (sessionId === currentSessionId) {
            setCurrentSessionId(null);
            setMessages([]);
            localStorage.removeItem("currentSessionId");
          }
        }
      } catch (err) {
        console.error("Error deleting session:", err);
        setError("Failed to delete session");
      }
    },
    [currentSessionId, createNewSession, isConnected, socket]
  );

  // Update session title
  const updateSessionTitle = useCallback(
    async (sessionId, newTitle) => {
      try {
        if (isConnected && socket) {
          // Use Socket.IO for real-time title update
          return new Promise((resolve, reject) => {
            let resolved = false;

            // Set a timeout to prevent getting stuck
            const timeout = setTimeout(() => {
              if (!resolved) {
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === sessionId ? { ...s, title: newTitle } : s
                  )
                );
                cleanup();
                resolve({ sessionId, title: newTitle });
              }
            }, 3000); // 3 second timeout

            const cleanup = () => {
              socket.off("session-title-updated", handleTitleUpdated);
              socket.off("session-updated", handleSessionUpdated);
              socket.off("session-error", handleTitleError);
              clearTimeout(timeout);
            };

            const handleTitleUpdated = (data) => {
              if (!resolved && data.sessionId === sessionId) {
                resolved = true;

                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === sessionId ? { ...s, title: newTitle } : s
                  )
                );
                cleanup();
                resolve(data);
              }
            };

            const handleSessionUpdated = (data) => {
              if (!resolved && data.session && data.session.id === sessionId) {
                resolved = true;

                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === sessionId
                      ? { ...s, title: data.session.title || newTitle }
                      : s
                  )
                );
                cleanup();
                resolve(data);
              }
            };

            const handleTitleError = (error) => {
              console.error("Socket.IO title update error:", error);
              if (!resolved) {
                resolved = true;
                setError("Failed to update session title");
                cleanup();
                reject(error);
              }
            };

            // Listen for multiple possible response events
            socket.on("session-title-updated", handleTitleUpdated);
            socket.on("session-updated", handleSessionUpdated);
            socket.on("session-error", handleTitleError);

            socket.emit("update-session-title", { sessionId, title: newTitle });
          });
        } else {
          // Fallback to HTTP API
          const url = `${
            import.meta.env.VITE_API_BASE_URL
          }/api/chat/sessions/${sessionId}`;

          const response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("HTTP error response:", errorText);
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${errorText}`
            );
          }

          const responseData = await response.json();

          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId ? { ...s, title: newTitle } : s
            )
          );

          return responseData;
        }
      } catch (err) {
        console.error("Error updating session title:", err);
        setError("Failed to update session title");
        throw err; // Re-throw so the UI can handle the error
      }
    },
    [isConnected, socket]
  );

  // Send a message
  const sendMessage = useCallback(
    async (message) => {
      if (!message.trim()) return;
      if (!currentSessionId) {
        await createNewSession();
        return;
      }

      // Add user message immediately
      const userMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      setStreamingContent("");
      setIsStreaming(true);

      // Add placeholder for AI response
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        sources: [],
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, aiMessage]);

      try {
        if (isConnected) {
          // Use Socket.IO for real-time streaming
          socketSendMessage(
            currentSessionId,
            message,
            // On stream chunk
            (data) => {
              if (data.chunk) {
                setStreamingContent((prev) => prev + data.chunk);
                // Update the AI message with streaming content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: streamingContent + data.chunk }
                      : msg
                  )
                );
              }
            },
            // On stream complete
            (data) => {
              setIsStreaming(false);
              setIsLoading(false);
              setStreamingContent("");

              // Update final message with complete response and sources
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        content: data.response,
                        sources: data.sources || [],
                        isStreaming: false,
                      }
                    : msg
                )
              );

              // Update session in the list with any auto-generated title
              setSessions((prev) =>
                prev.map((s) =>
                  s.id === currentSessionId
                    ? {
                        ...s,
                        lastActivity: new Date().toISOString(),
                        messageCount: (s.messageCount || 0) + 2,
                        title:
                          s.title === "New Chat" && data.autoTitle
                            ? data.autoTitle
                            : s.title,
                      }
                    : s
                )
              );

              // Refresh sessions from backend to get the auto-generated title
              setTimeout(() => {
                loadSessions();
              }, 1000); // Small delay to ensure backend has processed the title
            },
            // On error
            (error) => {
              setIsStreaming(false);
              setIsLoading(false);
              setStreamingContent("");
              setError("Failed to send message");

              // Update message to show error
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        content:
                          "Sorry, I encountered an error. Please try again.",
                        isError: true,
                        isStreaming: false,
                      }
                    : msg
                )
              );
            }
          );
        } else {
          // Fallback to HTTP API (no streaming)
          const response = await chatAPI.sendMessage(message, currentSessionId);

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: response.response || response.message,
                    sources: response.sources || [],
                    isStreaming: false,
                  }
                : msg
            )
          );

          // Update session message count and refresh sessions to get auto-generated title
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    lastActivity: new Date().toISOString(),
                    messageCount: (s.messageCount || 0) + 2,
                  }
                : s
            )
          );

          // Refresh sessions from backend to get the auto-generated title
          setTimeout(() => {
            loadSessions();
          }, 1000); // Small delay to ensure backend has processed the title
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message. Please try again.");

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: "Sorry, I encountered an error. Please try again.",
                  isError: true,
                  isStreaming: false,
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [
      currentSessionId,
      isConnected,
      socketSendMessage,
      createNewSession,
      streamingContent,
    ]
  );

  // Reset/clear current session
  const resetSession = useCallback(async () => {
    await createNewSession();
  }, [createNewSession]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
    isLoadingSessions,
    error,
    sendMessage,
    resetSession,
    clearError,

    // Socket status
    isConnected,

    // Utility
    loadSessions,
  };
};
