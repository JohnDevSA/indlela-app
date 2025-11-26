# ADR-001: Offline-First Architecture

**Status:** Accepted
**Date:** 2025-01-15
**Deciders:** Development Team
**Context:** Initial architecture design for Indlela mobile app

## Context and Problem Statement

South African township residents face significant connectivity challenges:

- **Expensive Data:** Mobile data costs are high relative to average income
- **Unreliable Networks:** Coverage is spotty in many township areas
- **Slow Speeds:** 3G is common, 4G/5G less prevalent
- **Network Congestion:** Peak hours often see degraded service

Traditional "online-first" mobile apps that require constant internet connectivity are:
- Frustrating to use in areas with poor coverage
- Expensive to use due to data costs
- Inaccessible during network outages
- Not aligned with user behavior patterns

The app must work reliably regardless of network conditions.

## Decision

We will implement an **offline-first architecture** where:

1. **All critical user actions work offline** - Create bookings, view providers, update profiles
2. **Data is stored locally first** using IndexedDB (via Dexie)
3. **Actions are queued** when offline and synced when connectivity returns
4. **UI updates optimistically** - show changes immediately, sync in background
5. **Cache API responses** aggressively to minimize network requests

### Technical Implementation

#### Local Storage Layer
- **IndexedDB** via Dexie for structured data storage
- **Three main tables:**
  - `queue` - Pending API actions (POST, PUT, DELETE)
  - `providers` - Cached provider data
  - `bookings` - User bookings with sync status

#### Queue System
- Actions queued with temporary local IDs (`local-{timestamp}-{uuid}`)
- FIFO processing when network available
- Retry with exponential backoff (max 5 attempts)
- User notification on permanent failures

#### Cache Strategy
- **Service categories**: Cache for 24 hours (rarely change)
- **Provider listings**: Network-first with 30-minute cache fallback
- **User bookings**: Persistent cache, always available offline
- **Static assets**: Aggressive caching via service worker

## Consequences

### Positive

- ✅ **Improved User Experience:** App remains usable without network
- ✅ **Reduced Data Costs:** Fewer API requests, more caching
- ✅ **Better Performance:** Instant UI feedback, background sync
- ✅ **Increased Accessibility:** Serves users in low-connectivity areas
- ✅ **Competitive Advantage:** Most competitors require constant connectivity

### Negative

- ❌ **Complexity:** More complex state management
- ❌ **Sync Conflicts:** Possible data conflicts between local and server
- ❌ **Storage Limits:** IndexedDB has browser quota limits
- ❌ **Testing Overhead:** Must test both online and offline scenarios
- ❌ **Debugging Difficulty:** Harder to debug async sync issues

### Risks and Mitigations

#### Risk: Sync Conflicts
**Mitigation:**
- Server is authoritative for booking status
- Last-write-wins for user profile updates
- Conflict resolution UI for ambiguous cases

#### Risk: Storage Quota Exceeded
**Mitigation:**
- Periodic cleanup of stale cache data
- Limit provider cache to 100 most recent
- Compress large data before storing
- Monitor quota usage and warn users

#### Risk: Data Inconsistency
**Mitigation:**
- Validate queued actions before sync
- Re-fetch critical data after sync
- Show sync status clearly to users
- Allow manual retry for failed syncs

## Alternatives Considered

### Alternative 1: Traditional Online-Only
**Rejected because:**
- Excludes users in low-connectivity areas
- Poor user experience during outages
- Higher data costs
- Slower perceived performance

### Alternative 2: Service Workers Only
**Rejected because:**
- Limited to GET request caching
- Can't queue POST/PUT/DELETE actions
- No structured data storage
- Insufficient for complex offline scenarios

### Alternative 3: LocalStorage
**Rejected because:**
- 5-10MB storage limit
- Synchronous API blocks UI
- No indexing or querying
- Not suitable for structured data

### Alternative 4: Native SQLite
**Rejected because:**
- Requires separate implementation per platform
- More complex Capacitor bridge code
- IndexedDB sufficient for our needs
- Would increase maintenance burden

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Dexie database schema
- [ ] Implement basic queue system
- [ ] Create useOffline composable
- [ ] Add offline indicator UI

### Phase 2: Core Features (Week 3-4)
- [ ] Offline provider caching
- [ ] Offline booking creation
- [ ] Sync queue processing
- [ ] Error handling and retries

### Phase 3: Polish (Week 5-6)
- [ ] Conflict resolution
- [ ] Cache cleanup
- [ ] Performance optimization
- [ ] Comprehensive testing

## Success Metrics

We will measure success by:

1. **Offline Functionality:** 100% of critical features work offline
2. **Sync Success Rate:** >99% of queued actions sync successfully
3. **Data Usage:** <50% data usage vs. online-only approach
4. **User Satisfaction:** Positive feedback in user interviews
5. **Cache Hit Rate:** >80% of provider requests served from cache

## References

- [Building Offline-First Apps](https://offlinefirst.org/)
- [Dexie.js Documentation](https://dexie.org/)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)
- [Working with Quota on Mobile Browsers](https://web.dev/storage-for-the-web/)

## Notes

This decision aligns with Indlela's mission to serve township communities where connectivity cannot be assumed. While it adds complexity, the user experience benefits far outweigh the development costs.

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2025-01-15 | Dev Team | Initial ADR created and accepted |
