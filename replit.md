# Overview

This is a full-stack SEO analysis and monitoring platform called "SEO Watcher" that helps users analyze websites, track SEO performance, and get optimization recommendations. The application allows users to submit URLs for analysis, view detailed SEO metrics, track keyword performance, and receive actionable recommendations for improving their website's search engine optimization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and building
- **Routing**: Uses Wouter for lightweight client-side routing
- **UI Framework**: Radix UI components with Tailwind CSS for styling using the "new-york" shadcn/ui theme
- **State Management**: TanStack React Query for server state management and data fetching
- **Form Handling**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with organized route handlers
- **Development**: Hot reloading with Vite integration for seamless full-stack development
- **Error Handling**: Centralized error handling middleware with structured JSON responses

## Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless with connection pooling)
- **Schema**: Well-structured relational schema with sites, analyses, recommendations, and keywords tables
- **Migrations**: Drizzle Kit for database schema management and migrations

## Key Data Models
- **Sites**: Store website URLs and domains for tracking
- **Analyses**: Track SEO analysis runs with scores, status, and progress
- **Recommendations**: Store actionable SEO improvement suggestions
- **Keywords**: Track keyword rankings and performance metrics

## Authentication & Session Management
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple
- **User System**: Basic user authentication with username/password (implementation in progress)

## SEO Analysis Engine
- **External API**: Google PageSpeed Insights API integration for performance and SEO scoring
- **Analysis Flow**: Asynchronous analysis with progress tracking and status updates
- **Data Processing**: Comprehensive SEO metrics extraction including performance scores, accessibility, and best practices

## UI/UX Design System
- **Component Library**: Comprehensive UI component system built on Radix UI primitives
- **Theming**: CSS custom properties with dark/light mode support
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Typography**: Multiple font families (Inter, Georgia, Menlo) for different use cases

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket connections
- **Connection Pooling**: @neondatabase/serverless for optimized database connections

## Third-party APIs
- **Google PageSpeed Insights API**: Core SEO and performance analysis service
- **Google API**: General Google services integration (API key required)

## UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework for styling

## Development Tools
- **Vite**: Fast build tool and development server with HMR
- **TypeScript**: Static type checking and enhanced developer experience
- **Drizzle Kit**: Database schema management and migration tools
- **ESBuild**: Fast JavaScript bundler for production builds

## Validation & Forms
- **Zod**: TypeScript-first schema validation library
- **React Hook Form**: Performant forms with easy validation
- **@hookform/resolvers**: Zod integration for form validation

## Additional Libraries
- **TanStack React Query**: Server state management and caching
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Utility for managing CSS class variants
- **Wouter**: Minimalist routing library for React