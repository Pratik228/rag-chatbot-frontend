# RAG News Chatbot Frontend

A modern React frontend for the RAG News Chatbot, built with Vite, Tailwind CSS, and Lucide React icons.

## Features

- 🎯 **Modern Chat Interface** - Clean, ChatGPT-like design
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔗 **News Source Integration** - Displays article sources with clickable links
- 🔄 **Session Management** - Reset conversations easily
- ⚡ **Real-time Updates** - Live typing indicators and smooth animations
- 🎨 **Beautiful UI** - Tailwind CSS styling with custom scrollbars

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Axios** - HTTP client for API calls

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
│   ├── ChatInterface.jsx      # Main chat UI component
│   ├── NewsSourceCard.jsx     # News article source display
│   └── SessionControls.jsx    # Header with reset functionality
├── hooks/
│   └── useNewsChat.js         # Chat state management hook
├── services/
│   └── api.js                 # Backend API integration
├── App.jsx                    # Main app component
├── main.jsx                   # React entry point
└── index.css                  # Global styles with Tailwind
```

## API Integration

The frontend connects to your RAG backend at `http://localhost:3000/api` with the following endpoints:

- `POST /api/chat` - Send messages and get responses
- `POST /api/reset` - Reset chat session
- `GET /api/history/:sessionId` - Get chat history (optional)

## Configuration

- **Backend URL**: Configure in `src/services/api.js`
- **Development Port**: Set in `vite.config.js` (default: 3001)
- **Proxy Settings**: API calls are proxied to backend in development

## Features in Detail

### Chat Interface

- Auto-scrolling message history
- User and assistant message bubbles
- Loading indicators during API calls
- Error handling with user-friendly messages

### News Sources

- Clickable source cards with article titles
- Publication dates and source names
- External link indicators
- Responsive card layout

### Session Management

- Reset button in header
- Message count display
- Session persistence across page reloads
- Error recovery

## Customization

The app uses a simple, clean design that's easy to customize:

- **Colors**: Modify Tailwind classes in components
- **Layout**: Adjust component structure in `App.jsx`
- **Styling**: Add custom CSS in `index.css`
- **Icons**: Replace Lucide icons as needed

## Development

The project uses modern JavaScript (ES6+) with JSX. No TypeScript complexity - just clean, readable React code.

Key development features:

- Hot module replacement with Vite
- ESLint integration ready
- Component-based architecture
- Custom hooks for state management
- Axios interceptors for API handling

Enjoy building with your RAG News Chatbot! 🚀
