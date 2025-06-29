# Technical Context - Contoso Voice Agent

## Architecture Overview
The Contoso Voice Agent follows a modern web application architecture with real-time capabilities:

### Frontend Architecture (Next.js)
- **Framework**: Next.js with TypeScript for type safety
- **State Management**: Zustand for global state management
- **Real-time Communication**: WebSocket client for bidirectional communication
- **Audio Processing**: Web Audio API for voice capture and playback
- **UI Components**: React components with modular CSS

### Backend Architecture (FastAPI)
- **Framework**: FastAPI for high-performance async API
- **WebSocket Support**: Real-time bidirectional communication
- **Session Management**: Maintaining client connections and AI sessions
- **AI Integration**: Azure OpenAI client for GPT-4o and Realtime API
- **Data Models**: Pydantic for request/response validation

### AI Integration Layer
- **Text Processing**: Azure OpenAI GPT-4o for natural language understanding
- **Voice Processing**: Azure OpenAI Realtime API for voice conversations
- **Prompt Engineering**: Prompty framework for structured prompts
- **Context Management**: Maintaining conversation state and history

## Key Technical Patterns

### Real-time Communication Flow
1. Frontend WebSocket client connects to backend
2. Backend maintains session with Azure OpenAI Realtime API
3. Audio/text data flows through WebSocket connections
4. AI responses are processed and returned in real-time

### State Management Pattern
- Zustand stores for different application domains:
  - Chat state (messages, conversation history)
  - Voice state (audio settings, connection status)
  - Product state (catalog, recommendations)
  - User state (preferences, session data)

### Audio Processing Pipeline
1. Web Audio API captures microphone input
2. Audio worklet processes real-time audio data
3. WebSocket transmits audio streams to backend
4. Backend forwards audio to Azure Realtime API
5. AI responses are streamed back through the same pipeline

## Technology Stack Details

### Frontend Dependencies
- Next.js: React framework with SSR capabilities
- TypeScript: Static typing for JavaScript
- Zustand: Lightweight state management
- Web Audio API: Browser audio processing
- WebSocket API: Real-time communication

### Backend Dependencies
- FastAPI: Modern Python web framework
- WebSockets: Real-time bidirectional communication
- Azure OpenAI: AI services integration
- Pydantic: Data validation and serialization
- Python asyncio: Asynchronous programming

## Development Environment
- **Local Development**: VS Code with launch configurations
- **Debugging**: F5 to start both frontend and backend simultaneously
- **Containerization**: Docker support for both components
- **Environment Variables**: Azure OpenAI configuration

## Deployment Architecture
- **Frontend**: Containerized Next.js app (port 3000)
- **Backend**: Containerized FastAPI app
- **Cloud Integration**: Azure OpenAI services
- **Real-time Infrastructure**: WebSocket support in production

## Performance Considerations
- **WebSocket Connections**: Efficient real-time communication
- **Audio Streaming**: Low-latency audio processing
- **AI Response Times**: Optimized prompt engineering
- **State Management**: Efficient client-side state updates

---
Created: Sun
Jun
29
08:26:00
MDT
2025
Last Updated: Sun
Jun
29
08:26:00
MDT
2025
