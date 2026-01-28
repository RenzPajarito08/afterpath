# Afterpath - Feature Implementation Journey

> _"Every journey leaves a memory."_

This document outlines the feature roadmap and implementation status for **Afterpath**, a React Native mobile application built with Expo that helps users track and remember their physical journeys through GPS tracking and reflective journaling.

---

## 📱 Application Overview

**Tech Stack:**

- Framework: React Native (v0.81.5) with Expo SDK 54
- Navigation: React Navigation (Stack & Bottom Tabs)
- Backend: Supabase (Authentication & Database)
- Maps: React Native Maps with Expo Location
- Icons: Lucide React Native

**Platform:** iOS & Android

---

## ✅ Feature Implementation Status

### 🔐 1. Authentication & Welcome Screen

**Status:** ✅ Completed

**Implemented Features:**

- Email/password authentication via Supabase
- Toggle between Sign In and Sign Up modes
- Loading states with activity indicators
- Profile auto-creation on signup
- Email verification flow
- Clean, minimal UI with inspirational quote

**Location:** `src/screens/WelcomeScreen.tsx`

---

### 🏠 2. Home Screen

**Status:** ✅ Completed

**Implemented Features:**

- "Start Journey" call-to-action button
- Journey statistics display (Total kilometers, Journey count)
- Recent memories card display
- Tab navigation integration
- Location permission handling

**Location:** `src/screens/HomeScreen.tsx`

---

### 📅 3. Timeline Screen

**Status:** ✅ Completed

**Implemented Features:**

- Display all completed journeys in card format
- Journey preview with date, activity type, and distance
- Navigate to detailed journey view on card tap
- Empty state handling
- Pull-to-refresh functionality

**Location:** `src/screens/TimelineScreen.tsx`

---

### 🗺️ 4. Journey Detail Screen

**Status:** ✅ Completed

**Implemented Features:**

- Full map display with route polyline
- Journey metadata:
  - Date and time
  - Distance (kilometers)
  - Duration (formatted)
  - Activity type (Walking, Running, Cycling, Hiking)
- Memory/reflection text display
- Map region fit to route coordinates

**Location:** `src/screens/JourneyDetailScreen.tsx`

**Navigation Params:**

- `journeyId: string` - Unique identifier for the journey

---

### 👤 5. Profile (Me) Screen

**Status:** ✅ Completed

**Implemented Features:**

- User avatar display
- Email address display (non-editable)
- Personal information fields:
  - First Name (editable)
  - Last Name (editable)
  - Birthday (editable, MM/DD/YYYY format)
- Save changes functionality
- Sign Out button
- Form validation and loading states

**Location:** `src/screens/ProfileScreen.tsx`

---

### 🚀 6. Start Journey Screen

**Status:** ✅ Completed

**Implemented Features:**

- Optional journey title input field
- Activity type selection:
  - Walking (Footprints icon)
  - Running (Footprints icon)
  - Cycling (Bike icon)
  - Hiking (Mountain icon)
- Visual selection feedback with color change
- Start button to begin tracking
- Navigation to Tracking screen with selected activity

**Location:** `src/screens/StartJourneyScreen.tsx`

**Navigation Params:**

- Passes: `activityType: string` to Tracking screen

---

### 📍 7. Tracking Screen

**Status:** ✅ Completed

**Implemented Features:**

- Full-screen real-time map display
- GPS location tracking with high accuracy
- Live route polyline rendering
- Real-time metrics:
  - Distance traveled (kilometers)
  - Elapsed time (HH:MM:SS)
- Control buttons:
  - Pause/Resume tracking
  - End journey
- Location permission management
- Foreground location updates
- Map follows user position

**Location:** `src/screens/TrackingScreen.tsx`

**Navigation Params:**

- Receives: `activityType: string`
- Passes to Summary: `distance`, `duration`, `coordinates[]`, `activityType`

---

### 📝 8. Summary Screen (Journey Complete)

**Status:** ✅ Completed

**Implemented Features:**

- Journey route map preview
- Journey statistics display:
  - Distance
  - Duration
  - Activity type
- Reflection textarea for memory/notes
- Save journey to database (Supabase)
- Discard option with confirmation
- Navigation back to Home after save
- Data persistence

**Location:** `src/screens/SummaryScreen.tsx`

**Navigation Params:**

- Receives: `distance`, `duration`, `coordinates[]`, `activityType`

---

## 🏗️ Architecture & Navigation Structure

### Navigation Hierarchy

```
RootNavigator (Stack)
├── Welcome Screen (Auth Gate)
└── MainTabs (Bottom Tab Navigator)
    ├── Home Tab
    ├── Timeline Tab
    └── Profile Tab

Stack Modals (over tabs):
├── StartJourney Screen
├── Tracking Screen
├── Summary Screen
└── JourneyDetail Screen
```

### Data Models

**Profiles Table:**

- `id` (UUID, FK to auth.users)
- `username` (text)
- `first_name` (text, nullable)
- `last_name` (text, nullable)
- `birthday` (date, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Journeys Table:**

- `id` (UUID, PK)
- `user_id` (UUID, FK to profiles)
- `title` (text, nullable)
- `activity_type` (text)
- `distance` (numeric)
- `duration` (integer, seconds)
- `coordinates` (jsonb, array of lat/lng/timestamp)
- `reflection` (text)
- `created_at` (timestamp)

---

## 🎯 Development Status

**Current Version:** 1.0.0

**Platform Configuration:**

- iOS: Configured with location permissions in Info.plist
- Android: Package `com.afterpath` with location/foreground permissions

**Build System:** EAS Build

- Preview builds configured
- Production builds ready

---

## 📋 Future Enhancements (Potential)

- [ ] Social sharing of journeys
- [ ] Journey photos/media attachments
- [ ] Exercise goals and achievements
- [ ] Export journey data (GPX format)
- [ ] Dark mode support
- [ ] Offline journey tracking
- [ ] Journey statistics analytics dashboard

---

## 📁 Project Structure

```
frieren-journey/
├── src/
│   ├── screens/        # All screen components
│   ├── navigation/     # Navigation configuration
│   ├── context/        # React Context providers
│   ├── lib/           # Supabase client & utilities
│   └── sql/           # Database migrations
├── assets/            # Images, icons, splash screens
├── app.json          # Expo configuration
├── eas.json          # EAS Build configuration
└── package.json      # Dependencies
```

---

**Last Updated:** January 28, 2026  
**Maintained by:** Renz Pajarito  
**Status:** All core features implemented and functional ✅
