# Page Layout Patterns

Best practices and patterns for page layouts in Indlela, with focus on safe area handling and mobile-first design.

## Problem Statement

Mobile devices have varying safe areas that need to be respected:

- **iOS:** Notch area and home indicator at the bottom
- **Android:** Gesture navigation bar or button navigation
- **PWA:** Different behavior between standalone and browser mode

Without proper handling, UI elements get cut off or overlap with system UI.

## Solution: Page Layout Components

We've created two reusable components to solve this systematically:

### PageFooter

General-purpose footer wrapper for any bottom content.

### PageActions

Specialized component for action button groups (most common use case).

## Common Patterns

### Pattern 1: Form Submit Buttons

**Use Case:** Forms with submit/cancel actions at bottom

```vue
<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ t('booking.new_booking') }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <!-- Form fields here -->
      <div class="section">
        <IonInput v-model="name" label="Name" />
        <IonInput v-model="email" label="Email" />
      </div>

      <!-- Action buttons with safe area handling -->
      <PageActions>
        <IonButton expand="block" :disabled="!isValid" @click="submit">
          {{ t('common.submit') }}
        </IonButton>
        <IonButton expand="block" fill="outline" @click="cancel">
          {{ t('common.cancel') }}
        </IonButton>
      </PageActions>
    </IonContent>
  </IonPage>
</template>
```

**Benefits:**
- Automatic safe area padding
- Consistent spacing (12px gap between buttons, 16px padding)
- Works on all platforms

---

### Pattern 2: Sticky Bottom Actions

**Use Case:** Important actions that should always be visible (checkout, book now)

```vue
<template>
  <IonPage>
    <IonHeader>
      <IonToolbar color="primary">
        <IonTitle>{{ provider.name }}</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <!-- Scrollable content -->
      <div class="provider-details">
        <!-- ... -->
      </div>

      <!-- Sticky actions always visible at bottom -->
      <PageActions
        :sticky="true"
        :border="true"
        :shadow="true"
        background="default"
      >
        <IonButton expand="block" fill="outline" @click="contact">
          <IonIcon :icon="call" slot="start" />
          {{ t('provider.contact') }}
        </IonButton>
        <IonButton expand="block" color="primary" @click="book">
          {{ t('provider.book_now') }}
        </IonButton>
      </PageActions>
    </IonContent>
  </IonPage>
</template>
```

**When to use sticky:**
- ✅ Checkout/payment buttons
- ✅ Primary CTAs that drive conversions
- ✅ Critical actions users need always available
- ❌ Most other cases (static is better for UX)

**Visual separation:**
When using sticky, add `:border="true"` and `:shadow="true"` to clearly separate from scrolling content.

---

### Pattern 3: Multiple Actions with Hierarchy

**Use Case:** Pages with primary, secondary, and destructive actions

```vue
<template>
  <IonPage>
    <IonContent>
      <!-- Booking details -->

      <PageActions gap="md" padding="lg">
        <!-- Primary action -->
        <IonButton expand="block" color="success" @click="rateService">
          <IonIcon :icon="star" slot="start" />
          {{ t('booking.actions.rate') }}
        </IonButton>

        <!-- Secondary action -->
        <IonButton expand="block" fill="outline" @click="contactProvider">
          <IonIcon :icon="call" slot="start" />
          {{ t('booking.actions.contact_provider') }}
        </IonButton>

        <!-- Destructive action (last) -->
        <IonButton expand="block" color="danger" fill="outline" @click="cancelBooking">
          <IonIcon :icon="close" slot="start" />
          {{ t('booking.actions.cancel') }}
        </IonButton>
      </PageActions>
    </IonContent>
  </IonPage>
</template>
```

**Best Practices:**
1. **Primary action first** (most important, solid fill)
2. **Secondary actions middle** (outline style)
3. **Destructive action last** (danger color, outline)
4. **Maximum 3-4 actions** (more = decision paralysis)

---

### Pattern 4: Footer with Legal/Info Text

**Use Case:** Copyright, terms, or informational text at bottom

```vue
<template>
  <IonPage>
    <IonContent>
      <!-- Page content -->

      <PageFooter background="transparent" padding="sm">
        <div class="footer-content">
          <p class="text-center text-sm text-gray-600">
            © 2025 Indlela. {{ t('footer.all_rights_reserved') }}
          </p>
          <div class="footer-links">
            <a href="/terms">{{ t('footer.terms') }}</a>
            <span>·</span>
            <a href="/privacy">{{ t('footer.privacy') }}</a>
          </div>
        </div>
      </PageFooter>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.footer-content {
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
}

.footer-links a {
  color: var(--ion-color-primary);
  text-decoration: none;
}
</style>
```

---

### Pattern 5: Success/Confirmation States

**Use Case:** Post-submission success screens with navigation options

```vue
<template>
  <IonPage>
    <IonContent>
      <div class="success-state">
        <div class="success-icon">
          <IonIcon :icon="checkmarkCircle" color="success" />
        </div>
        <h1>{{ t('booking.booking_confirmed') }}</h1>
        <p>{{ t('booking.provider_notified') }}</p>

        <!-- Summary details -->
        <div class="success-summary">
          <p><strong>{{ serviceName }}</strong></p>
          <p>{{ providerName }}</p>
          <p>{{ formattedDate }} at {{ formattedTime }}</p>
        </div>

        <!-- Navigation actions -->
        <PageActions padding="lg">
          <IonButton expand="block" @click="viewBookings">
            {{ t('booking.view_bookings') }}
          </IonButton>
          <IonButton expand="block" fill="outline" @click="backToHome">
            {{ t('common.back_to_home') }}
          </IonButton>
        </PageActions>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px;
  min-height: 100%;
}

.success-icon ion-icon {
  font-size: 80px;
}

.success-summary {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  margin: 24px 0;
}
</style>
```

---

## Migration Guide

### Before: Manual Safe Area Handling

```vue
<template>
  <div class="actions-section">
    <IonButton expand="block">Submit</IonButton>
    <IonButton expand="block" fill="outline">Cancel</IonButton>
  </div>
</template>

<style scoped>
.actions-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: calc(32px + env(safe-area-inset-bottom));
}
</style>
```

**Issues:**
- Duplicated CSS across pages
- Easy to forget `env(safe-area-inset-bottom)`
- Inconsistent padding values
- 9 lines of CSS

### After: Using PageActions

```vue
<template>
  <PageActions>
    <IonButton expand="block">Submit</IonButton>
    <IonButton expand="block" fill="outline">Cancel</IonButton>
  </PageActions>
</template>

<!-- No CSS needed! -->
```

**Benefits:**
- Zero CSS duplication
- Guaranteed safe area handling
- Consistent spacing everywhere
- Self-documenting code

---

## Component Props Quick Reference

### PageActions Props

| Prop | Values | Default | Use Case |
|------|--------|---------|----------|
| `gap` | `sm` `md` `lg` | `md` | Spacing between buttons |
| `padding` | `sm` `md` `lg` | `md` | Internal padding |
| `background` | `default` `transparent` `surface` | `default` | Background style |
| `sticky` | `boolean` | `false` | Fix to bottom of viewport |
| `border` | `boolean` | `false` | Top border for separation |
| `shadow` | `boolean` | `false` | Shadow effect (with sticky) |

### PageFooter Props

| Prop | Values | Default | Use Case |
|------|--------|---------|----------|
| `padding` | `sm` `md` `lg` | `md` | Internal padding |
| `background` | `default` `transparent` `surface` | `default` | Background style |
| `sticky` | `boolean` | `false` | Fix to bottom of viewport |
| `border` | `boolean` | `false` | Top border for separation |
| `shadow` | `boolean` | `false` | Shadow effect |

---

## Design Tokens

The components use these CSS custom properties:

```css
/* Safe area (automatically provided by browsers) */
env(safe-area-inset-bottom) /* iOS notch, Android nav bar */
env(safe-area-inset-top)    /* iOS notch at top */
env(safe-area-inset-left)   /* Landscape orientation */
env(safe-area-inset-right)  /* Landscape orientation */

/* Component-specific tokens */
--page-actions-padding-y    /* Vertical padding */
--page-actions-padding-x    /* Horizontal padding */
--page-footer-padding-y     /* Vertical padding */
--page-footer-padding-x     /* Horizontal padding */
```

---

## Accessibility Considerations

### Touch Target Size

Both components ensure **minimum 44x44px touch targets**:

```css
.page-actions > :deep(*) {
  min-height: 44px;
}
```

This meets WCAG 2.1 AA standards for mobile accessibility.

### Keyboard Navigation

All buttons within `PageActions` are keyboard-navigable:
- Tab through actions in order
- Enter/Space to activate
- Focus indicators visible

### Screen Readers

Use semantic button text and ARIA labels:

```vue
<PageActions>
  <!-- Good: Descriptive text -->
  <IonButton expand="block">
    Confirm Booking for R120
  </IonButton>

  <!-- Avoid: Generic text -->
  <IonButton expand="block">
    OK <!-- ❌ Not descriptive -->
  </IonButton>
</PageActions>
```

---

## Testing Checklist

When using page layout components, test on:

- [ ] iOS Safari (iPhone X+ with notch)
- [ ] iOS Safari (iPhone SE without notch)
- [ ] Android Chrome (gesture navigation)
- [ ] Android Chrome (button navigation)
- [ ] PWA standalone mode (iOS)
- [ ] PWA standalone mode (Android)
- [ ] Desktop browsers (graceful degradation)
- [ ] Landscape orientation (safe area on sides)
- [ ] Small screens (320px width)
- [ ] Tablet screens (responsive behavior)

---

## Common Mistakes to Avoid

### ❌ Nesting PageActions Inside Another Fixed Container

```vue
<!-- BAD: Double-fixed positioning -->
<div class="custom-footer" style="position: fixed; bottom: 0">
  <PageActions :sticky="true">
    <IonButton>Action</IonButton>
  </PageActions>
</div>
```

**Why it's wrong:** Creates z-index issues, double padding

**Fix:** Use PageActions sticky directly, no wrapper

---

### ❌ Forgetting expand="block" on Buttons

```vue
<!-- BAD: Buttons don't fill width -->
<PageActions>
  <IonButton>Submit</IonButton>
</PageActions>
```

**Why it's wrong:** Buttons don't fill container width, looks inconsistent

**Fix:** Always use `expand="block"` for full-width buttons

```vue
<!-- GOOD -->
<PageActions>
  <IonButton expand="block">Submit</IonButton>
</PageActions>
```

---

### ❌ Using Custom Padding Inside PageActions

```vue
<!-- BAD: Fighting with component padding -->
<PageActions>
  <div style="padding: 20px">
    <IonButton expand="block">Submit</IonButton>
  </div>
</PageActions>
```

**Why it's wrong:** Double padding, breaks safe area calculation

**Fix:** Use component's `padding` prop instead

```vue
<!-- GOOD -->
<PageActions padding="lg">
  <IonButton expand="block">Submit</IonButton>
</PageActions>
```

---

### ❌ Too Many Actions

```vue
<!-- BAD: Decision paralysis -->
<PageActions>
  <IonButton expand="block">Option 1</IonButton>
  <IonButton expand="block">Option 2</IonButton>
  <IonButton expand="block">Option 3</IonButton>
  <IonButton expand="block">Option 4</IonButton>
  <IonButton expand="block">Option 5</IonButton>
</PageActions>
```

**Why it's wrong:** Overwhelming, pushes content off screen, poor UX

**Fix:** Maximum 3-4 actions, use a menu for more options

---

## Performance Considerations

### Component Size

- **PageActions:** ~2KB minified
- **PageFooter:** ~1.5KB minified
- **Total overhead:** < 4KB (negligible)

### Runtime Performance

- Zero JavaScript runtime cost (pure CSS)
- No watchers or reactivity overhead
- Static classes only

### Browser Support

- **Modern browsers:** Full support (env() + flexbox)
- **Legacy browsers:** Graceful degradation (safe area ignored)
- **IE11:** Not supported (not a target for Indlela)

---

## Related Documentation

- [ADR-002: Page Layout Components](../adr/002-page-layout-components.md) - Architecture decision
- [Component Library](./components.md) - Full API reference
- [Accessibility Guidelines](./accessibility.md) - Accessibility standards
- [Design Tokens](./design-tokens.md) - CSS custom properties

---

## Questions?

If you encounter a use case not covered by these patterns:

1. Check if existing props can solve it (background, padding, sticky, etc.)
2. Consult the team (maybe others had the same issue)
3. Consider if a new component variant is needed
4. Document your solution for others

**Remember:** Consistency > customization. Use the components as-is when possible.
