# Style Guide - Contoso Voice Agent

## Code Style Standards

### TypeScript/JavaScript (Frontend)
- Use TypeScript for all new code
- Prefer functional components with hooks
- Use meaningful variable and function names
- Implement proper error boundaries
- Follow React best practices for performance

### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints for function parameters and returns
- Implement proper async/await patterns
- Use Pydantic models for data validation
- Follow FastAPI best practices

### File Naming Conventions
- Frontend: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Backend: `snake_case.py` for all Python files
- Components: PascalCase for component names
- Hooks: `use` prefix for custom hooks

## Architecture Principles

### Frontend Architecture
- Component-based architecture with clear separation of concerns
- State management through Zustand stores
- Real-time communication via WebSocket
- Audio processing through Web Audio API
- Modular CSS with component-specific styles

### Backend Architecture
- FastAPI with async/await patterns
- WebSocket handlers for real-time communication
- Session management for stateful connections
- AI integration through Azure OpenAI clients
- Pydantic models for data validation

### Communication Patterns
- WebSocket for real-time bidirectional communication
- JSON message format for data exchange
- Proper error handling and reconnection logic
- Session persistence across connections

## UI/UX Guidelines

### Design Principles
- Clean, modern interface focused on conversation
- Responsive design for various screen sizes
- Accessible components following WCAG guidelines
- Consistent visual hierarchy and spacing
- Clear visual feedback for user actions

### Voice Interface Guidelines
- Clear audio quality indicators
- Visual feedback during voice interactions
- Graceful fallback to text when audio fails
- Intuitive voice controls and settings

### Chat Interface Guidelines
- Clear message threading and history
- Typing indicators and message status
- Product recommendations integrated naturally
- Easy-to-use file and image sharing

## Development Practices

### Code Quality
- Write self-documenting code with clear naming
- Add comments for complex business logic
- Implement proper error handling
- Use TypeScript/Python type systems effectively

### Testing Standards
- Unit tests for core business logic
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical user flows

### Performance Guidelines
- Optimize WebSocket message frequency
- Implement efficient state updates
- Use lazy loading for heavy components
- Optimize audio processing pipeline

### Security Practices
- Validate all user inputs
- Secure WebSocket connections
- Protect API keys and sensitive data
- Implement proper session management

## Documentation Standards

### Code Documentation
- JSDoc comments for TypeScript functions
- Python docstrings following Google style
- README files for major components
- API documentation for endpoints

### Memory Bank Integration
- Update Memory Bank files when making architectural changes
- Document new patterns in systemPatterns.md
- Track progress in progress.md
- Maintain active context in activeContext.md

---
Created: Sun
Jun
29
08:27:44
MDT
2025
Last Updated: Sun
Jun
29
08:27:44
MDT
2025
