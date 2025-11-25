# Indlela Mobile App - Claude Code Instructions

## Project Overview

**Indlela** ("The Way" in isiZulu) is a voice-first, offline-capable service marketplace connecting South African township service providers with customers.

### Tech Stack
- **Framework:** Nuxt 4 (Vue 3 Composition API)
- **UI Library:** Ionic 8
- **Mobile:** Capacitor 6 (iOS + Android)
- **State:** Pinia 2
- **Offline:** Workbox 7 + IndexedDB (Dexie)
- **i18n:** @nuxtjs/i18n (6 SA languages: en, zu, xh, af, st, tn)
- **Styling:** Tailwind CSS + Ionic components
- **HTTP:** ofetch with retry logic
- **Forms:** VeeValidate 4 + Zod

### API Backend
- Laravel 12 API at `NUXT_PUBLIC_API_URL`
- Sanctum token authentication
- RESTful endpoints under `/api/v1/`

## Code Standards

### Vue/Nuxt Patterns
- Always use `<script setup lang="ts">`
- Use Composition API, never Options API
- Composables for reusable logic (useAuth, useBooking, useOffline)
- Pinia for global state

### File Naming
- Components: `PascalCase.vue` (e.g., `BookingCard.vue`)
- Composables: `useCamelCase.ts` (e.g., `useBooking.ts`)
- Pages: `kebab-case.vue` or `[param].vue`
- Stores: `camelCase.ts` (e.g., `booking.ts`)

### Component Structure
```
app/
├── components/
│   ├── booking/       # Feature components
│   ├── provider/
│   └── ui/            # Shared UI
├── composables/
├── pages/
└── layouts/
```

## Key Architectural Decisions

### 1. Offline-First
All critical features must work offline. Queue actions locally with IndexedDB (Dexie), sync when online.

### 2. Multi-Channel
Single codebase serves PWA, Android, iOS via Capacitor.

### 3. Low-Data Optimization
- Lazy load images
- WebP format
- Aggressive caching with service workers

### 4. Accessibility
- 6 SA languages supported
- 44x44px minimum touch targets
- Semantic HTML

## Business Rules
- **Commission:** 12% charged to customers (not workers)
- **Booking fee:** R10-15 flat fee
- **OTP expiry:** 5 minutes
- **Service radius:** Default 10km

## Key User Flows
1. **Customer:** Browse → Select provider → Schedule → Pay → Rate
2. **Provider:** Register → Verify ID → Add services → Set availability
3. **Offline:** Queue locally → Sync when online → Confirm via SMS

## Development Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run generate     # Static generation (for Capacitor)
npx cap sync         # Sync to native projects
npx cap run android  # Run on Android
```
```

---

## Option 2: Let Claude Code Generate Everything

Once you have the empty folder and start Claude Code, just paste this prompt:
```
I'm building Indlela - a hyper-local service marketplace mobile app for South African townships.

Tech stack:
- Nuxt 4 + Vue 3 Composition API
- Ionic 8 for UI
- Capacitor 6 for iOS/Android
- Pinia for state management
- Offline-first with IndexedDB (Dexie)
- 6 languages: English, isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana
- Laravel 12 backend API

Key features:
- OTP phone authentication
- Service provider discovery
- Booking system with offline support
- 12% commission charged to customers

Please:
1. Create a CLAUDE.md with project context
2. Initialize the Nuxt 4 project with all dependencies
3. Set up the folder structure
4. Create base composables (useApi, useAuth, useOffline)
5. Create the auth store with Pinia