# Contoso Voice Agent - Project Brief

## Project Overview

The Contoso Voice Agent is a sophisticated full-stack AI-powered application that combines text chat and voice calling capabilities to provide personalized product recommendations and customer support. The system serves as a retail assistant for Contoso Outdoor Company, helping customers discover and purchase outdoor gear through natural conversations.

## Core Objectives

- **Enhanced Customer Experience**: Provide seamless text and voice interactions for product discovery
- **AI-Powered Recommendations**: Leverage Azure OpenAI GPT-4o for intelligent product suggestions
- **Real-time Communication**: Enable real-time voice and chat conversations with customers
- **Personalized Shopping**: Utilize purchase history and preferences for tailored recommendations

## Architecture Overview

### High-Level System Design
```
┌─────────────────┐    WebSocket/HTTP    ┌──────────────────┐
│   Next.js       │◄────────────────────►│   FastAPI        │
│   Frontend      │                      │   Backend        │
│   (Port 3000)   │                      │   (Port 8000)    │
│                 │                      │                  │
│ ┌─────────────┐ │   Real-time Audio    │                  │
│ │ Web Audio   │ │──────────────────────┤                  │
│ │ Capture &   │ │      (WebSocket)     │                  │
│ │ Processing  │ │                      │                  │
│ └─────────────┘ │                      │                  │
└─────────────────┘                      └──────────────────┘
                                                   │
                                                   │ Audio Stream
                                                   ▼
                                         ┌──────────────────┐
                                         │   Azure OpenAI   │
                                         │   GPT-4o         │
                                         │   Realtime API   │
                                         └──────────────────┘
```

## Technology Stack

### Backend (Python FastAPI)
- **Framework**: FastAPI with WebSocket support
- **AI Integration**: Azure OpenAI GPT-4o and Realtime API
- **Prompt Management**: Prompty framework for structured prompts
- **Session Management**: Custom session handling with conversation context
- **Data Models**: Pydantic models for type safety
- **Testing**: Pytest with evaluation framework

### Frontend (Next.js TypeScript)
- **Framework**: Next.js 14 with App Router
- **State Management**: Zustand for global state
- **Audio Processing**: Web Audio API with custom worklets
- **Real-time Communication**: WebSocket client for voice/chat
- **UI Components**: React components with TypeScript
- **Styling**: CSS modules and styled components

### AI & Data
- **Language Model**: Azure OpenAI GPT-4o for chat and suggestions
- **Voice Processing**: Azure OpenAI Realtime API for voice conversations
- **Product Data**: JSON-based product catalog (20 outdoor products)
- **User Data**: Purchase history and preferences in JSON format
- **Prompt Engineering**: Structured prompty files for different scenarios

## Key Features

### 1. Text Chat Interface
- Real-time text conversations with AI assistant
- Product catalog integration
- WebSocket-based message exchange
- Conversation context preservation

### 2. Voice Calling System
- Real-time voice conversations with AI
- Custom Web Audio worklets for audio processing
- Azure OpenAI Realtime API integration
- Voice-specific state management

### 3. Product Recommendation Engine
- AI-powered product suggestions based on context
- Integration with product catalog and purchase history
- Embedded in both chat and voice interactions
- Contextual recommendation prompts

### 4. Session Management
- Conversation context maintenance
- User preference tracking
- Message history persistence
- Cross-session continuity

## Success Metrics

- **User Engagement**: Improved conversation completion rates
- **Recommendation Accuracy**: Higher conversion rates on suggested products
- **Response Quality**: Reduced customer support escalations
- **Technical Performance**: Sub-second response times for AI interactions

## Current Status

- **Infrastructure**: Complete backend and frontend setup
- **AI Integration**: Azure OpenAI GPT-4o and Realtime API connected
- **Core Features**: Text chat, voice calling, and recommendations implemented
- **Data Layer**: Product catalog and user data structures established
- **Testing**: Basic test coverage with evaluation framework

## Next Steps

- Memory Bank system implementation for enhanced development workflow
- Continuous improvement of AI prompt engineering
- Performance optimization and monitoring
- Advanced user personalization features
- Mobile application development considerations

---

*Last Updated: $(date)*
*Memory Bank Initialized: $(date)*
