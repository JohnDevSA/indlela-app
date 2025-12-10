# Safe Area Visual Guide

Understanding how safe areas work on mobile devices and how our components handle them.

## What is Safe Area?

The safe area is the portion of the screen where content can be displayed without being obscured by device features.

### iOS Devices

```
┌─────────────────────────────────┐
│      [ Notch/Camera ]           │ ← Unsafe area (covered by notch)
├─────────────────────────────────┤
│                                 │
│     Safe Area (Content)         │ ← Your content goes here
│                                 │
│                                 │
├─────────────────────────────────┤
│   ───────────────────           │ ← Home indicator
└─────────────────────────────────┘
     ↑ env(safe-area-inset-bottom)
```

**Without safe area handling:**
```
┌─────────────────────────────────┐
│                                 │
│  [Button] [Button]              │
└─────────────────────────────────┘
  ↑ Button cut off by home indicator
```

**With safe area handling:**
```
┌─────────────────────────────────┐
│  [Button] [Button]              │
│                                 │ ← Proper padding
└─────────────────────────────────┘
```

### Android Devices (Gesture Navigation)

```
┌─────────────────────────────────┐
│                                 │
│     Safe Area (Content)         │
│                                 │
├─────────────────────────────────┤
│        ─────                    │ ← Gesture indicator
└─────────────────────────────────┘
```

### Android Devices (Button Navigation)

```
┌─────────────────────────────────┐
│                                 │
│     Safe Area (Content)         │
│                                 │
├─────────────────────────────────┤
│    [◁]   [○]   [▢]             │ ← Navigation bar
└─────────────────────────────────┘
```

---

## The Problem We Solved

### Before: Inconsistent Implementation

**Page 1:** Forgot safe area padding
```vue
<div class="actions">
  <ion-button>Submit</ion-button>
</div>

<style>
.actions {
  padding: 16px;
  /* ❌ Missing env(safe-area-inset-bottom) */
}
</style>
```

Result: Button cut off on iOS ❌

---

**Page 2:** Correct but verbose
```vue
<div class="actions-section">
  <ion-button>Submit</ion-button>
</div>

<style>
.actions-section {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  /* ✅ Correct but lots of code */
}
</style>
```

Result: Works but duplicated everywhere 🤷

---

**Page 3:** Wrong padding value
```vue
<div class="bottom-bar">
  <ion-button>Submit</ion-button>
</div>

<style>
.bottom-bar {
  padding: 8px;  /* ❌ Different from other pages */
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}
</style>
```

Result: Inconsistent spacing ❌

---

### After: Consistent Component-Based Solution

**All pages:** Same implementation
```vue
<PageActions>
  <ion-button expand="block">Submit</ion-button>
</PageActions>
```

Result:
- ✅ Automatic safe area handling
- ✅ Consistent spacing (16px + safe area)
- ✅ No CSS duplication
- ✅ Works on iOS, Android, PWA

---

## Visual Comparison

### Scenario: Booking Detail Page Bottom Actions

#### Before (Cut Off)

```
┌─────────────────────────────────────┐
│ Booking Details                     │
│ Service: Plumbing                   │
│ Date: Nov 27                        │
│ Time: 2:00 PM                       │
│                                     │
│ Payment Summary                     │
│ Service Fee: R150                   │
│ Booking Fee: R15                    │
│ Total: R165                         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  Contact Provider               │ │ ← Button visible
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │  Cancel Booking                 │ │ ← Button cut off!
└───────────────────────────────────── │
     ↑ Home indicator overlaps button
```

**Problems:**
- Cancel button partially obscured
- Can't tap bottom of button
- Poor user experience
- Accessibility failure

---

#### After (Proper Spacing)

```
┌─────────────────────────────────────┐
│ Booking Details                     │
│ Service: Plumbing                   │
│ Date: Nov 27                        │
│ Time: 2:00 PM                       │
│                                     │
│ Payment Summary                     │
│ Service Fee: R150                   │
│ Booking Fee: R15                    │
│ Total: R165                         │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  Contact Provider               │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │  Cancel Booking                 │ │
│ └─────────────────────────────────┘ │
│                                     │ ← Safe padding
└─────────────────────────────────────┘
  ────────── (Home indicator)
```

**Benefits:**
- Full button visible
- Proper tap target (44x44px)
- Consistent spacing
- Platform-aware padding

---

## Real Device Examples

### iPhone 14 Pro (Notched)

**Safe area values:**
- `safe-area-inset-bottom`: 34px
- Total bottom padding: 16px + 34px = **50px**

```
                              ┌───────────────────┐
                              │                   │
                              │   Your Content    │
                              │                   │
                              ├───────────────────┤
                              │  [Button]         │
                              │                   │ ← 16px padding
                              │                   │ ← 34px safe area
                              └───────────────────┘
                                   ──────────
```

---

### iPhone SE (No Notch)

**Safe area values:**
- `safe-area-inset-bottom`: 0px
- Total bottom padding: 16px + 0px = **16px**

```
                              ┌───────────────────┐
                              │                   │
                              │   Your Content    │
                              │                   │
                              ├───────────────────┤
                              │  [Button]         │
                              │                   │ ← 16px padding
                              └───────────────────┘
```

---

### Android (Gesture Nav)

**Safe area values:**
- `safe-area-inset-bottom`: 16-20px (varies)
- Total bottom padding: 16px + 20px = **36px**

```
                              ┌───────────────────┐
                              │                   │
                              │   Your Content    │
                              │                   │
                              ├───────────────────┤
                              │  [Button]         │
                              │                   │ ← 16px padding
                              │                   │ ← 20px safe area
                              └───────────────────┘
                                     ─────
```

---

### Android (Button Nav)

**Safe area values:**
- `safe-area-inset-bottom`: 48px (navigation bar)
- Total bottom padding: 16px + 48px = **64px**

```
                              ┌───────────────────┐
                              │                   │
                              │   Your Content    │
                              │                   │
                              ├───────────────────┤
                              │  [Button]         │
                              │                   │ ← 16px padding
                              │                   │ ← 48px safe area
                              └───────────────────┘
                                  [◁] [○] [▢]
```

---

## Component Behavior Matrix

| Device | Mode | Bottom Inset | Component Padding | Total Space |
|--------|------|--------------|-------------------|-------------|
| iPhone 14 Pro | Portrait | 34px | 16px | 50px |
| iPhone SE | Portrait | 0px | 16px | 16px |
| Android | Gesture | 20px | 16px | 36px |
| Android | Button Nav | 48px | 16px | 64px |
| Desktop | Browser | 0px | 16px | 16px |
| iPad | Portrait | 20px | 16px | 36px |

**Key insight:** Same component code adapts to every device automatically.

---

## Code Implementation Details

### How PageActions Works

```vue
<!-- Component Usage -->
<PageActions>
  <ion-button expand="block">Submit</ion-button>
</PageActions>
```

**Compiles to:**
```html
<div class="page-actions page-actions--padding-md">
  <ion-button expand="block">Submit</ion-button>
</div>
```

**CSS Applied:**
```css
.page-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* The magic happens here: */
  padding-bottom: calc(
    16px                              /* Base padding */
    + env(safe-area-inset-bottom)     /* Device-specific safe area */
  );

  padding-left: 16px;
  padding-right: 16px;
  padding-top: 16px;
}
```

**Result on iPhone 14 Pro:**
```css
padding-bottom: calc(16px + 34px); /* = 50px */
```

**Result on Android (button nav):**
```css
padding-bottom: calc(16px + 48px); /* = 64px */
```

**Result on desktop browser:**
```css
padding-bottom: calc(16px + 0px); /* = 16px */
```

---

## Layout Content Padding

Don't forget about the default layout! The tab bar also needs safe area handling:

**In `layouts/default.vue`:**
```vue
<div class="layout-container">
  <main class="layout-content">
    <slot />
  </main>

  <nav class="tab-bar">
    <!-- Tab buttons -->
  </nav>
</div>
```

**CSS:**
```css
.layout-content {
  flex: 1;
  overflow: auto;
  /* Padding for tab bar + safe area */
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

.tab-bar {
  position: fixed;
  bottom: 0;
  /* Safe area padding */
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}
```

**This ensures:**
- Content doesn't hide behind tab bar
- Tab bar doesn't hide behind home indicator
- Everything works together harmoniously

---

## Testing Your Layout

### Quick Visual Test

1. **iOS Safari:** Open in browser, add to home screen, open as PWA
2. **Check bottom spacing:** Scroll to page bottom
3. **Verify touch targets:** Try tapping buttons near edges
4. **Rotate device:** Test landscape orientation
5. **Android Chrome:** Repeat steps 1-4

### Chrome DevTools

Use device emulation:

```
F12 → Toggle Device Toolbar → Select:
- iPhone 14 Pro (notched)
- iPhone SE (non-notched)
- Pixel 7 (gesture nav)
```

**Inspect safe area:**
```
Computed → search for "padding-bottom"
Should show: calc(16px + 34px) or similar
```

---

## Common Scenarios Visualized

### Scenario 1: Form at Bottom of Page

```
┌─────────────────────────────────┐
│ Profile                         │
│                                 │
│ [Name Input]                    │
│ [Email Input]                   │
│ [Phone Input]                   │
│                                 │
│ <PageActions>                   │
│   ┌───────────────────────────┐ │
│   │ Save Changes              │ │
│   └───────────────────────────┘ │
│   ┌───────────────────────────┐ │
│   │ Cancel                    │ │
│   └───────────────────────────┘ │
│                                 │ ← Safe padding
└─────────────────────────────────┘
```

---

### Scenario 2: Sticky Checkout Button

```
┌─────────────────────────────────┐ ↑
│ Cart Items                      │ │
│ - Plumbing Service    R150      │ │
│ - Electrician         R200      │ │
│                                 │ │ Scrollable
│ Delivery Address                │ │
│ 123 Main St, Soweto             │ │
│                                 │ ↓
├─────────────────────────────────┤ ← Border
│ <PageActions sticky>            │
│   ┌───────────────────────────┐ │ ↑ Always
│   │ Checkout - R350           │ │   visible
│   └───────────────────────────┘ │ ↓
│                                 │ ← Safe padding
└─────────────────────────────────┘
```

---

### Scenario 3: Success Screen

```
┌─────────────────────────────────┐
│         ✓                       │
│   Booking Confirmed!            │
│                                 │
│   Plumber will arrive at        │
│   2:00 PM on Nov 27             │
│                                 │
│ <PageActions>                   │
│   ┌───────────────────────────┐ │
│   │ View Bookings             │ │
│   └───────────────────────────┘ │
│   ┌───────────────────────────┐ │
│   │ Back to Home              │ │
│   └───────────────────────────┘ │
│                                 │ ← Safe padding
└─────────────────────────────────┘
```

---

## Troubleshooting

### Button Still Cut Off?

**Check:**
1. Are you using `<PageActions>` or custom CSS?
2. Is there a parent container with `overflow: hidden`?
3. Did you wrap in another fixed position element?
4. Are you testing on actual device or simulator?

**Solution:**
- Remove custom padding CSS
- Use PageActions directly
- Test on real device

---

### Too Much Space at Bottom?

**Check:**
1. Are you adding extra padding inside PageActions?
2. Is there a margin on child buttons?
3. Are you using `padding="lg"` unintentionally?

**Solution:**
- Remove extra padding/margins
- Use default `padding="md"`
- Let component handle spacing

---

### Different Spacing on iOS vs Android?

**This is expected!** Safe area values differ by platform.

**iOS:** 34px (notched) or 0px (non-notched)
**Android:** 16-48px (depends on nav style)

The component adapts automatically. If you want **truly identical** spacing (not recommended):

```vue
<PageActions padding="lg">
  <!-- Larger base padding masks safe area differences -->
</PageActions>
```

But this defeats the purpose of platform-adaptive design.

---

## Best Practices Summary

1. ✅ **Always use PageActions for bottom buttons**
2. ✅ **Test on real devices, not just simulators**
3. ✅ **Use `expand="block"` on all action buttons**
4. ✅ **Limit to 3-4 actions maximum**
5. ✅ **Add border/shadow when using sticky**
6. ❌ **Don't add custom padding inside PageActions**
7. ❌ **Don't nest fixed position containers**
8. ❌ **Don't hardcode safe area values**

---

## Resources

- [iOS Human Interface Guidelines - Safe Area](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Android Display Cutout](https://developer.android.com/guide/topics/display-cutout)
- [MDN: env() CSS Function](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [WebKit: Designing for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

---

**Remember:** Safe area handling is automatic with our components. Just use them correctly and your UI will work perfectly on every device.
