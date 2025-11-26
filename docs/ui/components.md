# Component Library

Comprehensive reference for all UI components in the Indlela design system.

## Base Components

### UiButton

Primary button component with multiple variants.

```vue
<UiButton>Default</UiButton>
<UiButton variant="secondary">Secondary</UiButton>
<UiButton variant="outline">Outline</UiButton>
<UiButton variant="ghost">Ghost</UiButton>
<UiButton variant="danger">Danger</UiButton>

<!-- Sizes -->
<UiButton size="sm">Small</UiButton>
<UiButton size="md">Medium</UiButton>
<UiButton size="lg">Large</UiButton>

<!-- States -->
<UiButton :loading="true">Loading...</UiButton>
<UiButton :disabled="true">Disabled</UiButton>

<!-- With icon -->
<UiButton icon="heroicons:plus">Add New</UiButton>
<UiButton icon="heroicons:arrow-right" icon-position="right">Next</UiButton>

<!-- Full width -->
<UiButton :full-width="true">Full Width</UiButton>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| loading | `boolean` | `false` | Show loading spinner |
| disabled | `boolean` | `false` | Disable interactions |
| fullWidth | `boolean` | `false` | Stretch to container width |
| icon | `string` | - | Iconify icon name |
| iconPosition | `'left' \| 'right'` | `'left'` | Icon placement |

---

### UiInput

Text input with label, validation, and icon support.

```vue
<UiInput
  v-model="email"
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  :required="true"
/>

<!-- With icon -->
<UiInput
  v-model="search"
  icon="heroicons:magnifying-glass"
  placeholder="Search..."
  :clearable="true"
/>

<!-- Password with toggle -->
<UiInput
  v-model="password"
  type="password"
  label="Password"
/>

<!-- With error -->
<UiInput
  v-model="phone"
  label="Phone"
  error="Invalid phone number"
/>

<!-- With hint -->
<UiInput
  v-model="name"
  label="Display Name"
  hint="This will be visible to other users"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | `string \| number` | - | Input value (v-model) |
| type | `'text' \| 'email' \| 'password' \| 'tel' \| 'number' \| 'search' \| 'url'` | `'text'` | Input type |
| label | `string` | - | Label text |
| placeholder | `string` | - | Placeholder text |
| hint | `string` | - | Helper text below input |
| error | `string` | - | Error message |
| disabled | `boolean` | `false` | Disable input |
| required | `boolean` | `false` | Mark as required |
| icon | `string` | - | Iconify icon name |
| iconPosition | `'left' \| 'right'` | `'left'` | Icon placement |
| clearable | `boolean` | `false` | Show clear button |

---

### UiCard

Flexible card container with multiple variants.

```vue
<UiCard>
  Basic card content
</UiCard>

<!-- Variants -->
<UiCard variant="elevated">Elevated</UiCard>
<UiCard variant="outlined">Outlined</UiCard>
<UiCard variant="filled">Filled</UiCard>
<UiCard variant="glass">Glass effect</UiCard>

<!-- Interactive (clickable) -->
<UiCard :interactive="true" @click="handleClick">
  Click me
</UiCard>

<!-- With header and footer -->
<UiCard>
  <template #header>
    <h3>Card Title</h3>
  </template>

  Card content goes here

  <template #footer>
    <UiButton>Action</UiButton>
  </template>
</UiCard>

<!-- Padding options -->
<UiCard padding="none">No padding</UiCard>
<UiCard padding="sm">Small padding</UiCard>
<UiCard padding="lg">Large padding</UiCard>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'elevated' \| 'outlined' \| 'filled' \| 'glass'` | `'default'` | Visual style |
| padding | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Internal padding |
| interactive | `boolean` | `false` | Make clickable |
| disabled | `boolean` | `false` | Disable interactions |
| loading | `boolean` | `false` | Show loading overlay |

---

### UiAvatar

User avatar with image, initials, or icon fallback.

```vue
<!-- With image -->
<UiAvatar src="/avatars/user.jpg" alt="John Doe" />

<!-- With initials (auto-generated from name) -->
<UiAvatar name="John Doe" />

<!-- Sizes -->
<UiAvatar name="JD" size="xs" />
<UiAvatar name="JD" size="sm" />
<UiAvatar name="JD" size="md" />
<UiAvatar name="JD" size="lg" />
<UiAvatar name="JD" size="xl" />

<!-- With online status -->
<UiAvatar name="John" :online="true" />
<UiAvatar name="Jane" :offline="true" />

<!-- Square shape -->
<UiAvatar name="Company" shape="square" />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | `string` | - | Image URL |
| alt | `string` | - | Alt text |
| name | `string` | - | Name for initials |
| size | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size |
| shape | `'circle' \| 'square'` | `'circle'` | Avatar shape |
| online | `boolean` | - | Show online indicator |
| offline | `boolean` | - | Show offline indicator |

---

### UiBadge

Status badges and labels.

```vue
<UiBadge>Default</UiBadge>
<UiBadge variant="primary">Primary</UiBadge>
<UiBadge variant="success">Completed</UiBadge>
<UiBadge variant="warning">Pending</UiBadge>
<UiBadge variant="error">Failed</UiBadge>
<UiBadge variant="info">Info</UiBadge>

<!-- With dot indicator -->
<UiBadge variant="success" :dot="true">Online</UiBadge>

<!-- Outline style -->
<UiBadge variant="primary" :outline="true">Outline</UiBadge>

<!-- With icon -->
<UiBadge icon="heroicons:star">Featured</UiBadge>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` | Color variant |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| dot | `boolean` | `false` | Show dot indicator |
| pill | `boolean` | `true` | Fully rounded |
| outline | `boolean` | `false` | Outline style |
| icon | `string` | - | Iconify icon name |

---

## Feedback Components

### UiToast

Toast notifications (use with composable for programmatic usage).

```vue
<UiToast
  type="success"
  title="Booking Confirmed!"
  message="Your plumber will arrive at 2 PM"
  :duration="4000"
/>
```

### UiModal

Accessible modal/dialog.

```vue
<UiModal v-model="isOpen" title="Confirm Booking">
  <p>Are you sure you want to confirm this booking?</p>

  <template #footer>
    <UiButton variant="ghost" @click="isOpen = false">Cancel</UiButton>
    <UiButton @click="confirm">Confirm</UiButton>
  </template>
</UiModal>
```

### UiSkeleton

Loading placeholder with shimmer.

```vue
<!-- Text line -->
<UiSkeleton />

<!-- Avatar -->
<UiSkeleton variant="circle" size="lg" />

<!-- Image/Rectangle -->
<UiSkeleton variant="rect" :height="200" />
```

### UiSpinner

Loading spinner.

```vue
<UiSpinner />
<UiSpinner size="lg" color="primary" />
<UiSpinner variant="dots" />
```

---

## AI Components

### AiChatBubble

Message bubble for AI conversations.

```vue
<!-- User message -->
<AiChatBubble sender="user" :timestamp="new Date()">
  Hi, I need help finding a plumber near me
</AiChatBubble>

<!-- AI response -->
<AiChatBubble sender="ai" name="Indlela">
  I found 5 plumbers within 10km of your location. Would you like me to show you their ratings and availability?
</AiChatBubble>

<!-- AI typing indicator -->
<AiChatBubble sender="ai" :typing="true" />

<!-- Streaming response -->
<AiChatBubble sender="ai" :streaming="true">
  Finding plumbers...
</AiChatBubble>
```

### AiChatInput

Chat input with voice support.

```vue
<AiChatInput
  v-model="message"
  :loading="isSending"
  :show-voice="true"
  placeholder="Ask Indlela anything..."
  @send="handleSend"
  @voice="startVoiceInput"
/>
```

### AiSuggestionChips

Quick action suggestions.

```vue
<AiSuggestionChips
  :suggestions="[
    'Find a plumber',
    'Show nearby',
    'Check prices'
  ]"
  @select="handleSelect"
/>

<!-- With icons -->
<AiSuggestionChips
  :suggestions="[
    { label: 'Plumber', icon: 'heroicons:wrench' },
    { label: 'Electrician', icon: 'heroicons:bolt' },
  ]"
  @select="handleSelect"
/>
```

### AiVoiceButton

Voice input button with visual feedback.

```vue
<AiVoiceButton
  :recording="isRecording"
  :processing="isProcessing"
  size="lg"
  @start="startRecording"
  @stop="stopRecording"
/>
```
