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

## Enhanced Design System Implementation - January 2025

### Atomic Design System Foundation

The project has been enhanced with a comprehensive atomic design system following Brad Frost's methodology, providing systematic UI component development with enhanced multi-modal support.

#### New Project Structure
```
web/src/
├── components/          # Atomic design components
│   ├── atoms/            # Basic building blocks
│   ├── molecules/        # Functional compositions  
│   ├── organisms/        # Complex UI sections
│   └── index.ts          # Tree-shaking barrel exports
├── templates/           # Page layout structures
├── pages/               # Route-level containers
├── styles/              # Design tokens and theme system
├── context/             # Global state providers
├── services/            # API and data layers
├── utils/               # Pure helper functions
└── tests/               # Testing utilities
```

#### Enhanced Design System Features

**Design Tokens**: Comprehensive token system in `src/styles/design-tokens.ts`
- Core foundation tokens (colors, typography, spacing, shadows)
- Multi-modal specific tokens (camera, voice, accessibility)
- Responsive breakpoints with mobile-first approach
- Component-specific tokens for systematic styling
- Performance tokens for optimization thresholds

**Multi-Modal Support**: Enhanced UI patterns for voice and camera interfaces
- Voice-specific design tokens and component variants
- Camera control sizing with proper touch targets
- Multi-modal coordination styling and status indicators
- Accessibility-first approach with WCAG AAA compliance

**Component Foundation**: Systematic atomic design implementation
- Button atom with comprehensive variants and accessibility
- Migration strategy for existing 56 messaging components
- Tree-shaking optimized barrel exports
- TypeScript-first development with full type safety

#### Integration with Existing Architecture

The enhanced design system integrates seamlessly with:
- **Task 8** (Enhanced UI Components): Provides foundation for systematic component development
- **Performance Goals**: Design tokens enable runtime optimization and bundle efficiency
- **Accessibility Requirements**: WCAG AAA compliance built into component foundation
- **Multi-Modal Coordination**: Design patterns for voice, camera, and text modality integration

#### Migration Strategy

**4-Phase Approach**:
1. **Core Atoms**: Basic UI elements (Button ✅ complete, Icon, Input, Label next)
2. **Multi-Modal Atoms**: Voice and camera specific elements
3. **Functional Molecules**: Composed components with business logic
4. **Legacy Integration**: Systematic migration of existing components

This enhancement provides a solid foundation for scalable, accessible, and maintainable UI development while supporting the sophisticated multi-modal requirements of the Contoso Voice Agent system.

---

*Enhanced Design System: Atomic design methodology with multi-modal support*
*Foundation Complete: Design tokens, Button atom, documentation, migration strategy*
*Ready for Scale: Systematic component development with performance and accessibility built-in*
