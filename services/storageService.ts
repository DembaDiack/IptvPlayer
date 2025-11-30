import AsyncStorage from '@react-native-async-storage/async-storage';
import { Channel } from './types';

const STORAGE_KEYS = {
  FAVORITES: '@iptv_favorites',
  LAST_WATCHED: '@iptv_last_watched',
  PLAYLISTS: '@iptv_playlists',
  SETTINGS: '@iptv_settings',
};

/**
 * Storage service for persisting app data.
 */

// Favorites management
export async function getFavorites(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

export async function addFavorite(channelId: string): Promise<void> {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(channelId)) {
      favorites.push(channelId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
}

export async function removeFavorite(channelId: string): Promise<void> {
  try {
    const favorites = await getFavorites();
    const updated = favorites.filter(id => id !== channelId);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

export async function isFavorite(channelId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.includes(channelId);
}

// Last watched channel
export async function getLastWatched(): Promise<Channel | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_WATCHED);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting last watched:', error);
    return null;
  }
}

export async function setLastWatched(channel: Channel): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_WATCHED, JSON.stringify(channel));
  } catch (error) {
    console.error('Error setting last watched:', error);
  }
}

// Saved playlists
export interface SavedPlaylist {
  name: string;
  url: string;
  addedAt: string;
}

export async function getSavedPlaylists(): Promise<SavedPlaylist[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved playlists:', error);
    return [];
  }
}

export async function savePlaylist(playlist: SavedPlaylist): Promise<void> {
  try {
    const playlists = await getSavedPlaylists();
    const exists = playlists.some(p => p.url === playlist.url);
    if (!exists) {
      playlists.push(playlist);
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    }
  } catch (error) {
    console.error('Error saving playlist:', error);
  }
}

export async function removePlaylist(url: string): Promise<void> {
  try {
    const playlists = await getSavedPlaylists();
    const updated = playlists.filter(p => p.url !== url);
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing playlist:', error);
  }
}

// App settings
export interface AppSettings {
  gridColumns?: number;
  autoPlay?: boolean;
  showChannelLogos?: boolean;
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Clear all data
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getLastWatched,
  setLastWatched,
  getSavedPlaylists,
  savePlaylist,
  removePlaylist,
  getSettings,
  saveSettings,
  clearAllData,
};
