import Hls from "hls.js"

export type HlsQualityLevel = {
  id: number
  width: number
  height: number
  bitrate: number
  name: string
  url: string
}

export type HlsStats = {
  bandwidth: number
  level: number
  totalLatency: number
  bufferLength: number
  droppedFrames: number
}

export type StabilityConfig = {
  enabled: boolean // Whether stability features are enabled
  bufferThreshold: number // Minimum buffer (in seconds) before increasing quality
  bandwidthSafetyFactor: number // Safety factor for bandwidth (0.0-1.0)
  qualityCooldownMs: number // Cooldown period between quality changes (ms)
  gradualSwitch: boolean // Whether to switch quality levels gradually
  startupProfile: "conservative" | "moderate" | "aggressive" // How aggressive to be during startup
  hysteresisFactor: number // Factor to prevent oscillation (0.0-1.0)
}

export class HlsManager {
  private hls: Hls | null = null
  private videoElement: HTMLVideoElement | null = null
  private levels: HlsQualityLevel[] = []
  private currentLevel = -1
  private autoLevel = true
  private onLevelSwitchingCallback: ((level: HlsQualityLevel) => void) | null = null
  private onLevelsLoadedCallback: ((levels: HlsQualityLevel[]) => void) | null = null
  private onStatsUpdateCallback: ((stats: HlsStats) => void) | null = null

  // Stability-related properties
  private stabilityConfig: StabilityConfig = {
    enabled: true,
    bufferThreshold: 10, // 10 seconds buffer before increasing quality
    bandwidthSafetyFactor: 0.7, // Use 70% of detected bandwidth for safety
    qualityCooldownMs: 10000, // 10 seconds cooldown between quality changes
    gradualSwitch: true, // Switch quality levels gradually
    startupProfile: "moderate", // Moderate startup profile
    hysteresisFactor: 0.2, // 20% hysteresis to prevent oscillation
  }
  private lastQualityChangeTime = 0
  private bandwidthHistory: number[] = []
  private bandwidthHistoryMaxSize = 10
  private startupPhase = true
  private startupPhaseEndTime = 0
  private targetLevel = -1 // Target level for gradual switching
  private manualQualityLevel: number | null = null

  constructor(config?: Partial<StabilityConfig>) {
    this.checkHlsSupport()

    // Apply custom configuration if provided
    if (config) {
      this.stabilityConfig = { ...this.stabilityConfig, ...config }
    }
  }

  /**
   * Check if HLS is supported in the current browser
   */
  private checkHlsSupport(): boolean {
    return Hls.isSupported()
  }

  /**
   * Initialize HLS with a video element and source URL
   */
  public initialize(videoElement: HTMLVideoElement, src: string): boolean {
    if (!this.checkHlsSupport()) {
      console.error("HLS is not supported in this browser")
      return false
    }

    this.videoElement = videoElement
    this.destroyHls() // Clean up any existing instance

    try {
      // Configure HLS with stability settings
      const hlsConfig: Partial<Hls.Config> = {
        debug: false,
        startLevel: -1, // Start with auto level
        capLevelToPlayerSize: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        // Disable HLS.js built-in ABR if we're using our custom stability algorithm
        abrEwmaDefaultEstimate: 1000000, // 1 Mbps initial estimate
        abrBandWidthFactor: this.stabilityConfig.bandwidthSafetyFactor,
        abrBandWidthUpFactor: 0.7,
        abrMaxWithRealBitrate: true,
        // Set longer fragments load timeout to prevent unnecessary quality switches
        fragLoadingTimeOut: 20000,
        // Stability settings
        startFragPrefetch: true,
        lowLatencyMode: false,
        // Only use our custom ABR logic if stability is enabled
        enableWorker: true,
      }

      // If stability is enabled, we'll handle ABR ourselves
      if (this.stabilityConfig.enabled) {
        hlsConfig.autoStartLoad = true
        hlsConfig.startLevel = this.getStartupLevel()
      }

      this.hls = new Hls(hlsConfig)

      // Bind HLS events
      this.bindEvents()

      // Load source
      this.hls.loadSource(src)
      this.hls.attachMedia(videoElement)

      // Set startup phase
      this.startupPhase = true
      this.startupPhaseEndTime = Date.now() + 30000 // 30 seconds startup phase

      return true
    } catch (error) {
      console.error("Error initializing HLS:", error)
      return false
    }
  }

  /**
   * Bind HLS events to handle quality levels and statistics
   */
  private bindEvents(): void {
    if (!this.hls) return

    // When manifest is parsed, get available quality levels
    this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
      if (!data.levels || data.levels.length === 0) return

      this.levels = data.levels.map((level, index) => {
        const height = level.height || 0
        const width = level.width || 0
        const bitrate = level.bitrate || 0

        // Generate a name based on resolution or bitrate
        let name = "Auto"
        if (height > 0) {
          name = `${height}p`
        } else if (bitrate > 0) {
          name = `${Math.round(bitrate / 1000)} kbps`
        }

        return {
          id: index,
          width,
          height,
          bitrate,
          name,
          url: level.url[0] || "",
        }
      })

      // Sort levels by bitrate (ascending)
      this.levels.sort((a, b) => a.bitrate - b.bitrate)

      // Add "Auto" as the first option
      this.levels.unshift({
        id: -1,
        width: 0,
        height: 0,
        bitrate: 0,
        name: "Auto",
        url: "",
      })

      // Notify about available levels
      if (this.onLevelsLoadedCallback) {
        this.onLevelsLoadedCallback(this.levels)
      }

      // If stability is enabled, take control of ABR
      if (this.stabilityConfig.enabled) {
        // Start with an appropriate level based on startup profile
        const startLevel = this.getStartupLevel()
        if (startLevel >= 0) {
          this.hls.currentLevel = startLevel
        }
      }
    })

    // When level switching
    this.hls.on(Hls.Events.LEVEL_SWITCHING, (_, data) => {
      const levelId = data.level
      this.currentLevel = levelId

      // Find the level details
      const level = this.levels.find((l) => l.id === levelId) || this.levels[0]

      // Notify about level switch
      if (this.onLevelSwitchingCallback && level) {
        this.onLevelSwitchingCallback(level)
      }

      // Update last quality change time
      this.lastQualityChangeTime = Date.now()
    })

    // When a level is loaded
    this.hls.on(Hls.Events.LEVEL_LOADED, (_, data) => {
      // Check if we're still in startup phase
      if (this.startupPhase && Date.now() > this.startupPhaseEndTime) {
        this.startupPhase = false
      }
    })

    // When fragments are loaded, update bandwidth history
    this.hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
      const loadTime = data.stats.loading.end - data.stats.loading.start
      const bitrate = Math.round((8 * data.stats.total) / loadTime)

      // Add to bandwidth history
      this.updateBandwidthHistory(bitrate)

      // If stability is enabled and we're in auto mode, run our custom ABR logic
      if (this.stabilityConfig.enabled && this.autoLevel && this.hls) {
        this.evaluateQualityChange()
      }
    })

    // Periodically update stats
    setInterval(() => {
      if (!this.hls) return

      const stats = this.hls.stats
      const currentLevel = this.hls.currentLevel
      const currentLevelDetails = this.hls.levels[currentLevel]

      if (this.onStatsUpdateCallback) {
        this.onStatsUpdateCallback({
          bandwidth: stats.bandwidth || 0,
          level: currentLevel,
          totalLatency: stats.totalLatency || 0,
          bufferLength: stats.bufferLen || 0,
          droppedFrames: stats.droppedFrames || 0,
        })
      }
    }, 2000)

    // Error handling
    this.hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("HLS network error, trying to recover...")
            this.hls?.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("HLS media error, trying to recover...")
            this.hls?.recoverMediaError()
            break
          default:
            console.error("HLS fatal error, destroying HLS instance:", data)
            this.destroyHls()
            break
        }
      }
    })
  }

  /**
   * Update bandwidth history with a new measurement
   */
  private updateBandwidthHistory(bandwidth: number): void {
    this.bandwidthHistory.push(bandwidth)

    // Keep history at max size
    if (this.bandwidthHistory.length > this.bandwidthHistoryMaxSize) {
      this.bandwidthHistory.shift()
    }
  }

  /**
   * Get estimated bandwidth based on history
   */
  private getEstimatedBandwidth(): number {
    if (this.bandwidthHistory.length === 0) {
      return 1000000 // Default 1 Mbps if no history
    }

    // Sort bandwidth measurements
    const sortedBandwidths = [...this.bandwidthHistory].sort((a, b) => a - b)

    // Use a percentile-based approach to avoid outliers
    // For stability, we use the 25th percentile to be conservative
    const index = Math.floor(sortedBandwidths.length * 0.25)
    let estimatedBandwidth = sortedBandwidths[index] || sortedBandwidths[0]

    // Apply safety factor
    estimatedBandwidth *= this.stabilityConfig.bandwidthSafetyFactor

    return estimatedBandwidth
  }

  /**
   * Get buffer length from video element
   */
  private getBufferLength(): number {
    if (!this.videoElement) return 0

    const buffered = this.videoElement.buffered
    if (buffered.length === 0) return 0

    return buffered.end(buffered.length - 1) - this.videoElement.currentTime
  }

  /**
   * Determine the appropriate level for startup based on profile
   */
  private getStartupLevel(): number {
    // If we don't have levels yet, return -1 (auto)
    if (this.levels.length <= 1) return -1

    // Get actual quality levels (excluding the "Auto" option)
    const actualLevels = this.levels.filter((level) => level.id !== -1)
    if (actualLevels.length === 0) return -1

    switch (this.stabilityConfig.startupProfile) {
      case "conservative":
        // Start with the lowest quality
        return actualLevels[0].id
      case "aggressive":
        // Start with the second highest quality
        return actualLevels.length > 1 ? actualLevels[actualLevels.length - 2].id : actualLevels[0].id
      case "moderate":
      default:
        // Start with a middle quality
        const middleIndex = Math.floor(actualLevels.length / 3) // Use the first third for faster startup
        return actualLevels[middleIndex]?.id || actualLevels[0].id
    }
  }

  /**
   * Evaluate whether to change quality level based on current conditions
   */
  private evaluateQualityChange(): void {
    if (!this.hls || !this.videoElement || this.manualQualityLevel !== null) return

    // Skip if we're in cooldown period
    const now = Date.now()
    if (now - this.lastQualityChangeTime < this.stabilityConfig.qualityCooldownMs) {
      return
    }

    // Get current conditions
    const estimatedBandwidth = this.getEstimatedBandwidth()
    const bufferLength = this.getBufferLength()
    const currentLevel = this.hls.currentLevel

    // Get actual quality levels (excluding the "Auto" option)
    const actualLevels = this.levels.filter((level) => level.id !== -1)
    if (actualLevels.length === 0) return

    // Find the optimal level based on bandwidth
    let optimalLevelIndex = 0
    for (let i = 0; i < actualLevels.length; i++) {
      if (actualLevels[i].bitrate <= estimatedBandwidth) {
        optimalLevelIndex = i
      } else {
        break
      }
    }

    // Apply hysteresis to prevent oscillation
    // If we're considering decreasing quality, require a larger bandwidth gap
    if (optimalLevelIndex < actualLevels.findIndex((l) => l.id === currentLevel)) {
      const hysteresisThreshold = estimatedBandwidth * (1 + this.stabilityConfig.hysteresisFactor)
      const currentBitrate = actualLevels.find((l) => l.id === currentLevel)?.bitrate || 0

      // Only decrease if current bitrate is significantly higher than what we can support
      if (currentBitrate <= hysteresisThreshold) {
        return // Don't decrease yet
      }
    }

    // Buffer-based decisions
    // If buffer is low, decrease quality regardless of bandwidth
    if (bufferLength < 2 && currentLevel > actualLevels[0].id) {
      this.setQualityWithStability(actualLevels[0].id)
      return
    }

    // If buffer is below threshold, don't increase quality
    if (
      bufferLength < this.stabilityConfig.bufferThreshold &&
      optimalLevelIndex > actualLevels.findIndex((l) => l.id === currentLevel)
    ) {
      return
    }

    // If we're in startup phase, be more conservative
    if (this.startupPhase) {
      // During startup, only increase quality if we have a good buffer
      if (
        bufferLength < this.stabilityConfig.bufferThreshold * 1.5 &&
        optimalLevelIndex > actualLevels.findIndex((l) => l.id === currentLevel)
      ) {
        return
      }
    }

    // Apply the quality change if needed
    const targetLevel = actualLevels[optimalLevelIndex].id
    if (targetLevel !== currentLevel) {
      this.setQualityWithStability(targetLevel)
    }
  }

  /**
   * Set quality with stability features
   */
  private setQualityWithStability(targetLevelId: number): void {
    if (!this.hls) return

    const currentLevel = this.hls.currentLevel

    // If gradual switching is enabled, move one step at a time
    if (this.stabilityConfig.gradualSwitch && !this.startupPhase) {
      const actualLevels = this.levels.filter((level) => level.id !== -1)
      const currentIndex = actualLevels.findIndex((l) => l.id === currentLevel)
      const targetIndex = actualLevels.findIndex((l) => l.id === targetLevelId)

      if (currentIndex !== -1 && targetIndex !== -1) {
        // Move one step at a time
        if (targetIndex > currentIndex) {
          // Increasing quality - move up one level
          this.hls.currentLevel = actualLevels[currentIndex + 1].id
        } else if (targetIndex < currentIndex) {
          // Decreasing quality - move down one level
          this.hls.currentLevel = actualLevels[currentIndex - 1].id
        }
      } else {
        // Fallback if indices are not found
        this.hls.currentLevel = targetLevelId
      }
    } else {
      // Direct switching
      this.hls.currentLevel = targetLevelId
    }

    // Store the target level for future reference
    this.targetLevel = targetLevelId

    // Update last quality change time
    this.lastQualityChangeTime = Date.now()
  }

  /**
   * Set the quality level
   * @param levelId Level ID or -1 for auto
   */
  public setQuality(levelId: number): void {
    if (!this.hls) return

    if (levelId === -1) {
      // Auto level
      this.hls.currentLevel = -1
      this.autoLevel = true
      this.manualQualityLevel = null

      // Reset bandwidth history when switching to auto
      this.bandwidthHistory = []
    } else {
      // Specific level
      this.hls.currentLevel = levelId
      this.autoLevel = false
      this.manualQualityLevel = levelId
    }

    // Update last quality change time
    this.lastQualityChangeTime = Date.now()
  }

  /**
   * Get all available quality levels
   */
  public getQualityLevels(): HlsQualityLevel[] {
    return this.levels
  }

  /**
   * Get the current quality level
   */
  public getCurrentQuality(): HlsQualityLevel | null {
    if (this.currentLevel === -1 && this.hls) {
      // For auto level, return the level HLS is currently using
      const currentLevelId = this.hls.currentLevel
      return this.levels.find((l) => l.id === currentLevelId) || null
    }
    return this.levels.find((l) => l.id === this.currentLevel) || null
  }

  /**
   * Check if auto quality selection is enabled
   */
  public isAutoQuality(): boolean {
    return this.autoLevel
  }

  /**
   * Update stability configuration
   */
  public updateStabilityConfig(config: Partial<StabilityConfig>): void {
    this.stabilityConfig = { ...this.stabilityConfig, ...config }
  }

  /**
   * Get current stability configuration
   */
  public getStabilityConfig(): StabilityConfig {
    return { ...this.stabilityConfig }
  }

  /**
   * Set callback for level switching events
   */
  public onLevelSwitching(callback: (level: HlsQualityLevel) => void): void {
    this.onLevelSwitchingCallback = callback
  }

  /**
   * Set callback for when levels are loaded
   */
  public onLevelsLoaded(callback: (levels: HlsQualityLevel[]) => void): void {
    this.onLevelsLoadedCallback = callback
  }

  /**
   * Set callback for stats updates
   */
  public onStatsUpdate(callback: (stats: HlsStats) => void): void {
    this.onStatsUpdateCallback = callback
  }

  /**
   * Clean up HLS instance
   */
  public destroyHls(): void {
    if (this.hls) {
      this.hls.destroy()
      this.hls = null
    }
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.destroyHls()
    this.videoElement = null
    this.levels = []
    this.currentLevel = -1
    this.onLevelSwitchingCallback = null
    this.onLevelsLoadedCallback = null
    this.onStatsUpdateCallback = null
    this.bandwidthHistory = []
  }
}
