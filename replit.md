# StockSense AI

## Overview

StockSense AI is a modern fintech web application that provides intelligent stock market analysis through AI-powered insights. The platform combines real-time market data, technical analysis, and AI-driven recommendations to help users make informed investment decisions. Built with a React frontend and Express backend, it delivers a professional, dark-themed interface optimized for extended viewing sessions with a focus on data-first presentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query (v5) for server state and data fetching
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom fintech-inspired dark theme

**Design Philosophy:**
- Card-based modular layout inspired by modern fintech platforms (Robinhood, Stripe, TradingView)
- Dark-themed interface with high contrast for extended viewing
- Typography hierarchy using Inter for UI and JetBrains Mono for numerical data
- Minimal animations to maintain professional credibility
- Responsive grid layouts for different content types (news cards, sentiment heatmaps, technical indicators)

**Component Structure:**
- Reusable UI components in `/client/src/components/ui/` (shadcn/ui pattern)
- Feature components in `/client/src/components/` (ChatBot, StockLookup, NewsCards, etc.)
- Single-page application with `/client/src/pages/Home.tsx` as main entry point
- Custom hooks in `/client/src/hooks/` for cross-component logic

**Key Features:**
- AI-powered chatbot for stock analysis with suggested prompts
- Real-time market sentiment heatmap tracking major indices
- Stock lookup with technical indicators (SMA50, SMA200, RSI, volatility)
- News feed with sentiment classification (Bullish/Bearish/Neutral)
- PDF report generation for analysis export
- Interactive charts using Recharts library

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Data Fetching**: Yahoo Finance 2 API for stock data
- **PDF Generation**: PDFKit for creating analysis reports
- **Session Management**: In-memory storage (MemStorage class)

**API Design:**
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Centralized error handling with appropriate HTTP status codes
- Request/response logging middleware for monitoring

**Core API Endpoints:**
- `GET /api/market-sentiment` - Fetches real-time data for major market indices
- `GET /api/news` - Retrieves and classifies trending financial news
- `POST /api/chat` - AI chatbot endpoint (placeholder for future integration)
- `GET /api/stock/:ticker` - Comprehensive stock data including price history and technical indicators
- `POST /api/generate-pdf` - Creates downloadable PDF reports

**Data Processing:**
- Market sentiment calculation based on 24-hour price changes
- News classification using keyword matching for sentiment analysis
- Technical indicator computation (50/200-day SMA, RSI, volatility, relative strength)
- Real-time stock data from Yahoo Finance with 6-month historical data

**Build System:**
- Custom esbuild configuration for server bundling with selective dependency bundling
- Vite for client build with code splitting
- Separate development and production modes
- Hot module replacement in development via Vite middleware

### Database Architecture

**Current Implementation:**
- In-memory storage using Map data structures (MemStorage class)
- Schema definitions using Drizzle ORM with Zod validation
- Database configuration ready for PostgreSQL (Neon serverless)

**Schema Design:**
- User model with basic authentication fields (username, password)
- Type-safe schema definitions in `/shared/schema.ts`
- Zod schemas for runtime validation of API requests/responses

**Migration Strategy:**
- Drizzle Kit configured for PostgreSQL migrations
- Migration files stored in `/migrations` directory
- Schema-first approach with TypeScript types derived from Drizzle schemas

**Note**: The application is architected to support PostgreSQL through Drizzle ORM and Neon serverless, but currently uses in-memory storage. The database infrastructure can be activated by providing a `DATABASE_URL` environment variable.

### Shared Code

**Type Safety:**
- Shared TypeScript schemas in `/shared/schema.ts`
- Runtime validation using Zod
- Type inference from Zod schemas for compile-time safety
- Consistent types between client and server

**Data Models:**
- MarketSentiment: Market index data with price changes
- NewsArticle: News with sentiment classification and metadata
- ChatMessage: User/assistant chat interactions
- StockData: Comprehensive stock information with technical indicators
- TechnicalIndicators: Calculated metrics (SMA, RSI, volatility, etc.)

### Code Organization

**Monorepo Structure:**
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Common TypeScript schemas and types
- `/script` - Build and deployment scripts
- `/attached_assets` - Legacy Python implementation references

**Path Aliases:**
- `@/` - Client source directory
- `@shared/` - Shared schemas and types
- `@assets/` - Static assets

**Development Workflow:**
- TypeScript strict mode enabled across entire codebase
- ESNext modules for modern JavaScript features
- Hot reload in development with Vite HMR
- Production builds optimize client and server separately

## External Dependencies

### Third-Party Services

**Financial Data:**
- **Yahoo Finance 2**: Primary data source for stock quotes, historical prices, and company information
  - Real-time and historical stock data
  - Market indices tracking
  - Company fundamental data (PE ratio, market cap)

**Future Integrations (Prepared):**
- **Google Generative AI**: AI chatbot responses (package installed, implementation pending)
- **News API**: Financial news aggregation (referenced in legacy code)
- **Alpha Vantage**: Technical indicators (referenced in legacy code)
- **Flowise**: AI workflow orchestration (referenced in legacy code)

### UI Component Libraries

**Radix UI Primitives:**
- Comprehensive set of unstyled, accessible components
- Used for modals, dropdowns, tooltips, tabs, etc.
- Fully keyboard navigable and ARIA compliant

**shadcn/ui:**
- Pre-styled components built on Radix UI
- Customized with Tailwind CSS
- "New York" style variant selected
- Custom color palette for fintech aesthetic

### Utility Libraries

**Frontend:**
- `clsx` & `tailwind-merge`: Dynamic className composition
- `class-variance-authority`: Type-safe component variants
- `date-fns`: Date formatting and manipulation
- `recharts`: Data visualization and charting
- `wouter`: Lightweight routing

**Backend:**
- `pdfkit`: PDF document generation
- `cors`: Cross-origin resource sharing
- `express-session`: Session management
- `nanoid`: Unique ID generation

### Build & Development Tools

**Vite Plugins:**
- `@vitejs/plugin-react`: React fast refresh
- `@replit/vite-plugin-runtime-error-modal`: Error overlay for Replit
- `@replit/vite-plugin-cartographer`: Replit cartographer integration
- `@replit/vite-plugin-dev-banner`: Development environment banner

**Database Tools:**
- `drizzle-orm`: Type-safe ORM
- `drizzle-kit`: Schema migrations and introspection
- `@neondatabase/serverless`: PostgreSQL driver for serverless environments

### Configuration Files

- `components.json`: shadcn/ui configuration with path aliases
- `tailwind.config.ts`: Custom theme with fintech color palette
- `tsconfig.json`: TypeScript compiler options with path mappings
- `vite.config.ts`: Build configuration with aliases and plugins
- `drizzle.config.ts`: Database connection and migration settings