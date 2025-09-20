import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Chat API functions
export const chatAPI = {
  // Send a message to the chat endpoint
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await api.post("/chat", {
        message,
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Reset chat session
  resetSession: async () => {
    try {
      const response = await api.post("/reset");
      return response.data;
    } catch (error) {
      console.error("Error resetting session:", error);
      throw error;
    }
  },

  // Get chat history (if backend supports it)
  getChatHistory: async (sessionId) => {
    try {
      const response = await api.get(`/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting chat history:", error);
      throw error;
    }
  },
};

export default api;
