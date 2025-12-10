# Fix UI Issue

Diagnose and fix UI/UX issues in the Indlela app.

## Instructions

When fixing a UI issue, follow this diagnostic process:

### 1. Identify the Issue Type

#### Visual Issues
- Layout problems (alignment, spacing, overflow)
- Color/contrast issues
- Typography problems
- Icon display issues
- Image loading failures

#### Interaction Issues
- Touch targets too small
- Button not responding
- Form validation not showing
- Animation glitches
- Scroll problems

#### Responsive Issues
- Layout breaking on certain screens
- Text overflow on mobile
- Elements hidden/cut off
- Safe area problems

#### Accessibility Issues
- Missing focus states
- Poor color contrast
- Missing labels/ARIA
- Keyboard navigation broken

### 2. Common Fixes

#### Layout Issues
```css
/* Fix overflow */
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;

/* Fix alignment */
display: flex;
align-items: center;
justify-content: center;

/* Fix spacing */
padding: var(--space-4);
margin: 0;
gap: var(--space-2);
```

#### Touch Target Issues
```css
/* Ensure minimum touch target */
min-height: var(--touch-target-min); /* 44px */
min-width: var(--touch-target-min);
padding: var(--space-3);
```

#### Safe Area Issues
```css
/* Handle notched devices */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

#### Dark Mode Issues
```css
/* Add dark mode support */
@media (prefers-color-scheme: dark) {
  .element {
    background: var(--color-neutral-800);
    color: var(--color-neutral-100);
  }
}
```

#### Animation Issues
```css
/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none;
    transition: none;
  }
}

/* Use GPU acceleration */
transform: translateZ(0);
will-change: transform;
```

### 3. Testing Checklist
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test in dark mode
- [ ] Test with reduced motion
- [ ] Test keyboard navigation
- [ ] Test touch interactions
- [ ] Test offline state

### 4. Ionic-Specific Fixes

#### IonContent scroll issues
```vue
<IonContent :scroll-y="true" :fullscreen="true">
```

#### Safe area handling
```vue
<IonContent class="ion-padding">
```

#### Header/Footer positioning
```css
ion-header {
  position: sticky;
  top: 0;
}
```

## Arguments

$ISSUE_DESCRIPTION - Description of the UI issue
$FILE_PATH - Path to the affected file (optional)

## Example Usage

```
/ui-fix "Button text is cut off on small screens" app/components/BookingCard.vue
```
