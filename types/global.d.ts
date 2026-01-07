declare global {
  interface ScreenOrientation {
    angle: number;
    onchange: ((this: ScreenOrientation, ev: Event) => void) | null;
    type: OrientationType;
    lock(orientation: OrientationLockType): Promise<void>;
    unlock(): void;
  }

  type OrientationLockType =
    | "any"
    | "natural"
    | "landscape"
    | "portrait"
    | "portrait-primary"
    | "portrait-secondary"
    | "landscape-primary"
    | "landscape-secondary";

  type OrientationType =
    | "portrait-primary"
    | "portrait-secondary"
    | "landscape-primary"
    | "landscape-secondary";

  interface Screen {
    orientation: ScreenOrientation;
  }

  interface NetworkInformation extends EventTarget {
    effectiveType?: "4g" | "3g" | "2g" | "slow-2g";
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener(type: "change", listener: () => void): void;
    removeEventListener(type: "change", listener: () => void): void;
  }

  interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  }
}
