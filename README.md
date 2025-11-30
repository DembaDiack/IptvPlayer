# IPTV Player

A cross-platform IPTV application built with React Native and Expo, optimized for Android TV, Apple TV, and mobile devices.

## Features

- **Dark Theme UI**: Modern, clean interface optimized for TV and touch
- **M3U Playlist Support**: Fetch and parse M3U/M3U8 playlists from URLs
- **Channel Grid/List**: Efficient display of channels with FlatList windowing
- **Video Player**: Full-featured player with expo-av
- **TV Remote Support**: Focusable components for TV navigation
- **Search & Filter**: Find channels by name or category
- **Favorites**: Save your favorite channels
- **Drawer Navigation**: Right-side sliding drawer for categories and settings
- **Performance Optimized**: Handles large playlists efficiently

## Tech Stack

- React Native with Expo (managed workflow)
- expo-router for navigation
- expo-av for video playback
- axios for HTTP requests
- AsyncStorage for persistence
- React Native Reanimated for animations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npx expo start
   ```

3. Run on specific platforms:
   ```bash
   npm run android    # Android
   npm run ios        # iOS
   npm run web        # Web
   ```

## Project Structure

```
├── app/               # Screen components (expo-router)
│   ├── _layout.tsx    # Root layout with navigation
│   ├── index.tsx      # Home screen (channel list)
│   ├── player.tsx     # Video player screen
│   └── settings.tsx   # Settings screen
├── components/        # Reusable UI components
│   ├── ChannelItem.tsx
│   ├── DrawerPanel.tsx
│   ├── FocusableButton.tsx
│   ├── SearchBar.tsx
│   ├── LoadingOverlay.tsx
│   └── ErrorView.tsx
├── services/          # Business logic and API
│   ├── types.ts       # TypeScript interfaces
│   ├── m3uParser.ts   # M3U playlist parser
│   ├── iptvService.ts # IPTV data fetching
│   └── storageService.ts # AsyncStorage helpers
├── theme/             # Centralized styling
│   ├── colors.ts      # Color palette
│   ├── spacing.ts     # Spacing values
│   └── typography.ts  # Text styles
└── assets/            # Images and static files
```

## Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Background | #121212 | Main screen background |
| Secondary Background | #1E1E1E | Cards, panels |
| Primary Text | #FFFFFF | Main text |
| Secondary Text | #B0B0B0 | Subtitles, hints |
| Accent | #FF6D00 | Buttons, focus highlight |
| Program Highlight | #FFA000 | Featured content |
| Divider | #333333 | Borders, separators |

## TV Navigation

All interactive components support TV remote navigation:
- Focus states with visual highlight
- D-pad navigation between items
- Enter/Select button actions

## License

MIT
