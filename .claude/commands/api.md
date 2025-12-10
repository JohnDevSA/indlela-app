# API Endpoint Documentation

Document and generate types for a new API endpoint.

## Instructions

When the user runs `/api <method> <path>`, document the API endpoint and generate TypeScript types.

## API Base

All endpoints are prefixed with `/api/v1/` and use the Laravel backend.

## Documentation Format

For each endpoint, document:

1. **URL**: Full path
2. **Method**: GET, POST, PUT, PATCH, DELETE
3. **Authentication**: Required? What role?
4. **Request Body**: JSON schema (for POST/PUT/PATCH)
5. **Response**: Success and error responses
6. **Example**: cURL and TypeScript usage

## Example

For `/api POST /bookings`:

### Endpoint Documentation

```markdown
## Create Booking

**URL**: `POST /api/v1/bookings`

**Authentication**: Required (Bearer token)

**Headers**:
- `Authorization: Bearer {token}`
- `Content-Type: application/json`
- `Accept-Language: en` (optional, for localized responses)

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| service_id | uuid | Yes | Service being booked |
| provider_id | uuid | Yes | Provider to book |
| location | object | Yes | Service location |
| location.lat | number | Yes | Latitude |
| location.lng | number | Yes | Longitude |
| location.address | string | Yes | Street address |
| scheduled_at | datetime | Yes | ISO 8601 datetime |
| notes | string | No | Customer notes |
| offline_id | string | No | Local ID for offline sync |

### Response (201 Created)

```json
{
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "status": "pending",
    "service": {...},
    "provider": {...},
    "customer": {...},
    "location": {...},
    "scheduled_at": "2025-01-15T09:00:00+02:00",
    "quoted_amount": 450.00,
    "commission_amount": 54.00,
    "created_at": "2025-01-10T14:30:00+02:00"
  }
}
```

### Error Responses

| Code | Reason |
|------|--------|
| 401 | Unauthorized - invalid/missing token |
| 422 | Validation error |
| 404 | Provider/Service not found |
```

### TypeScript Types

```typescript
// types/api/booking.ts

export interface CreateBookingRequest {
  service_id: string
  provider_id: string
  location: {
    lat: number
    lng: number
    address: string
  }
  scheduled_at: string
  notes?: string
  offline_id?: string
}

export interface CreateBookingResponse {
  data: Booking
}
```

### Composable Usage

```typescript
// In useBooking.ts
const createBooking = async (data: CreateBookingRequest) => {
  return await $api<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: data,
  })
}
```

## Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {
      "field_name": ["Error message"]
    }
  }
}
```

Now document the API endpoint based on the user's input.