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

## Multi-Modal AI System Architecture Patterns

### Architectural Patterns Established
- **Date**: $(date)
- **Context**: Contoso Voice Agent Multi-Modal System

#### Multi-Modal Orchestration Pattern
- **Pattern**: Central orchestrator coordinates multiple interaction modalities (text, voice, visual)
- **Implementation**: Multi-Modal Orchestrator service with event-driven state management
- **Benefits**: Unified coordination, consistent state management, scalable modality addition
- **Usage**: Apply for systems requiring coordination between multiple input/output modalities

#### Dual API Endpoint Pattern
- **Pattern**: Intelligent routing between specialized API endpoints based on request type
- **Implementation**: Azure Endpoint Router with request type detection and load balancing
- **Benefits**: Optimized API usage, cost management, failover capability, performance optimization
- **Usage**: Apply when using multiple specialized AI endpoints with different capabilities

#### Real-Time State Synchronization Pattern
- **Pattern**: Synchronized state management across frontend and backend via WebSocket
- **Implementation**: Event-driven state updates with real-time WebSocket communication
- **Benefits**: Consistent user experience, real-time updates, efficient data flow
- **Usage**: Apply for applications requiring real-time multi-modal interaction

## Enhanced Camera Integration Design Patterns

### Camera Permission Management Pattern
- **Date**: $(date)
- **Pattern**: Progressive permission request with graceful degradation and comprehensive error handling
- **Implementation**: CameraPermissionButton atom with useCameraPermission hook
- **Benefits**: 
  - WCAG AAA accessibility compliance with screen reader support
  - Multiple permission states with clear user feedback
  - Touch-optimized for mobile with proper target sizes
  - Keyboard navigation and voice control integration
  - Cross-browser compatibility with WebRTC support
- **Design Tokens Used**:
  - Camera status colors for different permission states
  - Animation tokens for smooth state transitions
  - Spacing tokens for touch targets and accessibility
  - Performance tokens for optimal user experience
- **Usage**: Apply for any camera-enabled web application requiring permission management

### Real-Time Video Feed Pattern
- **Date**: $(date)
- **Pattern**: Performance-optimized video display with 30fps target and accessibility features
- **Implementation**: CameraFeedDisplay atom with GPU acceleration and memory management
- **Benefits**:
  - 30fps real-time video processing with minimal CPU impact
  - Responsive design across mobile, tablet, and desktop
  - Comprehensive accessibility with focus indicators and screen reader support
  - Dark mode and high contrast support
  - Reduced motion preferences compliance
  - Cross-browser video optimization
- **Performance Optimizations**:
  - GPU acceleration with transform3d and backface-visibility
  - CSS containment for layout optimization
  - Will-change property for smooth animations
  - Optimized image rendering for video playback
- **Usage**: Apply for real-time video applications requiring high performance and accessibility

### Atomic Design Methodology Pattern
- **Date**: $(date)
- **Pattern**: Systematic component development from design tokens to complete interfaces
- **Implementation**: Five-level hierarchy with comprehensive design token foundation
- **Levels**:
  1. **Design Tokens**: Camera-specific colors, animations, spacing, performance values
  2. **Atoms**: CameraPermissionButton, CameraFeedDisplay, CaptureButton, StatusIndicator
  3. **Molecules**: CameraPermissionFlow, CameraFeedContainer, CaptureInterface
  4. **Organisms**: AdvancedCameraWidget, VisualSearchInterface, MultiModalOrchestrator
  5. **Templates**: CameraEnabledChatLayout, VisualSearchResultsLayout
  6. **Pages**: EnhancedChatWithCamera, VisualSearchResults
- **Benefits**:
  - Systematic component development and reusability
  - Consistent design system integration
  - Scalable component architecture
  - Clear dependency hierarchy
  - Enhanced maintainability
- **Usage**: Apply for complex UI systems requiring systematic component development

### Multi-Modal Coordination Pattern
- **Date**: $(date)
- **Pattern**: Seamless coordination between voice, camera, and text interactions
- **Implementation**: Event-driven coordination with shared state management
- **Coordination Points**:
  - Voice commands triggering camera capture
  - Camera analysis informing text responses
  - Text chat context enhancing voice interactions
  - Visual search results integrated into conversation flow
- **Design Tokens**:
  - Multi-modal coordination colors for different active states
  - Transition timings for smooth mode switching
  - Status indicators for current active modality
- **Benefits**:
  - Unified user experience across modalities
  - Context preservation during mode switching
  - Intelligent feature coordination
  - Performance optimization for multi-modal processing
- **Usage**: Apply for applications requiring multiple interaction modalities with shared context

## Enhanced Design System Patterns

### Camera-Specific Design Token System
- **Date**: $(date)
- **Pattern**: Comprehensive token system for camera-related UI components
- **Token Categories**:
  - **Status Colors**: idle, requesting, active, capturing, processing, error, denied
  - **UI Colors**: overlay backgrounds, control backgrounds, capture rings, focus indicators
  - **Animation Tokens**: transition speeds, capture duration, focus timing, permission timing
  - **Spacing Tokens**: touch targets, spacing, control sizes, icon sizes, border radius
  - **Performance Tokens**: frame rates, resolution limits, quality settings, timeout values
  - **Multi-Modal Colors**: voice active, camera active, text active, coordination, processing
  - **Visual Search Colors**: match confidence levels, backgrounds, borders, shadows
- **Responsive Adaptations**:
  - Dark mode variants for all color tokens
  - Reduced motion alternatives for animation tokens
  - High contrast mode enhancements
- **Usage**: Apply for camera-enabled applications requiring consistent visual design

### Progressive Enhancement Pattern
- **Date**: $(date)
- **Pattern**: Graceful degradation when camera features are unavailable
- **Implementation**: Feature detection with fallback UI states
- **Enhancement Levels**:
  1. **Base Level**: Text-only interaction with file upload fallback
  2. **Enhanced Level**: Camera permission with static image capture
  3. **Advanced Level**: Real-time video feed with 30fps processing
  4. **Premium Level**: Multi-modal coordination with voice-triggered capture
- **Benefits**:
  - Broad device and browser compatibility
  - Accessible to users with different capabilities
  - Performance optimization for varying hardware
  - Graceful handling of permission denials
- **Usage**: Apply for applications requiring broad accessibility and device support

### Performance-Optimized Media Pattern
- **Date**: $(date)
- **Pattern**: Optimized media handling for real-time processing
- **Implementation**: GPU acceleration, memory management, and efficient encoding
- **Optimizations**:
  - Hardware-accelerated video rendering
  - Efficient image capture and base64 encoding
  - Memory cleanup for video streams
  - Optimized network transmission
  - Lazy loading for camera components
- **Performance Targets**:
  - 30fps video feed with minimal CPU impact
  - <200ms image capture and encoding
  - <3s visual analysis response time
  - <100ms multi-modal coordination
- **Usage**: Apply for media-intensive applications requiring real-time processing

## Implementation Guidelines

### Camera Integration Best Practices
1. **Always request permissions progressively** with clear user education
2. **Implement comprehensive error handling** for all camera states
3. **Optimize for performance** with GPU acceleration and memory management
4. **Ensure accessibility compliance** with WCAG AAA standards
5. **Support all interaction modalities** with graceful degradation
6. **Test across devices and browsers** for compatibility
7. **Monitor performance metrics** for optimization opportunities

### Design Token Usage Guidelines
1. **Use semantic tokens** instead of primitive values
2. **Implement responsive variants** for different screen sizes
3. **Support accessibility preferences** (dark mode, reduced motion, high contrast)
4. **Maintain consistency** across all component levels
5. **Document token usage** with clear examples and guidelines
6. **Version token changes** for backward compatibility

### Atomic Design Implementation Guidelines
1. **Start with design tokens** as the foundation
2. **Build atoms systematically** with comprehensive accessibility
3. **Compose molecules** with clear component relationships
4. **Create organisms** with complex interaction patterns
5. **Design templates** with flexible content areas
6. **Implement pages** with real content and complete user flows
7. **Validate across levels** for consistency and performance

---

*Enhanced design patterns for sophisticated multi-modal camera integration*
*Atomic design methodology ensuring systematic and scalable component development*
*Performance and accessibility optimized for real-time video processing*

