# Environment Setup Guide

> Complete setup guide for new Indlela developers

## Prerequisites

Before you start, ensure you have these installed:

### Required Software

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm 9+** - Install with `npm install -g pnpm`
- **Git** - [Download](https://git-scm.com/)

### Mobile Development (Optional)

For iOS and Android development:

- **Android Studio** (for Android) - [Download](https://developer.android.com/studio)
  - Install Android SDK Platform 34 (Android 14)
  - Install Android SDK Build-Tools 34.0.0
  - Configure `ANDROID_HOME` environment variable

- **Xcode** (for iOS, macOS only) - [Mac App Store](https://apps.apple.com/app/xcode/id497799835)
  - Install Xcode Command Line Tools: `xcode-select --install`
  - Install CocoaPods: `sudo gem install cocoapods`

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/indlela/app.git indlela
cd indlela
```

### 2. Install Dependencies

```bash
pnpm install
```

This will:
- Install all npm packages
- Run `nuxt prepare` to generate type definitions
- Set up Git hooks

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# API Configuration
NUXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Payment Gateway (for testing payments)
NUXT_PUBLIC_YOCO_PUBLIC_KEY=pk_test_xxxxx
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Verify Installation

### Check Type Safety

```bash
pnpm typecheck
```

Should complete with no errors.

### Run Tests

```bash
pnpm test:run
```

All tests should pass.

### Check Linting

```bash
pnpm lint
```

Should show no errors (warnings are OK during development).

## Mobile Setup

### Android Setup

1. **Install Android Studio** and open it
2. **Open SDK Manager** (Tools > SDK Manager)
3. Install the following:
   - Android SDK Platform 34 (Android 14.0)
   - Android SDK Build-Tools 34.0.0
   - Android Emulator
4. **Create an AVD** (Android Virtual Device):
   - Tools > Device Manager
   - Create Device > Phone > Pixel 7
   - Select System Image: Android 14.0 (API 34)
   - Finish and launch the emulator

5. **Build and run the app**:

```bash
pnpm run android
```

This will:
- Build the app
- Sync with Capacitor
- Open Android Studio
- You can then click "Run" in Android Studio

### iOS Setup (macOS only)

1. **Install Xcode** from the Mac App Store
2. **Install Command Line Tools**:

```bash
xcode-select --install
```

3. **Install CocoaPods**:

```bash
sudo gem install cocoapods
```

4. **Build and run the app**:

```bash
pnpm run ios
```

This will:
- Build the app
- Sync with Capacitor
- Open Xcode
- You can then select a simulator and click "Run"

## Troubleshooting

### Node Version Issues

If you get errors about Node version:

```bash
# Check your Node version
node --version

# Should be v20.x.x or higher
# If not, install Node 20+ from nodejs.org
```

### pnpm Not Found

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 pnpm dev
```

### Android Studio Issues

**ANDROID_HOME not set:**

Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows (System Environment Variables)
# ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
```

**Gradle errors:**

```bash
cd android
./gradlew clean
cd ..
pnpm run android
```

### iOS Build Issues

**CocoaPods errors:**

```bash
cd ios/App
pod deintegrate
pod install
cd ../..
pnpm run ios
```

**Signing issues:**

1. Open Xcode
2. Select the project in the navigator
3. Select the "App" target
4. Go to "Signing & Capabilities"
5. Select your Apple Developer team or use "Automatically manage signing"

## Next Steps

Once you have the app running:

1. Read the [Architecture Overview](./architecture.md)
2. Review [Coding Standards](../standards/code-style.md)
3. Check out [First Contribution Guide](./first-contribution.md)
4. Explore [Component Patterns](../standards/component-patterns.md)

## Getting Help

- Check existing issues on GitHub
- Ask in the team Slack channel
- Review the [DEVELOPER-DOCUMENTATION.md](../../DEVELOPER-DOCUMENTATION.md) for detailed technical info
