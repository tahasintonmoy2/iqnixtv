"use client";

import { Slider } from "@/components/ui/slider";
import { useMobile } from "@/hooks/use-mobile";
import { useVideoSettingsModal } from "@/hooks/use-video-settings-modal";
import { Episode } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ChevronLeft,
  Clock,
  ClosedCaption,
  GalleryVerticalEnd,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Settings2,
  SkipBack,
  SkipForward,
  Subtitles,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdOutlineRecordVoiceOver } from "react-icons/md";
import shaka from "shaka-player/dist/shaka-player.compiled.js";
import { useEventListener } from "usehooks-ts";
import { PauseIcon } from "../icons";
import { VideoSettingsModal } from "../models/video-settings-modal";
import { Button } from "../ui/button";

// Video playlist type
interface VideoProps {
  title?: string;
  playbackId: string;
  thumbnail: string;
  className: string;
  onCanPlay: () => void;
  onLoadStart: () => void;
  description?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  initialSeek?: number;
  episodes: Episode[];
  episodeId: string;
  hasNextEpisode?: boolean;
}

export const Video = ({
  playbackId,
  thumbnail,
  title,
  className,
  episodes,
  episodeId,
  hasNextEpisode = false,
  onCanPlay,
  onLoadStart,
  onTimeUpdate,
  initialSeek,
}: VideoProps) => {
  type ShakaErrorEvent = { detail?: { code?: number } };
  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isControlsInteraction, setIsControlsInteraction] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isAdjustingVolume, setIsAdjustingVolume] = useState(false);

  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showEpisodePanel, setShowEpisodePanel] = useState(false);

  // Compute next/previous availability
  const canGoNext = useMemo(() => {
    if (!episodes || !episodeId) return false;
    const currentIndex = episodes.findIndex((ep) => ep.id === episodeId);
    return currentIndex < episodes.length - 1;
  }, [episodes, episodeId]);

  const canGoPrevious = useMemo(() => {
    if (!episodes || !episodeId) return false;
    const currentIndex = episodes.findIndex((ep) => ep.id === episodeId);
    return currentIndex > 0;
  }, [episodes, episodeId]);

  // Thumbnail preview state
  const [thumbnails, setThumbnails] = useState<
    { time: number; dataUrl: string }[]
  >([]);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [thumbnailPosition, setThumbnailPosition] = useState({ x: 0, time: 0 });
  const [thumbnailsGenerated, setThumbnailsGenerated] = useState(false);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<
    "main" | "quality" | "speed" | "subtitles" | "audio"
  >("main");
  const [subtitles, setSubtitles] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLandscape, setIsLandscape] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const isMobile = useMobile();
  const { onOpen } = useVideoSettingsModal();
  const [quality, setQuality] = useState("auto");

  // Local UI flags for progress interactions (kept for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);
  const playerRef = useRef<InstanceType<typeof shaka.Player> | null>(null);

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
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

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

  const qualityOptions = [
    { value: "2160", label: "2160p", badge: "4K" },
    { value: "1440", label: "1440p", badge: "HD" },
    { value: "1080", label: "1080p", badge: "HD" },
    { value: "720", label: "720p", badge: "" },
    { value: "480", label: "480p", badge: "" },
    { value: "360", label: "360p", badge: "" },
    { value: "auto", label: "Auto", badge: "" },
  ];

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

  const seekIndicatorVariants = {
    hidden: { opacity: 0, scale: 0.8, x: "-50%" },
    visible: {
      opacity: 1,
      scale: 1,
      x: "-50%",
      transition: { type: "spring" as const, damping: 20, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: "-50%",
      transition: { duration: 0.2 },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playlistItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.1 } },
  };

  // Playlist functions
  const initializeNativePlayback = useCallback(
    (videoElement: HTMLVideoElement) => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      try {
        // Try HLS first
        videoElement.src = `https://stream.mux.com/${playbackId}.m3u8`;
      } catch (error) {
        console.error("Native HLS playback failed:", error);
        videoElement.src = `https://stream.mux.com/${playbackId}/medium.mp4`;
      }
    },
    [playbackId]
  );

  const playVideo = useCallback(
    async (targetEpisodeId: string) => {
      if (!episodes?.length || !playbackId) return;

      const episode = episodes.find((ep: Episode) => ep.id === targetEpisodeId);
      if (!episode) return;

      const video = videoRef.current;
      const player = playerRef.current;
      if (!video) return;

      const wasPlaying = !video.paused;
      const currentVolume = video.volume;
      const wasMuted = video.muted;

      // Reset states
      setCurrentTime(0);
      setThumbnailsGenerated(false);
      setThumbnails([]);

      try {
        // Clean up existing player if it exists
        if (player) {
          await player.destroy();
          playerRef.current = null;
        }

        // Try Shaka Player first
        try {
          if (shaka.Player.isBrowserSupported()) {
            const newPlayer = new shaka.Player(video);
            playerRef.current = newPlayer;

            // Configure error handlers before loading
            newPlayer.addEventListener("error", (error) => {
              console.error("Shaka player error:", error);
              initializeNativePlayback(video);
            });

            await newPlayer.load(`https://stream.mux.com/${playbackId}.m3u8`);
          } else {
            initializeNativePlayback(video);
          }
        } catch (error) {
          console.error("Video playback initialization failed:", error);
          initializeNativePlayback(video);
        }

        // Restore video state
        video.currentTime = 0;
        video.volume = currentVolume;
        video.muted = wasMuted;

        if (wasPlaying) {
          try {
            await video.play();
            setIsPlaying(true);
          } catch (playError) {
            console.warn("Failed to resume playback:", playError);
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error("Error during video transition:", error);
        setIsPlaying(false);
      }
    },
    [playbackId, episodes, initializeNativePlayback]
  );

  const playNext = useCallback(() => {
    if (!episodes?.length || !episodeId || !canGoNext) return;
    const currentIndex = episodes.findIndex(
      (ep: Episode) => ep.id === episodeId
    );
    const nextEpisode = episodes[currentIndex + 1];
    if (nextEpisode) {
      playVideo(nextEpisode.id);
    }
  }, [episodes, episodeId, playVideo, canGoNext]);

  const playPrevious = useCallback(() => {
    if (!episodes?.length || !episodeId || !canGoPrevious) return;
    const currentIndex = episodes.findIndex(
      (ep: Episode) => ep.id === episodeId
    );
    const previousEpisode = episodes[currentIndex - 1];
    if (previousEpisode) {
      playVideo(previousEpisode.id);
    }
  }, [episodes, episodeId, playVideo, canGoPrevious]);

  // Generate thumbnails
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
    setHoverProgress(percentage);
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

  useEffect(() => {
    if (!videoRef.current || !playbackId) return;

    const video = videoRef.current;
    const src = `https://stream.mux.com/${playbackId}.m3u8`;

    // Install polyfills
    shaka.polyfill.installAll();

    async function initPlayer() {
      // If Shaka not supported, fallback to native HLS
      if (!shaka.Player.isBrowserSupported()) {
        console.warn(
          "Shaka not supported in this browser. Falling back to native HLS."
        );
        video.src = src;
        if (typeof initialSeek === "number" && initialSeek > 0) {
          video.currentTime = initialSeek;
        }
        onCanPlay();
        return;
      }

      try {
        // Store current state before destroying player
        const currentTime = video.currentTime;
        const wasPlaying = !video.paused;

        // Only reinitialize if necessary
        if (playerRef.current) {
          try {
            await playerRef.current.load(src);
            // Restore state
            video.currentTime = currentTime;
            if (wasPlaying) video.play();
            return;
          } catch (error) {
            console.warn("Failed to reuse player, reinitializing:", error);
            playerRef.current.destroy();
          }
        }

        const player = new shaka.Player(video);
        playerRef.current = player as InstanceType<typeof shaka.Player>;

        // Conservative, resilient streaming config
        player.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 15,
            bufferBehind: 30,
            useNativeHlsOnSafari: true,
            retryParameters: {
              maxAttempts: 5,
              baseDelay: 1000,
              backoffFactor: 2,
              fuzzFactor: 0.5,
              timeout: 30000,
            },
            stallThreshold: 1,
            stallSkip: 0.1,
          },
          manifest: {
            retryParameters: {
              maxAttempts: 5,
              baseDelay: 1000,
              backoffFactor: 2,
              timeout: 30000,
            },
          },
          drm: { servers: {} },
        } as unknown as Parameters<typeof player.configure>[0]);

        // Listen for errors
        player.addEventListener("error", (event: ShakaErrorEvent) => {
          console.error("Shaka error", event.detail);
        });

        // Load the HLS manifest
        await player.load(src);

        // Restore saved state or use initial seek
        if (currentTime > 0) {
          video.currentTime = currentTime;
          if (wasPlaying) video.play();
        } else if (typeof initialSeek === "number" && initialSeek > 0) {
          video.currentTime = initialSeek;
        }

        onCanPlay();
      } catch (error) {
        console.error("Shaka failed, falling back to native HLS:", error);
        try {
          // Fallback to native
          video.src = src;
          if (typeof initialSeek === "number" && initialSeek > 0) {
            video.currentTime = initialSeek;
          }
          onCanPlay();
        } catch (fallbackError) {
          console.error("Native HLS fallback failed:", fallbackError);
        }
      }
    }

    initPlayer();

    // Cleanup
    return () => {
      try {
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        // Clean up video element
        if (video) {
          video.removeAttribute("src");
          video.load();
        }
      } catch (error) {
        console.warn("Error during player cleanup:", error);
      }
    };
  }, [playbackId, initialSeek, onCanPlay]);

  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
    };

    const startHideTimer = (delay: number) => {
      resetControlsTimeout();
      if (isPlaying && !isControlsInteraction) {
        controlsTimeoutRef.current = setTimeout(() => {
          // Only hide if still playing and not interacting
          if (isPlaying && !isControlsInteraction) {
            setIsContentVisible(false);
          }
        }, delay);
      }
    };

    // Show controls in these cases
    const shouldShowControls =
      !isPlaying || // Always show when paused
      isControlsInteraction || // Show while interacting with controls
      (isFullscreen && isMobile) || // Show in mobile fullscreen
      isHover; // Show on hover

    if (shouldShowControls) {
      setIsContentVisible(true);
      resetControlsTimeout();

      // Start hide timer only if playing and not interacting
      if (isPlaying && !isControlsInteraction) {
        startHideTimer(isFullscreen ? 3500 : 2000);
      }
    } else {
      startHideTimer(2000);
    }

    return resetControlsTimeout;
  }, [isHover, isPlaying, isFullscreen, isMobile, isControlsInteraction]);

  const lockOrientationToLandscape = useCallback(async () => {
    if (!isMobile || !screen?.orientation) return;

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
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

  // Handle fullscreen
  // Handle touch events for mobile controls

  // Handle touch events for mobile controls
  const handleVideoTouch = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return;

      // Check if the touch target is a control button or slider
      const target = e.target as HTMLElement;
      const isControlElement = target.closest('button, input, [role="slider"]');

      const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = null;
        }
      };

      if (isControlElement) {
        // If touching a control, keep controls visible and mark as interacting
        setIsControlsInteraction(true);
        setIsContentVisible(true);
        resetControlsTimeout();
      } else {
        // If touching the video area, toggle controls visibility
        setIsContentVisible((prev) => !prev);
        resetControlsTimeout();

        // Start a new hide timer if playing
        if (isPlaying) {
          controlsTimeoutRef.current = setTimeout(
            () => {
              setIsContentVisible(false);
              setIsControlsInteraction(false);
            },
            isFullscreen ? 3500 : 2000
          );
        }
      }
    },
    [isMobile, isPlaying, isFullscreen]
  );

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

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleFullscreen]);

  const handleFullScreenChange = () => {
    const isCurrentlyFullScreen = document.fullscreenElement !== null;
    setIsFullscreen(isCurrentlyFullScreen);
  };

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
          if (e.shiftKey) {
            playPrevious();
          } else {
            seekBackward(10);
          }
          break;
        case "ArrowRight":
          if (e.shiftKey) {
            playNext();
          } else {
            seekForward(10);
          }
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
    playNext,
    playPrevious,
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

    const onEnded = () => {
      setIsPlaying(false);

      // Only auto-advance if there's a next episode available
      if (hasNextEpisode) {
        playNext();
      }
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
    video.addEventListener("ended", onEnded);
    video.addEventListener("enterpictureinpicture", onEnterPiP);
    video.addEventListener("leavepictureinpicture", onLeavePiP);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("enterpictureinpicture", onEnterPiP);
      video.removeEventListener("leavepictureinpicture", onLeavePiP);
    };
  }, [playNext, onTimeUpdate, hasNextEpisode]);

  // Generate thumbnails when video loads
  useEffect(() => {
    if (duration > 0 && !thumbnailsGenerated) {
      generateThumbnails();
    }
  }, [duration, thumbnailsGenerated, generateThumbnails]);

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

  // Update video source when playbackId changes
  useEffect(() => {
    if (!playbackId) return;
    const src = `https://stream.mux.com/${playbackId}.m3u8`;
    const player = playerRef.current;
    const video = videoRef.current;

    // Ensure initial playback speed is set to 1x
    if (video) {
      video.playbackRate = 1;
      setPlaybackSpeed(1);
    }

    if (player) {
      player.load(src).catch((e: unknown) => {
        console.error(
          "Error loading new playbackId with Shaka, fallback to native:",
          e
        );
        if (video) {
          video.src = src;
        }
      });
    } else if (video) {
      // If no Shaka player (unsupported), use native
      video.src = src;
    }
  }, [playbackId]);

  // Format time (seconds to MM:SS)
  function formatTime(time: number) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

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
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onTouchStart={handleVideoTouch}
        onTouchEnd={() => {
          // Reset control interaction state after a short delay
          setTimeout(() => setIsControlsInteraction(false), 300);
        }}
      >
        <div className="flex gap-4">
          {/* Playlist sidebar */}

          {/* Video player */}
          <div className="flex-1">
            {/* Video title */}
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
            </motion.div>

            <div
              className={cn(
                "relative bg-black transition-all duration-1000 overflow-hidden -mt-6 lg:-mt-4 xl:-mt-4",
                // Non-fullscreen mode: maintain aspect ratio for all devices
                !isFullscreen && "aspect-video",
                // Fullscreen mode: specific heights for mobile and desktop
                isFullscreen && !isMobile && "h-full", // Full height for desktop fullscreen
                isFullscreen && "h-[400px] lg:h-full xl:h-full w-full", // Fixed height for mobile fullscreen
                className
              )}
            >
              <video
                ref={videoRef}
                className="w-full h-full rounded-lg"
                poster={thumbnail}
                onClick={togglePlay}
                onCanPlay={onCanPlay}
                onLoadStart={onLoadStart}
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
                  <motion.div
                    className="absolute top-1/2 left-1/2 bg-black/80 text-white px-4 py-3 rounded-lg flex items-center gap-2"
                    variants={seekIndicatorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {seekDirection === "forward" ? (
                      <RotateCw className="size-5" />
                    ) : (
                      <RotateCcw className="size-5" />
                    )}
                    <span className="text-sm font-medium">
                      {seekDirection === "forward" ? "+" : "-"}
                      {seekAmount}s
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Play/Pause overlay */}
              <AnimatePresence>
                {showPlayPauseIndicator && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bottom-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls overlay */}
              {isContentVisible && (
                <motion.div
                  className="absolute inset-x-0 z-10 bottom-0"
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

                    {/* Progress markers */}
                    <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 pointer-events-none">
                      {duration > 60 &&
                        Array.from({ length: Math.floor(duration / 60) }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className="absolute top-0 w-px h-1 bg-white/30"
                              style={{
                                left: `${(((i + 1) * 60) / duration) * 100}%`,
                              }}
                            />
                          )
                        )}
                    </div>
                  </div>

                  {/* Control buttons */}
                  <div
                    className={cn(
                      "flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent",
                      !isFullscreen && isMobile ? "p-2" : "p-3", // Different padding for mobile non-fullscreen
                      isFullscreen && isMobile && "p-4 from-black/90 mb-safe" // Stronger gradient and safe area margin in fullscreen
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className=" bg-black/30 backdrop-blur-sm px-1 py-1 rounded-full">
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
                            onClick={playPrevious}
                            className="py-1.5 px-3 text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                            title="Previous video"
                            disabled={!canGoPrevious}
                          >
                            <SkipBack className="w-5 h-5" />
                          </motion.button>
                        )}

                        {!isMobile && (
                          <motion.button
                            onClick={playNext}
                            className="py-1.5 px-3 text-white rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!canGoNext}
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
                          className="py-1.5 px-3 text-white rounded-full hover:bg-white/10"
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
                          onClick={() => setShowPlaylist(!showPlaylist)}
                          className={cn(
                            "py-1 px-3 text-white rounded-full hover:bg-white/10",
                            showPlaylist && "bg-white/10"
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
                            isPictureInPicture && "bg-white/10"
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
                      variants={settingsBackdropVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    />

                    <motion.div
                      className="relative w-full max-w-xs bg-black/60 backdrop-blur-sm text-white rounded-lg shadow-lg overflow-hidden max-h-[80vh] overflow-y-auto"
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
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg"
                                variants={menuItemVariants}
                                initial="hidden"
                                animate="visible"
                                custom={3}
                                layout
                              >
                                <div className="flex items-center gap-3">
                                  <Subtitles className="size-6" />
                                  <span className="text-sm">Subtitles</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-neutral-400">
                                  <span>Off</span>
                                  <ChevronLeft className="w-4 h-4 rotate-180" />
                                </div>
                              </motion.button>
                              <motion.button
                                onClick={() => navigateTo("audio")}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg"
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
                                <div className="flex items-center gap-1 text-sm text-neutral-400">
                                  <span>Korean</span>
                                  <ChevronLeft className="w-4 h-4 rotate-180" />
                                </div>
                              </motion.button>

                              <motion.button
                                onClick={() => navigateTo("speed")}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg"
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
                                <div className="flex items-center gap-1 text-sm text-neutral-400">
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
                                className="w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg"
                                variants={menuItemVariants}
                                initial="hidden"
                                animate="visible"
                                custom={6}
                                layout
                              >
                                <div className="flex items-center gap-3">
                                  <Settings2 className="size-6" />
                                  <span className="text-sm">Quality</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-neutral-400">
                                  <span>
                                    {quality === "auto"
                                      ? "Auto (480p)"
                                      : `${quality}p`}
                                  </span>
                                  <ChevronLeft className="w-4 h-4 rotate-180" />
                                </div>
                              </motion.button>
                            </LayoutGroup>
                          </motion.div>
                        )}

                        {/* Quality settings view */}
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
                              {qualityOptions.map((option, index) => (
                                <motion.button
                                  key={option.value}
                                  onClick={() => {
                                    setQuality(option.value);
                                    navigateTo("main");
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg",
                                    quality === option.value && "bg-white/15"
                                  )}
                                  variants={menuItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  custom={index}
                                  whileTap={{ scale: 0.98 }}
                                  layout
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {option.label}
                                    </span>
                                    {option.badge && (
                                      <span className="text-xs text-neutral-400">
                                        {option.badge}
                                      </span>
                                    )}
                                  </div>
                                </motion.button>
                              ))}
                            </LayoutGroup>
                          </motion.div>
                        )}

                        {/* Playback speed view */}
                        {settingsView === "speed" && (
                          <motion.div
                            key="speed"
                            className="p-1"
                            custom={1}
                            variants={settingsViewVariants}
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
                                    "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg",
                                    playbackSpeed === option.value &&
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
                                    setSubtitles(option.value !== "off");
                                    navigateTo("main");
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg",
                                    option.value !== "off" &&
                                      subtitles &&
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
                              {subtitleOptions.map((option, index) => (
                                <motion.button
                                  key={option.value}
                                  onClick={() => {
                                    setSubtitles(option.value !== "off");
                                    navigateTo("main");
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between p-3 hover:bg-white/15 rounded-lg",
                                    option.value !== "off" &&
                                      subtitles &&
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
