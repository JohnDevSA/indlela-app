// Indlela Type Definitions

// ============================================
// User & Authentication Types
// ============================================

export type UserRole = 'customer' | 'provider' | 'admin'

export interface User {
  id: string
  phone: string
  email?: string
  name: string
  role: UserRole
  locale: SupportedLocale
  avatar?: string
  phoneVerifiedAt?: string
  emailVerifiedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface OtpRequest {
  phone: string
}

export interface OtpVerification {
  phone: string
  otp: string
}

export interface AuthResponse {
  token: string
  user: User
  isNewUser: boolean
}

// ============================================
// Provider Types
// ============================================

export type ProviderStatus = 'pending' | 'verified' | 'suspended' | 'inactive'

export interface Provider {
  id: string
  userId: string
  user?: User
  locationId?: string
  location?: Location
  bio?: string
  idNumber?: string
  idDocument?: string
  rating: number
  totalReviews: number
  totalJobs: number
  status: ProviderStatus
  verifiedAt?: string
  availability?: WeeklyAvailability
  serviceRadiusKm: number
  services?: ProviderService[]
  createdAt: string
  updatedAt: string
}

export interface ProviderService {
  id: string
  providerId: string
  serviceId: string
  service?: Service
  price: number
  duration: number // in minutes
}

export interface WeeklyAvailability {
  monday?: DayAvailability
  tuesday?: DayAvailability
  wednesday?: DayAvailability
  thursday?: DayAvailability
  friday?: DayAvailability
  saturday?: DayAvailability
  sunday?: DayAvailability
}

export interface DayAvailability {
  enabled: boolean
  start: string // HH:mm format
  end: string // HH:mm format
}

// ============================================
// Service Types
// ============================================

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  icon: string
  description?: string
  servicesCount: number
}

export interface Service {
  id: string
  categoryId: string
  category?: ServiceCategory
  name: string
  description?: string
  basePrice: number
  icon?: string
}

// ============================================
// Customer Types
// ============================================

export interface Customer {
  id: string
  userId: string
  user?: User
  address?: string
  locationId?: string
  location?: Location
  preferences?: CustomerPreferences
  createdAt: string
}

export interface CustomerPreferences {
  notificationsEnabled: boolean
  smsNotifications: boolean
  emailNotifications: boolean
  preferredLanguage: SupportedLocale
}

// ============================================
// Booking Types
// ============================================

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export interface Booking {
  id: string
  customerId: string
  customer?: Customer
  providerId?: string
  provider?: Provider
  serviceId: string
  service?: Service
  locationId: string
  location?: Location
  status: BookingStatus
  scheduledAt: string
  startedAt?: string
  completedAt?: string
  durationMinutes?: number
  quotedAmount: number
  finalAmount?: number
  commissionAmount?: number
  providerPayout?: number
  customerNotes?: string
  providerNotes?: string
  cancellationReason?: string
  offlineId?: string
  syncedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingPayload {
  serviceId: string
  providerId: string
  location: LocationInput
  scheduledAt: string
  notes?: string
  offlineId?: string
}

export interface UpdateBookingPayload {
  scheduledAt?: string
  notes?: string
  status?: BookingStatus
}

// ============================================
// Location Types
// ============================================

export interface Location {
  id: string
  lat: number
  lng: number
  address: string
  township?: string
  suburb?: string
  city: string
  province?: string
  postalCode?: string
}

export interface LocationInput {
  lat: number
  lng: number
  address: string
}

export interface Coordinates {
  lat: number
  lng: number
}

// ============================================
// Review Types
// ============================================

export interface Review {
  id: string
  bookingId: string
  booking?: Booking
  customerId: string
  customer?: Customer
  providerId: string
  provider?: Provider
  rating: number // 1-5
  comment?: string
  response?: string // Provider's response
  createdAt: string
}

export interface CreateReviewPayload {
  bookingId: string
  rating: number
  comment?: string
}

// ============================================
// Payment Types
// ============================================

export type PaymentMethod = 'yoco' | 'ozow' | 'cash'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Payment {
  id: string
  bookingId: string
  booking?: Booking
  amount: number
  method: PaymentMethod
  gatewayRef?: string
  status: PaymentStatus
  paidAt?: string
  createdAt: string
}

export interface Payout {
  id: string
  providerId: string
  provider?: Provider
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  reference?: string
  processedAt?: string
  createdAt: string
}

export interface PaymentCheckout {
  checkoutId: string
  redirectUrl: string
}

// ============================================
// Offline & Sync Types
// ============================================

export type OfflineActionType =
  | 'CREATE_BOOKING'
  | 'UPDATE_BOOKING'
  | 'UPDATE_STATUS'
  | 'CREATE_REVIEW'

export interface QueuedAction {
  id?: number
  type: OfflineActionType
  payload: Record<string, unknown>
  localId: string
  createdAt: Date
  retryCount: number
  lastError?: string
}

export interface SyncResult {
  localId: string
  serverId?: string
  status: 'synced' | 'already_synced' | 'failed'
  error?: string
  data?: unknown
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
  links: {
    first: string
    last: string
    prev?: string
    next?: string
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

// ============================================
// i18n Types
// ============================================

export type SupportedLocale = 'en' | 'zu' | 'xh' | 'af' | 'st' | 'tn'

export interface LocaleInfo {
  code: SupportedLocale
  name: string
  nativeName: string
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zu', name: 'isiZulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa', nativeName: 'isiXhosa' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho' },
  { code: 'tn', name: 'Setswana', nativeName: 'Setswana' },
]

// ============================================
// Business Constants
// ============================================

export const BUSINESS_RULES = {
  COMMISSION_RATE: 0.12, // 12%
  BOOKING_FEE_MIN: 10, // R10
  BOOKING_FEE_MAX: 15, // R15
  OTP_EXPIRY_MINUTES: 5,
  DEFAULT_SERVICE_RADIUS_KM: 10,
  MAX_RETRY_ATTEMPTS: 5,
  MIN_BOOKING_ADVANCE_HOURS: 2,
} as const

// ============================================
// Utility Types
// ============================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]