/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class AdvancedABRManager {
  private switchCallback_:
    | ((variant: any, clearBuffer: boolean, safeMargin?: number) => void)
    | null = null;
  private enabled_ = false;
  private variants_: any[] = [];
  private bandwidthHistory_: number[] = [];
  private currentVariant_: any = null;
  private config_ = {
    maxHistorySize: 20, // More samples for better bandwidth estimation
    safetyFactor: 0.7, // Base safety factor, adjusted dynamically based on network
    upgradeBufferThreshold: 15, // Buffer level to consider upgrades
    downgradeBufferThreshold: 8, // Buffer level to trigger downgrades
    criticalBufferThreshold: 5, // Critical buffer level - immediate action needed
    minSwitchInterval: 5000, // Reduced for faster response to network changes
    minBandwidthSamples: 2, // Reduced to allow faster initial decisions
    drainRateCheckInterval: 1000,
    maxDrainRateForUpgrade: 0.15, // Slightly more lenient
    // Network speed thresholds (in bps)
    highSpeedThreshold: 10 * 1000 * 1000, // 10 Mbps - high speed network
    mediumSpeedThreshold: 3 * 1000 * 1000, // 3 Mbps - medium speed network
    lowSpeedThreshold: 1 * 1000 * 1000, // 1 Mbps - low speed network
  };
  private bufferHistory_: { level: number; time: number }[] = [];
  private networkType_: string = "unknown";
  private networkSpeed_: "high" | "medium" | "low" | "unknown" = "unknown";
  private lastSwitchTime_ = 0;
  private bufferLevel_ = 0;
  private playbackRate_ = 1;
  private cmsdManager_: any = null;
  private mediaElement_: HTMLMediaElement | null = null;
  private isDestroyed_ = false;
  private bandwidthCheckInterval_: ReturnType<typeof setInterval> | null = null;
  private onVariantChangeCallback_: ((variant: any) => void) | null = null;
  private consecutiveErrors_ = 0; // Track consecutive switch errors
  private lastFailedVariantId_: number | null = null; // Track failed variant to avoid retrying
  private lastNetworkChangeTime_ = 0; // Track when network condition last changed

  init(
    switchCallback: (
      variant: any,
      clearBuffer: boolean,
      safeMargin?: number
    ) => void
  ): void {
    this.switchCallback_ = switchCallback;
  }

  stop(): void {
    this.enabled_ = false;
    // Don't set switchCallback_ to null here to prevent errors
  }

  release(): void {
    // Mark as destroyed to prevent further operations
    this.isDestroyed_ = true;

    // Stop monitoring
    this.stopBandwidthMonitoring();

    // Release all internal references
    this.switchCallback_ = null;
    this.variants_ = [];
    this.bandwidthHistory_ = [];
    this.currentVariant_ = null;
    this.cmsdManager_ = null;
    this.mediaElement_ = null;
    this.onVariantChangeCallback_ = null;
    this.consecutiveErrors_ = 0;
    this.lastFailedVariantId_ = null;
  }

  enable(): void {
    if (!this.isDestroyed_) {
      this.enabled_ = true;
      // Immediately trigger variant selection when enabled
      this.forceVariantSelection();
      // Start periodic bandwidth monitoring for dynamic quality adjustment
      this.startBandwidthMonitoring();
      this.updateNetworkInfo();
      if ((navigator as any).connection) {
        (navigator as any).connection.addEventListener("change", () =>
          this.updateNetworkInfo()
        );
      }
    }
  }

  disable(): void {
    this.enabled_ = false;
    this.stopBandwidthMonitoring();
  }

  // Start periodic monitoring to check if we should switch quality
  private startBandwidthMonitoring(): void {
    if (this.bandwidthCheckInterval_) return;

    this.bandwidthCheckInterval_ = setInterval(() => {
      if (!this.enabled_ || this.isDestroyed_) return;

      this.updateNetworkInfo();
      this.updateNetworkSpeed();

      // Skip evaluation if we've had too many consecutive errors
      if (this.consecutiveErrors_ >= 3) {
        console.log("ABR: Pausing quality switches due to consecutive errors");
        return;
      }

      // Update buffer level from media element
      if (this.mediaElement_ && this.mediaElement_.buffered.length > 0) {
        const currentTime = this.mediaElement_.currentTime;
        const bufferedEnd = this.mediaElement_.buffered.end(
          this.mediaElement_.buffered.length - 1
        );
        this.bufferLevel_ = bufferedEnd - currentTime;

        // Update buffer history
        const now = Date.now();
        this.bufferHistory_.push({ level: this.bufferLevel_, time: now });
        if (this.bufferHistory_.length > 15) {
          this.bufferHistory_.shift();
        }

        // Check buffer drain rate
        const isDraining = this.isBufferDraining_();

        // Urgent check: if buffer is critical, ignore timer
        if (this.bufferLevel_ < this.config_.criticalBufferThreshold) {
          this.evaluateQualitySwitch(true, true); // Force urgent evaluation
        } else if (this.bufferLevel_ < this.config_.downgradeBufferThreshold) {
          this.evaluateQualitySwitch(true, false); // Force downgrade evaluation
        } else if (
          now - this.lastSwitchTime_ >=
          this.config_.minSwitchInterval
        ) {
          // Normal periodic check
          this.evaluateQualitySwitch(false, isDraining);
        }

        // If network speed changed significantly, force re-evaluation
        const timeSinceNetworkChange = now - this.lastNetworkChangeTime_;
        if (
          timeSinceNetworkChange < 10000 &&
          timeSinceNetworkChange > 2000 &&
          now - this.lastSwitchTime_ >= 2000
        ) {
          // Network changed recently, re-evaluate quality
          this.evaluateQualitySwitch(false, isDraining);
        }
      }
    }, 2000); // Check every 2 seconds for faster response
  }

  private stopBandwidthMonitoring(): void {
    if (this.bandwidthCheckInterval_) {
      clearInterval(this.bandwidthCheckInterval_);
      this.bandwidthCheckInterval_ = null;
    }
    if ((navigator as any).connection) {
      (navigator as any).connection.removeEventListener("change", () =>
        this.updateNetworkInfo()
      );
    }
  }

  // Check if buffer is consistently draining
  private isBufferDraining_(): boolean {
    if (this.bufferHistory_.length < 5) return false;
    const first = this.bufferHistory_[0];
    const last = this.bufferHistory_[this.bufferHistory_.length - 1];
    const duration = (last.time - first.time) / 1000;
    if (duration === 0) return false;

    const drainRate = (first.level - last.level) / duration; // Positive means draining
    return drainRate > this.config_.maxDrainRateForUpgrade;
  }

  // Update network speed classification based on bandwidth measurements
  private updateNetworkSpeed(): void {
    const bandwidth = this.getBandwidthEstimate();
    const previousSpeed = this.networkSpeed_;

    if (bandwidth >= this.config_.highSpeedThreshold) {
      this.networkSpeed_ = "high";
      this.config_.safetyFactor = 0.85; // More aggressive on high speed networks
    } else if (bandwidth >= this.config_.mediumSpeedThreshold) {
      this.networkSpeed_ = "medium";
      this.config_.safetyFactor = 0.75; // Moderate safety factor
    } else if (bandwidth >= this.config_.lowSpeedThreshold) {
      this.networkSpeed_ = "low";
      this.config_.safetyFactor = 0.6; // More conservative on low speed
    } else if (bandwidth > 0) {
      this.networkSpeed_ = "low";
      this.config_.safetyFactor = 0.5; // Very conservative on very low speed
    } else {
      // Fallback to network type if bandwidth not available
      this.networkSpeed_ = "unknown";
    }

    // Track network speed changes
    if (previousSpeed !== this.networkSpeed_ && previousSpeed !== "unknown") {
      this.lastNetworkChangeTime_ = Date.now();
      console.log(
        `ABR: Network speed changed from ${previousSpeed} to ${this.networkSpeed_} (bandwidth: ${Math.round(bandwidth / 1000)}kbps)`
      );
    }
  }

  private updateNetworkInfo(): void {
    const connection = (navigator as any).connection;
    if (connection) {
      const previousType = this.networkType_;
      this.networkType_ = connection.effectiveType; // 'slow-2g', '2g', '3g', '4g'

      // Adjust safety factor based on network type (will be overridden by bandwidth-based detection)
      if (connection.saveData === true) {
        this.config_.safetyFactor = Math.min(this.config_.safetyFactor, 0.4);
      } else if (
        this.networkType_ === "slow-2g" ||
        this.networkType_ === "2g"
      ) {
        this.config_.safetyFactor = Math.min(this.config_.safetyFactor, 0.4);
      } else if (this.networkType_ === "3g") {
        this.config_.safetyFactor = Math.min(this.config_.safetyFactor, 0.6);
      }

      // Track network type changes
      if (previousType !== this.networkType_ && previousType !== "unknown") {
        this.lastNetworkChangeTime_ = Date.now();
        console.log(
          `ABR: Network type changed from ${previousType} to ${this.networkType_}`
        );
      }
    }
  }

  // Evaluate if we should switch quality based on current conditions
  private evaluateQualitySwitch(
    forceLowBuffer: boolean = false,
    isDraining: boolean = false
  ): void {
    if (
      !this.switchCallback_ ||
      this.variants_.length === 0 ||
      this.isDestroyed_
    )
      return;

    const hasSufficientSamples =
      this.bandwidthHistory_.length >= this.config_.minBandwidthSamples;
    const bandwidth = this.getBandwidthEstimate();

    // Urgent downgrade check - critical buffer level
    if (
      forceLowBuffer ||
      this.bufferLevel_ < this.config_.criticalBufferThreshold
    ) {
      console.log(
        `ABR: Critical buffer (${this.bufferLevel_.toFixed(1)}s) - Urgent downgrade`
      );
      this.selectVariant_(true, true); // Urgent and critical
      return;
    }

    // Proactive downgrade check - low buffer or poor network
    if (
      forceLowBuffer ||
      this.bufferLevel_ < this.config_.downgradeBufferThreshold ||
      (this.networkSpeed_ === "low" && this.bufferLevel_ < 12) ||
      (isDraining && this.bufferLevel_ < 15)
    ) {
      console.log(
        `ABR: Low buffer (${this.bufferLevel_.toFixed(1)}s) or poor network - Proactive downgrade`
      );
      this.selectVariant_(true, false); // Urgent but not critical
      return;
    }

    // If buffer is draining, don't upgrade
    if (isDraining) {
      return;
    }

    // Aggressive upgrade on high speed networks
    if (this.networkSpeed_ === "high" && hasSufficientSamples) {
      // On high speed networks, upgrade more aggressively
      if (this.bufferLevel_ > 10) {
        console.log(
          `ABR: High speed network detected - Aggressive upgrade (buffer: ${this.bufferLevel_.toFixed(1)}s)`
        );
        this.selectVariant_(false, false, true); // Force upgrade to highest
        return;
      }
    }

    // Normal upgrade check
    if (
      this.bufferLevel_ > this.config_.upgradeBufferThreshold &&
      hasSufficientSamples &&
      !isDraining
    ) {
      console.log(
        `ABR: Good buffer (${this.bufferLevel_.toFixed(1)}s) - considering upgrade`
      );
      this.selectVariant_(false);
    }
  }

  // Called when a switch error occurs (e.g., 1003 HTTP error)
  notifySwitchError(variantId?: number): void {
    this.consecutiveErrors_++;
    if (variantId !== undefined) {
      this.lastFailedVariantId_ = variantId;
    }
    console.log(
      `ABR: Switch error occurred (consecutive: ${this.consecutiveErrors_})`
    );

    // After too many errors, fall back to lowest quality
    if (this.consecutiveErrors_ >= 3 && this.variants_.length > 0) {
      const sortedVariants = [...this.variants_].sort(
        (a, b) => a.bandwidth - b.bandwidth
      );
      const lowestVariant = sortedVariants[0];
      if (lowestVariant && this.currentVariant_?.id !== lowestVariant.id) {
        console.log("ABR: Falling back to lowest quality due to errors");
        this.currentVariant_ = lowestVariant;
        if (this.switchCallback_) {
          this.switchCallback_(lowestVariant, false);
        }
      }
    }
  }

  // Called when a switch succeeds - reset error counter
  notifySwitchSuccess(): void {
    this.consecutiveErrors_ = 0;
    this.lastFailedVariantId_ = null;
  }

  // Force immediate variant selection (for when ABR is first enabled)
  forceVariantSelection(): void {
    if (!this.enabled_ || this.isDestroyed_ || this.variants_.length === 0)
      return;

    // Update network info before initial selection
    this.updateNetworkInfo();
    this.updateNetworkSpeed();

    // Allow immediate switch by resetting last switch time
    this.lastSwitchTime_ = 0;
    // Initial selection - network-aware but not urgent
    this.selectVariant_(false, false, false);
  }

  // Set a callback to be notified when variant changes
  setOnVariantChangeCallback(callback: ((variant: any) => void) | null): void {
    this.onVariantChangeCallback_ = callback;
  }

  // Get the current actively selected variant
  getCurrentVariant(): any {
    return this.currentVariant_;
  }

  segmentDownloaded(
    deltaTimeMs: number,
    numBytes: number,
    allowSwitch?: boolean,
    _request?: any
  ): void {
    if (!this.enabled_ || this.isDestroyed_) return;

    // Calculate bandwidth
    const bandwidth = (numBytes * 8000) / deltaTimeMs;

    // Add to history
    this.bandwidthHistory_.push(bandwidth);
    if (this.bandwidthHistory_.length > this.config_.maxHistorySize) {
      this.bandwidthHistory_.shift();
    }

    // Update network speed classification based on new bandwidth measurement
    this.updateNetworkSpeed();

    // Only switch if enough time has passed and switching is allowed
    const now = Date.now();
    if (now - this.lastSwitchTime_ < this.config_.minSwitchInterval) {
      return;
    }

    if (allowSwitch !== false) {
      // Update buffer level
      if (this.mediaElement_ && this.mediaElement_.buffered.length > 0) {
        const currentTime = this.mediaElement_.currentTime;
        const bufferedEnd = this.mediaElement_.buffered.end(
          this.mediaElement_.buffered.length - 1
        );
        this.bufferLevel_ = bufferedEnd - currentTime;
      }

      // Draining check for opportunistic switch
      const isDraining = this.isBufferDraining_();

      // On high speed networks with good buffer, be more aggressive about upgrading
      if (
        this.networkSpeed_ === "high" &&
        this.bufferLevel_ > 12 &&
        !isDraining
      ) {
        this.selectVariant_(false, false, true); // Force upgrade
      } else if (!isDraining) {
        this.selectVariant_();
      }
    }
  }

  getBandwidthEstimate(): number {
    if (this.bandwidthHistory_.length === 0) return 0;

    // Use harmonic mean for conservative estimate
    const sumOfInverses = this.bandwidthHistory_.reduce(
      (sum, bw) => sum + 1 / bw,
      0
    );
    return this.bandwidthHistory_.length / sumOfInverses;
  }

  setVariants(variants: any[]): boolean {
    if (this.isDestroyed_) return false;

    const filteredVariants = variants.filter((v) => v.video);
    const changed =
      JSON.stringify(this.variants_) !== JSON.stringify(filteredVariants);
    this.variants_ = filteredVariants;
    return changed;
  }

  configure(config: any): void {
    if (!this.isDestroyed_) {
      this.config_ = { ...this.config_, ...config };
    }
  }

  // Required by shaka.extern.AbrManager interface
  chooseVariant(_preferFastSwitching?: boolean): any {
    if (this.variants_.length === 0 || this.isDestroyed_) return null;

    const bandwidth = this.getBandwidthEstimate();
    const usableBandwidth = bandwidth * this.config_.safetyFactor;

    // Sort variants by bandwidth
    const sortedVariants = [...this.variants_].sort(
      (a, b) => a.bandwidth - b.bandwidth
    );

    // Find best variant within bandwidth
    let selectedVariant = sortedVariants[0];
    for (const variant of sortedVariants) {
      if (variant.bandwidth <= usableBandwidth) {
        selectedVariant = variant;
      } else {
        break;
      }
    }

    return selectedVariant;
  }

  // Required by shaka.extern.AbrManager interface
  playbackRateChanged(rate: number): void {
    if (!this.isDestroyed_) {
      this.playbackRate_ = rate;
    }
  }

  // Required by shaka.extern.AbrManager interface
  setCmsdManager(cmsdManager: any): void {
    if (!this.isDestroyed_) {
      this.cmsdManager_ = cmsdManager;
    }
  }

  // Required by shaka.extern.AbrManager interface
  setMediaElement(mediaElement: HTMLMediaElement | null): void {
    if (this.isDestroyed_) return;

    this.mediaElement_ = mediaElement;

    // Update buffer level if media element is available
    if (mediaElement && mediaElement.buffered.length > 0) {
      const currentTime = mediaElement.currentTime;
      const bufferedEnd = mediaElement.buffered.end(
        mediaElement.buffered.length - 1
      );
      this.bufferLevel_ = bufferedEnd - currentTime;
    }
  }

  // Required by shaka.extern.AbrManager interface
  trySuggestStreams(): boolean {
    // Return false to indicate we don't have stream suggestions
    // This is used for low-latency streaming optimizations
    return false;
  }

  private selectVariant_(
    isUrgent: boolean = false,
    isCritical: boolean = false,
    forceUpgrade: boolean = false
  ): void {
    if (
      !this.switchCallback_ ||
      this.variants_.length === 0 ||
      this.isDestroyed_
    )
      return;

    const bandwidth = this.getBandwidthEstimate();
    const usableBandwidth = bandwidth * this.config_.safetyFactor;

    // Sort variants by bandwidth (lowest to highest)
    let sortedVariants = [...this.variants_].sort(
      (a, b) => a.bandwidth - b.bandwidth
    );

    // Filter out recently failed variants
    if (this.lastFailedVariantId_ !== null) {
      sortedVariants = sortedVariants.filter(
        (v) => v.id !== this.lastFailedVariantId_
      );
      if (sortedVariants.length === 0) {
        sortedVariants = [...this.variants_].sort(
          (a, b) => a.bandwidth - b.bandwidth
        );
      }
    }

    // Network-aware quality limits
    if (
      this.networkType_ === "3g" ||
      this.networkType_ === "2g" ||
      this.networkType_ === "slow-2g"
    ) {
      // Cap at 720p for 3G, 480p for 2G
      const maxRes: number = this.networkType_ === "3g" ? 720 : 480;
      const filtered = sortedVariants.filter((v) => (v.height || 0) <= maxRes);
      if (filtered.length > 0) {
        sortedVariants = filtered;
      }
    }

    // Also limit based on network speed classification
    if (this.networkSpeed_ === "low" && !isUrgent) {
      // On low speed networks, cap at 720p unless urgent
      const filtered = sortedVariants.filter((v) => (v.height || 0) <= 720);
      if (filtered.length > 0) {
        sortedVariants = filtered;
      }
    }

    const currentIndex = this.currentVariant_
      ? sortedVariants.findIndex((v) => v.id === this.currentVariant_.id)
      : -1;

    // Update buffer level
    if (this.mediaElement_ && this.mediaElement_.buffered.length > 0) {
      const currentTime = this.mediaElement_.currentTime;
      const bufferedEnd = this.mediaElement_.buffered.end(
        this.mediaElement_.buffered.length - 1
      );
      this.bufferLevel_ = bufferedEnd - currentTime;
    }

    let selectedVariant: any;

    // Decision Logic
    // 1. CRITICAL / Urgent Downgrade: Immediate action to prevent buffering
    if (isCritical || (isUrgent && this.bufferLevel_ < this.config_.criticalBufferThreshold)) {
      // Critical: drop to lowest quality immediately
      selectedVariant = sortedVariants[0];
      console.log(
        `ABR: Critical buffer - dropping to lowest quality (${selectedVariant.height}p)`
      );
    }
    // 2. URGENT / Low Buffer: Proactive downgrade
    else if (isUrgent || this.bufferLevel_ < this.config_.downgradeBufferThreshold) {
      if (currentIndex > 0) {
        // Drop one or more levels based on severity
        if (this.bufferLevel_ < 5) {
          // Very low buffer - drop to lowest or near-lowest
          selectedVariant = sortedVariants[0];
        } else if (this.networkSpeed_ === "low") {
          // Poor network - drop to medium-low quality
          const targetIndex = Math.max(0, Math.floor(sortedVariants.length * 0.3));
          selectedVariant = sortedVariants[targetIndex];
        } else {
          // Drop one level
          selectedVariant = sortedVariants[Math.max(0, currentIndex - 1)];
          // Ensure the new variant fits bandwidth
          if (
            selectedVariant.bandwidth > usableBandwidth * 1.2 &&
            currentIndex - 1 > 0
          ) {
            selectedVariant = sortedVariants[currentIndex - 1];
          }
        }
      } else {
        selectedVariant = sortedVariants[0];
      }
    }
    // 3. FORCE UPGRADE: High speed network - aggressively upgrade to highest
    else if (forceUpgrade || (this.networkSpeed_ === "high" && this.bufferLevel_ > 10)) {
      // Find highest quality that fits bandwidth with some headroom
      let optimalVariant = sortedVariants[sortedVariants.length - 1];
      for (let i = sortedVariants.length - 1; i >= 0; i--) {
        const variant = sortedVariants[i];
        // On high speed networks, use 90% of bandwidth for quality selection
        if (variant.bandwidth <= usableBandwidth * 1.1) {
          optimalVariant = variant;
          break;
        }
      }

      // On high speed networks, be more aggressive - jump to optimal quality
      if (forceUpgrade || this.bufferLevel_ > 15) {
        selectedVariant = optimalVariant;
      } else {
        // Gradual upgrade if buffer is good but not excellent
        const optimalIndex = sortedVariants.findIndex(
          (v) => v.id === optimalVariant.id
        );
        if (currentIndex !== -1 && optimalIndex > currentIndex) {
          // Jump up to 2 levels at a time on high speed
          const targetIndex = Math.min(
            optimalIndex,
            currentIndex + 2
          );
          selectedVariant = sortedVariants[targetIndex];
        } else {
          selectedVariant = optimalVariant;
        }
      }
    }
    // 4. High Buffer & Good Bandwidth: Normal Upgrade
    else if (this.bufferLevel_ > this.config_.upgradeBufferThreshold) {
      // Find optimal variant for bandwidth
      let optimalVariant = sortedVariants[0];
      for (const variant of sortedVariants) {
        if (variant.bandwidth <= usableBandwidth) {
          optimalVariant = variant;
        } else {
          break;
        }
      }

      const optimalIndex = sortedVariants.findIndex(
        (v) => v.id === optimalVariant.id
      );

      // Gradual upgrade - one level at a time for stability
      if (currentIndex !== -1 && optimalIndex > currentIndex) {
        selectedVariant = sortedVariants[currentIndex + 1];
      } else {
        selectedVariant = optimalVariant;
      }
    }
    // 5. Medium Buffer: Maintenance or proactive adjustment
    else {
      if (this.currentVariant_) {
        // Check if current variant is too high for bandwidth
        if (this.currentVariant_.bandwidth > usableBandwidth * 1.3) {
          // Proactive downgrade if sustain impossible
          if (currentIndex > 0) {
            selectedVariant = sortedVariants[currentIndex - 1];
          } else {
            selectedVariant = this.currentVariant_;
          }
        }
        // On low speed networks, proactively downgrade even with medium buffer
        else if (this.networkSpeed_ === "low" && this.bufferLevel_ < 12) {
          if (currentIndex > 0) {
            // Move to medium-low quality
            const targetIndex = Math.max(0, Math.floor(sortedVariants.length * 0.4));
            if (targetIndex < currentIndex) {
              selectedVariant = sortedVariants[targetIndex];
            } else {
              selectedVariant = this.currentVariant_;
            }
          } else {
            selectedVariant = this.currentVariant_;
          }
        } else {
          selectedVariant = this.currentVariant_;
        }
      } else {
        // Initial selection - network-aware
        let initialIndex: number;
        if (this.networkSpeed_ === "high") {
          // Start at medium-high quality on fast networks
          initialIndex = Math.floor(sortedVariants.length * 0.6);
        } else if (this.networkSpeed_ === "medium") {
          // Start at medium quality
          initialIndex = Math.floor(sortedVariants.length * 0.4);
        } else {
          // Start low on slow networks
          initialIndex = Math.floor(sortedVariants.length * 0.25);
        }
        selectedVariant = sortedVariants[initialIndex];
      }
    }

    // Apply Switch
    if (
      !this.currentVariant_ ||
      selectedVariant.id !== this.currentVariant_.id
    ) {
      const previousHeight = this.currentVariant_?.height || 0;
      this.currentVariant_ = selectedVariant;
      this.lastSwitchTime_ = Date.now();

      // Only clear buffer on critical downgrades to prevent playback interruption
      const clearBuffer = isCritical && selectedVariant.bandwidth < (this.currentVariant_?.bandwidth || 0) * 0.7;

      this.switchCallback_(selectedVariant, clearBuffer, isCritical ? 3 : 5);

      // Call the variant change callback to update UI
      if (this.onVariantChangeCallback_) {
        // Ensure we pass the variant with height information
        // Variant might have height directly or in video property
        const variantHeight = selectedVariant.height || selectedVariant.video?.height;
        if (variantHeight) {
          // Call callback with the variant
          try {
            this.onVariantChangeCallback_(selectedVariant);
          } catch (error) {
            console.error("Error in variant change callback:", error);
          }
        }
      }

      const currentHeight = selectedVariant.height || selectedVariant.video?.height || previousHeight;
      console.log(
        `ABR Switch: ${previousHeight}p -> ${currentHeight}p @ ${Math.round(selectedVariant.bandwidth / 1000)}kbps (buffer: ${this.bufferLevel_.toFixed(1)}s, bw: ${Math.round(bandwidth / 1000)}kbps, net: ${this.networkType_}, speed: ${this.networkSpeed_})`
      );
    }
  }
}
