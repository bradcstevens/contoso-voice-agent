# Technical Context - Contoso Voice Agent

## Architecture Overview

### Full-Stack Application Architecture

The Contoso Voice Agent implements a modern full-stack architecture with clear separation between frontend and backend concerns, connected via WebSocket and HTTP protocols.

### Technology Stack Deep Dive

#### Backend Technology Stack (Python FastAPI)

**Core Framework**
- **FastAPI**: Modern, fast web framework for building APIs
- **WebSocket Support**: Real-time bidirectional communication
- **Pydantic Models**: Type-safe data validation and serialization
- **Async/Await**: Non-blocking I/O operations

**AI & ML Integration**
- **Azure OpenAI Service**: GPT-4o model integration
- **Realtime API**: Voice conversation processing
- **Prompty Framework**: Structured prompt management
- **Custom Prompt Engineering**: Domain-specific AI responses

**Data Management**
- **JSON-based Data**: Product catalog and user data
- **Session Management**: In-memory cocat sation state
- **Message History**: Conversation persistence
- **Context Preservation**: Cross-session continuity

#### Frontend Technology Stack (Next.js TypeScript)

**Core Framework**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Static type checking and development experience
- **App Router**: Modern routing with layouts and nested routes
- **Server Components**: Optimized rendering strategy

**State Management**
- **Zustand**: Lightweight state management
- **Persistent State**: Local storage integration
- **Real-time Updates**: WebSocket state synchronization
- **Optimistic Updates**: Immediate UI feedback

**Audio Processing**
- **Web Audio API**: Native browser audio processing
- **Audio Worklets**: Custom audio processors
- **Real-time Streaming**: Microphone capture and playback
- **Cross-browser Compatibility**: Standardized audio handling

## System Architecture Patterns

### Communication Patterns

**WebSocket Communication**
- **Real-time Chat**: Bidirectional message exchange
- **Voice Streaming**: Audio data transmission
- **Session Synchronization**: State consistency
- **Connection Management**: Reconnection and error handling

**HTTP API Patterns**
- **RESTful Endpoints**: Standard HTTP operations
- **Request/Response Cycle**: Stateless operations
- **Error Handling**: Consistent error responses
- **CORS Configuration**: Cross-origin resource sharing

### Data Flow Architecture

```
User Input → Frontend Component → Zustand Store → WebSocket Client → FastAPI Backend → Azure OpenAI → Response Processing → Frontend Update → UI Render
```

### Session Management Architecture

**Session Lifecycle**
- **Session Creation**: Unique session identifier generation
- **Context Maintenance**: Conversation history preservation
- **State Persistence**: Cross-request data continuity
- **Session Cleanup**: Memory management and cleanup

## File Structure & Organization

### Backend Structure (`/api`)

**Core Application Files**
- `main.py`: FastAPI application entry point
- `models.py`: Pydantic data models
- `session.py`: Session management logic
- `requirements.txt`: Python dependencies

**Feature Modules**
- `chat/`: Text chat functionality
- `suggestions/`: Product recommendation engine
- `voice/`: Voice interaction handling
- `tests/`: Test suite and evaluations

**Configuration & Data**
- `*.prompty`: Structured prompt templates
- `*.json`: Product and user data
- `Dockerfile`: Container configuration

### Frontend Structure (`/web`)

**Application Structure**
- `src/app/`: Next.js App Router pages and layouts
- `src/components/`: Reusable React components
- `src/store/`: State management with Zustand
- `src/audio/`: Audio processing and utilities
- `src/socket/`: WebSocket client integration

**Asset Management**
- `public/images/`: Product photography
- `public/manuals/`: Product documentation
- `public/*.json`: Client-side data files

## Development Patterns

### Prompt Engineering Patterns

**Prompty Framework Usage**
```yaml
---
name: [Prompt Name]
description: [Prompt Description]
authors: [Author List]
model:
  api: chat
  configuration:
    type: azure_openai
    azure_deployment: gpt-4o
    api_version: 2024-05-01-preview
  parameters:
    max_tokens: 1500
    temperature: 0.7
---
```

### State Management Patterns

**Zustand Store Structure**
```typescript
interface StoreState {
  // State properties
  messages: Message[];
  isConnected: boolean;
  
  // Actions
  addMessage: (message: Message) => void;
  setConnected: (connected: boolean) => void;
}
```

### WebSocket Integration Patterns

**Real-time Communication**
- **Message Routing**: Type-based message handling
- **Event Listeners**: WebSocket event management
- **Error Recovery**: Connection resilience
- **State Synchronization**: Client-server state consistency

## Performance Considerations

### Backend Performance

**Async Operations**
- Non-blocking I/O for database operations
- Concurrent request handling
- Efficient memory usage
- Background task processing

**AI Integration Optimization**
- Response caching strategies
- Prompt optimization for token efficiency
- Context window management
- Rate limiting and throttling

### Frontend Performance

**Rendering Optimization**
- Server-side rendering where appropriate
- Component lazy loading
- Image optimization
- Bundle size optimization

**Audio Processing Optimization**
- Efficient audio worklet implementation
- Memory management for audio buffers
- Real-time processing without blocking UI
- Cross-browser audio optimization

## Security Considerations

### API Security

**Authentication & Authorization**
- Azure OpenAI API key management
- Environment variable security
- Request validation and sanitization
- Rate limiting and abuse prevention

### Frontend Security

**Client-side Security**
- Secure WebSocket connections (WSS)
- Input validation and sanitization
- CORS policy enforcement
- Content Security Policy (CSP)

## Deployment Architecture

### Containerization

**Backend Container**
- Python runtime environment
- FastAPI service configuration
- Environment variable management
- Health check endpoints

**Frontend Container**
- Node.js runtime environment
- Next.js production build
- Static asset serving
- Optimized image layers

### Environment Configuration

**Development Environment**
- Local development setup
- Hot reloading and debugging
- Test database configuration
- Mock service integration

**Production Environment**
- Scalability considerations
- Performance monitoring
- Error tracking and logging
- Security hardening

---

*Technical architecture documented for development team reference*
*Comprehensive coverage of backend, frontend, and integration patterns*
