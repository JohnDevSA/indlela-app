// Mock data for UI development without backend
import type {
  User,
  Provider,
  Service,
  ServiceCategory,
  Booking,
  Review,
} from '~/types'

// ============================================
// Mock User
// ============================================
export const mockUser: User = {
  id: 'user-001',
  phone: '+27821234567',
  email: 'thabo@example.com',
  name: 'Thabo Molefe',
  role: 'customer',
  locale: 'en',
  avatar: undefined,
  phoneVerifiedAt: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
}

// ============================================
// Mock Service Categories
// ============================================
export const mockCategories: ServiceCategory[] = [
  { id: 'cat-1', name: 'Home Services', slug: 'home-services', icon: '🏠', servicesCount: 5 },
  { id: 'cat-2', name: 'Repairs', slug: 'repairs', icon: '🔧', servicesCount: 4 },
  { id: 'cat-3', name: 'Personal Care', slug: 'personal-care', icon: '💇', servicesCount: 3 },
  { id: 'cat-4', name: 'Education', slug: 'education', icon: '📚', servicesCount: 2 },
]

// ============================================
// Mock Services
// ============================================
export const mockServices: Service[] = [
  { id: 'srv-1', categoryId: 'cat-1', name: 'House Cleaning', description: 'Professional home cleaning', basePrice: 350, icon: '🧹' },
  { id: 'srv-2', categoryId: 'cat-1', name: 'Laundry Service', description: 'Wash, dry and fold', basePrice: 150, icon: '👕' },
  { id: 'srv-3', categoryId: 'cat-1', name: 'Gardening', description: 'Lawn care and maintenance', basePrice: 250, icon: '🌱' },
  { id: 'srv-4', categoryId: 'cat-2', name: 'Plumbing', description: 'Fix leaks and installations', basePrice: 400, icon: '🔧' },
  { id: 'srv-5', categoryId: 'cat-2', name: 'Electrical', description: 'Electrical repairs and installations', basePrice: 450, icon: '⚡' },
  { id: 'srv-6', categoryId: 'cat-2', name: 'Appliance Repair', description: 'Fix household appliances', basePrice: 300, icon: '🔌' },
  { id: 'srv-7', categoryId: 'cat-3', name: 'Haircut', description: 'Professional haircuts', basePrice: 80, icon: '💇' },
  { id: 'srv-8', categoryId: 'cat-3', name: 'Braiding', description: 'Hair braiding services', basePrice: 200, icon: '👩' },
  { id: 'srv-9', categoryId: 'cat-4', name: 'Tutoring', description: 'Academic tutoring', basePrice: 150, icon: '📖' },
  { id: 'srv-10', categoryId: 'cat-4', name: 'Music Lessons', description: 'Learn instruments', basePrice: 200, icon: '🎸' },
]

// ============================================
// Mock Providers
// ============================================
export const mockProviders: Provider[] = [
  {
    id: 'prov-1',
    userId: 'user-prov-1',
    user: {
      id: 'user-prov-1',
      phone: '+27831234567',
      name: 'Thandi Mokoena',
      role: 'provider',
      locale: 'en',
      avatar: undefined,
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    bio: 'Professional cleaner with 5 years experience. I take pride in making homes sparkle!',
    rating: 4.8,
    totalReviews: 127,
    totalJobs: 245,
    status: 'verified',
    verifiedAt: '2023-06-15T00:00:00Z',
    serviceRadiusKm: 15,
    services: [
      { id: 'ps-1', providerId: 'prov-1', serviceId: 'srv-1', service: mockServices[0], price: 350, duration: 180 },
      { id: 'ps-2', providerId: 'prov-1', serviceId: 'srv-2', service: mockServices[1], price: 150, duration: 120 },
    ],
    createdAt: '2023-06-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prov-2',
    userId: 'user-prov-2',
    user: {
      id: 'user-prov-2',
      phone: '+27841234567',
      name: 'Sipho Ndlovu',
      role: 'provider',
      locale: 'zu',
      avatar: undefined,
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    bio: 'Master plumber with 10 years experience. No job too big or small. Available 24/7 for emergencies.',
    rating: 4.9,
    totalReviews: 89,
    totalJobs: 156,
    status: 'verified',
    verifiedAt: '2023-03-15T00:00:00Z',
    serviceRadiusKm: 20,
    services: [
      { id: 'ps-3', providerId: 'prov-2', serviceId: 'srv-4', service: mockServices[3], price: 400, duration: 120 },
    ],
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prov-3',
    userId: 'user-prov-3',
    user: {
      id: 'user-prov-3',
      phone: '+27851234567',
      name: 'Nomsa Dlamini',
      role: 'provider',
      locale: 'xh',
      avatar: undefined,
      createdAt: '2023-08-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    bio: 'Certified electrician. Specializing in home wiring, repairs, and solar installations.',
    rating: 4.7,
    totalReviews: 56,
    totalJobs: 98,
    status: 'verified',
    verifiedAt: '2023-08-15T00:00:00Z',
    serviceRadiusKm: 10,
    services: [
      { id: 'ps-4', providerId: 'prov-3', serviceId: 'srv-5', service: mockServices[4], price: 450, duration: 90 },
    ],
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prov-4',
    userId: 'user-prov-4',
    user: {
      id: 'user-prov-4',
      phone: '+27861234567',
      name: 'Lindiwe Khumalo',
      role: 'provider',
      locale: 'en',
      avatar: undefined,
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    bio: 'Hair stylist and braider. Specializing in African styles. Your hair is my canvas!',
    rating: 4.9,
    totalReviews: 203,
    totalJobs: 312,
    status: 'verified',
    verifiedAt: '2023-05-15T00:00:00Z',
    serviceRadiusKm: 8,
    services: [
      { id: 'ps-5', providerId: 'prov-4', serviceId: 'srv-7', service: mockServices[6], price: 100, duration: 45 },
      { id: 'ps-6', providerId: 'prov-4', serviceId: 'srv-8', service: mockServices[7], price: 250, duration: 180 },
    ],
    createdAt: '2023-05-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prov-5',
    userId: 'user-prov-5',
    user: {
      id: 'user-prov-5',
      phone: '+27871234567',
      name: 'Bongani Zulu',
      role: 'provider',
      locale: 'zu',
      avatar: undefined,
      createdAt: '2023-09-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    bio: 'Experienced gardener and landscaper. I can transform any outdoor space into a beautiful garden.',
    rating: 4.6,
    totalReviews: 45,
    totalJobs: 78,
    status: 'verified',
    verifiedAt: '2023-09-15T00:00:00Z',
    serviceRadiusKm: 12,
    services: [
      { id: 'ps-7', providerId: 'prov-5', serviceId: 'srv-3', service: mockServices[2], price: 280, duration: 150 },
    ],
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

// ============================================
// Mock Bookings
// ============================================
export const mockBookings: Booking[] = [
  {
    id: 'book-1',
    customerId: 'cust-001',
    providerId: 'prov-1',
    provider: mockProviders[0],
    serviceId: 'srv-1',
    service: mockServices[0],
    locationId: 'loc-1',
    location: {
      id: 'loc-1',
      lat: -26.2041,
      lng: 28.0473,
      address: '123 Vilakazi Street',
      township: 'Soweto',
      city: 'Johannesburg',
      province: 'Gauteng',
    },
    status: 'completed',
    scheduledAt: '2024-01-10T09:00:00Z',
    startedAt: '2024-01-10T09:15:00Z',
    completedAt: '2024-01-10T12:30:00Z',
    durationMinutes: 195,
    quotedAmount: 350,
    finalAmount: 350,
    commissionAmount: 42,
    providerPayout: 308,
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-10T12:30:00Z',
  },
  {
    id: 'book-2',
    customerId: 'cust-001',
    providerId: 'prov-2',
    provider: mockProviders[1],
    serviceId: 'srv-4',
    service: mockServices[3],
    locationId: 'loc-1',
    location: {
      id: 'loc-1',
      lat: -26.2041,
      lng: 28.0473,
      address: '123 Vilakazi Street',
      township: 'Soweto',
      city: 'Johannesburg',
      province: 'Gauteng',
    },
    status: 'accepted',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    quotedAmount: 400,
    customerNotes: 'Leaking tap in the kitchen',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'book-3',
    customerId: 'cust-001',
    providerId: 'prov-4',
    provider: mockProviders[3],
    serviceId: 'srv-8',
    service: mockServices[7],
    locationId: 'loc-2',
    location: {
      id: 'loc-2',
      lat: -26.1952,
      lng: 28.0343,
      address: '45 Chris Hani Road',
      township: 'Orlando',
      city: 'Johannesburg',
      province: 'Gauteng',
    },
    status: 'pending',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    quotedAmount: 250,
    customerNotes: 'Box braids, medium length',
    createdAt: '2024-01-22T16:00:00Z',
    updatedAt: '2024-01-22T16:00:00Z',
  },
]

// ============================================
// Mock Reviews
// ============================================
export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    bookingId: 'book-1',
    customerId: 'cust-001',
    providerId: 'prov-1',
    provider: mockProviders[0],
    rating: 5,
    comment: 'Thandi did an amazing job! My house has never been cleaner. Will definitely book again.',
    createdAt: '2024-01-10T15:00:00Z',
  },
  {
    id: 'rev-2',
    bookingId: 'book-old-1',
    customerId: 'cust-002',
    providerId: 'prov-1',
    provider: mockProviders[0],
    rating: 5,
    comment: 'Very professional and thorough. Highly recommended!',
    response: 'Thank you so much! It was a pleasure working in your home.',
    createdAt: '2024-01-05T12:00:00Z',
  },
  {
    id: 'rev-3',
    bookingId: 'book-old-2',
    customerId: 'cust-003',
    providerId: 'prov-2',
    provider: mockProviders[1],
    rating: 5,
    comment: 'Sipho fixed our burst pipe in no time. Saved us from a disaster!',
    createdAt: '2024-01-12T18:00:00Z',
  },
]

// ============================================
// Helper to simulate API delay
// ============================================
export const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================
// Popular services for home screen
// ============================================
export const popularServices = [
  { id: 'srv-1', name: 'cleaning', icon: '🧹', count: 245 },
  { id: 'srv-4', name: 'plumbing', icon: '🔧', count: 89 },
  { id: 'srv-5', name: 'electrical', icon: '⚡', count: 67 },
  { id: 'srv-3', name: 'gardening', icon: '🌱', count: 123 },
  { id: 'srv-7', name: 'beauty', icon: '💇', count: 156 },
  { id: 'srv-6', name: 'appliance_repair', icon: '🔌', count: 34 },
]

// ============================================
// Nearby providers for home screen
// ============================================
export const nearbyProviders = mockProviders.slice(0, 4).map((p, i) => ({
  id: p.id,
  name: p.user?.name || 'Provider',
  service: p.services?.[0]?.service?.name || 'Service',
  rating: p.rating,
  reviews: p.totalReviews,
  distance: `${(0.5 + i * 0.7).toFixed(1)}km`,
  avatar: p.user?.avatar,
}))