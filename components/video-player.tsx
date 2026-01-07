"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useDeviceMonitoring } from "@/hooks/use-device-monitoring";
import { useMobile } from "@/hooks/use-mobile";
import { useVideoSettingsModal } from "@/hooks/use-video-settings-modal";
import { BufferManager } from "@/lib/buffer-manager";
import { AdvancedABRManager } from "@/lib/custom-abr-manager";
import { ErrorRecoveryManager } from "@/lib/error-recovery";
import { Episode, Season, Series } from "@/lib/generated/prisma";
import { MuxVideoConfig, generateMuxHlsUrl } from "@/lib/mux-config";
import { initializeShakaPlayer } from "@/lib/shaka-player-config";
import { cn, formatDuration } from "@/lib/utils";
import {
  VideoError,
  VideoErrorType,
  parseVideoError,
} from "@/lib/video-player-utils";
import axios from "axios";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClosedCaption,
  GalleryVerticalEnd,
  Info,
  Maximize,
  Minimize,
  Pause,
  PauseIcon,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Settings2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaClosedCaptioning } from "react-icons/fa6";
import { MdOutlineRecordVoiceOver } from "react-icons/md";
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";
import { ActionHint } from "./action-hint";
import { VideoSettingsModal } from "./models/video-settings-modal";
import { NextEpisodePreviewCard } from "./next-episode-preview-card";
import { SeasonSelectorClient } from "./season-selector-client";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./video/loading-spinner";

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery(): Promise<BatteryManager>;
}

export interface SubtitleTrack {
  id: number;
  active: boolean;
  type: string;
  bandwidth?: number;
  language: string;
  src: string;
  label: string | null;
  kind: string | null;
  mimeType: string | null;
  primary: boolean;
  roles: string[];
  forced: boolean;
  originalTextId: string | null;
}

export interface VideoPlayerProps {
  muxConfig: MuxVideoConfig;
  thumbnail: string;
  autoplay?: boolean;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  episodes: Episode[];
  episode: Episode;
  series?: Series;
  episodeId: string;
  seasons: Season[];
  seriesId: string;
  playbackId: string | null | undefined;
  onEnded: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
  nextEpisodeId?: string;
}

interface QualityOption {
  id: number;
  label: string;
  height: number;
  bandwidth: number;
  isAuto: boolean;
}

interface AudioTrackOption {
  id: string;
  type: string;
  languageCode: string;
  label: string;
}

interface ApiAudioTrack {
  id: string;
  type: string;
  languageCode: string;
  name?: string | null;
}

/**
 * Core Video Player Component
 * Integrates Google Shaka Player with Mux HLS streaming
 */
export const VideoPlayer = ({
  muxConfig,
  thumbnail,
  onPlayNext,
  onPlayPrevious,
  hasNext,
  hasPrevious,
  episodes,
  episode,
  series,
  episodeId,
  seasons,
  seriesId,
  playbackId,
  onEnded,
  onTimeUpdate,
  className,
  initialProgress = 0,
  nextEpisodeId,
}: VideoPlayerProps & { initialProgress?: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<InstanceType<typeof shaka.Player> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<VideoError | null>(null);
  const errorRecoveryRef = useRef<ErrorRecoveryManager | null>(null);
  const bufferManagerRef = useRef<BufferManager | null>(null);
  const bufferCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  //const thumbnailGeneratorRef = useRef<ThumbnailGenerator | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferingProgress, setBufferingProgress] = useState(0);

  const [qualities, setQualities] = useState<QualityOption[]>([]);
  const qualitiesRef = useRef<QualityOption[]>([]);

  const [selectedQuality, setSelectedQuality] = useState<QualityOption | null>(
    null
  );
  const selectedQualityRef = useRef<QualityOption | null>(null);
  const [audioTracks, setAudioTracks] = useState<AudioTrackOption[]>([]);

  const [activeAudioTrackId, setActiveAudioTrackId] = useState<string | null>(
    null
  );
  const [currentPlayingHeight, setCurrentPlayingHeight] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play state
  const [remainingSeconds, setRemainingSeconds] = useState(10);
  const [showNextEpisodeIndicator, setShowNextEpisodeIndicator] =
    useState(false);
  const isNavigatingRef = useRef(false);
  const hasEnteredMobileFullscreenRef = useRef(false);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isAdjustingVolume, setIsAdjustingVolume] = useState(false);
  const volumeSliderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const { deviceStatus, getQualityRecommendation } = useDeviceMonitoring();

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showEpisodePanel, setShowEpisodePanel] = useState(false);

  // Thumbnail preview state
  const [thumbnails, setThumbnails] = useState<
    { time: number; dataUrl: string }[]
  >([]);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [thumbnailPosition, setThumbnailPosition] = useState({
    x: 0,
    time: 0,
  });
  const [thumbnailsGenerated, setThumbnailsGenerated] = useState(false);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<
    "main" | "quality" | "speed" | "subtitles" | "audio"
  >("main");
  const [availableTracks, setAvailableTracks] = useState<SubtitleTrack[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<number>(-1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLandscape, setIsLandscape] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const isMobile = useMobile();
  const { onOpen } = useVideoSettingsModal();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard control state
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  const [showCaptionIndicator, setShowCaptionIndicator] = useState(false);
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState(false);
  const [showSeekIndicator, setShowSeekIndicator] = useState(false);
  const [seekDirection, setSeekDirection] = useState<"forward" | "backward">(
    "forward"
  );
  const [seekAmount, setSeekAmount] = useState(10);
  const router = useRouter();
  const abrManagerRef = useRef<AdvancedABRManager | null>(null);
  const captionIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();
  const seasonId = searchParams.get("seasonId");

  // Use the first season as default if no season is selected
  const selectedSeason = seasonId || seasons[0]?.id || "";

  // Filter episodes by current season
  const filteredEpisodes = episodes
    .filter((ep) => ep.seasonId === selectedSeason)
    .sort((a, b) => (a?.episodeNumber ?? 0) - (b?.episodeNumber ?? 0));

  const handleSeasonChange = (newSeasonId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("seasonId", newSeasonId);
  };

  // Compute dynamic quality label for display
  const displayQualityLabel = useMemo(() => {
    if (!selectedQuality) return "";

    // If Auto is selected, show dynamic quality with current playing height
    if (selectedQuality.isAuto) {
      if (currentPlayingHeight) {
        return `Auto (${currentPlayingHeight}p)`;
      }
      // Fallback to label if height not available yet
      return selectedQuality.label;
    }

    // For specific quality selection, show the selected quality label
    return selectedQuality.label;
  }, [selectedQuality, currentPlayingHeight]);

  const nextEpisode = useMemo(() => {
    return episodes.find((ep) => ep.id === nextEpisodeId);
  }, [episodes, nextEpisodeId]);

  const nextEpisodeThumbnail = useMemo(() => {
    if (playbackId) {
      return `https://image.mux.com/${playbackId}/thumbnail.jpg`;
    }
    return (
      series?.thumbnailImageUrl ||
      seasons.find((s) => s.id === nextEpisode?.seasonId)?.thumbnailImageUrl
    );
  }, [series, seasons, playbackId, nextEpisode?.seasonId]);

  // Function declarations first
  const togglePlay = useCallback(async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();

        // On mobile, enter fullscreen and landscape on first play (requires user gesture)
        if (
          isMobile &&
          !isFullscreen &&
          !hasEnteredMobileFullscreenRef.current
        ) {
          hasEnteredMobileFullscreenRef.current = true;
          try {
            if (containerRef.current) {
              await containerRef.current.requestFullscreen();
              setIsFullscreen(true);
              // Landscape orientation will be locked by the existing isFullscreen effect
            }
          } catch (error) {
            console.log("Mobile fullscreen request failed:", error);
            // Even if fullscreen fails, try to lock orientation
            try {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              await screen.orientation?.lock("landscape");
            } catch (e) {
              console.log("Orientation lock failed:", e);
            }
          }
        }
      }
    }
  }, [isPlaying, isMobile, isFullscreen]);

  const togglePictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !pipSupported) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Error toggling picture-in-picture:", error);
    }
  }, [pipSupported]);

  // 4. Update the updateQualityDisplay function to be more resilient:
  const updateQualityDisplay = useCallback(() => {
    if (!playerRef.current) return;

    try {
      const tracks = playerRef.current.getVariantTracks();
      const activeTrack = tracks.find((track) => track.active);
      const currentSelectedQuality = selectedQualityRef.current;

      if (!currentSelectedQuality || !activeTrack || !activeTrack.height) {
        return;
      }

      // Notify ABR manager that the switch was successful
      if (abrManagerRef.current) {
        abrManagerRef.current.notifySwitchSuccess();
      }

      // Update current playing height for display
      const currentVariant = abrManagerRef.current?.getCurrentVariant();
      const displayHeight =
        currentVariant?.height ||
        currentVariant?.video?.height ||
        activeTrack.height;
      setCurrentPlayingHeight(displayHeight);

      // Only update if it's an Auto quality selection
      if (currentSelectedQuality.isAuto) {
        const autoQuality = qualitiesRef.current.find((q) => q.isAuto);
        if (autoQuality) {
          const updatedQuality = {
            ...autoQuality,
            label: `Auto (${displayHeight}p)`,
          };
          setSelectedQuality(updatedQuality);
          selectedQualityRef.current = updatedQuality;

          // Also update the qualities array so the settings view shows the updated label
          const updatedQualities = qualitiesRef.current.map((q) =>
            q.isAuto ? updatedQuality : q
          );
          setQualities(updatedQualities);
          qualitiesRef.current = updatedQualities;
        }
      }
    } catch (error) {
      console.error("Error updating quality display:", error);
    }
  }, []);

  // 5. Optimize updateAvailableQualities to prevent unnecessary updates:
  const updateAvailableQualities = useCallback(() => {
    try {
      if (!playerRef.current) {
        return;
      }

      const tracks = playerRef.current.getVariantTracks();

      if (!tracks || tracks.length === 0) {
        return;
      }

      const uniqueTracks = tracks
        .filter(
          (track, index, self) =>
            track.height &&
            index === self.findIndex((t) => t.height === track.height)
        )
        .sort((a, b) => (b.height || 0) - (a.height || 0));

      if (uniqueTracks.length === 0) {
        return;
      }

      const activeTrack = tracks.find((track) => track.active);

      if (!activeTrack || !activeTrack.height) {
        return;
      }

      // Update current playing height for display
      const currentVariant = abrManagerRef.current?.getCurrentVariant();
      const displayHeight =
        currentVariant?.height ||
        currentVariant?.video?.height ||
        activeTrack.height;
      setCurrentPlayingHeight(displayHeight);

      const qualityOptions: QualityOption[] = [
        ...uniqueTracks.map((track) => ({
          id: track.id || 0,
          label: `${track.height}p`,
          height: track.height || 0,
          bandwidth: track.bandwidth || 0,
          isAuto: false,
        })),
        {
          id: -1,
          label: `Auto (${displayHeight}p)`,
          height: 0,
          bandwidth: 0,
          isAuto: true,
        },
      ];

      // Only update if qualities actually changed
      const currentQualitiesStr = JSON.stringify(qualitiesRef.current);
      const newQualitiesStr = JSON.stringify(qualityOptions);

      if (currentQualitiesStr !== newQualitiesStr) {
        setQualities(qualityOptions);
        qualitiesRef.current = qualityOptions;

        // Default to Auto quality if none is set
        if (!selectedQualityRef.current) {
          // Select Auto quality by default for dynamic quality adaptation
          const autoQuality = qualityOptions.find((q) => q.isAuto);
          if (autoQuality) {
            setSelectedQuality(autoQuality);
            selectedQualityRef.current = autoQuality;
            console.log("Default quality set to Auto");
          }
        }
      }
    } catch (error) {
      console.error("Error updating qualities:", error);
    }
  }, []);

  const speedOptions = [
    { value: 0.25, label: "0.25x" },
    { value: 0.5, label: "0.5x" },
    { value: 0.75, label: "0.75x" },
    { value: 1, label: "Normal" },
    { value: 1.25, label: "1.25x" },
    { value: 1.5, label: "1.5x" },
    { value: 1.75, label: "1.75x" },
    { value: 2, label: "2x" },
  ];

  // Animation variants
  const settingsPanelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, x: 50, transition: { duration: 0.2 } },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playlistPanelVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
  };

  const settingsBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const controlsVariants = {
    hidden: { opacity: 0, y: 20, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  };

  const topbarVariants = {
    hidden: { opacity: 0, z: 20, transition: { duration: 0.2 } },
    visible: { opacity: 1, z: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, z: 20, transition: { duration: 0.2 } },
  };

  const volumeSliderVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring" as const, damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } },
  };

  const volumePercentageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, damping: 20, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };

  const settingsViewVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const thumbnailPreviewVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, damping: 20, stiffness: 300 },
    },
    exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } },
  };

  const indicatorVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, damping: 20, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  // Initialize shaka player
  useEffect(() => {
    let isMounted = true;
    let isInitializing = false;

    const handleError = (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorDetail = (event as any).detail;
      const errorCode = errorDetail?.code;

      console.error("Shaka Player error:", {
        code: errorCode,
        detail: errorDetail,
      });

      // Error 1003 is HTTP_ERROR - typically happens during quality switch segment fetch
      if (errorCode === 1003) {
        console.log("HTTP error during segment fetch - notifying ABR manager");
        // Notify ABR manager about the error so it can avoid this quality
        if (abrManagerRef.current) {
          abrManagerRef.current.notifySwitchError();
        }
        // Don't show error to user for transient HTTP errors during ABR
        // The player should retry automatically
        return;
      }

      // For other errors, parse and show to user
      const playerError = shaka.util.Error;
      const parsedError = parseVideoError(playerError);
      setError(parsedError);
      setIsLoading(false);
    };

    const handleLoadstart = () => setIsLoading(true);
    const handleCanplay = () => setIsLoading(false);
    const handleReady = () => {
      setIsReady(true);
      setIsLoading(false);
      // Notify ABR manager of successful load
      if (abrManagerRef.current) {
        abrManagerRef.current.notifySwitchSuccess();
      }
    };

    const initPlayer = async () => {
      if (!videoRef.current || isInitializing) return;

      isInitializing = true;
      setError(null);

      await new Promise<void>((resolve) => {
        const check = () => {
          if (videoRef.current?.isConnected) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });

      if (!isMounted) {
        isInitializing = false;
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (!muxConfig.playbackId || muxConfig.playbackId.trim() === "") {
          throw new Error(
            "Playback ID is required. Please provide a valid Mux playback ID."
          );
        }

        errorRecoveryRef.current = new ErrorRecoveryManager();

        const manifestUrl = await errorRecoveryRef.current.executeWithRetry(
          async () => {
            const url = generateMuxHlsUrl(muxConfig);
            if (!url)
              throw new Error("Failed to generate manifest URL from Mux");
            return url;
          }
        );

        console.log("Generated manifest URL:", manifestUrl);

        if (!manifestUrl.includes(".m3u8")) {
          throw new Error("Invalid manifest URL format - must be HLS (.m3u8)");
        }

        const player = (await initializeShakaPlayer(
          videoRef.current,
          manifestUrl
        )) as shaka.Player;

        if (!player) {
          throw new Error("Failed to initialize Shaka Player");
        }

        if (!isMounted) {
          player.destroy();
          isInitializing = false;
          return;
        }

        playerRef.current = player;
        bufferManagerRef.current = new BufferManager(videoRef.current);
        // Note: We don't use BufferManager's setOnBufferingChange callback
        // because isBuffering state is controlled by video events (waiting, playing, stalled)

        // Create and configure custom ABR manager
        const customABR = new AdvancedABRManager();
        abrManagerRef.current = customABR;

        // Set up callback for ABR variant changes to update UI
        customABR.setOnVariantChangeCallback((variant) => {
          if (variant) {
            // Get height from variant (could be variant.height or variant.video?.height)
            const height = variant.height || variant.video?.height;
            if (height) {
              // Update current playing height state
              setCurrentPlayingHeight(height);

              // Only update if currently on Auto mode
              const currentQuality = selectedQualityRef.current;
              if (currentQuality?.isAuto) {
                const updatedQuality = {
                  ...currentQuality,
                  label: `Auto (${height}p)`,
                };
                // Update both state and ref immediately
                setSelectedQuality(updatedQuality);
                selectedQualityRef.current = updatedQuality;

                // Also update the qualities array so the settings view shows the updated label
                const updatedQualities = qualitiesRef.current.map((q) =>
                  q.isAuto ? updatedQuality : q
                );
                setQualities(updatedQualities);
                qualitiesRef.current = updatedQualities;

                console.log(`ABR: Quality label updated to Auto (${height}p)`);
              }
            }
          }
        });

        const abrFactory = (): shaka.extern.AbrManager => {
          return customABR;
        };

        const bm = await (navigator as NavigatorWithBattery).getBattery();

        // Configure player with custom ABR - ABR enabled by default for dynamic quality
        player.configure({
          abrFactory: abrFactory,
          abr: {
            enabled: true,
          },
        });

        if (bm.charging && bm.level >= 0.5) {
          player.configure({
            abr: {
              bandwidthUpgradeTarget: 0.8, // More aggressive on good battery
            },
          });
        }

        // Enforce 1080p if device is charging and temperature is high
        if (
          bm.charging &&
          deviceStatus?.thermal.temperature &&
          deviceStatus.thermal.temperature > 42
        ) {
          const tracks = player.getVariantTracks();
          const maxHeight = 1080;
          const targetTrack =
            tracks.find((t) => t.height === maxHeight) ||
            [...tracks].sort((a, b) => (b.height || 0) - (a.height || 0))[0];

          if (targetTrack) {
            player.configure({
              abr: {
                enabled: false,
              },
            });
            player.selectVariantTrack(targetTrack, false);

            const qualityOption: QualityOption = {
              id: targetTrack.id || 0,
              label: `${targetTrack.height}p`,
              height: targetTrack.height || 0,
              bandwidth: targetTrack.bandwidth || 0,
              isAuto: false,
            };

            setSelectedQuality(qualityOption);
            selectedQualityRef.current = qualityOption;
          }
        }

        // Set up event listeners
        player.addEventListener("variantchanged", updateQualityDisplay);
        player.addEventListener("error", handleError);
        player.addEventListener("loadstart", handleLoadstart);
        player.addEventListener("canplay", handleCanplay);
        player.addEventListener("ready", handleReady);
        player.addEventListener("buffering", (event: Event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isBuffering = (event as any).buffering;
          setIsBuffering(isBuffering);
          console.log("Shaka buffering state:", isBuffering);
        });
        player.addEventListener("trackschanged", () => {
          updateTextTracks();
          updateAvailableQualities();
        });
        player.addEventListener("texttrackvisibility", () => {
          updateTextTracks();
        });

        updateTextTracks();
        setIsReady(true);

        // Set initial progress if provided
        if (initialProgress > 0 && videoRef.current) {
          videoRef.current.currentTime = initialProgress;
        }

        // Update qualities after a short delay to ensure tracks are loaded
        setTimeout(() => {
          updateAvailableQualities();
        }, 1000);

        setIsLoading(false);
        isInitializing = false;
      } catch (error) {
        const videoError: VideoError = {
          type: VideoErrorType.PLAYBACK,
          message: error instanceof Error ? error.message : "Unknown error",
          originalError:
            error instanceof Error ? error : new Error("Unknown error"),
        };
        setError(videoError);
        setIsLoading(false);
        isInitializing = false;
      }
    };

    // Initialize immediately, no delay
    initPlayer();

    return () => {
      isMounted = false;

      if (bufferCheckIntervalRef.current) {
        clearInterval(bufferCheckIntervalRef.current);
      }

      if (playerRef.current) {
        playerRef.current.removeEventListener(
          "variantchanged",
          updateQualityDisplay
        );
        playerRef.current.removeEventListener("error", handleError);
        playerRef.current.removeEventListener("loadstart", handleLoadstart);
        playerRef.current.removeEventListener("canplay", handleCanplay);
        playerRef.current.removeEventListener("ready", handleReady);

        playerRef.current.destroy();
        playerRef.current = null;
        setError(null);
      }

      if (bufferManagerRef.current) {
        bufferManagerRef.current = null;
      }

      if (errorRecoveryRef.current) {
        errorRecoveryRef.current = null;
      }

      if (abrManagerRef.current) {
        abrManagerRef.current.release();
        abrManagerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    muxConfig.playbackId,
    initialProgress,
    updateAvailableQualities,
    updateQualityDisplay,
  ]); // Only depend on playbackId, not entire muxConfig

  // 2. Add visibility change handler to prevent re-initialization:
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause video when tab is hidden to save resources
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      }
      // Don't do anything on visibility restore - let user manually play
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const loadAudioTrack = async () => {
      try {
        const response = await axios.get(
          `/api/series/multi-track-audio?episodeId=${episodeId}`
        );
        const tracks: ApiAudioTrack[] = response.data?.tracks ?? [];

        const formatted: AudioTrackOption[] = tracks.map((t) => ({
          id: t.id,
          type: t.type,
          languageCode: t.languageCode,
          label: t.name || t.languageCode || "Unknown",
        }));

        setAudioTracks(formatted);

        // Select a default language: prefer primary, else first track
        if (formatted.length > 0) {
          const primary =
            formatted.find((t) => t.type === "primary") || formatted[0];
          setActiveAudioTrackId(primary.id);
        } else {
          setActiveAudioTrackId(null);
        }
      } catch (error) {
        console.error("Failed to fetch tracks:", error);
      }
    };

    loadAudioTrack();
  }, [episodeId]);

  useEffect(() => {
    if (!videoRef.current || !bufferManagerRef.current) return;

    // Only use BufferManager for progress tracking, not for isBuffering state
    // The isBuffering state is controlled by video events (waiting, playing, stalled)
    bufferCheckIntervalRef.current = setInterval(() => {
      const state = bufferManagerRef.current?.getBufferState();
      if (state) {
        setBufferingProgress(state.bufferingProgress);
      }
    }, 500);

    return () => {
      if (bufferCheckIntervalRef.current) {
        clearInterval(bufferCheckIntervalRef.current);
      }
    };
  }, []);

  const updateTextTracks = () => {
    if (!playerRef.current) return;

    const tracks = playerRef.current.getTextTracks();

    // Convert Shaka TextTrack to SubtitleTrack format
    const convertedTracks: SubtitleTrack[] = tracks.map((track, index) => ({
      id: track.id ?? index,
      active: track.active ?? false,
      type: track.type ?? "subtitles",
      language: track.language ?? "unknown",
      src: track.originalLanguage ?? "",
      label: track.label ?? track.language ?? null,
      kind: track.kind ?? "subtitles",
      mimeType: track.mimeType ?? "text/vtt",
      primary: track.primary ?? false,
      roles: track.roles ?? [],
      forced: track.forced ?? false,
      originalTextId: null,
    }));

    setAvailableTracks(convertedTracks);

    const isTextVisible = playerRef.current.isTextTrackVisible();

    if (isTextVisible) {
      const activeTrack = tracks.find((track) => track.active);
      setActiveTrackId(activeTrack ? activeTrack.id : -1);
    } else {
      setActiveTrackId(-1);
    }
  };

  const handleTrackChange = (trackId: number) => {
    if (!playerRef.current) return;

    const tracks = playerRef.current.getTextTracks();

    if (trackId === -1) {
      playerRef.current.setTextTrackVisibility(false);
      setActiveTrackId(-1);
    } else {
      const selectTrack = tracks.find((track) => track.id === trackId);
      if (selectTrack) {
        playerRef.current.selectTextTrack(selectTrack);
        playerRef.current.setTextTrackVisibility(true);
        setActiveTrackId(trackId);
      }
    }
  };

  const getCurrentSubtitleLabel = (): string => {
    if (activeTrackId === -1) return "Off";
    const activeTrack = availableTracks.find((t) => t.id === activeTrackId);

    if (!activeTrack) {
      return "Off";
    }

    return activeTrack ? activeTrack.label || activeTrack.language : "Unknown";
  };

  // Enhanced audio selection
  const selectAudioTrack = async (track: AudioTrackOption) => {
    if (!playerRef.current) return;

    try {
      // 1. Select by language code
      // We rely on the language code for selection.
      // Note: If multiple tracks have the same language but different roles/labels,
      // shaka might pick the first one or the "primary" one if we don't specify role.
      // Since we are asked to not depend on track.type (which was mapping to role),
      // we just pass the language.
      playerRef.current.selectAudioLanguage(track.languageCode);

      // Update state
      setActiveAudioTrackId(track.id);

      // Determine feedback label
      const isOriginal = track.id === "original";
      const displayLabel = track.label || (isOriginal ? "Original" : "Audio");

      toast.success(`Switched to ${displayLabel}`);
    } catch (error) {
      console.error("Failed to select audio track:", error);
      toast.error("Failed to switch audio track");
    }
  };

  // 3. Improve the selectQuality function to not reinitialize:
  const selectQuality = useCallback((quality: QualityOption) => {
    if (!playerRef.current) return;

    try {
      if (quality.isAuto) {
        // Enable ABR without destroying player
        playerRef.current.configure({
          abr: {
            enabled: true,
          },
        });

        // Force the ABR manager to immediately select the best variant
        if (abrManagerRef.current) {
          abrManagerRef.current.forceVariantSelection();
        }

        // Update display immediately with current active track
        const tracks = playerRef.current.getVariantTracks();
        const activeTrack = tracks.find((track) => track.active);

        if (activeTrack && activeTrack.height) {
          // Update current playing height
          setCurrentPlayingHeight(activeTrack.height);
          const updatedQuality = {
            ...quality,
            label: `Auto (${activeTrack.height}p)`,
          };
          setSelectedQuality(updatedQuality);
          selectedQualityRef.current = updatedQuality;
        } else {
          setSelectedQuality(quality);
          selectedQualityRef.current = quality;
        }

        console.log("Switched to Auto quality - dynamic selection enabled");
      } else {
        // Disable ABR and select specific quality without destroying player
        playerRef.current.configure({
          abr: {
            enabled: false,
          },
        });

        const tracks = playerRef.current.getVariantTracks();
        const track = tracks.find((t) => t.height === quality.height);

        if (track) {
          // Use selectVariantTrack with clearBuffer=false to avoid disruption
          playerRef.current.selectVariantTrack(track, false);
          setSelectedQuality(quality);
          selectedQualityRef.current = quality;
          console.log(`Switched to manual quality: ${quality.height}p`);
        }
      }
    } catch (error) {
      console.error("Error selecting quality:", error);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current || !selectedQualityRef.current?.isAuto) return;

    const recommendation = getQualityRecommendation();
    if (recommendation.shouldReduceQuality) {
      console.log("Device monitoring:", recommendation.reason);

      // Notify user of thermal/battery based quality reduction
      if (deviceStatus.thermal.thermalLevel === "critical") {
        toast.info(
          `Video quality has been reduced to optimize device performance.`
        );
      }

      // Reduce quality by one level
      const currentQuality = selectedQualityRef.current;
      const currentIndex = qualitiesRef.current.findIndex(
        (q) => q.id === currentQuality.id
      );
      if (currentIndex < qualitiesRef.current.length - 1) {
        const newQuality = qualitiesRef.current[currentIndex + 1];
        selectQuality(newQuality);
      }
    }
  }, [
    deviceStatus.thermal.thermalLevel,
    getQualityRecommendation,
    selectQuality,
  ]);

  useEffect(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      setShowControls(true);
    }

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Generate thumbnails
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateThumbnails = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !duration || thumbnailsGenerated) return;

    try {
      const interval = Math.max(5, Math.floor(duration / 20));
      const newThumbnails = [];
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const thumbnailWidth = 160;
      const thumbnailHeight = 90;
      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;

      const wasPlaying = !video.paused;
      if (wasPlaying) video.pause();

      for (let time = 0; time < duration; time += interval) {
        video.currentTime = time;

        await new Promise<void>((resolve) => {
          const seeked = () => {
            video.removeEventListener("seeked", seeked);
            resolve();
          };
          video.addEventListener("seeked", seeked);
        });

        try {
          ctx.drawImage(video, 0, 0, thumbnailWidth, thumbnailHeight);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          newThumbnails.push({ time, dataUrl });
        } catch (error) {
          console.log(error);
          // Fallback for CORS issues
          newThumbnails.push({ time, dataUrl: "" });
        }
      }

      if (wasPlaying) {
        try {
          await video.play();
        } catch (error) {
          console.warn("Failed to resume video playback:", error);
        }
      }
      video.currentTime = currentTime;

      setThumbnails(newThumbnails);
      setThumbnailsGenerated(true);
    } catch (error) {
      console.error("Error generating thumbnails:", error);
    }
  }, [duration, thumbnailsGenerated, currentTime]);

  // Handle progress bar hover for thumbnails
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressContainerRef.current || !duration) return;

    const rect = progressContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const time = (percentage / 100) * duration;

    setThumbnailPosition({
      x: Math.min(Math.max(x, 80), rect.width - 80),
      time,
    });
    setShowThumbnail(true);
  };

  // Find current thumbnail
  const currentThumbnail = useMemo(() => {
    if (thumbnails.length === 0) return null;
    return thumbnails.reduce((prev, curr) => {
      return Math.abs(curr.time - thumbnailPosition.time) <
        Math.abs(prev.time - thumbnailPosition.time)
        ? curr
        : prev;
    });
  }, [thumbnails, thumbnailPosition.time]);

  // Seek functions
  const seekForward = useCallback(
    (seconds = 10) => {
      const video = videoRef.current;
      if (!video) return;

      const newTime = Math.min(video.currentTime + seconds, duration);
      video.currentTime = newTime;
      setCurrentTime(newTime);

      setSeekDirection("forward");
      setSeekAmount(seconds);
      setShowSeekIndicator(true);
      setTimeout(() => setShowSeekIndicator(false), 1000);
    },
    [duration]
  );

  const seekBackward = (seconds = 10) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(video.currentTime - seconds, 0);
    video.currentTime = newTime;
    setCurrentTime(newTime);

    setSeekDirection("backward");
    setSeekAmount(seconds);
    setShowSeekIndicator(true);
    setTimeout(() => setShowSeekIndicator(false), 1000);
  };

  const lockOrientationToLandscape = useCallback(async () => {
    if (!isMobile || !screen?.orientation) return;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      await screen.orientation.lock("landscape");
    } catch (error) {
      // Silently fail - orientation lock is not critical
      console.log("Orientation lock not supported or failed", error);
    }
  }, [isMobile]);

  const unlockOrientation = useCallback(async () => {
    if (!isMobile || !screen?.orientation) return;

    try {
      screen.orientation.unlock();
    } catch (error) {
      // Silently fail
      console.log("Orientation unlock failed", error);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;

    const updateOrientation = () => {
      const isLandscapeNow =
        window.orientation === 90 || window.orientation === -90;
      setIsLandscape(isLandscapeNow);
    };

    // Set initial orientation
    updateOrientation();

    // Only listen to orientation changes to update state, don't interfere with locking
    window.addEventListener("orientationchange", updateOrientation);

    return () => {
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, [isMobile]);

  // Reset mobile fullscreen flag when component unmounts or video changes
  useEffect(() => {
    return () => {
      hasEnteredMobileFullscreenRef.current = false;
    };
  }, [muxConfig]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (isFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } else if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (error) {
      console.warn(
        "Fullscreen toggle failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }, [isFullscreen]);

  const handleFullScreenChange = () => {
    const isCurrentlyFullScreen = document.fullscreenElement !== null;
    setIsFullscreen(isCurrentlyFullScreen);
  };

  // Video event handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  useEventListener(
    "fullscreenchange" as unknown as keyof WindowEventMap,
    handleFullScreenChange,
    undefined
  );

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleEpisodePanel = useCallback(() => {
    setShowEpisodePanel(!showEpisodePanel);
  }, [showEpisodePanel]);

  const toggleCaption = useCallback(() => {
    // Helper to briefly show caption indicator on any caption toggle
    const showIndicator = () => {
      if (captionIndicatorTimeoutRef.current) {
        clearTimeout(captionIndicatorTimeoutRef.current);
      }
      setShowCaptionIndicator(true);
      captionIndicatorTimeoutRef.current = setTimeout(() => {
        setShowCaptionIndicator(false);
      }, 800);
    };

    const nextTrackId = (activeTrackId + 1) % (availableTracks.length + 1);
    setActiveTrackId(nextTrackId);
    if (playerRef.current) {
      if (nextTrackId === availableTracks.length) {
        // Disable captions
        playerRef.current.setTextTrackVisibility(false);
        showIndicator();
      } else {
        // Enable selected caption track
        const shakaTrack = playerRef.current
          .getTextTracks()
          .find((t) => t.id === availableTracks[nextTrackId]?.id);
        if (shakaTrack) {
          playerRef.current.selectTextTrack(shakaTrack);
          playerRef.current.setTextTrackVisibility(true);
          showIndicator();
        }
      }
    }
  }, [activeTrackId, availableTracks]);

  // Handle orientation locking when fullscreen state changes
  useEffect(() => {
    if (!isMobile) return;

    if (isFullscreen) {
      // Lock to landscape when entering fullscreen
      const timeout = setTimeout(() => {
        lockOrientationToLandscape();
      }, 500);

      return () => clearTimeout(timeout);
    } else {
      // Unlock orientation when exiting fullscreen
      unlockOrientation();
    }
  }, [isFullscreen, isMobile, lockOrientationToLandscape, unlockOrientation]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for our handled keys
      if (
        [
          "Space",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "KeyP",
          "KeyL",
          "KeyM",
          "KeyF",
          "KeyN",
          "KeyE",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }

      switch (e.code) {
        case "Space":
          togglePlay();
          setShowPlayPauseIndicator(true);
          setTimeout(() => setShowPlayPauseIndicator(false), 1000);
          break;
        case "KeyK":
          togglePlay();
          setShowPlayPauseIndicator(true);
          setTimeout(() => setShowPlayPauseIndicator(false), 1000);
          break;
        case "ArrowUp":
          const newVolumeUp = Math.min(1, volume + 0.1);
          setVolume(newVolumeUp);
          if (isMuted) setIsMuted(false);
          setShowVolumeIndicator(true);
          setTimeout(() => setShowVolumeIndicator(false), 1500);
          break;
        case "ArrowDown":
          const newVolumeDown = Math.max(0, volume - 0.1);
          setVolume(newVolumeDown);
          if (isMuted) setIsMuted(false);
          setShowVolumeIndicator(true);
          setTimeout(() => setShowVolumeIndicator(false), 1500);
          break;
        case "ArrowLeft":
          seekBackward(10);
          break;
        case "ArrowRight":
          seekForward(10);
          break;
        case "KeyP":
          if (pipSupported) {
            togglePictureInPicture();
          }
          break;
        case "KeyL":
          setShowPlaylist(!showPlaylist);
          break;
        case "KeyF":
          toggleFullscreen();
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyC":
          toggleCaption();
          break;
        case "KeyE":
          toggleEpisodePanel();
          break;
        case "KeyN":
          if (e.shiftKey && hasNext) {
            onPlayNext();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    volume,
    isMuted,
    isPlaying,
    pipSupported,
    duration,
    showPlaylist,
    seekForward,
    togglePictureInPicture,
    togglePlay,
    toggleFullscreen,
    toggleMute,
    toggleCaption,
    toggleEpisodePanel,
    hasNext,
    hasPrevious,
    onPlayNext,
    onPlayPrevious,
  ]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setShowPlayPauseIndicator(true);
      setTimeout(() => setShowPlayPauseIndicator(false), 1000);
    };

    const onPause = () => {
      setIsPlaying(false);
      setShowPlayPauseIndicator(true);
      setTimeout(() => setShowPlayPauseIndicator(false), 1000);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // Call the parent's onTimeUpdate callback if provided
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime, video.duration);
      }

      // Handle next episode indicator
      const duration = video.duration;
      const timeLeft = duration - video.currentTime;
      if (timeLeft <= 10 && nextEpisodeId) {
        setRemainingSeconds(Math.max(0, Math.ceil(timeLeft)));
        setShowNextEpisodeIndicator(true);
      } else {
        setShowNextEpisodeIndicator(false);
      }

      // Fallback: If onEnded doesn't fire, force it when extremely close to end
      if (duration > 0 && timeLeft < 0.5 && nextEpisodeId) {
        if (!isNavigatingRef.current) {
          console.log("Internal Player: Fallback navigation triggered");
          isNavigatingRef.current = true; // Prevent internal multiple triggers
          onEnded();
        }
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };

    // Check PiP support
    if ("pictureInPictureEnabled" in document) {
      setPipSupported(true);
    }

    const onEnterPiP = () => {
      setIsPictureInPicture(true);
    };

    const onLeavePiP = () => {
      setIsPictureInPicture(false);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("enterpictureinpicture", onEnterPiP);
    video.addEventListener("leavepictureinpicture", onLeavePiP);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("enterpictureinpicture", onEnterPiP);
      video.removeEventListener("leavepictureinpicture", onLeavePiP);
    };
  }, [onTimeUpdate, nextEpisodeId, onEnded]);

  // Clean up caption indicator timeout on unmount
  useEffect(() => {
    return () => {
      if (captionIndicatorTimeoutRef.current) {
        clearTimeout(captionIndicatorTimeoutRef.current);
      }
    };
  }, []);

  // Update video playback when state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
      setShowPlayPauseIndicator(true);
      setTimeout(() => setShowPlayPauseIndicator(false), 1000);
    } else {
      video.pause();
      setShowPlayPauseIndicator(true);
      setTimeout(() => setShowPlayPauseIndicator(false), 1000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Handle progress bar interaction
  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Settings navigation
  const openSettings = () => {
    setShowSettings(true);
    setSettingsView("main");
  };

  const closeSettings = () => {
    setShowSettings(false);
  };

  const navigateTo = (
    view: "main" | "quality" | "speed" | "subtitles" | "audio"
  ) => {
    setSettingsView(view);
  };

  // Calculate direction for animations
  const getDirection = (current: string, target: string) => {
    const views = ["main", "quality", "speed", "subtitles", "audio"];
    const currentIndex = views.indexOf(current);
    const targetIndex = views.indexOf(target);
    return targetIndex > currentIndex ? 1 : -1;
  };

  return (
    <>
      <VideoSettingsModal />
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full transition-all duration-1000",
          isFullscreen && isMobile && "h-screen w-screen max-w-none"
        )}
      >
        {isLoading && <LoadingSpinner />}

        {/* Buffering Spinner - shows when video is buffering during playback or quality switch */}
        {isBuffering && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-white/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin" />
              </div>
              <span className="text-white/70 text-sm font-medium">
                {selectedQuality?.isAuto
                  ? "Optimizing quality..."
                  : "Buffering..."}
              </span>
            </div>
          </div>
        )}

        {/* Buffer progress bar at bottom */}
        {isBuffering && (
          <div className="absolute bottom-0 left-0 right-0 h-1 z-50">
            <div
              className="h-full bg-linear-to-r from-violet-500 to-violet-600 transition-all duration-300"
              style={{ width: `${bufferingProgress}%` }}
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className={cn(
              "inset-0 items-center justify-center bg-black/40 backdrop-blur-lg h-screen",
              !error ? "hidden" : "flex"
            )}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${thumbnail})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <div className="flex flex-col items-center p-6">
              <div className="flex items-center justify-center size-16 rounded-full bg-destructive/20 mb-2">
                <AlertTriangle className="size-8 text-destructive" />
              </div>
              <p className="text-red-500 text-lg font-semibold mb-2">
                Playback Error
              </p>
              <p className="text-gray-300 text-sm mb-4 mx-4">{error.message}</p>
              <div className="mt-2">
                <Button onClick={() => window.location.reload()} size="sm">
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Next Episode Indicator */}
        <AnimatePresence>
          {showNextEpisodeIndicator && nextEpisodeId && (
            <motion.div
              className="absolute bottom-24 right-4 z-50 pointer-events-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg">
                <p className="text-sm text-gray-300">
                  Next episode in {remainingSeconds}
                  {remainingSeconds === 1 ? "second" : "seconds"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn("flex gap-4", error && "hidden")}>
          {/* Playlist sidebar */}

          {/* Video player */}
          <div
            className="flex-1"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <div
              className={cn(
                "relative transition-all duration-1000 overflow-hidden",
                // Non-fullscreen mode: maintain aspect ratio for all devices
                // !isFullscreen && "aspect-video",
                // Fullscreen mode: specific heights for mobile and desktop
                isFullscreen && !isMobile && "h-full lg:h-[740px]", // Full height for desktop fullscreen
                isFullscreen && "lg:h-full xl:h-full w-full mt-0", // Fixed height for mobile fullscreen
                className
              )}
            >
              <div>
                <video
                  ref={videoRef}
                  className={cn(
                    "navbar-width",
                    isFullscreen ? "h-screen" : "h-[40.3rem]",
                    isMobile && "h-screen -mt-14"
                  )}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={onEnded}
                  onClick={togglePlay}
                  autoPlay
                  loop={false}
                  playsInline
                  crossOrigin="anonymous"
                />

                {/* Hidden canvas for thumbnail generation */}
                <canvas ref={canvasRef} className="hidden" />

                {isReady && (
                  <div
                    data-player-hook="logo"
                    className="fixed right-0 mr-8 top-6 sm:top-8 z-20"
                    style={{ top: "24.864px" }}
                  >
                    <div
                      className="iqp-logo-top-logo logoShowAnimation"
                      data-player-hook="topLogo"
                      style={{ height: "1.2rem", right: "29.2493px" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        width="87"
                        height="26"
                        viewBox="0 0 87 26"
                        fill="none"
                      >
                        <path
                          data-figma-bg-blur-radius="6"
                          d="M4.92048 0.318092V23.5908H2.21729e-05V0.318092H4.92048ZM17.7529 15.4999H21.9347L24.037 18.2045L26.1051 20.6135L30.0029 25.4999H25.412L22.7301 22.2045L21.3551 20.2499L17.7529 15.4999ZM30.3551 11.9545C30.3551 14.4923 29.8741 16.6514 28.912 18.4317C27.9574 20.212 26.6544 21.5719 25.0029 22.5113C23.3589 23.4431 21.5104 23.909 19.4574 23.909C17.3892 23.909 15.5332 23.4393 13.8892 22.4999C12.2453 21.5605 10.946 20.2007 9.9915 18.4204C9.03695 16.6401 8.55968 14.4848 8.55968 11.9545C8.55968 9.41658 9.03695 7.25749 9.9915 5.47718C10.946 3.69688 12.2453 2.34082 13.8892 1.409C15.5332 0.469608 17.3892 -8.96454e-05 19.4574 -8.96454e-05C21.5104 -8.96454e-05 23.3589 0.469608 25.0029 1.409C26.6544 2.34082 27.9574 3.69688 28.912 5.47718C29.8741 7.25749 30.3551 9.41658 30.3551 11.9545ZM25.3665 11.9545C25.3665 10.3105 25.1203 8.92415 24.6279 7.79537C24.143 6.66658 23.4574 5.81052 22.571 5.22718C21.6847 4.64385 20.6468 4.35218 19.4574 4.35218C18.268 4.35218 17.2301 4.64385 16.3438 5.22718C15.4574 5.81052 14.768 6.66658 14.2756 7.79537C13.7907 8.92415 13.5483 10.3105 13.5483 11.9545C13.5483 13.5984 13.7907 14.9848 14.2756 16.1135C14.768 17.2423 15.4574 18.0984 16.3438 18.6817C17.2301 19.2651 18.268 19.5567 19.4574 19.5567C20.6468 19.5567 21.6847 19.2651 22.571 18.6817C23.4574 18.0984 24.143 17.2423 24.6279 16.1135C25.1203 14.9848 25.3665 13.5984 25.3665 11.9545ZM53.4659 0.318092V23.5908H49.2159L39.0909 8.94309H38.9205V23.5908H34V0.318092H38.3182L48.3637 14.9545H48.5682V0.318092H53.4659ZM62.4517 0.318092V23.5908H57.5313V0.318092H62.4517ZM71.1137 0.318092L75.8068 8.24991H75.9887L80.7046 0.318092H86.2614L79.1591 11.9545L86.4205 23.5908H80.7614L75.9887 15.6476H75.8068L71.0341 23.5908H65.3977L72.6818 11.9545L65.5341 0.318092H71.1137Z"
                          fill="white"
                          fillOpacity="0.50"
                          id="iqn-logo"
                        />
                        <defs>
                          <clipPath transform="translate(6 6)">
                            <path d="M4.92048 0.318092V23.5908H2.21729e-05V0.318092H4.92048ZM17.7529 15.4999H21.9347L24.037 18.2045L26.1051 20.6135L30.0029 25.4999H25.412L22.7301 22.2045L21.3551 20.2499L17.7529 15.4999ZM30.3551 11.9545C30.3551 14.4923 29.8741 16.6514 28.912 18.4317C27.9574 20.212 26.6544 21.5719 25.0029 22.5113C23.3589 23.4431 21.5104 23.909 19.4574 23.909C17.3892 23.909 15.5332 23.4393 13.8892 22.4999C12.2453 21.5605 10.946 20.2007 9.9915 18.4204C9.03695 16.6401 8.55968 14.4848 8.55968 11.9545C8.55968 9.41658 9.03695 7.25749 9.9915 5.47718C10.946 3.69688 12.2453 2.34082 13.8892 1.409C15.5332 0.469608 17.3892 -8.96454e-05 19.4574 -8.96454e-05C21.5104 -8.96454e-05 23.3589 0.469608 25.0029 1.409C26.6544 2.34082 27.9574 3.69688 28.912 5.47718C29.8741 7.25749 30.3551 9.41658 30.3551 11.9545ZM25.3665 11.9545C25.3665 10.3105 25.1203 8.92415 24.6279 7.79537C24.143 6.66658 23.4574 5.81052 22.571 5.22718C21.6847 4.64385 20.6468 4.35218 19.4574 4.35218C18.268 4.35218 17.2301 4.64385 16.3438 5.22718C15.4574 5.81052 14.768 6.66658 14.2756 7.79537C13.7907 8.92415 13.5483 10.3105 13.5483 11.9545C13.5483 13.5984 13.7907 14.9848 14.2756 16.1135C14.768 17.2423 15.4574 18.0984 16.3438 18.6817C17.2301 19.2651 18.268 19.5567 19.4574 19.5567C20.6468 19.5567 21.6847 19.2651 22.571 18.6817C23.4574 18.0984 24.143 17.2423 24.6279 16.1135C25.1203 14.9848 25.3665 13.5984 25.3665 11.9545ZM53.4659 0.318092V23.5908H49.2159L39.0909 8.94309H38.9205V23.5908H34V0.318092H38.3182L48.3637 14.9545H48.5682V0.318092H53.4659ZM62.4517 0.318092V23.5908H57.5313V0.318092H62.4517ZM71.1137 0.318092L75.8068 8.24991H75.9887L80.7046 0.318092H86.2614L79.1591 11.9545L86.4205 23.5908H80.7614L75.9887 15.6476H75.8068L71.0341 23.5908H65.3977L72.6818 11.9545L65.5341 0.318092H71.1137Z" />
                          </clipPath>
                          <filter
                            x="-2.7%"
                            y="-8.9%"
                            width="105.5%"
                            height="117.8%"
                            filterUnits="objectBoundingBox"
                            id="filter-2"
                          >
                            <feOffset
                              dx="0"
                              dy="0"
                              in="SourceAlpha"
                              result="shadowOffsetOuter1"
                            ></feOffset>
                            <feGaussianBlur
                              stdDeviation="1"
                              in="shadowOffsetOuter1"
                              result="shadowBlurOuter1"
                            ></feGaussianBlur>
                            <feComposite
                              in="shadowBlurOuter1"
                              in2="SourceAlpha"
                              operator="out"
                              result="shadowBlurOuter1"
                            ></feComposite>
                            <feColorMatrix
                              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0"
                              type="matrix"
                              in="shadowBlurOuter1"
                            ></feColorMatrix>
                          </filter>
                        </defs>
                        <g
                          id="播放器胡"
                          stroke="none"
                          strokeWidth="1"
                          fill="none"
                          fillRule="evenodd"
                        >
                          <g
                            id="形状你"
                            transform="translate(1.000000, 1.000000)"
                          >
                            <use
                              fill="black"
                              fillOpacity="1"
                              filter="url(#filter-2)"
                              xlinkHref="#iqn-logo"
                            ></use>
                            <use
                              fillOpacity="0.6"
                              fill="#FFFFFF"
                              fillRule="evenodd"
                              xlinkHref="#iqn-logo"
                            ></use>
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div
                      className="iqp-logo-top"
                      data-player-hook="adLogo"
                      style={{ display: "none" }}
                    >
                      <div
                        data-player-hook="ad-close-btn"
                        style={{ display: "none" }}
                        className="ad-close"
                      ></div>
                      <div
                        id="gpt-sponsored-ad"
                        data-player-hook="sponsored-ad"
                        style={{ pointerEvents: "auto" }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Keyboard control indicators */}
                <AnimatePresence>
                  {showVolumeIndicator && (
                    <motion.div
                      className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                      variants={indicatorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.round(isMuted ? 0 : volume * 100)}%
                      </span>
                    </motion.div>
                  )}

                  {showSeekIndicator && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-3 rounded-lg flex items-center gap-2 z-50">
                      {seekDirection === "forward" ? (
                        <RotateCw className="size-5" />
                      ) : (
                        <RotateCcw className="size-5" />
                      )}
                      <span className="text-sm font-medium">
                        {seekDirection === "forward" ? "+" : "-"}
                        {seekAmount}s
                      </span>
                    </div>
                  )}
                </AnimatePresence>

                {/* Play/Pause overlay */}
                <AnimatePresence>
                  {showPlayPauseIndicator && (
                    <div className="absolute inset-0 flex items-center justify-center z-50">
                      <motion.button
                        onClick={togglePlay}
                        className="flex items-center justify-center size-16 text-white bg-black/50 backdrop-blur-sm rounded-full transition-colors hover:bg-black/70"
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{
                          scale: 0.9,
                          transition: { duration: 0.1 },
                        }}
                        initial={{ scale: 0.95 }}
                        animate={{
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          },
                        }}
                      >
                        {isPlaying ? (
                          <Play className="w-8 h-8 fill-white transition-transform duration-200" />
                        ) : (
                          <PauseIcon className="size-8 fill-white transition-transform duration-200" />
                        )}
                      </motion.button>
                    </div>
                  )}
                  {showCaptionIndicator && (
                    <div className="absolute inset-0 flex items-center justify-center z-50">
                      <motion.button
                        className="flex items-center justify-center size-16 text-white bg-black/50 backdrop-blur-sm rounded-full transition-colors hover:bg-black/70"
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{
                          scale: 0.9,
                          transition: { duration: 0.1 },
                        }}
                        initial={{ scale: 0.95 }}
                        animate={{
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          },
                        }}
                      >
                        <ClosedCaption className="size-9 transition-transform duration-200" />
                      </motion.button>
                    </div>
                  )}
                  {showVolumeIndicator && (
                    <div className="absolute inset-0 flex items-center justify-center z-50">
                      <motion.button
                        className="flex flex-col items-center justify-center size-16 text-white bg-black/50 backdrop-blur-sm rounded-full transition-colors hover:bg-black/70"
                        whileHover={{
                          scale: 1.1,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{
                          scale: 0.9,
                          transition: { duration: 0.1 },
                        }}
                        initial={{ scale: 0.95 }}
                        animate={{
                          scale: 1,
                          transition: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          },
                        }}
                      >
                        {isMuted ? (
                          <VolumeX className="size-6" />
                        ) : (
                          <Volume2 className="size-6" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.round(isMuted ? 0 : volume * 100)}%
                        </span>
                      </motion.button>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Controls overlay */}
              {isReady && showControls && (
                <div>
                  <motion.div
                    className="absolute inset-x-0 z-20 top-0 px-4 py-3.5"
                    variants={topbarVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="flex items-center gap-x-2">
                      <Link
                        href={`/title/${seriesId}`}
                        className="gap-2 rounded-full bg-neutral-900/50 px-3 py-1 text-sm backdrop-blur-sm transition-all hover:bg-neutral-800/50"
                      >
                        <ArrowLeft className="size-5" />
                      </Link>
                      <div>
                        <h1 className="text-xl truncate">{series?.name}</h1>
                        <h2 className="text-sm">
                          Episode {episode.episodeNumber}
                        </h2>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className={cn(
                      "absolute inset-x-0 z-10",
                      isFullscreen && !isMobile ? "bottom-0" : "bottom-2"
                    )} // Adjust for mobile safe area
                    variants={controlsVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Progress bar with thumbnail preview */}
                    <div
                      className={cn(
                        "relative",
                        isMobile ? "px-3 pb-2" : "px-2 pb-1", // Larger touch area on mobile
                        isFullscreen && isMobile && "px-4 pb-3" // Even larger in fullscreen
                      )}
                      ref={progressContainerRef}
                      onMouseMove={handleProgressHover}
                      onMouseEnter={() => setShowThumbnail(true)}
                      onMouseLeave={() => setShowThumbnail(false)}
                    >
                      {/* Thumbnail preview */}
                      <AnimatePresence>
                        {showThumbnail && currentThumbnail && (
                          <motion.div
                            className="absolute bottom-full mb-2 bg-black rounded-md overflow-hidden shadow-lg"
                            style={{
                              left: `${thumbnailPosition.x}px`,
                              transform: "translateX(-50%)",
                            }}
                            variants={thumbnailPreviewVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                          >
                            <div className="w-40 h-[90px] relative">
                              {currentThumbnail.dataUrl ? (
                                <Image
                                  src={
                                    currentThumbnail.dataUrl ||
                                    "/placeholder.svg"
                                  }
                                  alt="Preview"
                                  height={60}
                                  width={60}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                                  <Play className="w-6 h-6 text-white/50" />
                                </div>
                              )}
                              <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-xs font-medium text-center py-1">
                                {formatDuration(thumbnailPosition.time)}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Slider
                        value={[
                          currentTime ? (currentTime / duration) * 100 : 0,
                        ]}
                        onValueChange={(value) => {
                          handleProgressChange(value);
                          setIsDraggingProgress(true);
                        }}
                        onValueCommit={() => {
                          setTimeout(() => setIsDraggingProgress(false), 500);
                        }}
                        className="w-full cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 **:[[role=slider]]:bg-violet-500 **:[[role=slider]]:w-3 **:[[role=slider]]:h-3 **:[[role=slider]]:border-0 [&>span:first-child_span]:bg-violet-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
                      />
                    </div>

                    {/* Control buttons */}
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        !isFullscreen && isMobile ? "p-2" : "p-3", // Different padding for mobile non-fullscreen
                        isFullscreen && isMobile && "p-4 mb-safe" // Stronger gradient and safe area margin in fullscreen
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-black/30 backdrop-blur-sm px-1 py-1 rounded-full">
                          <ActionHint
                            label={isPlaying ? "Pause" : "Play"}
                            shortcutKey="K"
                          >
                            <motion.button
                              onClick={togglePlay}
                              className="p-1.5 text-white rounded-full hover:bg-white/20"
                            >
                              {isPlaying ? (
                                <Pause className="size-5" />
                              ) : (
                                <Play className="size-5" />
                              )}
                            </motion.button>
                          </ActionHint>
                        </div>
                        {series?.type === "SERIES" && (
                          <div
                            className={cn(
                              "",
                              !isMobile &&
                                "bg-black/30 backdrop-blur-sm px-1 py-1 rounded-full"
                            )}
                          >
                            {!isMobile && (
                              <ActionHint
                                label={
                                  series?.type === "SERIES"
                                    ? "Previous episode"
                                    : "Previous video"
                                }
                              >
                                <motion.button
                                  className="py-1.5 px-3 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                                  onClick={onPlayPrevious}
                                  title={
                                    series?.type === "SERIES"
                                      ? "Previous episode"
                                      : "Previous video"
                                  }
                                  disabled={!hasPrevious}
                                >
                                  <SkipBack className="w-5 h-5" />
                                </motion.button>
                              </ActionHint>
                            )}

                            {!isMobile && (
                              <NextEpisodePreviewCard
                                episode={nextEpisode}
                                thumbnail={nextEpisodeThumbnail}
                                seasonNumber={
                                  seasons.find(
                                    (s) => s.id === nextEpisode?.seasonId
                                  )?.seasonNumber
                                }
                              >
                                <motion.button
                                  className="py-1.5 px-3 text-white rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={onPlayNext}
                                  disabled={!hasNext}
                                  title="Next episode (Shift+N)"
                                >
                                  <SkipForward className="size-5" />
                                </motion.button>
                              </NextEpisodePreviewCard>
                            )}
                          </div>
                        )}
                        {series?.type === "SERIES" ||
                          (series?.type === "VARIETY_SHOWS" && (
                            <div
                              className={cn(
                                "",
                                !isMobile &&
                                  "bg-black/30 backdrop-blur-sm px-1 py-1 rounded-full"
                              )}
                            >
                              {!isMobile && (
                                <motion.button
                                  className="py-1.5 px-3 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                                  onClick={onPlayPrevious}
                                  title="Previous episode"
                                  disabled={!hasPrevious}
                                >
                                  <SkipBack className="w-5 h-5" />
                                </motion.button>
                              )}

                              {!isMobile && (
                                <NextEpisodePreviewCard
                                  episode={nextEpisode}
                                  thumbnail={nextEpisodeThumbnail}
                                  seasonNumber={
                                    seasons.find(
                                      (s) => s.id === nextEpisode?.seasonId
                                    )?.seasonNumber
                                  }
                                >
                                  <motion.button
                                    className="py-1.5 px-3 text-white rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={onPlayNext}
                                    disabled={!hasNext}
                                    title="Next video"
                                  >
                                    <SkipForward className="size-5" />
                                  </motion.button>
                                </NextEpisodePreviewCard>
                              )}
                            </div>
                          ))}
                        <div className="flex items-center gap-x-0.5 text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                          <span>{formatDuration(currentTime)}</span>
                          <span>/</span>
                          <span>{formatDuration(duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center ml-auto bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                        <div className="relative">
                          <ActionHint
                            label={isMuted ? "Unmute" : "Mute"}
                            shortcutKey="M"
                          >
                            <motion.button
                              onClick={toggleMute}
                              onMouseEnter={() => {
                                if (volumeSliderTimeoutRef.current) {
                                  clearTimeout(volumeSliderTimeoutRef.current);
                                }
                                setShowVolumeSlider(true);
                              }}
                              onMouseLeave={() => {
                                if (!isAdjustingVolume) {
                                  volumeSliderTimeoutRef.current = setTimeout(
                                    () => {
                                      setShowVolumeSlider(false);
                                    },
                                    200
                                  );
                                }
                              }}
                              className={cn(
                                "py-1.5 px-3 text-white rounded-full hover:bg-white/10"
                              )}
                            >
                              {isMuted ? (
                                <VolumeX className="size-5" />
                              ) : (
                                <Volume2 className="size-5" />
                              )}
                            </motion.button>
                          </ActionHint>

                          <AnimatePresence>
                            {showVolumeSlider && (
                              <motion.div
                                className="absolute bottom-full left-0 mb-2 p-2 bg-black/60 backdrop-blur-sm rounded-lg shadow-xl"
                                variants={volumeSliderVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                onMouseEnter={() => {
                                  if (volumeSliderTimeoutRef.current) {
                                    clearTimeout(
                                      volumeSliderTimeoutRef.current
                                    );
                                  }
                                  if (isMobile) {
                                    volumeSliderTimeoutRef.current = setTimeout(
                                      () => {
                                        setShowVolumeSlider(true);
                                      }
                                    );
                                  }
                                }}
                                onMouseLeave={() => {
                                  setIsAdjustingVolume(false);
                                  volumeSliderTimeoutRef.current = setTimeout(
                                    () => {
                                      setShowVolumeSlider(false);
                                    },
                                    200
                                  );
                                }}
                                layout
                              >
                                <div className="relative h-24 w-6 flex items-center justify-center">
                                  <Slider
                                    value={[isMuted ? 0 : volume * 100]}
                                    onValueChange={(value) => {
                                      handleVolumeChange(value);
                                      setIsAdjustingVolume(true);
                                    }}
                                    onValueCommit={() => {
                                      setTimeout(
                                        () => setIsAdjustingVolume(false),
                                        1500
                                      );
                                      // Auto-hide volume slider on mobile after adjusting
                                      if (isMobile) {
                                        volumeSliderTimeoutRef.current =
                                          setTimeout(() => {
                                            setShowVolumeSlider(false);
                                          }, 2000);
                                      }
                                    }}
                                    orientation="vertical"
                                    className="h-2 cursor-pointer [&>span:first-child]:w-1 [&>span:first-child]:bg-white/30 **:[[role=slider]]:bg-violet-500 **:[[role=slider]]:w-3 **:[[role=slider]]:h-3 **:[[role=slider]]:border-0 [&>span:first-child_span]:bg-violet-500 data-[orientation=vertical]:min-h-4 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform **:[[role=slider]]:pt-1"
                                  />

                                  {/* Volume percentage indicator */}
                                  <AnimatePresence>
                                    {isAdjustingVolume && (
                                      <motion.div
                                        className="absolute -right-12 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded"
                                        variants={volumePercentageVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                      >
                                        {Math.round(isMuted ? 0 : volume * 100)}
                                        %
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {!isMobile && (
                          <ActionHint
                            label={
                              availableTracks.length >= 0
                                ? "Subtitles/closed captions"
                                : "Subtitles/closed captions unavailable"
                            }
                            shortcutKey="C"
                          >
                            <motion.button
                              onClick={() => {
                                const nextTrackId =
                                  (activeTrackId + 1) %
                                  (availableTracks.length + 1);
                                setActiveTrackId(nextTrackId);
                                if (playerRef.current) {
                                  if (nextTrackId === availableTracks.length) {
                                    // Disable captions
                                    playerRef.current.setTextTrackVisibility(
                                      false
                                    );
                                  } else {
                                    // Enable selected caption track
                                    const shakaTrack = playerRef.current
                                      .getTextTracks()
                                      .find(
                                        (t) =>
                                          t.id ===
                                          availableTracks[nextTrackId]?.id
                                      );
                                    if (shakaTrack) {
                                      playerRef.current.selectTextTrack(
                                        shakaTrack
                                      );
                                      playerRef.current.setTextTrackVisibility(
                                        true
                                      );
                                    }
                                  }
                                }
                              }}
                              disabled={availableTracks.length === 0}
                              className={cn(
                                "py-1 px-3 text-white rounded-full hover:bg-white/10",
                                activeTrackId >= 0 && "bg-white/10"
                              )}
                            >
                              {activeTrackId >= 0 ? (
                                <FaClosedCaptioning className="size-6" />
                              ) : (
                                <ClosedCaption className="size-6" />
                              )}
                            </motion.button>
                          </ActionHint>
                        )}

                        {series?.type === "SERIES" && (
                          <ActionHint label="View Episode" shortcutKey="E">
                            <motion.button
                              onClick={toggleEpisodePanel}
                              className={cn(
                                "py-1 px-3 text-white rounded-full hover:bg-white/10",
                                showEpisodePanel && "bg-white/10"
                              )}
                              title="View Episode (E)"
                            >
                              <GalleryVerticalEnd className="size-5" />
                            </motion.button>
                          </ActionHint>
                        )}

                        {pipSupported && !isFullscreen && (
                          <ActionHint
                            label={
                              isPictureInPicture
                                ? "Exit Picture-in-Picture"
                                : "Enter Picture-in-Picture"
                            }
                            shortcutKey="P"
                          >
                            <motion.button
                              onClick={togglePictureInPicture}
                              className={cn(
                                "py-1 px-3 text-white rounded-full hover:bg-white/10",
                                isPictureInPicture && "bg-white/10",
                                isMobile && "hidden"
                              )}
                              title={
                                isPictureInPicture
                                  ? "Exit Picture-in-Picture"
                                  : "Enter Picture-in-Picture"
                              }
                            >
                              <PictureInPicture2 className="size-6" />
                            </motion.button>
                          </ActionHint>
                        )}

                        {!isMobile && (
                          <ActionHint label="Settings">
                            <motion.button
                              onClick={() => {
                                if (!isMobile) {
                                  if (showSettings) {
                                    closeSettings();
                                  } else {
                                    openSettings();
                                  }
                                }
                                if (isMobile) {
                                  onOpen();
                                }
                              }}
                              className="py-1.5 px-3 text-white rounded-full hover:bg-white/10"
                              title="Settings"
                            >
                              <Settings className="size-5" />
                            </motion.button>
                          </ActionHint>
                        )}
                        <ActionHint
                          label={
                            isFullscreen
                              ? "Exit Full screen"
                              : "Enter Full screen"
                          }
                          shortcutKey="F"
                        >
                          <motion.button
                            onClick={toggleFullscreen}
                            className="py-1.5 px-3 text-white rounded-full hover:bg-white/10"
                            title={
                              isFullscreen
                                ? "Exit Full screen"
                                : "Enter Full screen"
                            }
                          >
                            {isFullscreen ? (
                              <Minimize className="size-5" />
                            ) : (
                              <Maximize className="size-5" />
                            )}
                          </motion.button>
                        </ActionHint>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Settings panel */}
              <AnimatePresence>
                {showEpisodePanel && (
                  <div
                    className={cn(
                      "absolute inset-x-0 z-20 xl:top-16 lg:top-8 top-4 flex items-start justify-end mr-4 h-full",
                      isMobile ? "top-4" : "top-16"
                    )}
                  >
                    <motion.div
                      className="absolute inset-0"
                      onClick={() => setShowEpisodePanel(false)}
                      variants={settingsBackdropVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    />

                    <motion.div
                      className="relative w-full h-[300px] max-w-xs bg-black/40 backdrop-blur-sm text-white rounded-lg shadow-lg overflow-hidden max-h-[80vh] overflow-y-auto"
                      variants={settingsPanelVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      {series?.type === "SERIES" && (
                        <div>
                          <div className="pt-[0.8rem] pl-4">
                            {seasons.length > 0 && (
                              <SeasonSelectorClient
                                seasons={seasons}
                                selectedSeason={selectedSeason}
                                onSelectSeason={handleSeasonChange}
                                seriesId={seriesId}
                              />
                            )}
                          </div>
                          {filteredEpisodes.length > 0 ? (
                            <div className="ml-4 mr-4 my-4 flex items-center">
                              {filteredEpisodes.map((episode) => (
                                <Button
                                  key={episode.id}
                                  className={cn(
                                    "mr-2 focus-visible:ring-transparent focus:outline-none backdrop-blur-sm",
                                    episodeId === episode.id
                                      ? "bg-[#7959FF]/32 hover:bg-[#7959FF]/33 border border-[#7959FF]"
                                      : "bg-white/22 hover:bg-white/30"
                                  )}
                                  onClick={() => {
                                    if (episode.id !== episodeId) {
                                      router.push(
                                        `/play/${episode.seasonId}/${episode.id}`
                                      );
                                    }
                                    console.log(episode.seasonId);
                                  }}
                                >
                                  {episode.episodeNumber}
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <div className="text-center py-8">
                                <div className="px-2 py-2 rounded-full bg-secondary">
                                  <Info className="size-8" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">
                                  No Episodes Found
                                </h3>
                                <p className="text-muted-foreground">
                                  No episodes found for this season. Please
                                  select a different season to view episodes.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showSettings && (
                  <div className="absolute bottom-20 inset-x-0 z-20 flex items-start justify-end mr-4">
                    <motion.div
                      className="absolute inset-0"
                      onClick={closeSettings}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    />

                    <motion.div
                      className={cn(
                        "relative w-full max-w-xs bg-black/35 backdrop-blur-sm text-white rounded-lg shadow-lg overflow-hidden max-h-[80vh] overflow-y-auto",
                        !isMobile && "bottom-4"
                      )}
                      variants={settingsPanelVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      {/* Settings header */}
                      {settingsView !== "main" && (
                        <motion.div
                          className="flex items-center p-3 border-b border-neutral-700 cursor-pointer"
                          onClick={() => navigateTo("main")}
                          layout
                        >
                          <ChevronLeft className="size-5 mr-2" />
                          <span className="text-sm font-medium">
                            {settingsView === "quality" && "Quality"}
                            {settingsView === "speed" && "Playback speed"}
                            {settingsView === "subtitles" && "Subtitles"}
                            {settingsView === "audio" && "Audio"}
                          </span>
                        </motion.div>
                      )}

                      {/* Settings views with animations */}
                      <AnimatePresence
                        mode="wait"
                        initial={false}
                        custom={getDirection(settingsView, settingsView)}
                      >
                        {/* Main settings view */}
                        {settingsView === "main" && (
                          <motion.div
                            key="main"
                            className="p-1"
                            custom={0}
                            variants={settingsViewVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            layout
                          >
                            <LayoutGroup>
                              <motion.button
                                onClick={() => navigateTo("subtitles")}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none disabled:text-muted-foreground"
                                disabled={availableTracks.length === 0}
                                variants={menuItemVariants}
                                initial="hidden"
                                animate="visible"
                                custom={3}
                                layout
                              >
                                <div className="flex items-center gap-3">
                                  <ClosedCaption className="size-6" />
                                  <span className="text-sm">Subtitles</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-neutral-400 disabled:text-muted-foreground">
                                  <span>
                                    {activeTrackId >= 0
                                      ? getCurrentSubtitleLabel()
                                      : "Off"}
                                  </span>
                                  <ChevronRight className="size-4" />
                                </div>
                              </motion.button>
                              <motion.button
                                onClick={() => navigateTo("audio")}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none disabled:text-muted-foreground"
                                variants={menuItemVariants}
                                disabled={audioTracks.length === 1}
                                initial="hidden"
                                animate="visible"
                                custom={3}
                                layout
                              >
                                <div className="flex items-center gap-3">
                                  <MdOutlineRecordVoiceOver className="size-6" />
                                  <span className="text-sm">Audio</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-neutral-400 disabled:text-muted-foreground">
                                  {audioTracks.length === 1 ? (
                                    <p>None</p>
                                  ) : (
                                    <span>
                                      {activeAudioTrackId
                                        ? audioTracks.find(
                                            (audio) =>
                                              audio.id === activeAudioTrackId
                                          )?.label
                                        : "Original"}
                                    </span>
                                  )}
                                  <ChevronLeft className="w-4 h-4 rotate-180" />
                                </div>
                              </motion.button>

                              <motion.button
                                onClick={() => navigateTo("speed")}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none disabled:text-muted-foreground"
                                variants={menuItemVariants}
                                initial="hidden"
                                animate="visible"
                                custom={5}
                                layout
                              >
                                <div className="flex items-center gap-3">
                                  <Clock className="w-5 h-5" />
                                  <span className="text-sm">
                                    Playback speed
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-neutral-400 disabled:text-muted-foreground">
                                  <span>
                                    {playbackSpeed === 1
                                      ? "Normal"
                                      : `${playbackSpeed}x`}
                                  </span>
                                  <ChevronLeft className="w-4 h-4 rotate-180" />
                                </div>
                              </motion.button>

                              <motion.button
                                onClick={() => navigateTo("quality")}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none disabled:text-muted-foreground"
                                variants={menuItemVariants}
                                disabled={qualities.length === 0}
                                initial="hidden"
                                animate="visible"
                                custom={6}
                                layout
                              >
                                <div className="flex items-center gap-3">
                                  <Settings2 className="size-6" />
                                  <span className="text-sm">Quality</span>
                                </div>
                                {qualities.length > 0 && (
                                  <div className="flex items-center gap-1 text-sm text-neutral-400">
                                    <span>{displayQualityLabel}</span>
                                    <ChevronRight className="size-4" />
                                  </div>
                                )}
                              </motion.button>
                            </LayoutGroup>
                          </motion.div>
                        )}

                        {/* Quality settings view */}
                        {qualities.length > 0 && (
                          <>
                            {settingsView === "quality" && (
                              <motion.div
                                key="quality"
                                className="p-1"
                                custom={1}
                                variants={settingsViewVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                layout
                              >
                                <LayoutGroup>
                                  {qualities.map((quality) => (
                                    <motion.button
                                      key={quality.id}
                                      onClick={() => {
                                        selectQuality(quality);
                                        navigateTo("main");
                                      }}
                                      className={cn(
                                        "w-full flex items-center justify-between p-3 my-1.5 hover:bg-white/15 rounded-lg",
                                        selectedQuality?.id === quality.id &&
                                          "bg-white/15"
                                      )}
                                      variants={menuItemVariants}
                                      initial="hidden"
                                      animate="visible"
                                      custom={quality.id}
                                      layout
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">
                                          {quality.isAuto &&
                                          currentPlayingHeight
                                            ? `Auto (${currentPlayingHeight}p)`
                                            : quality.label}
                                        </span>
                                      </div>
                                    </motion.button>
                                  ))}
                                </LayoutGroup>
                              </motion.div>
                            )}
                          </>
                        )}

                        {/* Playback speed view */}
                        {settingsView === "speed" && (
                          <motion.div
                            key="speed"
                            className="p-1"
                            custom={1}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            layout
                          >
                            <LayoutGroup>
                              <ScrollArea className="h-64">
                                {speedOptions.map((option, index) => (
                                  <motion.button
                                    key={option.value}
                                    onClick={() => {
                                      setPlaybackSpeed(option.value);
                                      navigateTo("main");
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between p-3 my-1.5 hover:bg-white/15 rounded-lg cursor-pointer",
                                      playbackSpeed === option.value &&
                                        "bg-white/15"
                                    )}
                                    variants={menuItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={index}
                                    layout
                                  >
                                    <span className="text-sm">
                                      {option.label}
                                    </span>
                                  </motion.button>
                                ))}
                              </ScrollArea>
                            </LayoutGroup>
                          </motion.div>
                        )}

                        {/* Audio view */}
                        {settingsView === "audio" && (
                          <motion.div
                            key="audio"
                            className="p-1"
                            custom={1}
                            variants={settingsViewVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            layout
                          >
                            <LayoutGroup>
                              {audioTracks.map((option, index) => (
                                <motion.button
                                  key={option.id}
                                  onClick={() => {
                                    selectAudioTrack(option);
                                    navigateTo("main");
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between p-3 my-1.5 hover:bg-white/15 rounded-lg cursor-pointer",
                                    activeAudioTrackId === option.id &&
                                      "bg-white/15"
                                  )}
                                  variants={menuItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  custom={index}
                                  whileTap={{ scale: 0.98 }}
                                  layout
                                >
                                  <span className="text-sm">
                                    {option.label}
                                  </span>
                                </motion.button>
                              ))}
                            </LayoutGroup>
                          </motion.div>
                        )}
                        {/* Subtitles view */}
                        {settingsView === "subtitles" && (
                          <motion.div
                            key="subtitles"
                            className="p-1"
                            custom={1}
                            variants={settingsViewVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            layout
                          >
                            <LayoutGroup>
                              {availableTracks.map((track) => (
                                <div key={track.id}>
                                  <motion.button
                                    onClick={() => {
                                      if (track.id !== undefined) {
                                        handleTrackChange(track.id);
                                      }
                                      navigateTo("main");
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between p-3 my-1.5 hover:bg-white/15 rounded-lg cursor-pointer",
                                      activeTrackId === track.id &&
                                        "bg-white/15"
                                    )}
                                    variants={menuItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={track.id}
                                    whileTap={{ scale: 0.98 }}
                                    layout
                                  >
                                    <span className="text-sm">
                                      {track.label}
                                    </span>
                                  </motion.button>
                                  <motion.button
                                    onClick={() => {
                                      handleTrackChange(-1);
                                      navigateTo("main");
                                    }}
                                    className={cn(
                                      "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer",
                                      activeTrackId === -1 && "bg-white/15"
                                    )}
                                    variants={menuItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={track.id}
                                    whileTap={{ scale: 0.98 }}
                                    layout
                                  >
                                    <span className="text-sm">Off</span>
                                  </motion.button>
                                </div>
                              ))}
                            </LayoutGroup>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
