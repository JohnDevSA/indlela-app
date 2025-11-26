# Icons

Indlela uses [@nuxt/icon](https://github.com/nuxt/icon) with [Iconify](https://iconify.design/) for access to 200,000+ icons.

## Basic Usage

```vue
<template>
  <!-- Simple usage -->
  <Icon name="heroicons:home" />

  <!-- With size -->
  <Icon name="heroicons:user" class="w-6 h-6" />

  <!-- With color -->
  <Icon name="heroicons:star" class="text-yellow-500" />
</template>
```

## Recommended Icon Sets

### Heroicons (Primary)
Modern, clean icons perfect for UI. Use the solid variant for filled icons.

**Prefix:** `heroicons:` (outline) or `heroicons-solid:` (filled)

```vue
<!-- Outline (default) -->
<Icon name="heroicons:home" />
<Icon name="heroicons:user" />
<Icon name="heroicons:cog-6-tooth" />

<!-- Solid -->
<Icon name="heroicons-solid:home" />
<Icon name="heroicons-solid:star" />
```

**Common icons:**
- Navigation: `home`, `arrow-left`, `arrow-right`, `chevron-down`
- Actions: `plus`, `minus`, `pencil`, `trash`, `eye`
- Status: `check-circle`, `x-circle`, `exclamation-triangle`
- Communication: `chat-bubble-left-right`, `phone`, `bell`
- User: `user`, `users`, `user-circle`
- Location: `map-pin`, `globe-alt`
- Time: `clock`, `calendar`

### Phosphor (AI/Modern)
Great for AI interfaces and modern apps.

**Prefix:** `ph:`

```vue
<Icon name="ph:robot" />
<Icon name="ph:brain" />
<Icon name="ph:lightning" />
<Icon name="ph:chats-circle" />
```

### Lucide (Minimal)
Clean, consistent icons.

**Prefix:** `lucide:`

```vue
<Icon name="lucide:loader-2" />  <!-- Animated spinner -->
<Icon name="lucide:send" />
<Icon name="lucide:refresh-cw" />
```

## Icon Sizing

Use Tailwind classes or inline styles:

```vue
<!-- Tailwind (recommended) -->
<Icon name="heroicons:star" class="w-4 h-4" />   <!-- 16px -->
<Icon name="heroicons:star" class="w-5 h-5" />   <!-- 20px -->
<Icon name="heroicons:star" class="w-6 h-6" />   <!-- 24px -->
<Icon name="heroicons:star" class="w-8 h-8" />   <!-- 32px -->

<!-- CSS -->
<Icon name="heroicons:star" style="width: 24px; height: 24px" />
```

## Icon Colors

Icons inherit text color by default:

```vue
<!-- Inherit from parent -->
<button class="text-primary-500">
  <Icon name="heroicons:plus" />
  Add
</button>

<!-- Direct color -->
<Icon name="heroicons:star" class="text-yellow-500" />
<Icon name="heroicons:check-circle" class="text-green-500" />
<Icon name="heroicons:x-circle" class="text-red-500" />
```

## Common Icon Patterns

### Button with Icon

```vue
<UiButton icon="heroicons:plus">Add Service</UiButton>
<UiButton icon="heroicons:arrow-right" icon-position="right">Next</UiButton>
```

### Icon-Only Button

```vue
<button class="p-2 rounded-full hover:bg-neutral-100" aria-label="Close">
  <Icon name="heroicons:x-mark" class="w-5 h-5" />
</button>
```

### Status Icons

```vue
<span class="flex items-center gap-2">
  <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500" />
  Completed
</span>

<span class="flex items-center gap-2">
  <Icon name="heroicons:clock" class="w-5 h-5 text-yellow-500" />
  Pending
</span>
```

### Loading Spinner

```vue
<Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
```

## Offline Support

Icons are bundled in the client for offline use. Common icons are pre-bundled in `nuxt.config.ts`:

```ts
// nuxt.config.ts
icon: {
  clientBundle: {
    icons: [
      'heroicons:home',
      'heroicons:user',
      // ... more icons
    ],
  },
}
```

To add more icons to the bundle, update the `nuxt.config.ts` file.

## Finding Icons

1. **Iconify Search**: https://icon-sets.iconify.design/
2. **Heroicons**: https://heroicons.com/
3. **Phosphor**: https://phosphoricons.com/
4. **Lucide**: https://lucide.dev/

## Best Practices

1. **Be consistent** - Use the same icon set throughout the app
2. **Use meaningful icons** - Icons should be universally understood
3. **Add aria-labels** - For icon-only buttons
4. **Size appropriately** - 20-24px for most UI icons
5. **Don't overuse** - Icons should add clarity, not clutter

```vue
<!-- Good: Icon adds clarity -->
<button>
  <Icon name="heroicons:trash" class="w-5 h-5" />
  Delete
</button>

<!-- Bad: Icon without context -->
<button aria-label="Delete">
  <Icon name="heroicons:trash" class="w-5 h-5" />
</button>
```

## Service Category Icons

Suggested icons for Indlela service categories:

| Category | Icon |
|----------|------|
| Plumbing | `heroicons:wrench-screwdriver` |
| Electrical | `heroicons:bolt` |
| Cleaning | `heroicons:sparkles` |
| Gardening | `ph:plant` |
| Security | `heroicons:shield-check` |
| Transport | `heroicons:truck` |
| Beauty | `ph:scissors` |
| Repairs | `heroicons:cog` |
| Tutoring | `heroicons:academic-cap` |
| Cooking | `ph:cooking-pot` |
