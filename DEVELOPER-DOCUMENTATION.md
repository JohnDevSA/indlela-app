# Indlela Platform - Developer Documentation

> **Version:** 1.0  
> **Last Updated:** November 2025  
> **Target Stack:** Laravel 12 + Nuxt 4 + Ionic 8 + Capacitor 6

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Design](#5-api-design)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Offline-First Implementation](#7-offline-first-implementation)
8. [USSD & SMS Integration](#8-ussd--sms-integration)
9. [Payment Integration](#9-payment-integration)
10. [Multi-Language Support](#10-multi-language-support)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Guide](#12-deployment-guide)
13. [Development Workflow](#13-development-workflow)
14. [Code Standards](#14-code-standards)

---

## 1. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────┬─────────────────┬─────────────────┬──────────────────────┤
│   PWA (Nuxt 4)  │  Android App    │   iOS App       │  USSD/SMS            │
│   + Ionic 8     │  (Capacitor 6)  │  (Capacitor 6)  │  (Africa's Talking)  │
└────────┬────────┴────────┬────────┴────────┬────────┴──────────┬───────────┘
         │                 │                 │                   │
         └─────────────────┴────────┬────────┴───────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │   API GATEWAY     │
                          │   (Laravel 12)    │
                          └─────────┬─────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
┌────────▼────────┐      ┌─────────▼─────────┐      ┌─────────▼─────────┐
│   PostgreSQL    │      │      Redis        │      │    AWS S3         │
│   (Supabase)    │      │   (Upstash)       │      │   (Media/Docs)    │
└─────────────────┘      └───────────────────┘      └───────────────────┘
```

### Core Principles

1. **Offline-First**: All critical features work without connectivity
2. **Mobile-First**: Designed for smartphones, works on feature phones via USSD
3. **Low-Data**: Optimized for expensive mobile data (gzip, lazy loading, WebP)
4. **Multi-Channel**: Single backend serves PWA, mobile apps, USSD, SMS, and voice
5. **Event-Driven**: Queue-based processing for scalability

---

## 2. Technology Stack

### Backend (API)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Laravel | 12.x | REST API, business logic |
| PHP | PHP | 8.3+ | Runtime |
| Authentication | Sanctum | 4.x | API tokens, SPA auth |
| Queue | Laravel Queues | - | Background jobs |
| Cache | Redis (Upstash) | - | Session, cache, rate limiting |
| Database | PostgreSQL | 16+ | Primary data store |
| Search | Meilisearch | 1.x | Provider search (optional) |
| File Storage | AWS S3 | - | Media, documents |

### Frontend (PWA + Mobile)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Nuxt | 4.x | SSR/SSG, Vue 3 ecosystem |
| UI Library | Ionic | 8.x | Cross-platform components |
| Mobile Build | Capacitor | 6.x | Native iOS/Android |
| State | Pinia | 2.x | Global state management |
| Offline | Workbox | 7.x | Service workers, caching |
| HTTP | ofetch | - | API requests with retry |
| Forms | VeeValidate | 4.x | Form validation |
| i18n | @nuxtjs/i18n | - | Internationalization |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Hosting (API) | AWS EC2 / Laravel Forge | API server |
| Hosting (Frontend) | Vercel / Cloudflare Pages | Static + edge |
| Database | Supabase (free tier) | Managed PostgreSQL |
| Cache | Upstash (free tier) | Serverless Redis |
| CDN | Cloudflare | Asset delivery |
| SMS/USSD | Africa's Talking | Communications |
| Payments | Yoco + Ozow | Card + EFT |
| Monitoring | Sentry | Error tracking |

### Development Tools

| Tool | Purpose |
|------|---------|
| Docker | Local development environment |
| GitHub Actions | CI/CD pipelines |
| Pest PHP | Backend testing |
| Vitest | Frontend testing |
| Playwright | E2E testing |
| Laravel Pint | PHP code formatting |
| ESLint + Prettier | JS/TS formatting |

---

## 3. Project Structure

### Backend (Laravel)

```
indlela-api/
├── app/
│   ├── Actions/                    # Single-purpose action classes
│   │   ├── Booking/
│   │   │   ├── CreateBooking.php
│   │   │   ├── AcceptBooking.php
│   │   │   ├── CompleteBooking.php
│   │   │   └── CancelBooking.php
│   │   ├── Provider/
│   │   │   ├── RegisterProvider.php
│   │   │   ├── VerifyProvider.php
│   │   │   └── UpdateAvailability.php
│   │   └── Payment/
│   │       ├── ProcessPayment.php
│   │       └── ProcessPayout.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── V1/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── BookingController.php
│   │   │   │   │   ├── ProviderController.php
│   │   │   │   │   ├── ServiceController.php
│   │   │   │   │   ├── ReviewController.php
│   │   │   │   │   └── PaymentController.php
│   │   │   │   └── Ussd/
│   │   │   │       └── UssdController.php
│   │   │   └── Webhook/
│   │   │       ├── YocoWebhookController.php
│   │   │       └── AfricasTalkingWebhookController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── EnsureProviderVerified.php
│   │   │   ├── RateLimitByPhone.php
│   │   │   └── LocaleFromHeader.php
│   │   │
│   │   ├── Requests/
│   │   │   ├── Booking/
│   │   │   │   ├── StoreBookingRequest.php
│   │   │   │   └── UpdateBookingRequest.php
│   │   │   └── Provider/
│   │   │       └── RegisterProviderRequest.php
│   │   │
│   │   └── Resources/
│   │       ├── BookingResource.php
│   │       ├── ProviderResource.php
│   │       └── ServiceResource.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Provider.php
│   │   ├── Customer.php
│   │   ├── Service.php
│   │   ├── ServiceCategory.php
│   │   ├── Booking.php
│   │   ├── Review.php
│   │   ├── Payment.php
│   │   ├── Payout.php
│   │   ├── Location.php
│   │   └── UssdSession.php
│   │
│   ├── Notifications/
│   │   ├── BookingCreated.php
│   │   ├── BookingAccepted.php
│   │   ├── BookingCompleted.php
│   │   └── PaymentReceived.php
│   │
│   ├── Services/
│   │   ├── Booking/
│   │   │   └── MatchingService.php
│   │   ├── Payment/
│   │   │   ├── YocoService.php
│   │   │   └── OzowService.php
│   │   ├── Communication/
│   │   │   ├── SmsService.php
│   │   │   ├── UssdService.php
│   │   │   └── WhatsAppService.php
│   │   └── Location/
│   │       └── GeocodingService.php
│   │
│   └── Jobs/
│       ├── SendBookingNotification.php
│       ├── ProcessPayoutBatch.php
│       └── SyncOfflineBookings.php
│
├── config/
│   ├── services.php              # Third-party service configs
│   └── indlela.php               # App-specific config
│
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
│
├── routes/
│   ├── api.php                   # API routes
│   ├── ussd.php                  # USSD callback routes
│   └── webhooks.php              # Payment/SMS webhooks
│
└── tests/
    ├── Feature/
    │   ├── Booking/
    │   ├── Provider/
    │   └── Payment/
    └── Unit/
        ├── Actions/
        └── Services/
```

### Frontend (Nuxt 4 + Ionic)

```
indlela-app/
├── app/
│   ├── components/
│   │   ├── booking/
│   │   │   ├── BookingCard.vue
│   │   │   ├── BookingForm.vue
│   │   │   ├── BookingStatus.vue
│   │   │   └── BookingHistory.vue
│   │   ├── provider/
│   │   │   ├── ProviderCard.vue
│   │   │   ├── ProviderProfile.vue
│   │   │   ├── ProviderList.vue
│   │   │   └── AvailabilityCalendar.vue
│   │   ├── review/
│   │   │   ├── ReviewForm.vue
│   │   │   ├── ReviewList.vue
│   │   │   └── StarRating.vue
│   │   ├── payment/
│   │   │   ├── PaymentForm.vue
│   │   │   └── PaymentHistory.vue
│   │   ├── ui/
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppFooter.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── ErrorMessage.vue
│   │   │   ├── EmptyState.vue
│   │   │   └── OfflineIndicator.vue
│   │   └── layout/
│   │       ├── AppTabs.vue
│   │       └── PageWrapper.vue
│   │
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useBooking.ts
│   │   ├── useProvider.ts
│   │   ├── useOffline.ts
│   │   ├── useGeolocation.ts
│   │   ├── useNotifications.ts
│   │   └── useApi.ts
│   │
│   ├── pages/
│   │   ├── index.vue                    # Home / Service discovery
│   │   ├── auth/
│   │   │   ├── login.vue
│   │   │   ├── register.vue
│   │   │   └── verify-otp.vue
│   │   ├── services/
│   │   │   ├── index.vue                # Service categories
│   │   │   └── [category].vue           # Providers in category
│   │   ├── providers/
│   │   │   └── [id].vue                 # Provider profile
│   │   ├── bookings/
│   │   │   ├── index.vue                # Booking history
│   │   │   ├── new.vue                  # Create booking
│   │   │   └── [id].vue                 # Booking details
│   │   ├── provider-dashboard/
│   │   │   ├── index.vue                # Provider home
│   │   │   ├── jobs.vue                 # Available jobs
│   │   │   ├── earnings.vue             # Earnings dashboard
│   │   │   └── profile.vue              # Edit profile
│   │   └── settings/
│   │       ├── index.vue
│   │       ├── notifications.vue
│   │       └── language.vue
│   │
│   └── layouts/
│       ├── default.vue
│       ├── auth.vue
│       └── provider.vue
│
├── stores/
│   ├── auth.ts
│   ├── booking.ts
│   ├── provider.ts
│   ├── offline.ts
│   └── ui.ts
│
├── utils/
│   ├── api.ts                     # API client setup
│   ├── offline-queue.ts           # IndexedDB queue management
│   ├── formatting.ts              # Date, currency formatting
│   └── validation.ts              # Form validation rules
│
├── locales/
│   ├── en.json
│   ├── zu.json                    # isiZulu
│   ├── xh.json                    # isiXhosa
│   ├── af.json                    # Afrikaans
│   ├── st.json                    # Sesotho
│   └── tn.json                    # Setswana
│
├── public/
│   ├── icons/                     # PWA icons
│   └── images/
│
├── service-worker/
│   └── sw.ts                      # Custom service worker
│
├── ios/                           # Capacitor iOS project
├── android/                       # Capacitor Android project
│
├── nuxt.config.ts
├── capacitor.config.ts
├── ionic.config.json
└── tailwind.config.ts
```

---

## 4. Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │       │  Providers  │       │  Customers  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────┤ user_id     │       │ user_id     │────►│
│ phone       │       │ id          │       │ id          │
│ email       │       │ bio         │       │ address     │
│ name        │       │ location_id │       │ location_id │
│ role        │       │ verified_at │       │ preferences │
│ locale      │       │ rating      │       └─────────────┘
│ created_at  │       │ status      │
└─────────────┘       └──────┬──────┘
                             │
                             │ has_many
                             ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Services   │◄──────┤Provider     │       │  Bookings   │
├─────────────┤       │Services     │       ├─────────────┤
│ id          │       ├─────────────┤       │ id          │
│ category_id │       │ provider_id │       │ customer_id │
│ name        │       │ service_id  │       │ provider_id │
│ description │       │ price       │       │ service_id  │
│ base_price  │       │ duration    │       │ status      │
│ icon        │       └─────────────┘       │ scheduled_at│
└─────────────┘                             │ completed_at│
                                            │ total_amount│
┌─────────────┐                             │ commission  │
│  Locations  │                             └──────┬──────┘
├─────────────┤                                    │
│ id          │                                    │ has_one
│ lat         │                             ┌──────▼──────┐
│ lng         │                             │   Reviews   │
│ address     │                             ├─────────────┤
│ township    │                             │ booking_id  │
│ suburb      │                             │ rating      │
│ city        │                             │ comment     │
└─────────────┘                             │ created_at  │
                                            └─────────────┘
┌─────────────┐       ┌─────────────┐
│  Payments   │       │   Payouts   │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ booking_id  │       │ provider_id │
│ amount      │       │ amount      │
│ method      │       │ status      │
│ gateway_ref │       │ reference   │
│ status      │       │ processed_at│
│ paid_at     │       └─────────────┘
└─────────────┘
```

### Migration Examples

```php
// database/migrations/2025_01_01_000001_create_users_table.php

Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('phone', 15)->unique();
    $table->string('email')->nullable()->unique();
    $table->string('name');
    $table->string('password')->nullable(); // Nullable for OTP-only auth
    $table->enum('role', ['customer', 'provider', 'admin'])->default('customer');
    $table->string('locale', 5)->default('en');
    $table->string('avatar')->nullable();
    $table->timestamp('phone_verified_at')->nullable();
    $table->timestamp('email_verified_at')->nullable();
    $table->rememberToken();
    $table->timestamps();
    $table->softDeletes();
    
    $table->index('phone');
    $table->index('role');
});
```

```php
// database/migrations/2025_01_01_000003_create_providers_table.php

Schema::create('providers', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
    $table->foreignUuid('location_id')->nullable()->constrained();
    $table->text('bio')->nullable();
    $table->string('id_number', 13)->nullable(); // SA ID for verification
    $table->string('id_document')->nullable(); // S3 path
    $table->decimal('rating', 2, 1)->default(0);
    $table->unsignedInteger('total_reviews')->default(0);
    $table->unsignedInteger('total_jobs')->default(0);
    $table->enum('status', ['pending', 'verified', 'suspended', 'inactive'])->default('pending');
    $table->timestamp('verified_at')->nullable();
    $table->json('verification_data')->nullable(); // Background check results
    $table->json('availability')->nullable(); // Weekly schedule
    $table->unsignedInteger('service_radius_km')->default(10);
    $table->timestamps();
    $table->softDeletes();
    
    $table->index('status');
    $table->index('rating');
    $table->index(['status', 'rating']); // Compound for search
});
```

```php
// database/migrations/2025_01_01_000005_create_bookings_table.php

Schema::create('bookings', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('customer_id')->constrained();
    $table->foreignUuid('provider_id')->nullable()->constrained();
    $table->foreignUuid('service_id')->constrained();
    $table->foreignUuid('location_id')->constrained();
    
    $table->enum('status', [
        'pending',      // Customer created, awaiting provider
        'accepted',     // Provider accepted
        'in_progress',  // Work started
        'completed',    // Work finished
        'cancelled',    // Either party cancelled
        'disputed'      // Issue raised
    ])->default('pending');
    
    $table->timestamp('scheduled_at');
    $table->timestamp('started_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->unsignedInteger('duration_minutes')->nullable();
    
    $table->decimal('quoted_amount', 10, 2);
    $table->decimal('final_amount', 10, 2)->nullable();
    $table->decimal('commission_amount', 10, 2)->nullable();
    $table->decimal('provider_payout', 10, 2)->nullable();
    
    $table->text('customer_notes')->nullable();
    $table->text('provider_notes')->nullable();
    $table->text('cancellation_reason')->nullable();
    
    $table->string('offline_id')->nullable(); // For offline-created bookings
    $table->timestamp('synced_at')->nullable();
    
    $table->timestamps();
    $table->softDeletes();
    
    $table->index('status');
    $table->index('scheduled_at');
    $table->index(['customer_id', 'status']);
    $table->index(['provider_id', 'status']);
    $table->index('offline_id');
});
```

---

## 5. API Design

### API Versioning

All API routes are versioned under `/api/v1/`. Future breaking changes will use `/api/v2/`.

### Authentication Endpoints

```
POST   /api/v1/auth/request-otp      # Send OTP to phone
POST   /api/v1/auth/verify-otp       # Verify OTP, return token
POST   /api/v1/auth/refresh          # Refresh access token
POST   /api/v1/auth/logout           # Revoke token
GET    /api/v1/auth/me               # Get current user
```

### Core Resource Endpoints

```
# Services
GET    /api/v1/services              # List service categories
GET    /api/v1/services/{id}         # Service details

# Providers
GET    /api/v1/providers             # Search providers (filters: service, location, rating)
GET    /api/v1/providers/{id}        # Provider profile
POST   /api/v1/providers             # Register as provider
PUT    /api/v1/providers/{id}        # Update provider profile
GET    /api/v1/providers/{id}/reviews # Provider reviews
GET    /api/v1/providers/{id}/availability # Provider schedule

# Bookings
GET    /api/v1/bookings              # List user's bookings
POST   /api/v1/bookings              # Create booking
GET    /api/v1/bookings/{id}         # Booking details
PUT    /api/v1/bookings/{id}         # Update booking
POST   /api/v1/bookings/{id}/accept  # Provider accepts
POST   /api/v1/bookings/{id}/start   # Provider starts work
POST   /api/v1/bookings/{id}/complete # Provider completes
POST   /api/v1/bookings/{id}/cancel  # Cancel booking

# Reviews
POST   /api/v1/bookings/{id}/review  # Submit review
GET    /api/v1/reviews               # List reviews (admin)

# Payments
POST   /api/v1/payments/initiate     # Start payment flow
POST   /api/v1/payments/confirm      # Confirm payment
GET    /api/v1/payments/{id}         # Payment status

# Provider Dashboard
GET    /api/v1/provider/jobs         # Available jobs in area
GET    /api/v1/provider/earnings     # Earnings summary
GET    /api/v1/provider/payouts      # Payout history
POST   /api/v1/provider/availability # Update availability

# Offline Sync
POST   /api/v1/sync/bookings         # Sync offline bookings
POST   /api/v1/sync/status           # Sync status updates
GET    /api/v1/sync/pending          # Get pending syncs
```

### Request/Response Examples

#### Create Booking

```http
POST /api/v1/bookings
Authorization: Bearer {token}
Content-Type: application/json
Accept-Language: zu

{
  "service_id": "550e8400-e29b-41d4-a716-446655440000",
  "provider_id": "660e8400-e29b-41d4-a716-446655440001",
  "location": {
    "lat": -26.2041,
    "lng": 28.0473,
    "address": "123 Vilakazi Street, Orlando West, Soweto"
  },
  "scheduled_at": "2025-01-15T09:00:00+02:00",
  "notes": "Please bring your own cleaning supplies",
  "offline_id": "local-12345" // Optional, for offline-created bookings
}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "pending",
    "service": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Home Cleaning",
      "category": "Cleaning"
    },
    "provider": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Thandi Mokoena",
      "rating": 4.8,
      "avatar": "https://cdn.indlela.co.za/avatars/thandi.jpg"
    },
    "customer": {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "name": "John Smith"
    },
    "location": {
      "lat": -26.2041,
      "lng": 28.0473,
      "address": "123 Vilakazi Street, Orlando West, Soweto"
    },
    "scheduled_at": "2025-01-15T09:00:00+02:00",
    "quoted_amount": 450.00,
    "commission_amount": 54.00,
    "notes": "Please bring your own cleaning supplies",
    "created_at": "2025-01-10T14:30:00+02:00"
  }
}
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {
      "scheduled_at": ["The scheduled time must be at least 2 hours in the future."],
      "provider_id": ["The selected provider is not available at this time."]
    }
  }
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource state conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 6. Authentication & Authorization

### OTP-Based Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Client  │     │   API    │     │Africa's Talk │     │    User     │
└────┬─────┘     └────┬─────┘     └──────┬───────┘     └──────┬──────┘
     │                │                   │                    │
     │ POST /auth/    │                   │                    │
     │ request-otp    │                   │                    │
     │ {phone}        │                   │                    │
     │───────────────►│                   │                    │
     │                │                   │                    │
     │                │  Generate OTP     │                    │
     │                │  Store in Redis   │                    │
     │                │  (5 min TTL)      │                    │
     │                │                   │                    │
     │                │   Send SMS        │                    │
     │                │──────────────────►│                    │
     │                │                   │                    │
     │                │                   │    SMS: Your       │
     │                │                   │    code is 123456  │
     │                │                   │───────────────────►│
     │                │                   │                    │
     │  202 Accepted  │                   │                    │
     │◄───────────────│                   │                    │
     │                │                   │                    │
     │ POST /auth/    │                   │                    │
     │ verify-otp     │                   │                    │
     │ {phone, otp}   │                   │                    │
     │───────────────►│                   │                    │
     │                │                   │                    │
     │                │  Verify OTP       │                    │
     │                │  Create user      │                    │
     │                │  Generate token   │                    │
     │                │                   │                    │
     │  200 OK        │                   │                    │
     │  {token, user} │                   │                    │
     │◄───────────────│                   │                    │
```

### Implementation

```php
// app/Http/Controllers/Api/V1/AuthController.php

class AuthController extends Controller
{
    public function requestOtp(Request $request, SmsService $sms): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^(\+27|0)[6-8][0-9]{8}$/'],
        ]);
        
        $phone = $this->normalizePhone($request->phone);
        
        // Rate limit: max 3 OTPs per phone per hour
        $key = "otp_requests:{$phone}";
        if (Cache::get($key, 0) >= 3) {
            return response()->json([
                'error' => [
                    'code' => 'RATE_LIMITED',
                    'message' => 'Too many OTP requests. Please try again later.',
                ]
            ], 429);
        }
        
        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store OTP in Redis with 5 minute TTL
        Cache::put("otp:{$phone}", Hash::make($otp), now()->addMinutes(5));
        Cache::increment($key);
        Cache::put($key, Cache::get($key), now()->addHour());
        
        // Send SMS
        $sms->send($phone, __('auth.otp_message', ['otp' => $otp]));
        
        return response()->json(['message' => 'OTP sent successfully'], 202);
    }
    
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
            'otp' => ['required', 'string', 'size:6'],
        ]);
        
        $phone = $this->normalizePhone($request->phone);
        $storedOtp = Cache::get("otp:{$phone}");
        
        if (!$storedOtp || !Hash::check($request->otp, $storedOtp)) {
            return response()->json([
                'error' => [
                    'code' => 'INVALID_OTP',
                    'message' => 'Invalid or expired OTP.',
                ]
            ], 401);
        }
        
        // Clear OTP
        Cache::forget("otp:{$phone}");
        
        // Find or create user
        $user = User::firstOrCreate(
            ['phone' => $phone],
            [
                'name' => 'User',
                'phone_verified_at' => now(),
            ]
        );
        
        // Update verification if existing user
        if (!$user->wasRecentlyCreated && !$user->phone_verified_at) {
            $user->update(['phone_verified_at' => now()]);
        }
        
        // Generate Sanctum token
        $token = $user->createToken('mobile-app')->plainTextToken;
        
        return response()->json([
            'data' => [
                'token' => $token,
                'user' => new UserResource($user),
                'is_new_user' => $user->wasRecentlyCreated,
            ]
        ]);
    }
    
    private function normalizePhone(string $phone): string
    {
        // Convert 0XX to +27XX
        if (str_starts_with($phone, '0')) {
            return '+27' . substr($phone, 1);
        }
        return $phone;
    }
}
```

### Role-Based Authorization

```php
// app/Models/User.php

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;
    
    protected $casts = [
        'role' => UserRole::class,
        'phone_verified_at' => 'datetime',
    ];
    
    public function isProvider(): bool
    {
        return $this->role === UserRole::Provider;
    }
    
    public function isCustomer(): bool
    {
        return $this->role === UserRole::Customer;
    }
    
    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }
    
    public function provider(): HasOne
    {
        return $this->hasOne(Provider::class);
    }
    
    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }
}

// app/Enums/UserRole.php

enum UserRole: string
{
    case Customer = 'customer';
    case Provider = 'provider';
    case Admin = 'admin';
}
```

```php
// app/Http/Middleware/EnsureProviderVerified.php

class EnsureProviderVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user->isProvider()) {
            return response()->json([
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => 'This action requires a provider account.',
                ]
            ], 403);
        }
        
        if (!$user->provider?->verified_at) {
            return response()->json([
                'error' => [
                    'code' => 'PROVIDER_NOT_VERIFIED',
                    'message' => 'Your provider account is pending verification.',
                ]
            ], 403);
        }
        
        return $next($request);
    }
}
```

---

## 7. Offline-First Implementation

### Strategy Overview

The offline-first approach ensures users can browse providers, create bookings, and update job status even without connectivity. Changes are queued locally and synchronized when online.

### Frontend: IndexedDB Queue

```typescript
// utils/offline-queue.ts

import Dexie, { Table } from 'dexie';

interface QueuedAction {
  id?: number;
  type: 'CREATE_BOOKING' | 'UPDATE_BOOKING' | 'UPDATE_STATUS';
  payload: Record<string, any>;
  localId: string;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
}

interface CachedProvider {
  id: string;
  data: Record<string, any>;
  cachedAt: Date;
}

interface CachedBooking {
  id: string;
  localId?: string;
  data: Record<string, any>;
  cachedAt: Date;
  synced: boolean;
}

class IndlelaDatabase extends Dexie {
  queue!: Table<QueuedAction>;
  providers!: Table<CachedProvider>;
  bookings!: Table<CachedBooking>;
  
  constructor() {
    super('IndlelaDB');
    
    this.version(1).stores({
      queue: '++id, type, localId, createdAt',
      providers: 'id, cachedAt',
      bookings: 'id, localId, synced, cachedAt',
    });
  }
}

export const db = new IndlelaDatabase();

export async function queueAction(
  type: QueuedAction['type'],
  payload: Record<string, any>
): Promise<string> {
  const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await db.queue.add({
    type,
    payload: { ...payload, localId },
    localId,
    createdAt: new Date(),
    retryCount: 0,
  });
  
  // If it's a booking, also cache it locally
  if (type === 'CREATE_BOOKING') {
    await db.bookings.add({
      id: localId,
      localId,
      data: {
        ...payload,
        id: localId,
        status: 'pending',
        synced: false,
      },
      cachedAt: new Date(),
      synced: false,
    });
  }
  
  return localId;
}

export async function processQueue(): Promise<void> {
  const pendingActions = await db.queue.toArray();
  
  for (const action of pendingActions) {
    try {
      const response = await syncAction(action);
      
      // Update local booking with server ID
      if (action.type === 'CREATE_BOOKING' && response?.data?.id) {
        await db.bookings.update(action.localId, {
          id: response.data.id,
          data: response.data,
          synced: true,
        });
      }
      
      // Remove from queue
      await db.queue.delete(action.id!);
      
    } catch (error) {
      // Increment retry count
      await db.queue.update(action.id!, {
        retryCount: action.retryCount + 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      });
      
      // Remove if too many retries
      if (action.retryCount >= 5) {
        console.error('Action failed after 5 retries:', action);
        await db.queue.delete(action.id!);
      }
    }
  }
}

async function syncAction(action: QueuedAction): Promise<any> {
  const { $api } = useNuxtApp();
  
  switch (action.type) {
    case 'CREATE_BOOKING':
      return await $api('/bookings', {
        method: 'POST',
        body: action.payload,
      });
      
    case 'UPDATE_BOOKING':
      return await $api(`/bookings/${action.payload.id}`, {
        method: 'PUT',
        body: action.payload,
      });
      
    case 'UPDATE_STATUS':
      return await $api(`/bookings/${action.payload.id}/${action.payload.status}`, {
        method: 'POST',
      });
      
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}
```

### Frontend: Offline Composable

```typescript
// composables/useOffline.ts

export function useOffline() {
  const isOnline = ref(navigator.onLine);
  const isSyncing = ref(false);
  const pendingCount = ref(0);
  
  // Update online status
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine;
    
    if (isOnline.value) {
      syncPendingActions();
    }
  };
  
  // Count pending actions
  const updatePendingCount = async () => {
    pendingCount.value = await db.queue.count();
  };
  
  // Sync pending actions
  const syncPendingActions = async () => {
    if (isSyncing.value || !isOnline.value) return;
    
    isSyncing.value = true;
    
    try {
      await processQueue();
      await updatePendingCount();
    } finally {
      isSyncing.value = false;
    }
  };
  
  // Register event listeners
  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updatePendingCount();
    
    // Sync on mount if online
    if (isOnline.value) {
      syncPendingActions();
    }
  });
  
  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  });
  
  return {
    isOnline: readonly(isOnline),
    isSyncing: readonly(isSyncing),
    pendingCount: readonly(pendingCount),
    syncPendingActions,
  };
}
```

### Service Worker Configuration

```typescript
// nuxt.config.ts

export default defineNuxtConfig({
  modules: ['@vite-pwa/nuxt'],
  
  pwa: {
    registerType: 'autoUpdate',
    
    manifest: {
      name: 'Indlela',
      short_name: 'Indlela',
      description: 'Connect with trusted service providers',
      theme_color: '#00A86B',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    
    workbox: {
      // Cache API responses
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.indlela\.co\.za\/api\/v1\/services/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'services-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 24 hours
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\.indlela\.co\.za\/api\/v1\/providers/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'providers-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 30, // 30 minutes
            },
            networkTimeoutSeconds: 10,
          },
        },
        {
          urlPattern: /^https:\/\/cdn\.indlela\.co\.za\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
            },
          },
        },
      ],
      
      // Precache essential pages
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    },
  },
});
```

### Backend: Offline Sync Endpoint

```php
// app/Http/Controllers/Api/V1/SyncController.php

class SyncController extends Controller
{
    public function syncBookings(Request $request): JsonResponse
    {
        $request->validate([
            'bookings' => ['required', 'array'],
            'bookings.*.local_id' => ['required', 'string'],
            'bookings.*.service_id' => ['required', 'uuid', 'exists:services,id'],
            'bookings.*.provider_id' => ['required', 'uuid', 'exists:providers,id'],
            'bookings.*.scheduled_at' => ['required', 'date', 'after:now'],
            'bookings.*.location' => ['required', 'array'],
        ]);
        
        $results = [];
        
        foreach ($request->bookings as $bookingData) {
            try {
                // Check if already synced (idempotency)
                $existing = Booking::where('offline_id', $bookingData['local_id'])->first();
                
                if ($existing) {
                    $results[] = [
                        'local_id' => $bookingData['local_id'],
                        'server_id' => $existing->id,
                        'status' => 'already_synced',
                    ];
                    continue;
                }
                
                // Create booking
                $booking = app(CreateBooking::class)->execute(
                    customerId: $request->user()->customer->id,
                    data: array_merge($bookingData, ['offline_id' => $bookingData['local_id']])
                );
                
                $results[] = [
                    'local_id' => $bookingData['local_id'],
                    'server_id' => $booking->id,
                    'status' => 'synced',
                    'data' => new BookingResource($booking),
                ];
                
            } catch (\Exception $e) {
                $results[] = [
                    'local_id' => $bookingData['local_id'],
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ];
            }
        }
        
        return response()->json(['data' => $results]);
    }
}
```

---

## 8. USSD & SMS Integration

### Africa's Talking Setup

```php
// config/services.php

return [
    'africastalking' => [
        'username' => env('AT_USERNAME'),
        'api_key' => env('AT_API_KEY'),
        'shortcode' => env('AT_SHORTCODE', '12345'),
        'sender_id' => env('AT_SENDER_ID', 'Indlela'),
    ],
];
```

### USSD Flow Implementation

```php
// app/Services/Communication/UssdService.php

class UssdService
{
    private const MENU_MAIN = 'main';
    private const MENU_SERVICES = 'services';
    private const MENU_PROVIDERS = 'providers';
    private const MENU_BOOKING = 'booking';
    private const MENU_MY_BOOKINGS = 'my_bookings';
    
    public function handleRequest(array $data): string
    {
        $sessionId = $data['sessionId'];
        $phone = $data['phoneNumber'];
        $text = $data['text'] ?? '';
        
        // Get or create session
        $session = $this->getSession($sessionId, $phone);
        
        // Parse input
        $inputs = $text ? explode('*', $text) : [];
        $currentInput = end($inputs) ?: '';
        
        // Route to handler
        return $this->route($session, $inputs, $currentInput);
    }
    
    private function route(UssdSession $session, array $inputs, string $input): string
    {
        $level = count($inputs);
        
        // Main menu
        if ($level === 0) {
            return $this->mainMenu($session);
        }
        
        // Handle based on navigation path
        $firstChoice = $inputs[0] ?? '';
        
        return match ($firstChoice) {
            '1' => $this->handleServices($session, $inputs, $input),
            '2' => $this->handleMyBookings($session, $inputs, $input),
            '3' => $this->handleHelp($session),
            default => $this->invalidOption(),
        };
    }
    
    private function mainMenu(UssdSession $session): string
    {
        $locale = $session->user?->locale ?? 'en';
        
        return $this->response(
            __('ussd.welcome', [], $locale) . "\n\n" .
            "1. " . __('ussd.find_service', [], $locale) . "\n" .
            "2. " . __('ussd.my_bookings', [], $locale) . "\n" .
            "3. " . __('ussd.help', [], $locale),
            continues: true
        );
    }
    
    private function handleServices(UssdSession $session, array $inputs, string $input): string
    {
        $level = count($inputs);
        
        // Level 1: Show service categories
        if ($level === 1) {
            $categories = ServiceCategory::active()->get();
            $menu = __('ussd.select_service', [], $session->locale) . "\n\n";
            
            foreach ($categories as $index => $category) {
                $menu .= ($index + 1) . ". {$category->name}\n";
            }
            
            return $this->response($menu, continues: true);
        }
        
        // Level 2: Show providers for selected category
        if ($level === 2) {
            $categoryIndex = (int) $inputs[1] - 1;
            $category = ServiceCategory::active()->skip($categoryIndex)->first();
            
            if (!$category) {
                return $this->invalidOption();
            }
            
            // Store selection in session
            $session->update(['data->category_id' => $category->id]);
            
            // Get nearby providers
            $providers = Provider::verified()
                ->whereHas('services', fn($q) => $q->where('category_id', $category->id))
                ->limit(5)
                ->get();
            
            if ($providers->isEmpty()) {
                return $this->response(__('ussd.no_providers', [], $session->locale));
            }
            
            $menu = __('ussd.select_provider', [], $session->locale) . "\n\n";
            
            foreach ($providers as $index => $provider) {
                $menu .= ($index + 1) . ". {$provider->user->name} ({$provider->rating}★)\n";
            }
            
            return $this->response($menu, continues: true);
        }
        
        // Level 3: Show provider details and confirm booking
        if ($level === 3) {
            $providerIndex = (int) $inputs[2] - 1;
            $categoryId = $session->data['category_id'];
            
            $provider = Provider::verified()
                ->whereHas('services', fn($q) => $q->where('category_id', $categoryId))
                ->skip($providerIndex)
                ->first();
            
            if (!$provider) {
                return $this->invalidOption();
            }
            
            $session->update(['data->provider_id' => $provider->id]);
            
            $service = $provider->services()->where('category_id', $categoryId)->first();
            
            return $this->response(
                "{$provider->user->name}\n" .
                __('ussd.rating', ['rating' => $provider->rating], $session->locale) . "\n" .
                __('ussd.price', ['price' => "R{$service->pivot->price}"], $session->locale) . "\n\n" .
                "1. " . __('ussd.book_now', [], $session->locale) . "\n" .
                "0. " . __('ussd.back', [], $session->locale),
                continues: true
            );
        }
        
        // Level 4: Confirm booking
        if ($level === 4 && $inputs[3] === '1') {
            return $this->createBookingFromUssd($session);
        }
        
        return $this->invalidOption();
    }
    
    private function createBookingFromUssd(UssdSession $session): string
    {
        $user = $session->user;
        
        if (!$user) {
            // Create user from phone number
            $user = User::firstOrCreate(
                ['phone' => $session->phone],
                [
                    'name' => 'USSD User',
                    'phone_verified_at' => now(),
                ]
            );
            
            $session->update(['user_id' => $user->id]);
        }
        
        // Ensure customer record exists
        $customer = $user->customer ?? Customer::create(['user_id' => $user->id]);
        
        $provider = Provider::find($session->data['provider_id']);
        $categoryId = $session->data['category_id'];
        $service = $provider->services()->where('category_id', $categoryId)->first();
        
        // Create booking for next available slot
        $booking = Booking::create([
            'customer_id' => $customer->id,
            'provider_id' => $provider->id,
            'service_id' => $service->id,
            'status' => 'pending',
            'scheduled_at' => now()->addDay()->setTime(9, 0), // Next day 9 AM
            'quoted_amount' => $service->pivot->price,
            'commission_amount' => $service->pivot->price * 0.12,
        ]);
        
        // Send SMS confirmation
        app(SmsService::class)->send(
            $session->phone,
            __('sms.booking_created', [
                'provider' => $provider->user->name,
                'date' => $booking->scheduled_at->format('d M H:i'),
                'ref' => substr($booking->id, 0, 8),
            ], $session->locale)
        );
        
        return $this->response(
            __('ussd.booking_confirmed', [
                'ref' => substr($booking->id, 0, 8),
            ], $session->locale)
        );
    }
    
    private function response(string $message, bool $continues = false): string
    {
        $prefix = $continues ? 'CON ' : 'END ';
        return $prefix . $message;
    }
    
    private function invalidOption(): string
    {
        return $this->response(__('ussd.invalid_option'));
    }
    
    private function getSession(string $sessionId, string $phone): UssdSession
    {
        return UssdSession::firstOrCreate(
            ['session_id' => $sessionId],
            [
                'phone' => $phone,
                'user_id' => User::where('phone', $phone)->value('id'),
                'data' => [],
                'locale' => User::where('phone', $phone)->value('locale') ?? 'en',
            ]
        );
    }
}
```

### SMS Service

```php
// app/Services/Communication/SmsService.php

class SmsService
{
    private AfricasTalking $gateway;
    
    public function __construct()
    {
        $this->gateway = new AfricasTalking(
            config('services.africastalking.username'),
            config('services.africastalking.api_key')
        );
    }
    
    public function send(string $phone, string $message): bool
    {
        try {
            $sms = $this->gateway->sms();
            
            $result = $sms->send([
                'to' => $phone,
                'message' => $message,
                'from' => config('services.africastalking.sender_id'),
            ]);
            
            Log::info('SMS sent', [
                'phone' => $phone,
                'status' => $result['status'],
            ]);
            
            return $result['status'] === 'success';
            
        } catch (\Exception $e) {
            Log::error('SMS failed', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }
    
    public function sendBulk(array $recipients, string $message): array
    {
        $results = [];
        
        foreach (array_chunk($recipients, 100) as $batch) {
            try {
                $sms = $this->gateway->sms();
                
                $result = $sms->send([
                    'to' => $batch,
                    'message' => $message,
                    'from' => config('services.africastalking.sender_id'),
                ]);
                
                $results = array_merge($results, $result['data']['SMSMessageData']['Recipients'] ?? []);
                
            } catch (\Exception $e) {
                Log::error('Bulk SMS failed', ['error' => $e->getMessage()]);
            }
        }
        
        return $results;
    }
}
```

### USSD Routes

```php
// routes/ussd.php

Route::post('/ussd/callback', [UssdController::class, 'handle'])
    ->middleware(['throttle:ussd'])
    ->name('ussd.callback');
```

```php
// app/Http/Controllers/Api/Ussd/UssdController.php

class UssdController extends Controller
{
    public function handle(Request $request, UssdService $ussd): Response
    {
        $response = $ussd->handleRequest($request->all());
        
        return response($response)
            ->header('Content-Type', 'text/plain');
    }
}
```

---

## 9. Payment Integration

### Yoco Integration

```php
// app/Services/Payment/YocoService.php

class YocoService
{
    private string $secretKey;
    private string $publicKey;
    private HttpClient $client;
    
    public function __construct()
    {
        $this->secretKey = config('services.yoco.secret_key');
        $this->publicKey = config('services.yoco.public_key');
        $this->client = Http::baseUrl('https://online.yoco.com/v1/')
            ->withBasicAuth($this->secretKey, '');
    }
    
    public function createCheckout(Booking $booking): array
    {
        $response = $this->client->post('checkouts', [
            'amount' => (int) ($booking->quoted_amount * 100), // Cents
            'currency' => 'ZAR',
            'successUrl' => route('payments.success', ['booking' => $booking->id]),
            'cancelUrl' => route('payments.cancel', ['booking' => $booking->id]),
            'failureUrl' => route('payments.failure', ['booking' => $booking->id]),
            'metadata' => [
                'booking_id' => $booking->id,
                'customer_id' => $booking->customer_id,
            ],
        ]);
        
        if (!$response->successful()) {
            throw new PaymentException('Failed to create checkout: ' . $response->body());
        }
        
        $data = $response->json();
        
        // Store payment record
        Payment::create([
            'booking_id' => $booking->id,
            'amount' => $booking->quoted_amount,
            'method' => 'yoco',
            'gateway_ref' => $data['id'],
            'status' => 'pending',
        ]);
        
        return [
            'checkout_id' => $data['id'],
            'redirect_url' => $data['redirectUrl'],
        ];
    }
    
    public function handleWebhook(array $payload): void
    {
        $event = $payload['type'] ?? '';
        $data = $payload['payload'] ?? [];
        
        match ($event) {
            'payment.succeeded' => $this->handlePaymentSuccess($data),
            'payment.failed' => $this->handlePaymentFailure($data),
            'refund.succeeded' => $this->handleRefundSuccess($data),
            default => null,
        };
    }
    
    private function handlePaymentSuccess(array $data): void
    {
        $payment = Payment::where('gateway_ref', $data['checkoutId'])->firstOrFail();
        
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'gateway_data' => $data,
        ]);
        
        // Update booking
        $booking = $payment->booking;
        $booking->update([
            'final_amount' => $payment->amount,
            'commission_amount' => $payment->amount * 0.12,
            'provider_payout' => $payment->amount * 0.88,
        ]);
        
        // Notify provider
        $booking->provider->user->notify(new PaymentReceived($booking));
    }
    
    private function handlePaymentFailure(array $data): void
    {
        $payment = Payment::where('gateway_ref', $data['checkoutId'])->firstOrFail();
        
        $payment->update([
            'status' => 'failed',
            'gateway_data' => $data,
        ]);
    }
}
```

### Payment Controller

```php
// app/Http/Controllers/Api/V1/PaymentController.php

class PaymentController extends Controller
{
    public function initiate(Request $request, YocoService $yoco): JsonResponse
    {
        $request->validate([
            'booking_id' => ['required', 'uuid', 'exists:bookings,id'],
        ]);
        
        $booking = Booking::findOrFail($request->booking_id);
        
        // Ensure user owns this booking
        if ($booking->customer->user_id !== $request->user()->id) {
            return response()->json([
                'error' => ['code' => 'FORBIDDEN', 'message' => 'Not your booking']
            ], 403);
        }
        
        // Check booking status
        if ($booking->status !== 'accepted') {
            return response()->json([
                'error' => ['code' => 'INVALID_STATE', 'message' => 'Booking must be accepted first']
            ], 422);
        }
        
        try {
            $checkout = $yoco->createCheckout($booking);
            
            return response()->json([
                'data' => $checkout
            ]);
            
        } catch (PaymentException $e) {
            return response()->json([
                'error' => ['code' => 'PAYMENT_ERROR', 'message' => $e->getMessage()]
            ], 500);
        }
    }
}
```

### Webhook Handler

```php
// app/Http/Controllers/Webhook/YocoWebhookController.php

class YocoWebhookController extends Controller
{
    public function handle(Request $request, YocoService $yoco): Response
    {
        // Verify webhook signature
        $signature = $request->header('Yoco-Signature');
        $payload = $request->getContent();
        
        $expectedSignature = hash_hmac(
            'sha256',
            $payload,
            config('services.yoco.webhook_secret')
        );
        
        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Invalid Yoco webhook signature');
            return response('Invalid signature', 401);
        }
        
        try {
            $yoco->handleWebhook($request->all());
            return response('OK', 200);
            
        } catch (\Exception $e) {
            Log::error('Yoco webhook error', ['error' => $e->getMessage()]);
            return response('Error', 500);
        }
    }
}
```

---

## 10. Multi-Language Support

### Backend: Laravel Localization

```php
// app/Http/Middleware/LocaleFromHeader.php

class LocaleFromHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language', 'en');
        
        // Support: en, zu, xh, af, st, tn
        $supported = ['en', 'zu', 'xh', 'af', 'st', 'tn'];
        
        // Parse Accept-Language header
        $preferredLocale = $this->parseAcceptLanguage($locale, $supported);
        
        app()->setLocale($preferredLocale);
        
        return $next($request);
    }
    
    private function parseAcceptLanguage(string $header, array $supported): string
    {
        // Simple implementation - first two chars
        $locale = strtolower(substr($header, 0, 2));
        
        return in_array($locale, $supported) ? $locale : 'en';
    }
}
```

### Language Files

```php
// lang/zu/messages.php (isiZulu)

return [
    'welcome' => 'Siyakwamukela ku-Indlela',
    'find_service' => 'Thola usizo',
    'my_bookings' => 'Ukubhukha kwami',
    'book_now' => 'Bhukha manje',
    'booking_confirmed' => 'Ukubhukha kwakho kuqinisekisiwe. Inombolo: :ref',
    'provider_on_way' => ':provider usendleleni',
    'job_complete' => 'Umsebenzi uqediwe. Siyabonga!',
    'rate_provider' => 'Sicela uklinganise umsebenzi ka-:provider',
];
```

```php
// lang/xh/messages.php (isiXhosa)

return [
    'welcome' => 'Wamkelekile kwi-Indlela',
    'find_service' => 'Fumana uncedo',
    'my_bookings' => 'Iibhukhingi zam',
    'book_now' => 'Bhukisha ngoku',
    'booking_confirmed' => 'Ibhukhingi yakho iqinisekisiwe. Inombolo: :ref',
    'provider_on_way' => ':provider usendleleni',
    'job_complete' => 'Umsebenzi ugqityiwe. Enkosi!',
    'rate_provider' => 'Nceda nika ixabiso kumsebenzi ka-:provider',
];
```

### Frontend: Nuxt i18n

```typescript
// nuxt.config.ts

export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zu', name: 'isiZulu', file: 'zu.json' },
      { code: 'xh', name: 'isiXhosa', file: 'xh.json' },
      { code: 'af', name: 'Afrikaans', file: 'af.json' },
      { code: 'st', name: 'Sesotho', file: 'st.json' },
      { code: 'tn', name: 'Setswana', file: 'tn.json' },
    ],
    defaultLocale: 'en',
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'en',
    },
  },
});
```

```json
// locales/zu.json

{
  "nav": {
    "home": "Ikhaya",
    "services": "Izinsizakalo",
    "bookings": "Ukubhukha",
    "profile": "Iphrofayela"
  },
  "home": {
    "welcome": "Siyakwamukela ku-Indlela",
    "tagline": "Xhumana nabantu abathembekile bezinsizakalo",
    "find_provider": "Thola umuntu ozokusiza",
    "popular_services": "Izinsizakalo ezithandwayo"
  },
  "booking": {
    "new": "Ukubhukha okusha",
    "confirm": "Qinisekisa ukubhukha",
    "cancel": "Khansela",
    "status": {
      "pending": "Kulindile",
      "accepted": "Kwamukelwe",
      "in_progress": "Kusaqhubeka",
      "completed": "Kuqediwe",
      "cancelled": "Kukhanselwe"
    }
  },
  "common": {
    "loading": "Iyalayisha...",
    "error": "Kukhona okungahambi kahle",
    "retry": "Zama futhi",
    "save": "Gcina",
    "cancel": "Khansela",
    "back": "Buyela emuva"
  }
}
```

### Language Selector Component

```vue
<!-- components/ui/LanguageSelector.vue -->

<template>
  <ion-select
    :value="locale"
    @ionChange="changeLocale($event.detail.value)"
    interface="popover"
  >
    <ion-select-option
      v-for="lang in availableLocales"
      :key="lang.code"
      :value="lang.code"
    >
      {{ lang.name }}
    </ion-select-option>
  </ion-select>
</template>

<script setup lang="ts">
const { locale, setLocale, availableLocales } = useI18n();
const { $api } = useNuxtApp();

async function changeLocale(code: string) {
  await setLocale(code);
  
  // Update user preference on server
  try {
    await $api('/auth/me', {
      method: 'PATCH',
      body: { locale: code },
    });
  } catch (e) {
    // Ignore - local change still applied
  }
}
</script>
```

---

## 11. Testing Strategy

### Backend: Pest PHP

```php
// tests/Feature/Booking/CreateBookingTest.php

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->customer = Customer::factory()->create();
    $this->provider = Provider::factory()->verified()->create();
    $this->service = Service::factory()->create();
    
    $this->provider->services()->attach($this->service, ['price' => 500]);
});

it('creates a booking successfully', function () {
    $response = $this->actingAs($this->customer->user)
        ->postJson('/api/v1/bookings', [
            'service_id' => $this->service->id,
            'provider_id' => $this->provider->id,
            'location' => [
                'lat' => -26.2041,
                'lng' => 28.0473,
                'address' => '123 Test Street, Soweto',
            ],
            'scheduled_at' => now()->addDay()->toISOString(),
        ]);
    
    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'id',
                'status',
                'service',
                'provider',
                'quoted_amount',
                'scheduled_at',
            ],
        ]);
    
    expect(Booking::count())->toBe(1);
    expect(Booking::first()->status)->toBe('pending');
});

it('rejects booking with unverified provider', function () {
    $unverifiedProvider = Provider::factory()->create(['verified_at' => null]);
    $unverifiedProvider->services()->attach($this->service, ['price' => 500]);
    
    $response = $this->actingAs($this->customer->user)
        ->postJson('/api/v1/bookings', [
            'service_id' => $this->service->id,
            'provider_id' => $unverifiedProvider->id,
            'location' => [
                'lat' => -26.2041,
                'lng' => 28.0473,
                'address' => '123 Test Street, Soweto',
            ],
            'scheduled_at' => now()->addDay()->toISOString(),
        ]);
    
    $response->assertStatus(422)
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

it('calculates commission correctly', function () {
    $booking = Booking::factory()->create([
        'quoted_amount' => 1000,
    ]);
    
    expect($booking->commission_amount)->toBe(120.00);
    expect($booking->provider_payout)->toBe(880.00);
});
```

### Frontend: Vitest

```typescript
// tests/composables/useBooking.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBooking } from '~/composables/useBooking';

describe('useBooking', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  
  it('creates a booking', async () => {
    const { createBooking, currentBooking, isLoading } = useBooking();
    
    const mockBooking = {
      id: '123',
      status: 'pending',
      quoted_amount: 500,
    };
    
    vi.mock('~/utils/api', () => ({
      $api: vi.fn().mockResolvedValue({ data: mockBooking }),
    }));
    
    await createBooking({
      service_id: 'service-1',
      provider_id: 'provider-1',
      location: { lat: -26.2, lng: 28.0, address: 'Test' },
      scheduled_at: new Date().toISOString(),
    });
    
    expect(currentBooking.value).toEqual(mockBooking);
    expect(isLoading.value).toBe(false);
  });
  
  it('queues booking when offline', async () => {
    const { createBooking, currentBooking } = useBooking();
    
    // Simulate offline
    vi.stubGlobal('navigator', { onLine: false });
    
    const localId = await createBooking({
      service_id: 'service-1',
      provider_id: 'provider-1',
      location: { lat: -26.2, lng: 28.0, address: 'Test' },
      scheduled_at: new Date().toISOString(),
    });
    
    expect(localId).toMatch(/^local-/);
    expect(currentBooking.value?.synced).toBe(false);
  });
});
```

### E2E: Playwright

```typescript
// tests/e2e/booking-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('[data-testid="phone-input"]', '0821234567');
    await page.click('[data-testid="request-otp"]');
    
    // In test mode, OTP is always 123456
    await page.fill('[data-testid="otp-input"]', '123456');
    await page.click('[data-testid="verify-otp"]');
    
    await expect(page).toHaveURL('/');
  });
  
  test('completes full booking flow', async ({ page }) => {
    // Select service
    await page.click('[data-testid="service-cleaning"]');
    
    // Select provider
    await page.click('[data-testid="provider-card"]');
    
    // Fill booking details
    await page.fill('[data-testid="address-input"]', '123 Test Street');
    await page.click('[data-testid="date-picker"]');
    await page.click('text=Tomorrow');
    await page.click('[data-testid="time-slot-9am"]');
    
    // Confirm booking
    await page.click('[data-testid="confirm-booking"]');
    
    // Check success
    await expect(page.locator('[data-testid="booking-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-ref"]')).toHaveText(/^[A-Z0-9]{8}$/);
  });
  
  test('works offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Create booking
    await page.click('[data-testid="service-cleaning"]');
    await page.click('[data-testid="provider-card"]');
    await page.fill('[data-testid="address-input"]', '123 Test Street');
    await page.click('[data-testid="confirm-booking"]');
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Booking should be queued
    await expect(page.locator('[data-testid="pending-sync"]')).toHaveText('1 pending');
    
    // Go online
    await context.setOffline(false);
    
    // Should sync
    await expect(page.locator('[data-testid="pending-sync"]')).toHaveText('0 pending');
  });
});
```

---

## 12. Deployment Guide

### Production Infrastructure

```yaml
# docker-compose.prod.yml

version: '3.8'

services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile.prod
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_CONNECTION=pgsql
      - DB_HOST=${SUPABASE_HOST}
      - DB_DATABASE=${SUPABASE_DB}
      - DB_USERNAME=${SUPABASE_USER}
      - DB_PASSWORD=${SUPABASE_PASSWORD}
      - REDIS_HOST=${UPSTASH_HOST}
      - REDIS_PASSWORD=${UPSTASH_PASSWORD}
      - REDIS_PORT=6379
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  queue:
    build:
      context: ./api
      dockerfile: Dockerfile.prod
    command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
    environment:
      - APP_ENV=production
    depends_on:
      - api

  scheduler:
    build:
      context: ./api
      dockerfile: Dockerfile.prod
    command: php artisan schedule:work
    environment:
      - APP_ENV=production
    depends_on:
      - api
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: pdo_pgsql, redis
          
      - name: Install dependencies
        run: composer install --no-progress --prefer-dist
        working-directory: ./api
        
      - name: Run tests
        run: vendor/bin/pest --parallel
        working-directory: ./api
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: ':memory:'

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Laravel Forge
        uses: jbrooksuk/laravel-forge-action@v1
        with:
          trigger_url: ${{ secrets.FORGE_TRIGGER_URL }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json
          
      - name: Install dependencies
        run: npm ci
        working-directory: ./app
        
      - name: Build
        run: npm run build
        working-directory: ./app
        env:
          NUXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./app
```

### Environment Variables

```bash
# API (.env.production)

APP_NAME=Indlela
APP_ENV=production
APP_KEY=base64:your-key-here
APP_DEBUG=false
APP_URL=https://api.indlela.co.za

DB_CONNECTION=pgsql
DB_HOST=db.xxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-password

REDIS_HOST=xxxx.upstash.io
REDIS_PASSWORD=your-password
REDIS_PORT=6379

# Africa's Talking
AT_USERNAME=indlela
AT_API_KEY=your-api-key
AT_SHORTCODE=12345
AT_SENDER_ID=Indlela

# Yoco
YOCO_PUBLIC_KEY=pk_live_xxx
YOCO_SECRET_KEY=sk_live_xxx
YOCO_WEBHOOK_SECRET=whsec_xxx

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_DEFAULT_REGION=af-south-1
AWS_BUCKET=indlela-media

# Sentry
SENTRY_LARAVEL_DSN=https://xxx@sentry.io/xxx
```

```bash
# Frontend (.env.production)

NUXT_PUBLIC_API_URL=https://api.indlela.co.za
NUXT_PUBLIC_YOCO_PUBLIC_KEY=pk_live_xxx
NUXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 13. Development Workflow

### Getting Started

```bash
# Clone repositories
git clone git@github.com:indlela/api.git indlela-api
git clone git@github.com:indlela/app.git indlela-app

# API Setup
cd indlela-api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend Setup (new terminal)
cd indlela-app
npm install
npm run dev

# Run tests
cd indlela-api && vendor/bin/pest
cd indlela-app && npm test
```

### Git Workflow

```
main ─────────────────────────────────────► Production
  │
  └── develop ────────────────────────────► Staging
        │
        ├── feature/booking-calendar ─────► Feature branches
        ├── feature/offline-sync
        └── fix/payment-webhook
```

### Commit Convention

```
type(scope): description

feat(booking): add recurring booking support
fix(payment): handle Yoco webhook timeout
docs(api): update authentication endpoints
test(provider): add verification flow tests
chore(deps): upgrade Laravel to 12.1
```

### Code Review Checklist

- [ ] Tests pass locally
- [ ] New code has tests
- [ ] API changes documented
- [ ] No sensitive data in commits
- [ ] Migrations are reversible
- [ ] Offline functionality preserved
- [ ] Multi-language strings added

---

## 14. Code Standards

### PHP (Laravel)

```php
// Use Action classes for business logic
app(CreateBooking::class)->execute($customerId, $data);

// Use Form Requests for validation
public function store(StoreBookingRequest $request) {}

// Use Resources for API responses
return new BookingResource($booking);

// Use Enums for status values
enum BookingStatus: string {
    case Pending = 'pending';
    case Accepted = 'accepted';
}

// Follow PSR-12, use Laravel Pint
./vendor/bin/pint
```

### TypeScript (Nuxt/Vue)

```typescript
// Use Composition API with <script setup>
<script setup lang="ts">
const { data, pending } = await useFetch('/api/bookings');
</script>

// Use typed composables
export function useBooking(): UseBookingReturn {}

// Use Pinia for global state
const bookingStore = useBookingStore();

// Follow ESLint + Prettier
npm run lint
```

### API Naming

```
GET    /resources          # List
POST   /resources          # Create
GET    /resources/{id}     # Read
PUT    /resources/{id}     # Update (full)
PATCH  /resources/{id}     # Update (partial)
DELETE /resources/{id}     # Delete
POST   /resources/{id}/action  # Custom action
```

---

## Quick Reference

### Common Commands

```bash
# API
php artisan make:model Booking -mfc    # Model + migration + factory + controller
php artisan make:action CreateBooking  # Action class
php artisan queue:work                 # Process jobs
php artisan schedule:run               # Run scheduler

# Frontend
npx nuxi generate                      # Static build
npx cap sync                           # Sync Capacitor
npx cap run android                    # Run on Android
npm run test                           # Run tests

# Database
php artisan migrate:fresh --seed       # Reset DB
php artisan db:seed --class=TestSeeder # Seed test data
```

### Useful Links

- [Laravel 12 Docs](https://laravel.com/docs/12.x)
- [Nuxt 4 Docs](https://nuxt.com/docs)
- [Ionic 8 Docs](https://ionicframework.com/docs)
- [Capacitor 6 Docs](https://capacitorjs.com/docs)
- [Africa's Talking Docs](https://developers.africastalking.com/)
- [Yoco API Docs](https://developer.yoco.com/)

---

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Maintained By:** Indlela Development Team
