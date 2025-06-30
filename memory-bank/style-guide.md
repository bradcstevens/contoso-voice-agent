# Style Guide - Contoso Voice Agent Development

## Code Style & Conventions

### Python (Backend) Style Guide

#### Code Formatting
- **PEP 8 Compliance**: Follow Python PEP 8 standards
- **Line Length**: Maximum 88 characters (Black formatter standard)
- **Indentation**: 4 spaces (no tabs)
- **Import Organization**: isort with Black compatibility

#### Naming Conventions
```python
# Variables and functions: snake_case
user_message = "Hello"
def process_message(message: str) -> str:
    return message.lower()

# Classes: PascalCase
class ConversationSession:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_MESSAGE_LENGTH = 1000

# Private methods: leading underscore
def _internal_helper(self):
    pass
```

#### Type Hints
```python
from typing import List, Dict, Optional, Union

def process_messages(
    messages: List[Dict[str, str]], 
    user_id: Optional[str] = None
) -> Dict[str, Union[str, int]]:
    """Process messages with full type annotation."""
    pass
```

#### Docstring Convention
```python
def generate_response(prompt: str, context: Dict[str, str]) -> str:
    """Generate AI response based on prompt and context.
    
    Args:
        prompt: The user input prompt
        context: Additional context for response generation
        
    Returns:
        Generated AI response string
        
    Raises:
        ValueError: If prompt is empty or invalid
    """
    pass
```

### TypeScript (Frontend) Style Guide

#### Code Formatting
- **Prettier Configuration**: 2-space indentation
- **Line Length**: Maximum 100 characters
- **Semicolons**: Always use semicolons
- **Quotes**: Single quotes for strings, double for JSX attributes

#### Naming Conventions
```typescript
// Variables and functions: camelCase
const userMessage = "Hello";
const processMessage = (message: string): string => {
  return message.toLowerCase();
};

// Types and interfaces: PascalCase
interface UserMessage {
  id: string;
  content: string;
  timestamp: Date;
}

// Constants: UPPER_SNAKE_CASE
const MAX_MESSAGE_LENGTH = 1000;

// Components: PascalCase
const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  return <div>{message.content}</div>;
};
```

#### React Component Patterns
```typescript
// Functional component with TypeScript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  const [state, setState] = useState<string>('');
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
    </div>
  );
};
```

#### CSS Modules Convention
```css
/* component.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background-color: var(--accent-color);
  color: white;
  cursor: pointer;
}
```

## Project Structure Conventions

### File Naming
- **Python files**: snake_case.py
- **TypeScript files**: camelCase.ts/tsx
- **CSS modules**: camelCase.module.css
- **Configuration files**: lowercase or conventional names

### Directory Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── styles/             # Global styles
```

## Documentation Standards

### Code Comments
```python
# Single line comments for brief explanations
def process_data():
    # Transform data before processing
    data = transform_input(raw_data)
    
    """
    Multi-line docstrings for functions and classes
    explaining purpose, parameters, and return values
    """
    pass
```

```typescript
// Single line comments for brief explanations
const processData = () => {
  // Transform data before processing
  const data = transformInput(rawData);
  
  /**
   * Multi-line comments for complex logic
   * explaining the reasoning behind implementation
   */
};
```

### API Documentation
```python
# FastAPI automatic documentation
@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Process chat message and return AI response.
    
    - **message**: User message content
    - **session_id**: Conversation session identifier
    - **context**: Additional context for response generation
    """
    pass
```

## Testing Conventions

### Python Testing
```python
# test_feature.py
import pytest
from unittest.mock import Mock, patch

class TestFeature:
    def setup_method(self):
        """Setup test fixtures."""
        self.feature = Feature()
    
    def test_basic_functionality(self):
        """Test basic feature functionality."""
        result = self.feature.process("input")
        assert result == "expected"
    
    @patch('module.external_service')
    def test_with_mock(self, mock_service):
        """Test with external service mocked."""
        mock_service.return_value = "mocked_response"
        result = self.feature.process_with_service("input")
        assert result == "processed_mocked_response"
```

### TypeScript Testing
```typescript
// component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('renders with title', () => {
    render(<Component title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Component title="Test" onAction={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Git Commit Conventions

### Commit Message Format
```
<type>(<scope>): <description>

<body>

<footer>
```

### Commit Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```
feat(chat): add real-time message streaming

Implement WebSocket-based message streaming for improved
user experience in chat interface.

- Add WebSocket client integration
- Update message state management
- Add connection status indicators

Closes #123
```

## Error Handling Standards

### Python Error Handling
```python
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

async def process_request(data: dict):
    try:
        result = await external_service.process(data)
        return result
    except ValidationError as e:
        logger.warning(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except ExternalServiceError as e:
        logger.error(f"External service error: {e}")
        raise HTTPException(status_code=502, detail="Service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### TypeScript Error Handling
```typescript
const handleAsyncOperation = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await apiCall();
    setData(result);
  } catch (error) {
    console.error('Operation failed:', error);
    setError(error instanceof Error ? error.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

## Performance Guidelines

### Backend Performance
- Use async/await for I/O operations
- Implement appropriate caching strategies
- Use connection pooling for database connections
- Monitor response times and optimize slow endpoints

### Frontend Performance
- Implement component lazy loading
- Optimize bundle size with tree shaking
- Use React.memo for expensive components
- Implement proper image optimization

## Security Best Practices

### Environment Variables
```python
# settings.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    azure_openai_key: str
    database_url: str
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

### Input Validation
```python
from pydantic import BaseModel, validator

class UserInput(BaseModel):
    message: str
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        if len(v) > 1000:
            raise ValueError('Message too long')
        return v.strip()
```

---

*Comprehensive style guide for consistent code quality*
*Updated as development practices evolve*
