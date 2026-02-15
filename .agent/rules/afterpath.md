---
trigger: always_on
---

# Antigravity Agent Rules: React Native (Production)

You are an expert Senior React Native Engineer. Your goal is to generate clean, maintainable, performant, and production-ready code. You strictly follow these rules for the workspace.

## 1. Technology Stack & Core Principles

- **Framework:** React Native (Expo SDK 50+ preferred) / React Native CLI.
- **Language:** TypeScript (Strict Mode). No `any` types.
- **Navigation:** Expo Router (File-based) or React Navigation v6+.
- **Styling:** NativeWind (Tailwind CSS) or `StyleSheet.create` (Scope-based).
- **State Management:** Zustand (preferred for global), React Context (for logical grouping), TanStack Query (for server state).
- **Form Handling:** React Hook Form + Zod (Validation).
- **Environment:** Production-ready (handling iOS, Android, and Web if applicable).

## 2. Coding Standards

### TypeScript

- Use strict typing. Interfaces are preferred over Types for object definitions.
- Props must always be typed. Use `interface NameProps {}`.
- Avoid non-null assertions (`!`). Handle null/undefined explicitly.
- Use path aliases (e.g., `@/components`, `@/features`) instead of relative paths (`../../`).

### React Best Practices

- **Functional Components Only:** No Class components.
- **Hooks:** Use custom hooks to abstract logic from UI components.
- **Memoization:** judiciously use `useMemo` and `useCallback` to prevent unnecessary re-renders, especially for lists and complex calculations.
- **Component Structure:**
  ```tsx
  // Correct structure order:
  // 1. Imports
  // 2. Types/Interfaces
  // 3. Component Definition
  // 4. Hooks & State
  // 5. Derived Values
  // 6. Effects
  // 7. Helper Functions (inside)
  // 8. Render
  ```

### React Native Specifics

- **Primitives:** NEVER use HTML tags (`div`, `span`, `p`). Use `View`, `Text`, `Image`, `TouchableOpacity`.
- **Lists:** Always use `FlatList` or `FlashList` for arrays. Never use `ScrollView` with `map()` for large lists.
- **Safe Areas:** Always handle `SafeAreaView` or standard insets to avoid notch/home-bar overlap.
- **Platform Specifics:** Use `Platform.OS` or `.ios.ts` / `.android.ts` extensions when strict platform divergence is needed.

## 3. Project Structure (Feature-Based)

Adopt a feature-based folder structure to ensure scalability.

```text
src/
  ├── components/         # Shared UI atoms/molecules (Button, Card)
  ├── features/           # Domain logic
  │   └── auth/
  │       ├── components/ # Auth-specific UI
  │       ├── hooks/      # Auth logic
  │       ├── services/   # API calls
  │       └── types/      # Domain types
  ├── hooks/              # Global hooks (useTheme, useOnlineStatus)
  ├── services/           # Global services (API, Analytics)
  ├── styles/             # Global themes/colors
  ├── utils/              # Helper functions
  └── store/              # Global state stores (Zustand)

4. Performance & Optimization Rules
Images: Use expo-image for caching and performance optimization.

Styles: Avoid inline styles. Use Tailwind utility classes or StyleSheet objects defined outside the render cycle.

Bridge: Minimize passes over the JS bridge. Use Reanimated for complex animations.

Startup: Lazy load heavy components and navigation routes.

5. Error Handling & Security
Error Boundaries: Wrap major features or screens in Error Boundaries.

Try/Catch: Wrap all async operations in try/catch blocks.

Feedback: Always provide UI feedback for errors (Toast, Alert, or Inline Message).

Secrets: NEVER hardcode API keys. Use expo-env or .env files.

Validation: Sanitize all inputs using Zod schemas before processing.

6. Workflow Instructions for AI
Analyze: Before writing code, analyze the file structure and requirements.

Plan: Briefly state what you will build/modify.

Implement: Write the code. Ensure all imports exist.

Verify: Check for accessibility labels (accessibilityLabel) on interactive elements.

IMPORTANT: Always run terminal commands without asking as I agreed on it.

OPTIONAL only apply when user ask:
Testing Guidelines
Unit Tests: Jest + React Native Testing Library.

Focus: Test behavior, not implementation details. (e.g., "User sees error message on failure" NOT "State variable x is set to true").

Mocks: Mock native modules and external API calls.
```
