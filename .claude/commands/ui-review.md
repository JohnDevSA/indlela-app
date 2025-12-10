# UI/UX Code Review

Review a component or page for UI/UX best practices following Indlela's design system.

## Instructions

When reviewing UI code, check for the following:

### 1. Design Token Usage
- [ ] Uses CSS custom properties from `design-tokens.css`
- [ ] No hardcoded colors (use `var(--color-*)`)
- [ ] No hardcoded spacing (use `var(--space-*)`)
- [ ] No hardcoded border-radius (use `var(--radius-*)`)
- [ ] Uses design system typography scale

### 2. Accessibility (A11y)
- [ ] Minimum 44x44px touch targets
- [ ] Proper heading hierarchy (h1 > h2 > h3)
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Color is not the only indicator
- [ ] ARIA attributes where needed

### 3. Responsive Design
- [ ] Works on mobile (320px+)
- [ ] Uses Ionic breakpoints appropriately
- [ ] Text remains readable
- [ ] Touch-friendly on mobile

### 4. Performance
- [ ] Images are lazy loaded
- [ ] No unnecessary re-renders
- [ ] Animations use GPU-accelerated properties
- [ ] No layout thrashing

### 5. Dark Mode Support
- [ ] Dark mode styles defined
- [ ] Text remains readable in dark mode
- [ ] Icons/images work in both modes
- [ ] No harsh contrast changes

### 6. Animation & Motion
- [ ] Animations are subtle and purposeful
- [ ] `prefers-reduced-motion` is respected
- [ ] Transitions use design system durations
- [ ] Loading states are smooth

### 7. Offline-First
- [ ] Handles offline gracefully
- [ ] Shows appropriate loading states
- [ ] Data persists locally when needed

### 8. Internationalization (i18n)
- [ ] Uses `$t()` for all user-facing text
- [ ] No hardcoded strings
- [ ] RTL-safe layout (flexbox/grid)

## Output Format

Provide review in this format:

```markdown
## UI/UX Review: [Component/Page Name]

### Score: X/10

### Strengths
- Point 1
- Point 2

### Issues Found

#### Critical (Must Fix)
1. **Issue**: Description
   **Location**: file:line
   **Fix**: Suggested solution

#### Warnings (Should Fix)
1. **Issue**: Description
   **Fix**: Suggested solution

#### Suggestions (Nice to Have)
1. **Suggestion**: Description

### Code Improvements
\`\`\`diff
- old code
+ new code
\`\`\`
```

## Arguments

$FILE_PATH - Path to the file to review (optional, will review current context if not provided)

## Example Usage

```
/ui-review app/pages/index.vue
```
