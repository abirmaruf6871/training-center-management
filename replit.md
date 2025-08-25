# Overview

This is a Training Center Management System designed for ACMR Academy and Aspirin Ultrasound Training Center. The application is a full-stack web solution built to manage students, courses, faculty, payments, attendance, and administrative operations for medical training centers. It includes role-based access control for administrators, managers, accountants, faculty, and students, with comprehensive features for tracking enrollment, payments, course progress, and generating reports.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Component Pattern**: Compound components with proper separation of concerns

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with proper error handling and validation

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Centralized schema definitions in shared directory
- **Tables**: Users, branches, courses, students, payments, classes, attendance, expenses, and sessions
- **Relationships**: Proper foreign key constraints and relational integrity
- **Validation**: Zod schemas for runtime validation integrated with Drizzle

## Authentication & Authorization
- **Provider**: Replit Auth with OpenID Connect protocol
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role-Based Access**: Five user roles (admin, manager, accountant, faculty, student) with different permission levels
- **Security**: HTTP-only cookies, CSRF protection, and secure session management

## Code Organization
- **Monorepo Structure**: Shared types and schemas between client and server
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)
- **Type Safety**: End-to-end TypeScript with strict configuration
- **Validation**: Shared Zod schemas for consistent validation across client and server

# External Dependencies

## Database & Storage
- **PostgreSQL**: Primary database hosted on Neon with connection pooling
- **Neon Database**: Serverless PostgreSQL with WebSocket support for real-time connections

## Authentication
- **Replit Auth**: OpenID Connect authentication provider
- **OpenID Client**: Standard OIDC implementation for secure authentication flows

## UI & Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Build tool with HMR and development server
- **ESBuild**: Fast bundling for production builds
- **TypeScript**: Static type checking across the entire application
- **Replit Integration**: Development environment with runtime error overlays and cartographer support