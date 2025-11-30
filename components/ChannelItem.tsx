import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import typography from '../theme/typography';
import spacing from '../theme/spacing';
import { Channel } from '../services/types';

interface ChannelItemProps {
  channel: Channel;
  onPress: (channel: Channel) => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (channel: Channel) => void;
  showLogo?: boolean;
  layout?: 'grid' | 'list';
}

/**
 * Channel item component for displaying individual channels.
 * Supports both grid and list layouts, optimized for TV remote navigation.
 */
export function ChannelItem({
  channel,
  onPress,
  isFavorite = false,
  onFavoriteToggle,
  showLogo = true,
  layout = 'grid',
}: ChannelItemProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePress = useCallback(() => {
    onPress(channel);
  }, [channel, onPress]);

  const handleFavoritePress = useCallback(() => {
    onFavoriteToggle?.(channel);
  }, [channel, onFavoriteToggle]);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const containerStyles = [
    styles.container,
    layout === 'list' ? styles.listContainer : styles.gridContainer,
    isFocused && styles.focused,
  ];

  const renderLogo = () => {
    if (!showLogo || imageError || !channel.logo) {
      return (
        <View style={[styles.logoPlaceholder, layout === 'list' && styles.listLogoPlaceholder]}>
          <Ionicons name="tv" size={24} color={colors.secondaryText} />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: channel.logo }}
        style={[styles.logo, layout === 'list' && styles.listLogo]}
        resizeMode="contain"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <Pressable
      style={containerStyles}
      onPress={handlePress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${channel.name}${channel.group ? `, ${channel.group}` : ''}`}
    >
      {renderLogo()}
      
      <View style={[styles.info, layout === 'list' && styles.listInfo]}>
        <Text style={styles.name} numberOfLines={2}>
          {channel.name}
        </Text>
        {channel.group && (
          <Text style={styles.group} numberOfLines={1}>
            {channel.group}
          </Text>
        )}
      </View>

      {onFavoriteToggle && (
        <Pressable
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? colors.accent : colors.secondaryText}
          />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gridContainer: {
    flex: 1,
    margin: spacing.sm / 2,
    padding: spacing.sm,
    alignItems: 'center',
    minHeight: 140,
  },
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    padding: spacing.sm,
    minHeight: 70,
  },
  focused: {
    borderColor: colors.focusHighlight,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  listLogo: {
    width: 50,
    height: 50,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listLogoPlaceholder: {
    width: 50,
    height: 50,
  },
  info: {
    flex: 1,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  listInfo: {
    marginTop: 0,
    marginLeft: spacing.md,
    alignItems: 'flex-start',
  },
  name: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  group: {
    ...typography.bodySmall,
    fontSize: 12,
    marginTop: 2,
  },
  favoriteButton: {
    padding: spacing.xs,
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
});

export default ChannelItem;
