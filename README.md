# Indlela - The Way

> A voice-first, offline-capable service marketplace connecting South African township service providers with customers.

**Indlela** (meaning "The Way" in isiZulu) empowers township communities by connecting skilled service providers with customers who need their services, all while working offline-first and supporting 6 South African languages.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Nuxt 4 (Vue 3 Composition API) |
| UI | Ionic 8 |
| Mobile | Capacitor 6 (iOS + Android) |
| State | Pinia 2 |
| Offline | IndexedDB (Dexie) + Service Workers |
| i18n | @nuxtjs/i18n (6 languages) |
| Backend | Laravel 12 API |

## Supported Languages

- English (en)
- isiZulu (zu)
- isiXhosa (xh)
- Afrikaans (af)
- Sesotho (st)
- Setswana (tn)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Generate static files (for Capacitor)
pnpm generate

# Run linting
pnpm lint

# Run type checking
pnpm typecheck
```

### Mobile Development

```bash
# Sync with native projects
pnpm sync

# Build and open Android Studio
pnpm android

# Build and open Xcode
pnpm ios
```

## Project Structure

```
indlela/
├── app/
│   ├── components/          # Vue components
│   │   ├── booking/         # Booking feature
│   │   ├── provider/        # Provider feature
│   │   ├── review/          # Review feature
│   │   ├── payment/         # Payment feature
│   │   └── ui/              # Shared UI components
│   ├── composables/         # Vue composables
│   ├── layouts/             # Page layouts
│   ├── middleware/          # Route middleware
│   ├── pages/               # Route pages
│   └── plugins/             # Nuxt plugins
├── stores/                  # Pinia stores
├── locales/                 # i18n language files
├── types/                   # TypeScript definitions
├── utils/                   # Utility functions
├── public/                  # Static assets
└── .claude/commands/        # Claude Code commands
```

## Claude Code Commands

Custom slash commands for development workflow:

| Command | Description |
|---------|-------------|
| `/feature <name>` | Scaffold a complete feature |
| `/page <path>` | Create a new page |
| `/component <name>` | Create a new component |
| `/i18n <key> <text>` | Add translations to all languages |
| `/api <method> <path>` | Document an API endpoint |
| `/test <path>` | Generate tests for a file |
| `/offline <path>` | Review offline-first compliance |

## Environment Variables

Create a `.env` file:

```bash
NUXT_PUBLIC_API_URL=http://localhost:8000
```

## Business Rules

- **Commission**: 12% charged to customers (not workers)
- **Booking fee**: R10-15 flat fee
- **OTP expiry**: 5 minutes
- **Service radius**: Default 10km

## Contributing

Please read the [DEVELOPER-DOCUMENTATION.md](./DEVELOPER-DOCUMENTATION.md) for detailed development guidelines.

## License

Proprietary - Indlela (Pty) Ltd