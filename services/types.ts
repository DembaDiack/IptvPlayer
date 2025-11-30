/**
 * Channel interface representing an IPTV channel.
 */
export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  tvgId?: string;
  tvgName?: string;
}

/**
 * Playlist interface representing an M3U playlist.
 */
export interface Playlist {
  name: string;
  url: string;
  channels: Channel[];
  lastUpdated?: Date;
}

/**
 * Group interface for channel categorization.
 */
export interface ChannelGroup {
  name: string;
  channels: Channel[];
}

export default Channel;
