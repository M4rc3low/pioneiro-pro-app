# Architecture

## Overview

Pioneiro Pro is a React single-page application focused on operational organization, student follow-up, scheduled visits, reminders and progress tracking.

The current version uses a local data layer based on `localStorage`. This approach keeps the frontend functional for portfolio demonstration and allows the project to evolve later into a backend-driven architecture without rewriting the UI.

## High-level structure

```txt
src/
├── api/
│   └── pioneiroClient.js      # Local data access layer
├── components/                # Reusable UI and feature components
├── hooks/                     # Shared hooks
├── lib/                       # Auth context, helpers and app utilities
├── pages/                     # Route-level pages
└── main.jsx                   # Application bootstrap
```

## Data layer

The application uses a local client responsible for:

- Reading collections
- Creating records
- Updating records
- Deleting records
- Simulating subscriptions through browser events

This isolates persistence concerns from UI components.

## Current data flow

```txt
Page or Component
      ↓
Feature logic / hook
      ↓
Local client
      ↓
localStorage
      ↓
UI refresh / event dispatch
```

## Future production architecture

A production-ready version should move from local storage to a secure backend:

```txt
React frontend
      ↓
API layer
      ↓
Authentication and authorization
      ↓
Database
      ↓
Observability, logs and monitoring
```

## Recommended evolution

- Add a backend API
- Add authentication and authorization
- Replace local storage with a database
- Add test coverage
- Add CI/CD deployment checks
- Add structured logs and monitoring
- Add role-based access control

## Security considerations

The current local layer is suitable for development and demonstration. It should not be used as the only persistence layer in production.
