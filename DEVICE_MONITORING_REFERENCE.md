# Device Monitoring Integration Quick Reference

## Files Created

1. **`hooks/use-device-monitoring.ts`** - Main monitoring hook
2. **`components/device-status-indicator.tsx`** - UI component for device status
3. **`components/device-monitoring-examples.tsx`** - Practical implementation examples

---

## Quick Integration Steps

### Step 1: Add Hook Import
```tsx
import { useDeviceMonitoring } from "@/hooks/use-device-monitoring";
```

### Step 2: Use in Your Component
```tsx
const { deviceStatus, getQualityRecommendation } = useDeviceMonitoring();
```

### Step 3: Access Device Information
```tsx
// Battery info
const batteryLevel = deviceStatus.battery.level; // 0-1
const isCharging = deviceStatus.battery.charging; // boolean
const batteryPercentage = Math.round(batteryLevel * 100);

// Thermal info
const thermalLevel = deviceStatus.thermal.thermalLevel; // "normal" | "warm" | "hot" | "critical"
const temperature = deviceStatus.thermal.estimatedTemp; // estimated in °C
const cpuUsage = deviceStatus.thermal.cpuUsage; // 0-100%
```

### Step 4: Get Quality Recommendation
```tsx
const recommendation = getQualityRecommendation();
// Returns:
// {
//   recommendedHeight: 480 | 720 | 1080,
//   reason: "Device thermal critical - reducing quality to 480p",
//   shouldReduceQuality: boolean
// }
```

---

## Implementation Examples

### Example 1: Simple Badge
```tsx
import { DeviceStatusIndicator } from "@/components/device-status-indicator";

export function MyComponent() {
  const { deviceStatus } = useDeviceMonitoring();
  
  return (
    <DeviceStatusIndicator 
      deviceStatus={deviceStatus}
      compact={true}
      showOnlyWarnings={true}
    />
  );
}
```

### Example 2: Auto Quality Reduction
```tsx
useEffect(() => {
  const recommendation = getQualityRecommendation();
  
  if (recommendation.shouldReduceQuality && autoReduceEnabled) {
    // Reduce quality to recommended height
    selectQuality({
      height: recommendation.recommendedHeight,
      label: `${recommendation.recommendedHeight}p`,
      // ... other properties
    });
  }
}, [deviceStatus]);
```

### Example 3: Show Warning Toast
```tsx
useEffect(() => {
  if (deviceStatus.thermal.thermalLevel === "critical") {
    toast.warning("Device temperature critical - quality reduced to 480p");
  }
}, [deviceStatus.thermal.thermalLevel]);
```

---

## Quality Adjustment Logic

| Condition | Recommended Quality | Reason |
|-----------|-------------------|--------|
| Battery > 50%, Normal temp | 1080p+ | Optimal quality |
| Battery 20-50% or Warm temp | 720p | Balanced quality & efficiency |
| Battery < 20% and not charging | 480p | Preserve battery |
| Hot thermal state | 480p | Reduce CPU/GPU load |
| Critical thermal state | 480p | Prevent device damage |

---

## Keyboard Shortcuts (Optional Addition)

Add these to your keyboard handler in video player:

```tsx
case "KeyD":
  setShowDeviceMonitor(!showDeviceMonitor); // Toggle device monitor
  break;
case "Shift+KeyA":
  setAutoReduceQuality(!autoReduceQuality); // Toggle auto-reduce
  break;
```

---

## Device Status States

### Battery
- `level`: 0-1 (0% = 0, 100% = 1)
- `charging`: boolean
- `chargingTime`: seconds to full charge (Infinity if not charging)
- `dischargingTime`: seconds of usage remaining (Infinity if charging)
- `isSupported`: boolean (Battery Status API available)

### Thermal
- `thermalLevel`: "normal" | "warm" | "hot" | "critical"
- `isThrottled`: boolean (FPS < 30)
- `cpuUsage`: 0-100% (estimated)
- `estimatedTemp`: °C (estimated from frame rate)

---

## Important Notes

1. **Temperature Limitations**: Web browsers cannot access real device temperature. The estimate is derived from frame rate (FPS) as a proxy for thermal load.

2. **Battery API Support**: ~70% of browsers support Battery Status API. Check `deviceStatus.battery.isSupported` before using battery features.

3. **Performance**: The monitoring hooks use `requestAnimationFrame` efficiently and won't cause performance issues.

4. **Mobile Only**: Some thermal features work best on mobile devices. Desktop devices may show different thermal indicators.

---

## Recommended Settings Panel Integration

Add this to your video player settings:

```tsx
<div className="border-t py-3">
  <div className="px-4 space-y-3">
    <label className="flex items-center justify-between">
      <span className="text-sm">Auto-reduce quality</span>
      <input
        type="checkbox"
        checked={autoReduceQuality}
        onChange={(e) => setAutoReduceQuality(e.target.checked)}
      />
    </label>
    <p className="text-xs text-muted-foreground">
      Automatically reduce quality when device is hot or low on battery
    </p>
    
    <DeviceStatusIndicator
      deviceStatus={deviceStatus}
      compact={false}
    />
  </div>
</div>
```

---

## Troubleshooting

### Battery API not working
- Battery Status API is deprecated and not available in all browsers
- Check `deviceStatus.battery.isSupported` before using
- Fallback gracefully if not supported

### Temperature always showing 35°C
- This is the default when device is in normal thermal state
- Temperature estimate is based on FPS, not actual device temperature
- If FPS drops significantly, estimated temperature will increase

### Auto-reduce quality not triggering
- Make sure `autoReduceQuality` state is `true`
- Check that `selectedQuality.isAuto` is `true` for auto mode
- Verify device actually meets the condition (battery < 20%, etc.)

