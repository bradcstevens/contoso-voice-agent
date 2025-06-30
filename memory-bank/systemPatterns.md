# System Patterns - Contoso Voice Agent

## Development Patterns & Best Practices

### Code Organization Patterns

#### Module Structure Pattern
```
feature/
├── __init__.py          # Module initialization
├── feature.prompty      # AI prompt templates
├── models.py           # Data models specific to feature
├── logic.py            # Business logic implementation
├── tests/              # Feature-specific tests
└── data/               # Feature-specific data files
```

#### Component Organization Pattern (Frontend)
```
components/
├── feature/
│   ├── component.tsx    # Main component
│   ├── component.module.css  # Component styles
│   ├── hooks/          # Feature-specific hooks
│   └── types.ts        # Component type definitions
```

### AI Integration Patterns

#### Prompty Template Pattern
**Standard Structure:**
```yaml
---
name: [Descriptive Name]
description: [Clear description of purpose]
authors: [Team/Individual]
model:
  api: chat
  configuration:
    type: azure_openai
    azure_deployment: gpt-4o
    api_version: 2024-05-01-preview
  parameters:
    max_tokens: [Appropriate limit]
    temperature: [0.0-1.0 based on creativity needs]
---
[System prompt content]
{{input_variables}}
```

#### Context Injection Pattern
- **Product Data**: Inject relevant product information
- **User History**: Include purchase and conversation history
- **Session Context**: Maintain conversation continuity
- **Environmental Context**: Include relevant environmental data

### State Management Patterns

#### Zustand Store Pattern
```typescript
interface FeatureStore {
  // State
  data: FeatureData[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  updateItem: (id: string, data: Partial<FeatureData>) => void;
  reset: () => void;
}

const useFeatureStore = create<FeatureStore>((set, get) => ({
  // Implementation
}));
```

#### Persistent State Pattern
- **Local Storage**: Non-sensitive user preferences
- **Session Storage**: Temporary session data
- **Memory Store**: Real-time application state
- **Server Sync**: Critical data synchronization

### WebSocket Communication Patterns

#### Message Type Pattern
```typescript
interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  sessionId: string;
}

// Message handlers organized by type
const messageHandlers = {
  'chat_message': handleChatMessage,
  'voice_data': handleVoiceData,
  'system_status': handleSystemStatus,
};
```

#### Connection Management Pattern
- **Auto-reconnection**: Exponential backoff strategy
- **Connection State**: Clear connection status tracking
- **Error Handling**: Graceful degradation on connection issues
- **Heartbeat**: Regular connection health checks

### Audio Processing Patterns

#### Audio Worklet Pattern
```javascript
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.setupProcessing();
  }
  
  process(inputs, outputs, parameters) {
    // Audio processing logic
    return true; // Keep processor alive
  }
}
```

#### Stream Management Pattern
- **Input Capture**: Microphone audio capture
- **Processing Pipeline**: Real-time audio processing
- **Output Streaming**: AI-generated audio playback
- **Buffer Management**: Efficient memory usage

### Error Handling Patterns

#### Backend Error Pattern
```python
from fastapi import HTTPException

async def handle_operation():
    try:
        result = await perform_operation()
        return result
    except SpecificException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

#### Frontend Error Pattern
```typescript
const handleAsyncOperation = async () => {
  try {
    setLoading(true);
    setError(null);
    const result = await operation();
    return result;
  } catch (error) {
    setError(error.message);
    console.error('Operation failed:', error);
  } finally {
    setLoading(false);
  }
};
```

### Testing Patterns

#### Backend Testing Pattern
```python
import pytest
from fastapi.testclient import TestClient

class TestFeature:
    def setup_method(self):
        # Test setup
        pass
    
    def test_functionality(self):
        # Test implementation
        assert expected_result == actual_result
```

#### AI Evaluation Pattern
```python
def evaluate_ai_response(prompt: str, expected_type: str):
    response = ai_service.generate(prompt)
    
    # Evaluate response quality
    assert len(response) > 0
    assert response_contains_expected_elements(response, expected_type)
    assert response_relevance_score(response, prompt) > 0.8
```

### Data Management Patterns

#### JSON Data Pattern
```json
{
  "id": "unique_identifier",
  "name": "descriptive_name",
  "metadata": {
    "created": "timestamp",
    "updated": "timestamp",
    "version": "1.0.0"
  },
  "data": {
    // Feature-specific data
  }
}
```

#### Session Management Pattern
```python
class ConversationSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.messages = []
        self.context = {}
        self.created_at = datetime.now()
    
    def add_message(self, message: dict):
        self.messages.append({
            **message,
            'timestamp': datetime.now().isoformat()
        })
    
    def get_context(self) -> dict:
        return {
            'recent_messages': self.messages[-10:],
            'session_metadata': self.context
        }
```

### Performance Optimization Patterns

#### Caching Strategy Pattern
- **Response Caching**: Cache AI responses for identical inputs
- **Asset Caching**: Optimize static asset delivery
- **Session Caching**: Maintain session data in memory
- **Computed Value Caching**: Cache expensive calculations

#### Lazy Loading Pattern
```typescript
const LazyComponent = lazy(() => import('./ExpensiveComponent'));

// Usage with Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

### Security Patterns

#### Environment Configuration Pattern
```python
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    azure_openai_key: str
    azure_openai_endpoint: str
    database_url: str
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
```

#### Input Validation Pattern
```python
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    message: str
    session_id: str
    
    @validator('message')
    def validate_message(cls, v):
        if len(v) > 1000:
            raise ValueError('Message too long')
        return v.strip()
```

## Architectural Principles

### Single Responsibility Principle
- Each module handles one specific concern
- Clear separation between business logic and presentation
- Focused component functionality

### Dependency Injection
- Configuration through environment variables
- Service interfaces for testability
- Modular architecture with loose coupling

### Event-Driven Architecture
- WebSocket events for real-time communication
- State changes trigger appropriate updates
- Asynchronous processing where appropriate

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with modern browser features
- Graceful degradation for older browsers

---

*System patterns documented for consistent development practices*
*Comprehensive coverage of common patterns and best practices*
