/**
 * VIDEO PLAYER INTEGRATION GUIDE
 * ==============================
 * 
 * Here's how to integrate device monitoring into your existing video-player.tsx
 */

// 1. ADD THESE IMPORTS AT THE TOP OF video-player.tsx
import { useDeviceMonitoring } from "@/hooks/use-device-monitoring";
import { DeviceStatusIndicator } from "@/components/device-status-indicator";

// ============================================================================

// 2. ADD THIS INSIDE THE VideoPlayer COMPONENT (after other state declarations)
```tsx
export const VideoPlayer = ({
  // ... existing props
}: VideoPlayerProps & { initialProgress?: number }) => {
  // ... existing state declarations ...

  // ADD THESE NEW LINES:
  const { deviceStatus, getQualityRecommendation } = useDeviceMonitoring();
  const [showDeviceMonitor, setShowDeviceMonitor] = useState(false);
  const [autoReduceQuality, setAutoReduceQuality] = useState(true);

  // ========================================================================

  // 3. ADD THIS EFFECT TO AUTO-REDUCE QUALITY BASED ON DEVICE STATE
  useEffect(() => {
    if (!autoReduceQuality || !selectedQualityRef.current?.isAuto) {
      return;
    }

    const recommendation = getQualityRecommendation();

    // Only log non-normal conditions to avoid spam
    if (recommendation.shouldReduceQuality) {
      console.log("Device monitoring:", recommendation.reason);

      // Optionally notify user of thermal/battery issues
      if (deviceStatus.thermal.thermalLevel === "critical") {
        // Show warning toast or notification
        console.warn(
          "Device thermal critical - quality has been reduced for stability"
        );
      }
    }

    // Auto quality is already handling this, but you can add custom logic here
    // For example, force a quality switch if thermal state changes dramatically
  }, [deviceStatus, autoReduceQuality, getQualityRecommendation]);

  // ========================================================================

  // 4. MODIFY THE selectQuality FUNCTION TO RESPECT DEVICE RECOMMENDATIONS
  // Find the existing selectQuality function and update it like this:

  const selectQuality = useCallback((quality: QualityOption) => {
    if (!playerRef.current) return;

    try {
      // Check device recommendations
      const recommendation = getQualityRecommendation();

      // If user selects a quality that's not recommended due to device state
      if (
        !quality.isAuto &&
        quality.height > recommendation.recommendedHeight &&
        (deviceStatus.thermal.thermalLevel === "critical" ||
          (deviceStatus.battery.level < 0.2 && !deviceStatus.battery.charging))
      ) {
        console.warn(
          `Selected quality ${quality.height}p exceeds device recommendation (${recommendation.recommendedHeight}p).`,
          recommendation.reason
        );
        // Optionally show warning but still allow user choice
      }

      if (quality.isAuto) {
        playerRef.current.configure({
          abr: {
            enabled: true,
          },
        });

        if (abrManagerRef.current) {
          abrManagerRef.current.forceVariantSelection();
        }

        const tracks = playerRef.current.getVariantTracks();
        const activeTrack = tracks.find((track) => track.active);

        if (activeTrack && activeTrack.height) {
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
      } else {
        playerRef.current.configure({
          abr: {
            enabled: false,
          },
        });

        const tracks = playerRef.current.getVariantTracks();
        const track = tracks.find((t) => t.height === quality.height);

        if (track) {
          playerRef.current.selectVariantTrack(track, false);
          setSelectedQuality(quality);
          selectedQualityRef.current = quality;
        }
      }
    } catch (error) {
      console.error("Error selecting quality:", error);
    }
  }, [deviceStatus, getQualityRecommendation]);

  // ========================================================================

  // 5. ADD THIS TO YOUR SETTINGS PANEL (in the JSX return statement)
  // Add this inside your settings menu, perhaps before the quality/speed options:

  /*
    <div className="px-4 py-3 border-b">
      <div className="flex items-center justify-between">
        <span className="text-sm">Auto-reduce quality</span>
        <input
          type="checkbox"
          checked={autoReduceQuality}
          onChange={(e) => setAutoReduceQuality(e.target.checked)}
          className="rounded"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Automatically reduce quality when device is hot or low battery
      </p>
    </div>
  */

  // ========================================================================

  // 6. ADD THIS DEVICE STATUS INDICATOR TO YOUR CONTROLS
  // Add to your control bar UI (usually near quality/settings buttons):

  /*
    <button
      onClick={() => setShowDeviceMonitor(!showDeviceMonitor)}
      className="p-2 hover:bg-white/20 rounded transition-colors"
      title="Device status"
    >
      {deviceStatus.thermal.thermalLevel !== "normal" ? (
        <AlertTriangle className="w-4 h-4 text-orange-500" />
      ) : deviceStatus.battery.level < 0.2 ? (
        <Battery className="w-4 h-4 text-red-500" />
      ) : (
        <BarChart3 className="w-4 h-4" />
      )}
    </button>

    {showDeviceMonitor && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute bottom-16 right-0 z-50"
      >
        <DeviceStatusIndicator
          deviceStatus={deviceStatus}
          compact={false}
        />
      </motion.div>
    )}
  */

  // ========================================================================

  // 7. OPTIONAL: ADD COMPACT INDICATOR IN TOP CORNER
  // Add this to your control bar for always-visible status:

  /*
    <div className="absolute top-4 right-4 pointer-events-none">
      <DeviceStatusIndicator
        deviceStatus={deviceStatus}
        compact={true}
        showOnlyWarnings={true}
      />
    </div>
  */

  // ========================================================================
};
```
 * USAGE SCENARIOS
 * ===============
 * 
 * 1. AUTO QUALITY ADJUSTMENT
 *    - User on mobile with 15% battery → automatically uses 480p
 *    - Device temperature rises → quality drops to 720p
 *    - User plugs in charger → quality can increase
 * 
 * 2. USER WARNINGS
 *    - Show toast when device is thermally throttling
 *    - Warn when battery will drain during long video
 *    - Suggest charging device
 * 
 * 3. QUALITY PRESETS
 *    Quality recommendations based on device state:
 *    - Normal: 1080p+ (device healthy, good battery)
 *    - Warm: 720p (thermal issues detected)
 *    - Hot: 480p (significant thermal issues)
 *    - Critical: 480p (severe thermal throttling)
 *    - Low battery: 480p (< 20% and not charging)
 * 
 * 4. KEYBOARD SHORTCUTS
 *    You could add:
 *    - 'D' key to toggle device monitor display
 *    - 'A' key to toggle auto-reduce quality
