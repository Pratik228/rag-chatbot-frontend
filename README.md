# RAG News Chatbot Frontend

A modern React frontend for the RAG News Chatbot, built with Vite, Tailwind CSS, and Socket.IO for real-time communication.

## Features

- 🎯 **Modern Chat Interface** - Clean, ChatGPT-like design with streaming responses
- 📱 **Responsive Design** - Works on desktop and mobile with collapsible sidebar
- 🔗 **News Source Integration** - Displays article sources with clickable links
- 🔄 **Advanced Session Management** - Create, rename, delete, and switch between chat sessions
- ⚡ **Real-time Updates** - Socket.IO integration for live updates and streaming
- 🎨 **Beautiful UI** - Tailwind CSS styling with custom scrollbars and animations
- 💾 **Session Persistence** - Automatic session saving and restoration
- 🔍 **Session History** - View and manage multiple conversation sessions

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Your RAG backend running on `http://localhost:3000`

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3001`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.jsx      # Main chat UI component with streaming
│   ├── NewsSourceCard.jsx     # News article source display
│   ├── SessionControls.jsx    # Header with session info
│   └── SessionSidebar.jsx     # Sidebar with session management
├── hooks/
│   ├── useNewsChat.js         # Basic chat state management
│   ├── useEnhancedNewsChat.js # Advanced session management hook
│   └── useSocket.js           # Socket.IO connection management
├── services/
│   └── api.js                 # Backend API integration
├── App.jsx                    # Main app component with routing
├── main.jsx                   # React entry point
└── index.css                  # Global styles with Tailwind
```

## API Integration

The frontend connects to your RAG backend at `http://localhost:3000/api` with the following endpoints:

### REST API Endpoints

- `POST /api/chat` - Send messages and get responses
- `POST /api/chat/sessions` - Create new chat session
- `GET /api/chat/sessions` - Get all chat sessions
- `GET /api/chat/sessions/:sessionId/history` - Get session message history
- `PUT /api/chat/sessions/:sessionId` - Update session title
- `DELETE /api/chat/sessions/:sessionId?deleteSession=true` - Delete session

### Socket.IO Events

- `create-session` - Create new session
- `update-session-title` - Update session title
- `delete-session` - Delete session
- `send-message` - Send chat message
- `join-session` - Join session room
- `leave-session` - Leave session room

### Socket.IO Response Events

- `session-created` - Session creation confirmation
- `session-title-updated` - Title update confirmation
- `session-updated` - Session update confirmation
- `session-deleted` - Session deletion confirmation
- `message-response` - Chat message response
- `session-error` - Error responses

## Configuration

- **Backend URL**: Configure in `src/services/api.js`
- **Development Port**: Set in `vite.config.js` (default: 3001)
- **Proxy Settings**: API calls are proxied to backend in development

## Features in Detail

### Chat Interface

- **Streaming Responses** - Real-time message streaming with Socket.IO
- **Auto-scrolling** - Automatic scroll to latest messages
- **Message Bubbles** - User and assistant message styling
- **Loading States** - Typing indicators and loading animations
- **Error Handling** - User-friendly error messages with retry options
- **Message Sources** - Display news article sources with relevance scores

### Session Management

- **Session Sidebar** - Collapsible sidebar with session list
- **Create Sessions** - "New Chat" button to start fresh conversations
- **Rename Sessions** - Click edit icon to rename sessions inline
- **Delete Sessions** - Remove sessions with confirmation
- **Session Switching** - Click any session to switch conversations
- **Auto-save** - Sessions automatically saved to localStorage
- **URL Routing** - Each session has its own URL (`/chat/:sessionId`)
- **Session Persistence** - Restore last active session on page reload

### News Sources

- **Source Cards** - Clickable cards with article information
- **Relevance Scores** - Display percentage relevance for each source
- **External Links** - Direct links to original articles
- **Publication Info** - Show publication date and source name
- **Responsive Layout** - Cards adapt to different screen sizes

### Real-time Features

- **Socket.IO Integration** - Real-time communication with backend
- **Live Updates** - Instant session updates across all clients
- **Connection Status** - Visual indicator of connection state
- **Fallback Support** - HTTP API fallback when Socket.IO unavailable
- **Optimistic Updates** - UI updates immediately with backend confirmation

## Customization

The app uses a simple, clean design that's easy to customize:

- **Colors**: Modify Tailwind classes in components
- **Layout**: Adjust component structure in `App.jsx`
- **Styling**: Add custom CSS in `index.css`
- **Icons**: Replace Lucide icons as needed

## Recent Updates

### Session Management Overhaul (Latest)

- **✅ Session Sidebar** - Added collapsible sidebar for session management
- **✅ Inline Editing** - Click-to-edit session titles with save/cancel buttons
- **✅ Session CRUD** - Full Create, Read, Update, Delete operations for sessions
- **✅ URL Routing** - Each session has its own URL for direct linking
- **✅ Socket.IO Integration** - Real-time session updates with fallback to HTTP
- **✅ Optimistic Updates** - UI updates immediately with backend confirmation
- **✅ Error Handling** - Robust error handling with timeout protection
- **✅ Session Persistence** - Automatic saving and restoration of active sessions

### UI/UX Improvements

- **✅ Better Button Layout** - Properly separated edit/save/cancel buttons
- **✅ Visual Feedback** - Hover effects and loading states
- **✅ Responsive Design** - Mobile-friendly sidebar and controls
- **✅ Keyboard Shortcuts** - Enter to save, Escape to cancel editing
- **✅ Connection Status** - Visual indicator for Socket.IO connection

### Technical Improvements

- **✅ Custom Hooks** - `useEnhancedNewsChat` for advanced session management
- **✅ Socket Management** - `useSocket` hook for connection handling
- **✅ Event Handling** - Proper event cleanup and timeout protection
- **✅ State Management** - Optimized state updates and error recovery
- **✅ Code Organization** - Modular component structure

## Development

The project uses modern JavaScript (ES6+) with JSX. No TypeScript complexity - just clean, readable React code.

Key development features:

- Hot module replacement with Vite
- ESLint integration ready
- Component-based architecture
- Custom hooks for state management
- Socket.IO real-time communication
- Axios interceptors for API handling
- React Router for client-side navigation

### Key Hooks

- **`useEnhancedNewsChat`** - Main chat and session management logic
- **`useSocket`** - Socket.IO connection and event handling
- **`useNewsChat`** - Basic chat functionality (legacy)

### Session Flow

1. **Create Session** → Socket.IO emit or HTTP POST
2. **Join Session** → Socket.IO room management
3. **Send Message** → Real-time streaming with Socket.IO
4. **Update Title** → Inline editing with optimistic updates
5. **Delete Session** → Clean removal with state updates
6. **Switch Sessions** → URL routing and state management

Enjoy building with your RAG News Chatbot! 🚀
