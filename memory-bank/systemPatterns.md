# System Patterns - Contoso Voice Agent

## Architectural Patterns

### Real-time Communication Pattern
**Pattern**: WebSocket-based bidirectional communication
**Implementation**: Frontend WebSocket client ↔ Backend FastAPI WebSocket handlers ↔ Azure OpenAI Realtime API
**Benefits**: Low latency, real-time audio/text streaming, persistent connections

### State Management Pattern
**Pattern**: Domain-driven state stores with Zustand
**Implementation**: Separate stores for chat, voice, products, user data
**Benefits**: Modular state management, predictable updates, easy debugging

### Audio Processing Pattern
**Pattern**: Web Audio API with worklet processors
**Implementation**: AudioWorklet → WebSocket → Backend → Azure Realtime API
**Benefits**: Real-time audio processing, low latency, browser-native performance

### Session Management Pattern
**Pattern**: Stateful session handling across WebSocket connections
**Implementation**: Backend maintains session state between client and AI services
**Benefits**: Conversation continuity, context preservation, connection resilience

## Code Organization Patterns

### Frontend Structure
```
src/
├── app/                 # Next.js app router
├── components/          # Reusable UI components
│   └── messaging/       # Chat-specific components
├── store/               # Zustand state stores
├── audio/               # Audio processing utilities
├── socket/              # WebSocket communication
└── data/                # Static data and types
```

### Backend Structure
```
api/
├── main.py              # FastAPI application entry
├── models.py            # Pydantic data models
├── session.py           # Session management
├── chat/                # Chat-specific handlers
├── suggestions/         # Product recommendation logic
├── voice/               # Voice processing
└── tests/               # Test suites
```

## Data Flow Patterns

### Text Chat Flow
1. User input → Frontend state
2. WebSocket message → Backend
3. AI processing → Azure OpenAI GPT-4o
4. Response → Backend → WebSocket → Frontend
5. UI update → State management

### Voice Chat Flow
1. Audio capture → Web Audio API
2. Audio stream → WebSocket → Backend
3. Audio processing → Azure Realtime API
4. Voice response → Backend → WebSocket
5. Audio playback → Web Audio API

### Product Recommendation Flow
1. Conversation context → AI analysis
2. Product matching → Suggestion engine
3. Recommendations → Chat context
4. User interaction → Purchase flow

## Error Handling Patterns

### WebSocket Resilience
- Connection retry logic with exponential backoff
- Graceful degradation when connection is lost
- State synchronization on reconnection

### Audio Processing Errors
- Fallback to text chat when audio fails
- User notification of audio issues
- Automatic retry for transient failures

### AI Service Errors
- Timeout handling for AI responses
- Fallback responses for service unavailability
- Error logging and monitoring

## Performance Patterns

### Lazy Loading
- Component-based code splitting
- Dynamic imports for heavy features
- Progressive loading of product data

### Caching Strategy
- Client-side state persistence
- Product catalog caching
- Session data optimization

### Audio Optimization
- Efficient audio buffer management
- Minimal latency audio processing
- Optimized WebSocket message size

---
Created: Sun
Jun
29
08:26:24
MDT
2025
Last Updated: Sun
Jun
29
08:26:24
MDT
2025
