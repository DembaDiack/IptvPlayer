import axios from 'axios';
import { Channel, Playlist, ChannelGroup } from './types';
import { parseM3U, groupChannels } from './m3uParser';

/**
 * IPTV Service for fetching and managing playlists and channels.
 */

/**
 * Fetch an M3U playlist from a URL.
 * 
 * @param url - The URL of the M3U playlist
 * @param name - Optional name for the playlist
 * @returns Promise resolving to a Playlist object
 */
export async function fetchPlaylist(url: string, name?: string): Promise<Playlist> {
  try {
    console.log(`Fetching playlist from: ${url}`);
    
    const response = await axios.get<string>(url, {
      timeout: 30000,
      responseType: 'text',
      headers: {
        'User-Agent': 'IPTV-App/1.0',
      },
    });
    
    const channels = parseM3U(response.data);
    console.log(`Parsed ${channels.length} channels from playlist`);
    
    return {
      name: name || extractPlaylistName(url),
      url,
      channels,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to fetch playlist: ${error.message}`
        : 'Failed to fetch playlist'
    );
  }
}

/**
 * Extract a readable name from a playlist URL.
 */
function extractPlaylistName(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const fileName = pathParts[pathParts.length - 1] || 'playlist';
    return fileName.replace(/\.(m3u8?|txt)$/i, '') || 'Playlist';
  } catch {
    return 'Playlist';
  }
}

/**
 * Get channels grouped by category.
 */
export function getChannelGroups(channels: Channel[]): ChannelGroup[] {
  const grouped = groupChannels(channels);
  const groups: ChannelGroup[] = [];
  
  grouped.forEach((groupChannels, groupName) => {
    groups.push({
      name: groupName,
      channels: groupChannels,
    });
  });
  
  // Sort groups alphabetically, but put 'Ungrouped' at the end
  groups.sort((a, b) => {
    if (a.name === 'Ungrouped') return 1;
    if (b.name === 'Ungrouped') return -1;
    return a.name.localeCompare(b.name);
  });
  
  return groups;
}

/**
 * Search channels by name.
 */
export function searchChannels(channels: Channel[], query: string): Channel[] {
  if (!query.trim()) {
    return channels;
  }
  
  const searchTerm = query.toLowerCase().trim();
  
  return channels.filter(channel => {
    const name = channel.name.toLowerCase();
    const group = (channel.group || '').toLowerCase();
    const tvgName = (channel.tvgName || '').toLowerCase();
    
    return (
      name.includes(searchTerm) ||
      group.includes(searchTerm) ||
      tvgName.includes(searchTerm)
    );
  });
}

/**
 * Filter channels by group name.
 */
export function filterByGroup(channels: Channel[], groupName: string): Channel[] {
  if (!groupName || groupName === 'All') {
    return channels;
  }
  
  return channels.filter(channel => channel.group === groupName);
}

// Demo playlist URL for testing (free public IPTV playlist)
export const DEMO_PLAYLIST_URL = 'https://iptv-org.github.io/iptv/index.m3u';

export default {
  fetchPlaylist,
  getChannelGroups,
  searchChannels,
  filterByGroup,
  DEMO_PLAYLIST_URL,
};
