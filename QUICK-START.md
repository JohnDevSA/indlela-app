# Indlela Developer Quick-Start Guide

> Get from zero to running in 30 minutes

---

## Prerequisites

- **PHP 8.3+** with extensions: pdo_pgsql, redis, gd
- **Node.js 20+** with npm
- **Composer 2.x**
- **Docker** (optional, for local services)
- **Git**

---

## 1. Clone & Setup (10 minutes)

```bash
# Create project directory
mkdir indlela && cd indlela

# Clone both repos
git clone https://github.com/indlela/api.git api
git clone https://github.com/indlela/app.git app
```

### Backend Setup

```bash
cd api

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database (use SQLite for quick start)
# Edit .env:
# DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database.sqlite

# Create database file
touch database/database.sqlite

# Run migrations and seed
php artisan migrate --seed

# Start server
php artisan serve
# API running at http://localhost:8000
```

### Frontend Setup

```bash
cd ../app

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env:
# NUXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
# App running at http://localhost:3000
```

---

## 2. Project Structure Overview

```
indlela/
├── api/                    # Laravel 12 Backend
│   ├── app/
│   │   ├── Actions/        # Business logic
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Requests/   # Validation
│   │   │   └── Resources/  # API responses
│   │   ├── Models/
│   │   └── Services/       # External integrations
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
│       └── api.php
│
└── app/                    # Nuxt 4 Frontend
    ├── app/
    │   ├── components/
    │   ├── composables/
    │   ├── pages/
    │   └── layouts/
    ├── stores/             # Pinia stores
    ├── locales/            # i18n translations
    └── service-worker/     # PWA offline
```

---

## 3. Core Development Patterns

### Creating a New Feature

Example: Adding a "Favorite Providers" feature

#### Step 1: Database Migration

```bash
cd api
php artisan make:migration create_favorite_providers_table
```

```php
// database/migrations/xxxx_create_favorite_providers_table.php
Schema::create('favorite_providers', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('customer_id')->constrained()->cascadeOnDelete();
    $table->foreignUuid('provider_id')->constrained()->cascadeOnDelete();
    $table->timestamps();
    
    $table->unique(['customer_id', 'provider_id']);
});
```

```bash
php artisan migrate
```

#### Step 2: Model

```php
// app/Models/FavoriteProvider.php
class FavoriteProvider extends Model
{
    use HasUuids;
    
    protected $fillable = ['customer_id', 'provider_id'];
    
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
    
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }
}
```

#### Step 3: API Endpoints

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{provider}', [FavoriteController::class, 'destroy']);
});
```

```php
// app/Http/Controllers/Api/V1/FavoriteController.php
class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()->customer
            ->favorites()
            ->with('provider.user')
            ->get();
        
        return ProviderResource::collection(
            $favorites->pluck('provider')
        );
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'provider_id' => ['required', 'uuid', 'exists:providers,id'],
        ]);
        
        $request->user()->customer->favorites()->firstOrCreate([
            'provider_id' => $request->provider_id,
        ]);
        
        return response()->json(['message' => 'Added to favorites'], 201);
    }
    
    public function destroy(Request $request, Provider $provider)
    {
        $request->user()->customer
            ->favorites()
            ->where('provider_id', $provider->id)
            ->delete();
        
        return response()->json(['message' => 'Removed from favorites']);
    }
}
```

#### Step 4: Frontend Composable

```typescript
// app/composables/useFavorites.ts
export function useFavorites() {
  const favorites = ref<Provider[]>([]);
  const isLoading = ref(false);
  
  async function fetchFavorites() {
    isLoading.value = true;
    try {
      const { data } = await useApi('/favorites');
      favorites.value = data.value ?? [];
    } finally {
      isLoading.value = false;
    }
  }
  
  async function addFavorite(providerId: string) {
    await useApi('/favorites', {
      method: 'POST',
      body: { provider_id: providerId },
    });
    await fetchFavorites();
  }
  
  async function removeFavorite(providerId: string) {
    await useApi(`/favorites/${providerId}`, {
      method: 'DELETE',
    });
    favorites.value = favorites.value.filter(p => p.id !== providerId);
  }
  
  function isFavorite(providerId: string): boolean {
    return favorites.value.some(p => p.id === providerId);
  }
  
  return {
    favorites: readonly(favorites),
    isLoading: readonly(isLoading),
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
```

#### Step 5: Component

```vue
<!-- app/components/provider/FavoriteButton.vue -->
<template>
  <ion-button
    fill="clear"
    @click.stop="toggleFavorite"
    :disabled="isLoading"
  >
    <ion-icon
      :icon="isFav ? heart : heartOutline"
      :color="isFav ? 'danger' : 'medium'"
    />
  </ion-button>
</template>

<script setup lang="ts">
import { heart, heartOutline } from 'ionicons/icons';

const props = defineProps<{
  providerId: string;
}>();

const { addFavorite, removeFavorite, isFavorite, isLoading } = useFavorites();

const isFav = computed(() => isFavorite(props.providerId));

async function toggleFavorite() {
  if (isFav.value) {
    await removeFavorite(props.providerId);
  } else {
    await addFavorite(props.providerId);
  }
}
</script>
```

---

## 4. Testing Your Code

### Backend Tests (Pest)

```bash
cd api

# Run all tests
vendor/bin/pest

# Run specific test file
vendor/bin/pest tests/Feature/FavoriteTest.php

# Run with coverage
vendor/bin/pest --coverage
```

```php
// tests/Feature/FavoriteTest.php
uses(RefreshDatabase::class);

it('adds provider to favorites', function () {
    $customer = Customer::factory()->create();
    $provider = Provider::factory()->verified()->create();
    
    $this->actingAs($customer->user)
        ->postJson('/api/v1/favorites', [
            'provider_id' => $provider->id,
        ])
        ->assertStatus(201);
    
    expect($customer->favorites)->toHaveCount(1);
});

it('removes provider from favorites', function () {
    $customer = Customer::factory()->create();
    $provider = Provider::factory()->verified()->create();
    
    $customer->favorites()->create(['provider_id' => $provider->id]);
    
    $this->actingAs($customer->user)
        ->deleteJson("/api/v1/favorites/{$provider->id}")
        ->assertOk();
    
    expect($customer->fresh()->favorites)->toHaveCount(0);
});
```

### Frontend Tests (Vitest)

```bash
cd app

# Run tests
npm test

# Run with watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

```typescript
// tests/composables/useFavorites.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('useFavorites', () => {
  it('adds favorite', async () => {
    const { addFavorite, favorites } = useFavorites();
    
    await addFavorite('provider-123');
    
    expect(favorites.value).toContainEqual(
      expect.objectContaining({ id: 'provider-123' })
    );
  });
});
```

---

## 5. Common Tasks

### Adding a New API Endpoint

```bash
# Create controller
php artisan make:controller Api/V1/NewFeatureController

# Create form request
php artisan make:request NewFeature/StoreRequest

# Create resource
php artisan make:resource NewFeatureResource

# Add route to routes/api.php
```

### Adding a New Page

```bash
# Create page file
touch app/pages/new-feature.vue

# Page is auto-registered at /new-feature
```

### Adding Translations

```json
// locales/en.json
{
  "favorites": {
    "title": "My Favorites",
    "add": "Add to favorites",
    "remove": "Remove from favorites",
    "empty": "No favorites yet"
  }
}

// locales/zu.json
{
  "favorites": {
    "title": "Abathandwayo Bami",
    "add": "Engeza kubathandwayo",
    "remove": "Susa kubathandwayo",
    "empty": "Awukabi nabathandwayo"
  }
}
```

### Working with Offline Data

```typescript
// Queue action for offline sync
import { queueAction } from '~/utils/offline-queue';

async function createBookingOffline(data: BookingData) {
  const localId = await queueAction('CREATE_BOOKING', data);
  
  // Optimistically update UI
  bookings.value.push({
    ...data,
    id: localId,
    status: 'pending',
    synced: false,
  });
  
  return localId;
}
```

---

## 6. Debugging Tips

### API Debugging

```php
// Log SQL queries
DB::listen(function ($query) {
    Log::info($query->sql, $query->bindings);
});

// Use dd() for quick debugging
dd($variable);

// Use Laravel Telescope (install if needed)
composer require laravel/telescope --dev
php artisan telescope:install
```

### Frontend Debugging

```typescript
// Vue DevTools - install browser extension

// Log composable state
const { favorites } = useFavorites();
watchEffect(() => {
  console.log('Favorites changed:', favorites.value);
});

// Network tab - check API requests
// Application tab - check IndexedDB for offline data
```

### Mobile Debugging

```bash
# Android - use Chrome DevTools
# Connect device, enable USB debugging
chrome://inspect

# iOS - use Safari Web Inspector
# Enable in Settings > Safari > Advanced > Web Inspector
```

---

## 7. Environment Variables Reference

### API (.env)

```bash
# Essential
APP_KEY=                    # Run php artisan key:generate
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql         # or sqlite for dev
DB_HOST=localhost
DB_DATABASE=indlela
DB_USERNAME=postgres
DB_PASSWORD=

# Redis (optional for dev)
REDIS_HOST=127.0.0.1

# Services (needed for full functionality)
AT_USERNAME=                # Africa's Talking
AT_API_KEY=
YOCO_SECRET_KEY=            # Payments
YOCO_PUBLIC_KEY=
```

### Frontend (.env)

```bash
NUXT_PUBLIC_API_URL=http://localhost:8000
NUXT_PUBLIC_YOCO_PUBLIC_KEY=pk_test_xxx
```

---

## 8. Deployment Checklist

- [ ] All tests pass
- [ ] No console errors in browser
- [ ] Offline mode works
- [ ] All translations added
- [ ] API documentation updated
- [ ] Environment variables set in production
- [ ] Database migrations ready
- [ ] Feature flag if needed

---

## Quick Commands Reference

```bash
# Backend
php artisan serve                    # Start server
php artisan migrate                  # Run migrations
php artisan db:seed                  # Seed database
php artisan route:list               # List all routes
php artisan tinker                   # Interactive shell
vendor/bin/pest                      # Run tests
vendor/bin/pint                      # Format code

# Frontend
npm run dev                          # Start dev server
npm run build                        # Build for production
npm run preview                      # Preview build
npm test                             # Run tests
npm run lint                         # Lint code
npx cap sync                         # Sync native projects
npx cap run android                  # Run on Android
```

---

## Getting Help

1. Check existing documentation in `/docs`
2. Search previous PRs and issues
3. Ask in team Slack channel
4. Check Laravel/Nuxt official docs

---

**Happy coding! 🚀**
