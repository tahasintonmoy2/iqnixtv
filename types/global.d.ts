declare global {
  interface ScreenOrientation {
    angle: number;
    onchange: ((this: ScreenOrientation, ev: Event) => void) | null;
    type: OrientationType;
    lock(orientation: OrientationLockType): Promise<void>;
    unlock(): void;
  }

  type OrientationLockType = 
    | 'any'
    | 'natural'
    | 'landscape'
    | 'portrait'
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';

  type OrientationType = 
    | 'portrait-primary'
    | 'portrait-secondary'
    | 'landscape-primary'
    | 'landscape-secondary';

  interface Screen {
    orientation: ScreenOrientation;
  }
}
