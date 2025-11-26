# Indlela Developer Documentation

> Comprehensive documentation for developers working on the Indlela mobile app

## Table of Contents

### Getting Started
- [Environment Setup](./getting-started/setup.md) - Install tools and configure your development environment
- [Architecture Overview](./getting-started/architecture.md) - Understanding the app architecture
- [First Contribution](./getting-started/first-contribution.md) - Guide to making your first code contribution

### Development Guides
- [Offline-First Development](./guides/offline-first.md) - Building features that work offline
- [API Integration](./guides/api-integration.md) - Patterns for integrating with the Laravel backend
- [Authentication Flow](./guides/authentication.md) - Implementing OTP-based auth
- [Internationalization](./guides/i18n.md) - Supporting 6 South African languages
- [Testing Guide](./guides/testing.md) - Writing unit, integration, and E2E tests

### Coding Standards
- [Code Style Guide](./standards/code-style.md) - Vue/TypeScript conventions and best practices
- [Component Patterns](./standards/component-patterns.md) - Reusable component architecture
- [State Management](./standards/state-management.md) - When to use refs, composables, or Pinia
- [Error Handling](./standards/error-handling.md) - Consistent error handling patterns
- [Accessibility](./standards/accessibility.md) - Making the app usable for everyone

### API Documentation
- [API Endpoints](./api/endpoints.md) - Complete API reference
- [Authentication](./api/authentication.md) - Auth endpoints and flows
- [Error Codes](./api/error-codes.md) - Standard error codes and meanings

### Architecture Decision Records
- [ADR-001: Offline-First Architecture](./adr/001-offline-first.md)
- [ADR-002: Capacitor for Mobile](./adr/002-capacitor-mobile.md)
- [ADR-003: Pinia for State Management](./adr/003-pinia-state.md)

## Quick Links

### For New Developers
Start here if you're new to the project:
1. [Environment Setup](./getting-started/setup.md)
2. [Architecture Overview](./getting-started/architecture.md)
3. [Code Style Guide](./standards/code-style.md)
4. [First Contribution](./getting-started/first-contribution.md)

### Common Tasks
- [Creating a New Component](./guides/component-patterns.md#creating-components)
- [Adding a New Page](./guides/routing.md)
- [Making API Requests](./guides/api-integration.md)
- [Working Offline](./guides/offline-first.md)
- [Adding Translations](./guides/i18n.md)
- [Writing Tests](./guides/testing.md)

### Reference
- [Component Library](./reference/components.md)
- [Composables Reference](./reference/composables.md)
- [Pinia Stores](./reference/stores.md)
- [Utility Functions](./reference/utils.md)

## Project Structure

```
indlela/
├── app/
│   ├── assets/           # CSS, images
│   ├── components/       # Vue components
│   │   ├── booking/      # Booking feature
│   │   ├── provider/     # Provider feature
│   │   ├── service/      # Service feature
│   │   └── ui/           # Shared UI components
│   ├── composables/      # Reusable composition functions
│   ├── layouts/          # Layout components
│   ├── middleware/       # Route middleware
│   ├── pages/            # Route pages
│   ├── plugins/          # Nuxt plugins
│   ├── stores/           # Pinia stores
│   └── types/            # TypeScript types
│
├── locales/              # i18n translations
├── public/               # Static files
├── android/              # Capacitor Android
├── ios/                  # Capacitor iOS
├── tests/                # Test files
└── docs/                 # This documentation
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Nuxt 4 (Vue 3) |
| UI Library | Ionic 8 |
| Mobile | Capacitor 6 |
| State | Pinia 2 |
| Offline | Dexie (IndexedDB) |
| i18n | @nuxtjs/i18n |
| Styling | Tailwind CSS |
| Testing | Vitest + Playwright |

## Key Principles

### 1. Offline-First
All critical features work without internet. Queue actions locally, sync when online.

### 2. Mobile-First
Designed for touch interfaces with 44x44px minimum touch targets.

### 3. Multi-Language
Support 6 South African languages: English, isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana.

### 4. Accessible
Semantic HTML, ARIA labels, screen reader support.

### 5. Type-Safe
TypeScript everywhere with strict mode enabled.

## Code Conventions

### File Naming
- Components: `PascalCase.vue` (e.g., `BookingCard.vue`)
- Composables: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Pages: `kebab-case.vue` (e.g., `verify-otp.vue`)
- Stores: `camelCase.ts` (e.g., `auth.ts`)

### Always Use Composition API
```vue
<script setup lang="ts">
// ✅ Correct
const count = ref(0);
</script>
```

### TypeScript Everything
```typescript
// ✅ Define interfaces for props
interface BookingCardProps {
  booking: Booking;
}

const props = defineProps<BookingCardProps>();
```

### Internationalize All Text
```vue
<template>
  <!-- ✅ Use translation keys -->
  <h1>{{ t('home.welcome') }}</h1>
</template>
```

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Mobile builds
pnpm android      # Build and open Android Studio
pnpm ios          # Build and open Xcode
pnpm sync         # Sync with Capacitor
```

## Getting Help

- **Documentation**: Check `/docs` first
- **Code Examples**: Browse `/app` for patterns
- **Issues**: Search GitHub issues
- **Team**: Ask in Slack channel
- **External**:
  - [Nuxt Docs](https://nuxt.com/docs)
  - [Ionic Docs](https://ionicframework.com/docs)
  - [Capacitor Docs](https://capacitorjs.com/docs)

## Contributing

See the [First Contribution Guide](./getting-started/first-contribution.md) for detailed instructions.

Quick checklist:
- [ ] Follows code style guide
- [ ] Has tests
- [ ] Has i18n translations
- [ ] Works offline
- [ ] Passes linting
- [ ] Passes type checking

## License

Proprietary - Indlela (Pty) Ltd
