# Button Usage Patterns

Standard patterns for button usage across the Indlela app. These patterns ensure consistency, accessibility, and optimal UX across all platforms (PWA, Android, iOS).

> **Design Note:** All buttons use `--radius-button` (20px) for a soft, pill-like appearance that reflects Indlela's friendly, approachable brand identity. See [Design Tokens](./design-tokens.md#border-radius) for details.

## Component Options

Indlela provides two button component options:

1. **UiButton** - Custom Vue component (recommended for new features)
2. **IonButton** - Ionic's native button component (for Ionic-specific features)

### When to Use UiButton

✅ **Use UiButton for:**
- Page-level action buttons (primary CTAs)
- Form submit/cancel buttons
- Modal/dialog actions
- Card actions
- Any custom UI outside Ionic patterns

**Benefits:**
- Consistent with Indlela design system
- Full TypeScript support
- Matches design tokens exactly
- Loading states built-in
- Icon support

**Example:**
```vue
<UiButton variant="primary" @click="handleSubmit">
  Submit Booking
</UiButton>
```

### When to Use IonButton

✅ **Use IonButton for:**
- Toolbar/header buttons
- Tab bar buttons
- FAB (Floating Action Button)
- Ionic-specific UI patterns
- When you need Ionic's native haptics/ripple

**Example:**
```vue
<IonButton expand="block" @click="handleSubmit">
  Submit Booking
</IonButton>
```

---

## Button Sizes & Touch Targets

All buttons must meet **44x44px minimum touch target** for accessibility.

### UiButton Sizes

| Size | Height | Use Case |
|------|--------|----------|
| `sm` | 36px | Dense UIs, secondary actions, tags |
| `md` | 44px | **Default** - Most actions |
| `lg` | 56px | Primary CTAs, important actions |

**Important:** `sm` buttons (36px) should only be used when:
- They are not the primary action
- Clear visual affordance exists (e.g., inside a larger card)
- Adequate spacing prevents mis-taps

```vue
<!-- Default size (44px) - recommended -->
<UiButton>Book Service</UiButton>

<!-- Large for primary CTAs -->
<UiButton size="lg">Confirm Booking</UiButton>

<!-- Small for secondary actions (use sparingly) -->
<UiButton size="sm" variant="ghost">Cancel</UiButton>
```

---

## Button Variants

### Primary
**Use for:** Main action, highest priority
```vue
<UiButton variant="primary">
  Book Now
</UiButton>
```

### Secondary
**Use for:** Supporting actions, alternative paths
```vue
<UiButton variant="secondary">
  View Details
</UiButton>
```

### Outline
**Use for:** Neutral actions, cancel buttons
```vue
<UiButton variant="outline">
  Cancel
</UiButton>
```

### Ghost
**Use for:** Tertiary actions, subtle interactions
```vue
<UiButton variant="ghost">
  Skip
</UiButton>
```

### Danger
**Use for:** Destructive actions (delete, cancel booking)
```vue
<UiButton variant="danger">
  Delete Booking
</UiButton>
```

---

## Common Patterns

### 1. Page-Level Actions (Bottom of Page)

**Pattern:** Use `PageActions` wrapper component
**Touch target:** 44px minimum
**Spacing:** 12px gap between buttons

```vue
<PageActions>
  <UiButton variant="primary" :full-width="true" @click="confirm">
    Confirm Booking
  </UiButton>
  <UiButton variant="outline" :full-width="true" @click="cancel">
    Cancel
  </UiButton>
</PageActions>
```

**Features:**
- Automatic safe area padding for iOS/Android
- Consistent vertical spacing
- Sticky positioning option
- Tab bar clearance built-in

**Usage Guidelines:**
- ✅ Booking confirmation pages
- ✅ Form submit/cancel
- ✅ Multi-step flows
- ❌ Inline form fields (use regular buttons)
- ❌ Card actions (use buttons directly in card)

---

### 2. Inline Form Buttons

**Pattern:** Buttons within form fields or small containers
**Touch target:** 44px minimum
**Spacing:** 8-12px between elements

```vue
<form class="space-y-4">
  <UiInput v-model="name" label="Full Name" />
  <UiInput v-model="phone" label="Phone Number" />

  <div class="flex gap-3 mt-6">
    <UiButton variant="outline" @click="cancel" class="flex-1">
      Cancel
    </UiButton>
    <UiButton variant="primary" @click="save" class="flex-1">
      Save
    </UiButton>
  </div>
</form>
```

**CSS Classes:**
- `flex gap-3` - 12px gap between buttons
- `flex-1` - Equal width buttons
- `mt-6` - 24px top margin for visual separation

---

### 3. Icon-Only Buttons

**Pattern:** Buttons with only an icon (no text)
**Touch target:** 44x44px enforced
**Use case:** Favorite, share, menu, back navigation

```vue
<!-- Icon-only (automatically becomes 44x44px) -->
<UiButton icon="heroicons:heart" />

<!-- Icon-only with label for accessibility -->
<UiButton
  icon="heroicons:share"
  aria-label="Share provider"
/>

<!-- Icon with text -->
<UiButton icon="heroicons:phone" icon-position="left">
  Call Now
</UiButton>
```

**Accessibility Note:** Always provide `aria-label` for icon-only buttons.

---

### 4. Button Groups

**Pattern:** Multiple related buttons in a row
**Spacing:** 8-12px gap
**Touch target:** 44px minimum

```vue
<!-- Horizontal group -->
<div class="flex gap-3">
  <UiButton variant="outline" icon="heroicons:phone">
    Call
  </UiButton>
  <UiButton variant="outline" icon="heroicons:chat-bubble-left">
    Message
  </UiButton>
  <UiButton variant="primary" icon="heroicons:calendar">
    Book
  </UiButton>
</div>

<!-- Segmented control style -->
<div class="flex gap-2">
  <UiButton
    variant="outline"
    :class="{ 'bg-neutral-100': view === 'grid' }"
    @click="view = 'grid'"
  >
    Grid
  </UiButton>
  <UiButton
    variant="outline"
    :class="{ 'bg-neutral-100': view === 'list' }"
    @click="view = 'list'"
  >
    List
  </UiButton>
</div>
```

---

### 5. Card Action Buttons

**Pattern:** Buttons within cards
**Placement:** Bottom of card or inline with content
**Spacing:** 12-16px from card edges

```vue
<UiCard>
  <div class="flex gap-3 mb-3">
    <UiAvatar :src="provider.avatar" />
    <div class="flex-1">
      <h3>{{ provider.name }}</h3>
      <p>{{ provider.service }}</p>
    </div>
  </div>

  <!-- Card actions -->
  <div class="flex gap-2 mt-4">
    <UiButton variant="ghost" size="sm" icon="heroicons:heart" />
    <UiButton variant="outline" class="flex-1">
      View Profile
    </UiButton>
    <UiButton variant="primary" class="flex-1">
      Book Now
    </UiButton>
  </div>
</UiCard>
```

---

### 6. Loading States

**Pattern:** Button with loading indicator
**Behavior:** Disabled during loading, shows spinner

```vue
<UiButton
  variant="primary"
  :loading="isSubmitting"
  :disabled="!isValid"
  @click="handleSubmit"
>
  {{ isSubmitting ? 'Submitting...' : 'Submit Booking' }}
</UiButton>
```

**Built-in Features:**
- Automatic spinner icon
- Disabled state during loading
- Prevents double-submission

---

### 7. Disabled States

**Pattern:** Buttons that are temporarily unavailable

```vue
<UiButton
  variant="primary"
  :disabled="!agreedToTerms"
  @click="proceed"
>
  Continue
</UiButton>
```

**Visual Feedback:**
- 50% opacity
- `not-allowed` cursor
- No hover effects

---

## Mobile-Specific Patterns

### Bottom Sheet Actions

```vue
<IonModal>
  <IonContent>
    <!-- Content -->
  </IonContent>

  <PageActions :border="true">
    <UiButton variant="primary" :full-width="true">
      Confirm
    </UiButton>
  </PageActions>
</IonModal>
```

### Floating Action Button (FAB)

**Use Ionic's IonFab for platform-native FABs:**

```vue
<IonFab vertical="bottom" horizontal="end" slot="fixed">
  <IonFabButton @click="addNew">
    <Icon name="heroicons:plus" />
  </IonFabButton>
</IonFab>
```

---

## Spacing Guidelines

### Between Buttons (Horizontal)
- **Small gap:** `gap-2` (8px) - Dense UI, segmented controls
- **Medium gap:** `gap-3` (12px) - **Default** for button groups
- **Large gap:** `gap-4` (16px) - Emphasize separation

### Between Buttons (Vertical)
- **Small gap:** `gap-2` (8px) - Compact lists
- **Medium gap:** `gap-3` (12px) - **Default** for PageActions
- **Large gap:** `gap-4` (16px) - Emphasize hierarchy

### From Other Elements
- **Top margin:** `mt-4` (16px) - Default spacing above button groups
- **Top margin:** `mt-6` (24px) - Strong visual separation
- **Bottom margin:** `mb-6` (24px) - Before next section

---

## Accessibility Checklist

✅ **All buttons must:**
- Have minimum 44x44px touch target
- Include visible focus states (handled by UiButton)
- Have descriptive labels or `aria-label`
- Not rely solely on color for meaning
- Support keyboard navigation (Enter/Space)
- Work with screen readers

✅ **Icon-only buttons must:**
- Include `aria-label` attribute
- Have clear visual affordance
- Use recognizable icons

✅ **Loading buttons must:**
- Disable during loading
- Announce state change to screen readers
- Show clear loading indicator

---

## Anti-Patterns (Avoid)

❌ **Don't:**
- Use buttons smaller than 44x44px for primary actions
- Place buttons too close together (< 8px gap)
- Use more than 2 buttons in PageActions (reduces clarity)
- Mix UiButton and IonButton unnecessarily
- Use `danger` variant for non-destructive actions
- Create custom button styles outside design system
- Forget safe area padding on bottom actions

---

## Migration Guide

### From IonButton to UiButton

**Before:**
```vue
<IonButton expand="block" color="primary" @click="submit">
  Submit
</IonButton>
```

**After:**
```vue
<UiButton variant="primary" :full-width="true" @click="submit">
  Submit
</UiButton>
```

### Variant Mapping

| IonButton | UiButton |
|-----------|----------|
| `color="primary"` | `variant="primary"` |
| `fill="solid"` | `variant="primary"` |
| `fill="outline"` | `variant="outline"` |
| `fill="clear"` | `variant="ghost"` |
| `color="danger"` | `variant="danger"` |

### Size Mapping

| IonButton | UiButton |
|-----------|----------|
| `size="small"` | `size="sm"` |
| `size="default"` | `size="md"` |
| `size="large"` | `size="lg"` |

---

## Examples from Codebase

### Booking Confirmation Page

```vue
<template>
  <IonPage>
    <IonContent>
      <!-- Booking details -->
    </IonContent>

    <PageActions>
      <UiButton
        variant="primary"
        :full-width="true"
        :loading="isConfirming"
        @click="confirmBooking"
      >
        Confirm Booking
      </UiButton>
      <UiButton
        variant="outline"
        :full-width="true"
        @click="goBack"
      >
        Edit Details
      </UiButton>
    </PageActions>
  </IonPage>
</template>
```

### Provider Card

```vue
<template>
  <UiCard class="provider-card">
    <div class="flex gap-3">
      <UiAvatar :src="provider.avatar" size="lg" />
      <div class="flex-1">
        <h3>{{ provider.name }}</h3>
        <p>{{ provider.service }}</p>
        <div class="flex gap-2 mt-2">
          <UiBadge variant="success">Verified</UiBadge>
          <UiBadge>4.8 ★</UiBadge>
        </div>
      </div>
      <UiButton
        variant="ghost"
        icon="heroicons:heart"
        @click="toggleFavorite"
      />
    </div>

    <div class="flex gap-2 mt-4">
      <UiButton variant="outline" class="flex-1" @click="viewProfile">
        View Profile
      </UiButton>
      <UiButton variant="primary" class="flex-1" @click="bookNow">
        Book Now
      </UiButton>
    </div>
  </UiCard>
</template>
```

---

## Testing Checklist

Before shipping button implementations:

- [ ] All touch targets are 44x44px minimum
- [ ] Buttons have adequate spacing (8-12px)
- [ ] Safe area padding applied to bottom actions
- [ ] Loading states work correctly
- [ ] Disabled states are visually clear
- [ ] Icon-only buttons have aria-labels
- [ ] Focus states are visible
- [ ] Works on iPhone with notch/Dynamic Island
- [ ] Works on Android with gesture navigation
- [ ] Works in PWA on desktop browsers

---

## Questions?

Refer to:
- [Design Tokens](./design-tokens.md) - Color, spacing, sizing tokens
- [Components](./components.md) - Full component API reference
- [Accessibility](./accessibility.md) - WCAG compliance guidelines
- [Page Layout Patterns](./page-layout-patterns.md) - Safe area and layout