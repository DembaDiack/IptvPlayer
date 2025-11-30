import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";
import {
  ChannelItem,
  SearchBar,
  LoadingOverlay,
  ErrorView,
  DrawerPanel,
  FocusableButton,
} from "../components";
import {
  Channel,
  ChannelGroup,
  fetchPlaylist,
  getChannelGroups,
  searchChannels,
  filterByGroup,
  DEMO_PLAYLIST_URL,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "../services";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_TV = Platform.isTV;
const NUM_COLUMNS = IS_TV ? 5 : SCREEN_WIDTH > 600 ? 4 : 2;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [groups, setGroups] = useState<ChannelGroup[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load playlist and favorites
  useEffect(() => {
    loadPlaylist();
    loadFavorites();
  }, []);

  const loadPlaylist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const playlist = await fetchPlaylist(DEMO_PLAYLIST_URL, "IPTV");
      setChannels(playlist.channels);
      setGroups(getChannelGroups(playlist.channels));
      console.log(`Loaded ${playlist.channels.length} channels`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load playlist";
      setError(message);
      console.error("Error loading playlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs);
  };

  // Filter channels based on search, group, and favorites
  const filteredChannels = useMemo(() => {
    let result = channels;

    // Filter by favorites if enabled
    if (showFavoritesOnly) {
      result = result.filter((ch) => favorites.includes(ch.id));
    }

    // Filter by group
    if (selectedGroup !== "All") {
      result = filterByGroup(result, selectedGroup);
    }

    // Filter by search query
    if (searchQuery) {
      result = searchChannels(result, searchQuery);
    }

    return result;
  }, [channels, selectedGroup, searchQuery, favorites, showFavoritesOnly]);

  // Handlers
  const handleChannelPress = useCallback(
    (channel: Channel) => {
      router.push({
        pathname: "/player",
        params: {
          url: channel.url,
          name: channel.name,
          channelId: channel.id,
        },
      });
    },
    [router]
  );

  const handleFavoriteToggle = useCallback(
    async (channel: Channel) => {
      const isFav = favorites.includes(channel.id);
      if (isFav) {
        await removeFavorite(channel.id);
        setFavorites((prev) => prev.filter((id) => id !== channel.id));
      } else {
        await addFavorite(channel.id);
        setFavorites((prev) => [...prev, channel.id]);
      }
    },
    [favorites]
  );

  const handleGroupSelect = useCallback((groupName: string) => {
    setSelectedGroup(groupName);
    setIsDrawerOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const toggleFavorites = useCallback(() => {
    setShowFavoritesOnly((prev) => !prev);
    setIsDrawerOpen(false);
  }, []);

  // Render functions
  const renderChannelItem = useCallback(
    ({ item }: { item: Channel }) => (
      <ChannelItem
        channel={item}
        onPress={handleChannelPress}
        isFavorite={favorites.includes(item.id)}
        onFavoriteToggle={handleFavoriteToggle}
        layout="grid"
      />
    ),
    [handleChannelPress, handleFavoriteToggle, favorites]
  );

  const keyExtractor = useCallback((item: Channel) => item.id, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: 160,
      offset: 160 * Math.floor(index / NUM_COLUMNS),
      index,
    }),
    []
  );

  // Loading state
  if (isLoading) {
    return <LoadingOverlay message="Loading channels..." />;
  }

  // Error state
  if (error) {
    return <ErrorView message={error} onRetry={loadPlaylist} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>IPTV Player</Text>
          <Text style={styles.subtitle}>
            {filteredChannels.length} channels
            {showFavoritesOnly && " (Favorites)"}
            {selectedGroup !== "All" && ` • ${selectedGroup}`}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            style={[
              styles.headerButton,
              showFavoritesOnly && styles.headerButtonActive,
            ]}
            onPress={toggleFavorites}
          >
            <Ionicons
              name={showFavoritesOnly ? "heart" : "heart-outline"}
              size={24}
              color={showFavoritesOnly ? colors.accent : colors.primaryText}
            />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={toggleDrawer}>
            <Ionicons name="menu" size={24} color={colors.primaryText} />
          </Pressable>
        </View>
      </View>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search channels..."
      />

      {/* Channel Grid */}
      {filteredChannels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="tv-outline" size={64} color={colors.secondaryText} />
          <Text style={styles.emptyText}>
            {showFavoritesOnly
              ? "No favorite channels yet"
              : "No channels found"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredChannels}
          renderItem={renderChannelItem}
          keyExtractor={keyExtractor}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          // Performance optimizations
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Drawer */}
      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Categories"
      >
        <FocusableButton
          title={`All Channels (${channels.length})`}
          onPress={() => handleGroupSelect("All")}
          variant={selectedGroup === "All" ? "primary" : "secondary"}
          style={styles.drawerButton}
        />
        {groups.map((group) => (
          <FocusableButton
            key={group.name}
            title={`${group.name} (${group.channels.length})`}
            onPress={() => handleGroupSelect(group.name)}
            variant={selectedGroup === group.name ? "primary" : "secondary"}
            style={styles.drawerButton}
          />
        ))}
        <View style={styles.drawerDivider} />
        <FocusableButton
          title="Settings"
          onPress={() => {
            setIsDrawerOpen(false);
            router.push("/settings");
          }}
          variant="ghost"
          icon={<Ionicons name="settings-outline" size={20} color={colors.primaryText} />}
          style={styles.drawerButton}
        />
      </DrawerPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.secondaryBackground,
  },
  headerButtonActive: {
    backgroundColor: colors.activeOverlay,
  },
  title: {
    ...typography.h1,
    fontSize: 24,
  },
  subtitle: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.secondaryText,
    marginTop: spacing.md,
    textAlign: "center",
  },
  drawerButton: {
    marginBottom: spacing.sm,
    justifyContent: "flex-start",
  },
  drawerDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
});
