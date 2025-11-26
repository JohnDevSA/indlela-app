# Indlela UI/UX Design System

A comprehensive design system for building AI-first, offline-capable mobile experiences.

## Quick Start

```vue
<script setup lang="ts">
// Import composables
const { haptic } = useAnimation()

// Handle interactions with haptic feedback
function handlePress() {
  haptic('light')
  // ... action
}
</script>

<template>
  <!-- Use design system components -->
  <UiButton variant="primary" @click="handlePress">
    Get Started
  </UiButton>
</template>
```

## Design Philosophy

### Inspired By
- **ChatGPT & Claude** - AI conversation patterns
- **Linear & Notion** - Clean, purposeful UI
- **Vercel & Stripe** - Premium feel, attention to detail
- **Apple HIG** - Native-quality mobile experience

### Core Principles

1. **AI-First** - Conversation-driven interfaces that feel natural
2. **Offline-Capable** - Every interaction works without connectivity
3. **Voice-Ready** - Voice input is a first-class citizen
4. **Accessible** - 44px touch targets, proper contrast, screen reader support
5. **Low-Data Friendly** - Optimized for South African mobile networks

## Directory Structure

```
app/
├── assets/css/
│   ├── design-tokens.css    # CSS custom properties
│   ├── animations.css       # Animation library
│   └── main.css             # Global styles + Ionic overrides
├── components/ui/
│   ├── base/                # Core primitives
│   │   ├── UiButton.vue
│   │   ├── UiInput.vue
│   │   ├── UiCard.vue
│   │   ├── UiAvatar.vue
│   │   └── UiBadge.vue
│   ├── feedback/            # User feedback
│   │   ├── UiToast.vue
│   │   ├── UiModal.vue
│   │   ├── UiSkeleton.vue
│   │   └── UiSpinner.vue
│   ├── layout/              # Layout components
│   └── ai/                  # AI-specific
│       ├── AiChatBubble.vue
│       ├── AiChatInput.vue
│       ├── AiSuggestionChips.vue
│       └── AiVoiceButton.vue
└── composables/
    └── useAnimation.ts      # Animation & haptics
```

## Documentation

- [Design Tokens](./design-tokens.md) - Colors, spacing, typography
- [Components](./components.md) - Component API reference
- [Animations](./animations.md) - Motion and transitions
- [Accessibility](./accessibility.md) - A11y guidelines
- [Icons](./icons.md) - Icon usage guide

## Claude Commands

Speed up development with custom slash commands:

- `/ui-component` - Create a new UI component
- `/ui-page` - Create a new page
- `/ui-review` - Review code for UI/UX issues
- `/ui-fix` - Fix UI problems

## Next Steps

1. Read the [Design Tokens](./design-tokens.md) documentation
2. Browse the [Component Library](./components.md)
3. Check [Accessibility](./accessibility.md) requirements
4. Use Claude commands to accelerate development
