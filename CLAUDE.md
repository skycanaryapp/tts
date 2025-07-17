# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Mandaleen** - a unified citizen services platform built with React, TypeScript, and shadcn/ui. It's an Arabic-language application that connects citizens with AI agents from government institutions, NGOs, hotels, hospitals, and travel services through chat and voice interfaces.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Architecture Overview

### Core Technology Stack
- **Vite + React 18**: Build tool and UI framework
- **TypeScript**: Type safety with strict configuration
- **shadcn/ui**: Component library based on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **TanStack Query**: Server state management

### Project Structure
```
src/
├── components/ui/          # shadcn/ui components (50+ pre-built components)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── pages/                  # Route components (Index.tsx, NotFound.tsx)
├── App.tsx                 # Main app with routing and providers
└── main.tsx               # Application entry point
```

### Key Features Implementation

**Multi-Agent Chat System**: The main page (`src/pages/Index.tsx`) implements a comprehensive chat interface supporting:
- Text and voice conversations with AI agents
- Real-time speech recognition (Arabic language)
- Text-to-speech synthesis
- Conversation history with local storage persistence
- Special webhook integration for "Zoka" hotel agent

**Agent Categories**: Five main service categories with predefined agents:
- Government (الحكومة) - Prime Ministry, Digital Economy, Youth Ministry
- NGOs (المنظمات غير الحكومية) - Crown Prince Foundation, development funds
- Hotels (الفنادق) - St. Regis, Fairmont, W Amman, Zoka (smart hotel)
- Hospitals (المستشفيات) - Cancer center, general hospitals
- Travel (السفر) - Royal Jordanian, tourism board, bus services

**Authentication**: Simple email/password auth with local state management and localStorage persistence.

## Special Considerations

### RTL (Right-to-Left) Support
- All components use `dir="rtl"` attribute
- CSS classes include RTL-specific utilities like `space-x-reverse`
- Arabic text uses `.arabic-text` class for proper typography

### Webhook Integration
The Zoka hotel agent connects to an external webhook at `https://0zr8zljh.rpcld.cc/webhook-test/zoka` for real AI responses. Other agents use simulated responses.

### Voice Features
- Uses Web Speech API (`webkitSpeechRecognition`) for Arabic speech recognition
- Speech synthesis for agent responses in voice calls
- Voice call UI with microphone controls and visual feedback

### Styling Approach
- Custom color schemes per agent/category using inline styles
- Extensive use of Tailwind utilities
- Custom animations defined in CSS
- Emoji icons used throughout the interface

## Development Notes

- The app uses Lovable's component tagger in development mode
- Path aliases configured: `@/` maps to `src/`
- ESLint configured with React-specific rules
- TypeScript strict mode enabled
- No test framework currently configured

## Component Patterns

When working with this codebase:
- Follow the existing shadcn/ui component patterns
- Use Tailwind classes for styling
- Implement proper RTL support for new components
- Maintain Arabic language support in all user-facing text
- Use the established color theming system for consistency