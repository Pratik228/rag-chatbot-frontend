import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get backend URL from environment variable
    const backendUrl = import.meta.env.VITE_API_BASE_URL;

    // Initialize socket connection
    socketRef.current = io(backendUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socketRef.current.on("connect", () => {
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", (reason) => {
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join a session room
  const joinSession = (sessionId) => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit("join-session", sessionId);
    }
  };

  // Leave a session room
  const leaveSession = (sessionId) => {
    if (socketRef.current && sessionId) {
      socketRef.current.emit("leave-session", sessionId);
    }
  };

  // Send a message with streaming response
  const sendMessage = (
    sessionId,
    message,
    onStreamChunk,
    onStreamComplete,
    onError
  ) => {
    if (!socketRef.current) {
      onError?.("Socket not connected");
      return;
    }

    // Listen for streaming chunks
    const handleStreamChunk = (data) => {
      onStreamChunk?.(data);
    };

    const handleStreamComplete = (data) => {
      onStreamComplete?.(data);
      // Clean up listeners
      socketRef.current.off("stream-chunk", handleStreamChunk);
      socketRef.current.off("stream-complete", handleStreamComplete);
      socketRef.current.off("stream-error", handleStreamError);
    };

    const handleStreamError = (error) => {
      onError?.(error);
      // Clean up listeners
      socketRef.current.off("stream-chunk", handleStreamChunk);
      socketRef.current.off("stream-complete", handleStreamComplete);
      socketRef.current.off("stream-error", handleStreamError);
    };

    // Set up listeners
    socketRef.current.on("stream-chunk", handleStreamChunk);
    socketRef.current.on("stream-complete", handleStreamComplete);
    socketRef.current.on("stream-error", handleStreamError);

    // Send the message
    socketRef.current.emit("send-message", {
      sessionId,
      message,
    });
  };

  // Create a new session
  const createSession = (title, onSuccess, onError) => {
    if (!socketRef.current) {
      onError?.("Socket not connected");
      return;
    }

    const handleSessionCreated = (data) => {
      // Transform backend response to match frontend expectations
      const session = {
        id: data.sessionId,
        title: data.title || "New Chat",
        createdAt: data.timestamp || new Date().toISOString(),
        lastActivity: data.timestamp || new Date().toISOString(),
        messageCount: 0,
      };
      onSuccess?.({ session });
      socketRef.current.off("session-created", handleSessionCreated);
      socketRef.current.off("session-error", handleSessionError);
    };

    const handleSessionError = (error) => {
      onError?.(error);
      socketRef.current.off("session-created", handleSessionCreated);
      socketRef.current.off("session-error", handleSessionError);
    };

    socketRef.current.on("session-created", handleSessionCreated);
    socketRef.current.on("session-error", handleSessionError);

    socketRef.current.emit("create-session", { title });
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinSession,
    leaveSession,
    sendMessage,
    createSession,
  };
};
