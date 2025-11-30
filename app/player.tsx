import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "../theme/colors";
import typography from "../theme/typography";
import spacing from "../theme/spacing";
import { setLastWatched } from "../services";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    url: string;
    name: string;
    channelId: string;
  }>();

  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPlaying = status?.isLoaded && status.isPlaying;

  // Save as last watched
  useEffect(() => {
    if (params.url && params.name && params.channelId) {
      setLastWatched({
        id: params.channelId,
        name: params.name,
        url: params.url,
      });
    }
  }, [params.url, params.name, params.channelId]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !error && !isLoading) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, error, isLoading]);

  const handlePlaybackStatusUpdate = useCallback((newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);

    if (newStatus.isLoaded) {
      setIsLoading(false);
      setError(null);
    }

    if (!newStatus.isLoaded && newStatus.error) {
      setError(newStatus.error);
      setIsLoading(false);
    }
  }, []);

  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleScreenPress = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleReload = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    if (videoRef.current) {
      try {
        await videoRef.current.unloadAsync();
        await videoRef.current.loadAsync({ uri: params.url }, {}, false);
        await videoRef.current.playAsync();
      } catch (err) {
        console.error("Error reloading video:", err);
        setError("Failed to reload stream");
      }
    }
  }, [params.url]);

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Playback Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorButtons}>
          <Pressable style={styles.errorButton} onPress={handleReload}>
            <Ionicons name="reload" size={20} color={colors.primaryText} />
            <Text style={styles.errorButtonText}>Retry</Text>
          </Pressable>
          <Pressable style={styles.errorButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={colors.primaryText} />
            <Text style={styles.errorButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      style={styles.container}
      onPress={handleScreenPress}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Video Player */}
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: params.url }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onLoad={() => setIsLoading(false)}
        onError={(e) => {
          console.error("Video error:", e);
          setError("Failed to load stream");
        }}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading stream...</Text>
        </View>
      )}

      {/* Controls Overlay */}
      {showControls && (
        <View style={[styles.controlsOverlay, { paddingTop: insets.top }]}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={28} color={colors.primaryText} />
            </Pressable>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName} numberOfLines={1}>
                {params.name || "Unknown Channel"}
              </Text>
            </View>
          </View>

          {/* Center Controls */}
          <View style={styles.centerControls}>
            <Pressable style={styles.playPauseButton} onPress={handlePlayPause}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={48}
                color={colors.primaryText}
              />
            </Pressable>
          </View>

          {/* Bottom Bar */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
            <Text style={styles.statusText}>
              {isPlaying ? "Playing" : "Paused"}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  channelInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  channelName: {
    ...typography.h2,
    fontSize: 20,
  },
  centerControls: {
    alignItems: "center",
    justifyContent: "center",
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 109, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    padding: spacing.md,
  },
  statusText: {
    ...typography.bodySmall,
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryBackground,
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h2,
    color: colors.error,
    marginTop: spacing.md,
  },
  errorMessage: {
    ...typography.body,
    color: colors.secondaryText,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  errorButtons: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  errorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondaryBackground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    gap: spacing.sm,
  },
  errorButtonText: {
    ...typography.button,
  },
});