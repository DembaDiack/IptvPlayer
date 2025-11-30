import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";
import { FocusableButton } from "../components";
import {
  getSettings,
  saveSettings,
  clearAllData,
  getSavedPlaylists,
  savePlaylist,
  removePlaylist,
  AppSettings,
  SavedPlaylist,
} from "../services";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState<AppSettings>({
    gridColumns: 2,
    autoPlay: true,
    showChannelLogos: true,
  });
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);

  useEffect(() => {
    loadSettings();
    loadPlaylists();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings((prev) => ({ ...prev, ...savedSettings }));
  };

  const loadPlaylists = async () => {
    const savedPlaylists = await getSavedPlaylists();
    setPlaylists(savedPlaylists);
  };

  const handleSettingChange = useCallback(
    async (key: keyof AppSettings, value: boolean | number) => {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      await saveSettings(newSettings);
    },
    [settings]
  );

  const handleAddPlaylist = async () => {
    if (!newPlaylistUrl.trim()) {
      Alert.alert("Error", "Please enter a playlist URL");
      return;
    }

    const playlist: SavedPlaylist = {
      name: newPlaylistName.trim() || "My Playlist",
      url: newPlaylistUrl.trim(),
      addedAt: new Date().toISOString(),
    };

    await savePlaylist(playlist);
    await loadPlaylists();
    setNewPlaylistUrl("");
    setNewPlaylistName("");
    setIsAddingPlaylist(false);
  };

  const handleRemovePlaylist = async (url: string) => {
    Alert.alert(
      "Remove Playlist",
      "Are you sure you want to remove this playlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removePlaylist(url);
            await loadPlaylists();
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all favorites, playlists, and settings. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            await loadSettings();
            await loadPlaylists();
            Alert.alert("Success", "All data has been cleared");
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: "Settings",
          headerStyle: { backgroundColor: colors.primaryBackground },
          headerTintColor: colors.primaryText,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Show Channel Logos</Text>
              <Text style={styles.settingDescription}>
                Display channel logos in the grid
              </Text>
            </View>
            <Switch
              value={settings.showChannelLogos}
              onValueChange={(value) =>
                handleSettingChange("showChannelLogos", value)
              }
              trackColor={{ false: colors.muted, true: colors.accent }}
              thumbColor={colors.primaryText}
            />
          </View>
        </View>

        {/* Playback Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-play</Text>
              <Text style={styles.settingDescription}>
                Automatically start playing when opening a channel
              </Text>
            </View>
            <Switch
              value={settings.autoPlay}
              onValueChange={(value) =>
                handleSettingChange("autoPlay", value)
              }
              trackColor={{ false: colors.muted, true: colors.accent }}
              thumbColor={colors.primaryText}
            />
          </View>
        </View>

        {/* Playlists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Playlists</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setIsAddingPlaylist(!isAddingPlaylist)}
            >
              <Ionicons
                name={isAddingPlaylist ? "close" : "add"}
                size={24}
                color={colors.accent}
              />
            </Pressable>
          </View>

          {isAddingPlaylist && (
            <View style={styles.addPlaylistForm}>
              <TextInput
                style={styles.input}
                placeholder="Playlist Name (optional)"
                placeholderTextColor={colors.secondaryText}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
              />
              <TextInput
                style={styles.input}
                placeholder="Playlist URL (m3u/m3u8)"
                placeholderTextColor={colors.secondaryText}
                value={newPlaylistUrl}
                onChangeText={setNewPlaylistUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <FocusableButton
                title="Add Playlist"
                onPress={handleAddPlaylist}
                variant="primary"
                size="small"
              />
            </View>
          )}

          {playlists.length === 0 ? (
            <Text style={styles.emptyText}>No saved playlists</Text>
          ) : (
            playlists.map((playlist) => (
              <View key={playlist.url} style={styles.playlistItem}>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.playlistUrl} numberOfLines={1}>
                    {playlist.url}
                  </Text>
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemovePlaylist(playlist.url)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <FocusableButton
            title="Clear All Data"
            onPress={handleClearAllData}
            variant="outline"
            icon={<Ionicons name="trash" size={20} color={colors.accent} />}
            style={styles.dangerButton}
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Built with</Text>
            <Text style={styles.aboutValue}>React Native + Expo</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
    backgroundColor: colors.secondaryBackground,
    borderRadius: 12,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    fontWeight: "500",
  },
  settingDescription: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  addButton: {
    padding: spacing.xs,
  },
  addPlaylistForm: {
    backgroundColor: colors.primaryBackground,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.secondaryBackground,
    color: colors.primaryText,
    padding: spacing.sm,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  playlistInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  playlistName: {
    ...typography.body,
    fontWeight: "500",
  },
  playlistUrl: {
    ...typography.bodySmall,
    fontSize: 12,
  },
  removeButton: {
    padding: spacing.xs,
  },
  emptyText: {
    ...typography.bodySmall,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  dangerButton: {
    borderColor: colors.error,
  },
  aboutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  aboutLabel: {
    ...typography.body,
  },
  aboutValue: {
    ...typography.bodySmall,
  },
});