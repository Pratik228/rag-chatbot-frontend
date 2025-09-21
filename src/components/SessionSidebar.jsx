import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";

const SessionSidebar = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onUpdateSessionTitle,
  isOpen,
  onToggle,
  isLoading = false,
}) => {
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const handleEditStart = (session) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title || "");
  };

  const handleEditSave = async () => {
    if (editTitle.trim()) {
      try {
        await onUpdateSessionTitle(editingSessionId, editTitle.trim());
        setEditingSessionId(null);
        setEditTitle("");
      } catch (error) {
        console.error("Error saving edit:", error);
        // Don't clear the edit state if there was an error
      }
    } else {
      setEditingSessionId(null);
      setEditTitle("");
    }
  };

  const handleEditCancel = () => {
    setEditingSessionId(null);
    setEditTitle("");
  };

  const handleMenuToggle = (sessionId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === sessionId ? null : sessionId);
  };

  const handleMenuAction = (action, session, e) => {
    e.stopPropagation();
    setOpenMenuId(null);

    if (action === "edit") {
      handleEditStart(session);
    } else if (action === "delete") {
      onDeleteSession(session.id);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className={`session-sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <button onClick={onNewSession} className="new-session-btn">
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="sessions-list">
        {isLoading ? (
          <div className="loading-sessions">
            <div className="loading-spinner"></div>
            <p>Loading sessions...</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${
                currentSessionId === session.id ? "active" : ""
              }`}
            >
              <div
                className="session-content"
                onClick={() => onSessionSelect(session.id)}
              >
                <MessageSquare className="w-4 h-4 session-icon" />

                {editingSessionId === session.id ? (
                  <div className="session-info">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="edit-title-input"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleEditSave();
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          handleEditCancel();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    <div className="session-meta">
                      Press Enter to save, Escape to cancel
                    </div>
                  </div>
                ) : (
                  <div className="session-info">
                    <div className="session-title">{session.title}</div>
                    <div className="session-meta">
                      {session.messageCount || 0} messages •{" "}
                      {formatDate(session.lastActivity || session.createdAt)}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="session-actions"
                onClick={(e) => e.stopPropagation()}
              >
                {editingSessionId === session.id ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handleEditSave();
                      }}
                      className="session-action-btn save"
                      title="Save changes"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCancel();
                      }}
                      className="session-action-btn cancel"
                      title="Cancel changes"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handleEditStart(session);
                      }}
                      className="session-action-btn"
                      title="Rename session"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        onDeleteSession(session.id);
                      }}
                      className="session-action-btn delete"
                      title="Delete session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}

        {sessions.length === 0 && !isLoading && (
          <div className="empty-sessions">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p>No chat sessions yet</p>
            <p className="text-sm opacity-60">
              Start a new conversation to begin
            </p>
          </div>
        )}
      </div>

      {/* Sidebar Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <div className={`toggle-icon ${isOpen ? "open" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
  );
};

export default SessionSidebar;
