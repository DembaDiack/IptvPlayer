import { Channel } from './types';

/**
 * Parse an M3U playlist string into an array of channels.
 * Supports extended M3U format with EXTINF metadata.
 * 
 * @param content - The raw M3U playlist content
 * @returns Array of parsed channels
 */
export function parseM3U(content: string): Channel[] {
  const channels: Channel[] = [];
  const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
  
  let currentChannel: Partial<Channel> | null = null;
  let channelIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip the header line
    if (line.startsWith('#EXTM3U')) {
      continue;
    }
    
    // Parse EXTINF line (channel metadata)
    if (line.startsWith('#EXTINF:')) {
      currentChannel = parseExtInf(line, channelIndex);
      channelIndex++;
      continue;
    }
    
    // Skip other comments
    if (line.startsWith('#')) {
      continue;
    }
    
    // This should be a URL line
    if (currentChannel && isValidStreamUrl(line)) {
      currentChannel.url = line;
      currentChannel.id = currentChannel.id || `channel-${channelIndex}`;
      currentChannel.name = currentChannel.name || `Channel ${channelIndex}`;
      channels.push(currentChannel as Channel);
      currentChannel = null;
    } else if (isValidStreamUrl(line)) {
      // URL without EXTINF
      channels.push({
        id: `channel-${channelIndex}`,
        name: `Channel ${channelIndex}`,
        url: line,
      });
      channelIndex++;
    }
  }
  
  return channels;
}

/**
 * Parse an EXTINF line to extract channel metadata.
 * 
 * Format: #EXTINF:duration tvg-id="id" tvg-name="name" tvg-logo="logo" group-title="group",Channel Name
 */
function parseExtInf(line: string, index: number): Partial<Channel> {
  const channel: Partial<Channel> = {
    id: `channel-${index}`,
  };
  
  // Extract the channel name (after the last comma)
  const commaIndex = line.lastIndexOf(',');
  if (commaIndex !== -1) {
    channel.name = line.substring(commaIndex + 1).trim();
  }
  
  // Extract tvg-id
  const tvgIdMatch = line.match(/tvg-id="([^"]*)"/i);
  if (tvgIdMatch) {
    channel.tvgId = tvgIdMatch[1];
  }
  
  // Extract tvg-name
  const tvgNameMatch = line.match(/tvg-name="([^"]*)"/i);
  if (tvgNameMatch) {
    channel.tvgName = tvgNameMatch[1];
  }
  
  // Extract tvg-logo
  const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
  if (logoMatch) {
    channel.logo = logoMatch[1];
  }
  
  // Extract group-title
  const groupMatch = line.match(/group-title="([^"]*)"/i);
  if (groupMatch) {
    channel.group = groupMatch[1];
  }
  
  return channel;
}

/**
 * Check if a string is a valid stream URL.
 */
function isValidStreamUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'rtsp:', 'rtmp:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Group channels by their group property.
 */
export function groupChannels(channels: Channel[]): Map<string, Channel[]> {
  const groups = new Map<string, Channel[]>();
  
  for (const channel of channels) {
    const groupName = channel.group || 'Ungrouped';
    const existingGroup = groups.get(groupName) || [];
    existingGroup.push(channel);
    groups.set(groupName, existingGroup);
  }
  
  return groups;
}

export default parseM3U;
