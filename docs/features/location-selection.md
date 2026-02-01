# Location Selection Feature

## Overview

The Location Selection feature provides a comprehensive solution for users (especially service providers) to set their service area during onboarding. It supports three methods:

1. **GPS-based location** - Uses device geolocation with reverse geocoding
2. **Location search** - Search for locations by name (powered by OpenStreetMap Nominatim)
3. **Manual entry** - Direct text input for township and city

## Components

### `LocationSelector.vue`

A reusable Vue component that provides a complete location selection UI.

#### Usage

```vue
<script setup lang="ts">
const township = ref('')
const city = ref('')
</script>

<template>
  <LocationSelector
    v-model:model-township="township"
    v-model:model-city="city"
  />
</template>
```

#### Props

- `modelTownship` (string) - Township/area value (v-model)
- `modelCity` (string) - City value (v-model)

#### Emits

- `update:modelTownship` - Emitted when township changes
- `update:modelCity` - Emitted when city changes

#### Features

- **Current Location Button**: Fetches GPS coordinates and reverse geocodes to address
- **Mode Toggle**: Switch between manual entry and search
- **Search**: Real-time search with debouncing (500ms)
- **Loading States**: Shows spinners during geolocation and geocoding
- **Error Handling**: Displays user-friendly error messages
- **Success Indicator**: Green checkmark when location is successfully set
- **Accessibility**: 44x44px touch targets, proper ARIA labels

## Composables

### `useGeolocation`

Handles device GPS location access using the browser Geolocation API (works on web and Capacitor).

```typescript
const {
  coordinates,
  isLoading,
  error,
  permissionStatus,
  getCurrentLocation,
  watchLocation,
  calculateDistance,
} = useGeolocation()
```

#### Methods

- `getCurrentLocation(): Promise<Coordinates | null>` - Get current GPS position
- `checkPermission(): Promise<boolean>` - Check location permission status
- `watchLocation(callback): () => void` - Watch for location changes
- `calculateDistance(from, to): number` - Calculate distance in km
- `formatDistance(km): string` - Format distance for display
- `isWithinRadius(center, point, radiusKm): boolean` - Check if within radius

### `useReverseGeocode`

Handles reverse geocoding (coordinates → address) and location search using OpenStreetMap Nominatim API.

```typescript
const {
  result,
  isLoading,
  error,
  reverseGeocode,
  searchLocation,
} = useReverseGeocode()
```

#### Methods

- `reverseGeocode(coords): Promise<GeocodingResult | null>` - Convert coordinates to address
- `searchLocation(query): Promise<GeocodingResult[]>` - Search for locations by name

#### Geocoding Result

```typescript
interface GeocodingResult {
  township?: string         // e.g., "Soweto"
  suburb?: string          // e.g., "Orlando West"
  city: string             // e.g., "Johannesburg"
  province?: string        // e.g., "Gauteng"
  country?: string         // e.g., "South Africa"
  formattedAddress: string // Full formatted address
  coordinates?: Coordinates
}
```

## South African Context

### Township Recognition

The `useReverseGeocode` composable includes logic to recognize common South African townships:

- Soweto
- Khayelitsha
- Alexandra
- Tembisa
- Mamelodi
- Umlazi
- Mdantsane
- Mitchells Plain
- Gugulethu
- Nyanga
- And more...

When a known township is detected in the address components, it's properly extracted and set as the township field.

### Location Search Bias

All location searches are biased to South Africa (`countrycodes=za`) to ensure relevant results.

## API Integration

### Nominatim/OpenStreetMap

The feature uses the free Nominatim API for geocoding:

- **Endpoint**: `https://nominatim.openstreetmap.org`
- **Rate Limit**: 1 request/second
- **User-Agent**: `Indlela/1.0.0` (required by Nominatim)
- **No API Key Required**: Free tier is sufficient for our use case

#### Rate Limiting

To comply with Nominatim's rate limits:
- Search queries are debounced (500ms)
- Only search when query length >= 3 characters
- User-Agent header is always included

## Permission Handling

### Browser Permissions

The component handles browser geolocation permissions gracefully:

1. **Granted**: Location access works immediately
2. **Prompt**: User is prompted on first use
3. **Denied**: Shows error message suggesting manual entry or search

### Error Messages

All error messages are internationalized:

- `location.permission_denied` - Location permission denied
- `location.position_unavailable` - Unable to get position
- `location.timeout` - Request timed out

## Mobile Considerations

### Capacitor Geolocation

While the current implementation uses the browser Geolocation API (which works on Capacitor), you can optionally upgrade to the native Capacitor Geolocation plugin:

```typescript
import { Geolocation } from '@capacitor/geolocation'

// Get current position
const coordinates = await Geolocation.getCurrentPosition()
```

### Platform Differences

- **Web/PWA**: Uses browser Geolocation API
- **Android**: Native GPS via Capacitor
- **iOS**: Native GPS via Capacitor (requires NSLocationWhenInUseUsageDescription in Info.plist)

## Offline Behavior

The location selector requires internet connectivity for:
- Reverse geocoding (coordinates → address)
- Location search

**Offline Fallback**: Manual entry mode always works offline.

## Accessibility

### Touch Targets

All interactive elements meet the 44x44px minimum:
- Current Location button: 44px height
- Mode toggle buttons: 44px height
- Search results: 60px height

### Screen Reader Support

- Proper semantic HTML
- ARIA labels on all interactive elements
- Loading state announcements
- Error message announcements

## Styling

The component uses:
- Ionic CSS variables for consistency
- Transparent backgrounds with white overlays
- Proper loading states with spinners
- Success states with green indicators
- Error states with red borders and icons

## Testing

### Manual Testing Checklist

- [ ] Current location button works
- [ ] Shows loading state during GPS fetch
- [ ] Shows loading state during reverse geocoding
- [ ] Handles permission denied gracefully
- [ ] Search returns results for South African locations
- [ ] Search results are selectable
- [ ] Manual entry works
- [ ] Mode toggle switches correctly
- [ ] All error states display properly
- [ ] Success indicator appears on location set
- [ ] Works on 320px width (small mobile)
- [ ] Works on tablet widths
- [ ] Touch targets are >= 44px

### Integration Testing

```typescript
import { mount } from '@vue/test-utils'
import LocationSelector from '~/components/LocationSelector.vue'

describe('LocationSelector', () => {
  it('emits township and city updates', async () => {
    const wrapper = mount(LocationSelector, {
      props: {
        modelTownship: '',
        modelCity: '',
      },
    })

    // Test implementation
  })
})
```

## Internationalization

The component supports all 6 Indlela languages:

- English (en)
- isiZulu (zu)
- isiXhosa (xh)
- Afrikaans (af)
- Sesotho (st)
- Setswana (tn)

### Translation Keys

```json
{
  "location": {
    "use_current": "Use my current location",
    "getting_location": "Getting your location...",
    "manual_entry": "Manual Entry",
    "search": "Search",
    "township": "Township/Area",
    "city": "City",
    "search_placeholder": "Search for your location...",
    "helper_text": "We'll use this to connect you with nearby customers and providers."
  }
}
```

## Future Enhancements

1. **Cache geocoding results** - Use IndexedDB to cache reverse geocode results
2. **Native Capacitor Geolocation** - Use native plugins for better accuracy
3. **Map view** - Add interactive map for location selection
4. **Recent locations** - Remember recently selected locations
5. **Location validation** - Verify location is within South Africa
6. **Offline maps** - Pre-download township boundaries for offline use

## Performance

### Optimizations

- Debounced search (500ms)
- Lazy load of geolocation APIs
- Minimal re-renders with computed properties
- Efficient state management

### Bundle Size

- `useGeolocation`: ~2KB
- `useReverseGeocode`: ~3KB
- `LocationSelector.vue`: ~5KB
- **Total**: ~10KB (minified)

## Security

### Privacy Considerations

- Location data never stored without user consent
- GPS coordinates only used for reverse geocoding
- No location tracking
- User can always use manual entry

### API Security

- Uses HTTPS for all API calls
- No API keys exposed (Nominatim is key-free)
- Rate limiting respected

## Troubleshooting

### Common Issues

**Issue**: "Location permission denied"
- **Solution**: Instruct user to enable location in device settings

**Issue**: "Unable to determine location"
- **Solution**: Suggest using search or manual entry, check if location services are enabled

**Issue**: Search returns no results
- **Solution**: Ensure query is at least 3 characters, check internet connectivity

**Issue**: Reverse geocoding fails
- **Solution**: Fall back to manual entry, check Nominatim API status

## Support

For issues or questions:
- Check the [API Integration Guide](../guides/api-integration.md)
- Review [Offline Patterns](../architecture/offline-patterns.md)
- Contact the development team
