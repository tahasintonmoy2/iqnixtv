"use client";

import { Slider } from "@/components/ui/slider";
import { useMobile } from "@/hooks/use-mobile";
import { useVideoSettingsModal } from "@/hooks/use-video-settings-modal";
import { BufferManager } from "@/lib/buffer-manager";
import { ErrorRecoveryManager } from "@/lib/error-recovery";
import { Episode } from "@/lib/generated/prisma";
import { generateMuxHlsUrl, MuxVideoConfig } from "@/lib/mux-config";
import { initializeShakaPlayer } from "@/lib/shaka-player-config";
import { cn, formatTime } from "@/lib/utils";
import {
  parseVideoError,
  VideoError,
  VideoErrorType,
} from "@/lib/video-player-utils";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  ClosedCaption,
  GalleryVerticalEnd,
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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MdOutlineRecordVoiceOver } from "react-icons/md";
import { useEventListener } from "usehooks-ts";
import { VideoSettingsModal } from "./models/video-settings-modal";
import { Button } from "./ui/button";
import { LoadingSpinner } from "./video/loading-spinner";

export interface SubtitleTrack {
  id: number;
  active: boolean;
  type: string;
  bandwidth?: number;
  language: string;
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
  episodeId: string;
  onEnded: () => void;
  onLoadStart: () => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  className?: string;
}

interface QualityOption {
  id: number;
  label: string;
  height: number;
  bandwidth: number;
  isAuto: boolean;
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
  episodeId,
  onEnded,
  onLoadStart,
  onTimeUpdate,
  className,
}: VideoPlayerProps) => {
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
  const [selectedQuality, setSelectedQuality] = useState<QualityOption | null>(
    null
  );
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isAdjustingVolume, setIsAdjustingVolume] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

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
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState(false);
  const [showSeekIndicator, setShowSeekIndicator] = useState(false);
  const [seekDirection, setSeekDirection] = useState<"forward" | "backward">(
    "forward"
  );
  const [seekAmount, setSeekAmount] = useState(10);

  // Function declarations first
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

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

  const updateQualityDisplay = useCallback(() => {
    if (!playerRef.current) return;

    const tracks = playerRef.current.getVariantTracks();
    const activeTrack = tracks.find((track) => track.active);

    if (activeTrack && selectedQuality?.isAuto) {
      const currentQuality = qualities.find(
        (q) => q.height === activeTrack.height
      );
      if (currentQuality) {
        setSelectedQuality({
          ...qualities[0],
          label: `Auto (${activeTrack.height})`,
        });
      }
    }
  }, [qualities, selectedQuality]);

  const updateAvailableQualities = useCallback(() => {
    try {
      if (!playerRef.current || !isReady) {
        console.log("Player not ready for quality update");
        return;
      }

      const tracks = playerRef.current.getVariantTracks();

      if (!tracks || tracks.length === 0) {
        console.log("No variant tracks available");
        return;
      }

      const uniqueTracks = tracks
        .filter(
          (track, index, self) =>
            track.height && // Ensure track has height property
            index === self.findIndex((t) => t.height === track.height)
        )
        .sort((a, b) => b.height! - a.height!);

      if (uniqueTracks.length === 0) {
        console.log("No valid quality tracks found");
        return;
      }

      const qualityOptions: QualityOption[] = [
        {
          id: -1,
          label: `Auto (${uniqueTracks[0].height}p)`,
          height: 0,
          bandwidth: 0,
          isAuto: true,
        },
        ...uniqueTracks.map((track) => ({
          id: track.id!,
          label: `${track.height}p`,
          height: track.height!,
          bandwidth: track.bandwidth,
          isAuto: false,
        })),
      ];

      setQualities(qualityOptions);
      setSelectedQuality(qualityOptions[0]);
    } catch (error) {
      console.error("Error updating qualities:", error);
    }
  }, [isReady]);

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

  const subtitleOptions = [
    { value: "en", label: "English" },
    { value: "ko", label: "Korean" },
    { value: "zh-CN", label: "Chinese" },
    { value: "off", label: "Off" },
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
    // Add error handler
    const handleError = () => {
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
    };

    const initPlayer = async () => {
      if (!videoRef.current) return;

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

      try {
        setIsLoading(true);
        setError(null);

        if (!muxConfig.playbackId || muxConfig.playbackId.trim() === "") {
          throw new Error(
            "Playback ID is required. Please provide a valid Mux playback ID."
          );
        }

        // Initialize error recovery
        errorRecoveryRef.current = new ErrorRecoveryManager();

        // Get HLS manifest URL from Mux
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

        // Initialize Shaka Player
        const player = (await initializeShakaPlayer(
          videoRef.current,
          manifestUrl
        )) as shaka.Player;

        if (!player) {
          throw new Error("Failed to initialize Shaka Player");
        }

        playerRef.current = player;

        bufferManagerRef.current = new BufferManager(videoRef.current);
        bufferManagerRef.current.setOnBufferingChange((isBuffering) => {
          setIsBuffering(isBuffering);
        });

        // thumbnailGeneratorRef.current = new ThumbnailGenerator(videoRef.current, {
        //   width: 160,
        //   height: 90,
        //   interval: 5,
        // })

        // Update available qualities
        player.addEventListener("variantchanged", updateQualityDisplay);
        // Track errors
        player.addEventListener("error", handleError);
        player.addEventListener("loadstart", handleLoadstart);
        player.addEventListener("canplay", handleCanplay);
        player.addEventListener("ready", handleReady);
        // Listen for track changes
        player.addEventListener("trackschanged", () => {
          updateTextTracks();
          updateAvailableQualities();
        });
        // Listen for text track visibility changes
        player.addEventListener("texttrackvisibility", () => {
          updateTextTracks();
        });

        updateTextTracks();
        setIsReady(true);

        setTimeout(() => {
          updateAvailableQualities();
        }, 2000);

        setIsLoading(false);
      } catch (error) {
        const videoError: VideoError = {
          type: VideoErrorType.PLAYBACK,
          message: error instanceof Error ? error.message : "Unknown error",
          originalError:
            error instanceof Error ? error : new Error("Unknown error"),
        };
        setError(videoError);
        setIsLoading(false);
      }
    };

    setTimeout(async () => {
      await initPlayer();
    }, 3000);

    return () => {
      if (bufferCheckIntervalRef.current) {
        clearInterval(bufferCheckIntervalRef.current);
      }

      // Cleanup Shaka player
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

      // Cleanup buffer manager
      if (bufferManagerRef.current) {
        bufferManagerRef.current = null;
      }

      // Cleanup error recovery
      if (errorRecoveryRef.current) {
        errorRecoveryRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muxConfig]);

  useEffect(() => {
    if (!videoRef.current || !bufferManagerRef.current) return;

    bufferCheckIntervalRef.current = setInterval(() => {
      bufferManagerRef.current?.checkBufferingStatus();
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

    setAvailableTracks(tracks);

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

  const selectQuality = (quality: QualityOption) => {
    if (!playerRef.current) return;

    if (quality.isAuto) {
      // Enable ABR
      playerRef.current.configure({
        abr: {
          enabled: true,
        },
      });
      setSelectedQuality(quality);
    } else {
      // Disable ABR and select specific quality
      playerRef.current.configure({
        abr: {
          enabled: false,
        },
      });

      const tracks = playerRef.current.getVariantTracks();
      const track = tracks.find((t) => t.height === quality.height);

      if (track) {
        playerRef.current.selectVariantTrack(track, true);
        setSelectedQuality(quality);
      }
    }
  };

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
  }, [onTimeUpdate]);

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
          "relative w-full max-w-6xl mx-auto overflow-hidden rounded-lg transition-all duration-1000",
          isFullscreen && isMobile && "h-screen w-screen max-w-none"
        )}
      >
        {isLoading && <LoadingSpinner />}
        {isBuffering && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 z-50">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-300"
              style={{ width: `${bufferingProgress}%` }}
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className={cn(
              "inset-0 items-center justify-center bg-black/40 backdrop-blur-lg rounded-md lg:h-[31rem] h-full",
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
              <p className="text-gray-300 text-sm mb-4">{error.message}</p>
              <div className="mt-2">
                <Button onClick={() => window.location.reload()} size="sm">
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

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
                !isFullscreen && "aspect-video",
                // Fullscreen mode: specific heights for mobile and desktop
                isFullscreen && !isMobile && "h-full lg:h-[740px]", // Full height for desktop fullscreen
                isFullscreen && "lg:h-full xl:h-full w-full mt-0", // Fixed height for mobile fullscreen
                className
              )}
            >
              <div onClick={togglePlay}>
                <video
                  ref={videoRef}
                  className="w-full h-full rounded-lg video-js vjs-default-skin"
                  onClick={togglePlay}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadStart={onLoadStart}
                  onEnded={onEnded}
                  autoPlay={true}
                  playsInline
                  crossOrigin="anonymous"
                />

                {/* Hidden canvas for thumbnail generation */}
                <canvas ref={canvasRef} className="hidden" />

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
                    <div className="absolute top-1/2 left-1/2 bg-black/80 text-white px-4 py-3 rounded-lg flex items-center gap-2">
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
                    <div className="absolute inset-0 flex items-center justify-center bottom-8">
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
                </AnimatePresence>
              </div>

              {/* Controls overlay */}
              {isReady && showControls && (
                <motion.div
                  className={cn(
                    "absolute inset-x-0 z-10",
                    isFullscreen && !isMobile ? "control-overlay" : "bottom-0"
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
                                  currentThumbnail.dataUrl || "/placeholder.svg"
                                }
                                alt="Preview"
                                height={60}
                                width={60}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                                <Play className="w-6 h-6 text-white/50" />
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-xs font-medium text-center py-1">
                              {formatTime(thumbnailPosition.time)}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Slider
                      value={[currentTime ? (currentTime / duration) * 100 : 0]}
                      onValueChange={(value) => {
                        handleProgressChange(value);
                        setIsDraggingProgress(true);
                      }}
                      onValueCommit={() => {
                        setTimeout(() => setIsDraggingProgress(false), 500);
                      }}
                      className="w-full cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-violet-500 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-violet-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
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
                      </div>
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
                            title="Previous video"
                            disabled={!hasPrevious}
                          >
                            <SkipBack className="w-5 h-5" />
                          </motion.button>
                        )}

                        {!isMobile && (
                          <motion.button
                            className="py-1.5 px-3 text-white rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={onPlayNext}
                            disabled={!hasNext}
                            title="Next video"
                          >
                            <SkipForward className="size-5" />
                          </motion.button>
                        )}
                      </div>
                      <div className="flex items-center gap-x-0.5 text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center ml-auto bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className="relative">
                        <motion.button
                          onClick={toggleMute}
                          onMouseEnter={() => setShowVolumeSlider(true)}
                          onMouseLeave={() => {
                            if (!isAdjustingVolume) {
                              setShowVolumeSlider(false);
                            }
                          }}
                          className={cn(
                            "py-1.5 px-3 text-white rounded-full hover:bg-white/10",
                            isMobile && "hidden"
                          )}
                        >
                          {isMuted ? (
                            <VolumeX className="size-5" />
                          ) : (
                            <Volume2 className="size-5" />
                          )}
                        </motion.button>

                        <AnimatePresence>
                          {showVolumeSlider && (
                            <motion.div
                              className="absolute bottom-full left-0 mb-2 p-2 bg-black/60 backdrop-blur-sm rounded-lg shadow-xl"
                              variants={volumeSliderVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              onMouseEnter={() => setShowVolumeSlider(true)}
                              onMouseLeave={() => {
                                setIsAdjustingVolume(false);
                                setShowVolumeSlider(false);
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
                                  }}
                                  orientation="vertical"
                                  className="h-2 cursor-pointer [&>span:first-child]:w-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-violet-500 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-violet-500 data-[orientation=vertical]:min-h-4 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform [&_[role=slider]]:pt-1"
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
                                      {Math.round(isMuted ? 0 : volume * 100)}%
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {!isMobile && (
                        <motion.button
                          onClick={() => {
                            const nextTrackId =
                              (activeTrackId + 1) %
                              (availableTracks.length + 1);
                            setActiveTrackId(nextTrackId);
                            if (playerRef.current) {
                              if (nextTrackId === availableTracks.length) {
                                // Disable captions
                                playerRef.current.setTextTrackVisibility(false);
                              } else {
                                // Enable selected caption track
                                const track = availableTracks[nextTrackId];
                                playerRef.current.selectTextTrack(
                                  track as shaka.extern.TextTrack
                                );
                                playerRef.current.setTextTrackVisibility(true);
                              }
                            }
                          }}
                          disabled={availableTracks.length === 0}
                          className={cn(
                            "py-1 px-3 text-white rounded-full hover:bg-white/10",
                            activeTrackId >= 0 && "bg-white/10"
                          )}
                        >
                          <ClosedCaption className="size-6" />
                        </motion.button>
                      )}
                      {isFullscreen && (
                        <motion.button
                          onClick={() => setShowEpisodePanel(!showEpisodePanel)}
                          className={cn(
                            "py-1 px-3 text-white rounded-full hover:bg-white/10",
                            showEpisodePanel && "bg-white/10"
                          )}
                          title="View episode"
                        >
                          <GalleryVerticalEnd className="size-5" />
                        </motion.button>
                      )}

                      {pipSupported && !isFullscreen && (
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
                      )}

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
                    </div>
                  </div>
                </motion.div>
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
                      className="relative w-full h-[300px] max-w-xs bg-black/60 backdrop-blur-sm text-white rounded-lg shadow-lg overflow-hidden max-h-[80vh] overflow-y-auto"
                      variants={settingsPanelVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <div className="ml-4 mr-4 my-4 flex items-center">
                        {episodes.map((episode) => (
                          <Button
                            key={episode.id}
                            variant={
                              episodeId === episode.id ? "default" : "secondary"
                            }
                            className="mr-2 focus-visible:ring-transparent focus:outline-none"
                          >
                            {episode.episodeNumber}
                          </Button>
                        ))}
                      </div>
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
                      className={cn("relative w-full max-w-xs bg-black/35 backdrop-blur-sm text-white rounded-lg shadow-lg overflow-hidden max-h-[80vh] overflow-y-auto", !isMobile && "bottom-4")}
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
                                  <ChevronLeft className="w-4 h-4 rotate-180" />
                                </div>
                              </motion.button>
                              <motion.button
                                onClick={() => navigateTo("audio")}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none disabled:text-muted-foreground"
                                variants={menuItemVariants}
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
                                  <span>Korean</span>
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
                                    <span>{selectedQuality?.label}</span>
                                    <ChevronLeft className="w-4 h-4 rotate-180" />
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
                                        "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg",
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
                                          {quality.label}
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
                              {speedOptions.map((option, index) => (
                                <motion.button
                                  key={option.value}
                                  onClick={() => {
                                    setPlaybackSpeed(option.value);
                                    navigateTo("main");
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer",
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
                              {subtitleOptions.map((option, index) => (
                                <motion.button
                                  key={option.value}
                                  onClick={() => {
                                    navigateTo("main");
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer",
                                    option.value !== "off" && "bg-white/15"
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
                                      "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg cursor-pointer",
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
