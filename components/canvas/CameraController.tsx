'use client';
import { OrbitControls } from '@react-three/drei';

export default function CameraController({ isLocked }: { isLocked: boolean }) {
  return (
    <OrbitControls
      makeDefault

      // Forces the camera viewpoint focus pivot to rest directly inside the center room floor bounds
      target={[0, 1.0, 0]}

      // Blocks users from side-dragging (panning) the camera array outside walls when locked
      enablePan={!isLocked}

      // Zoom Bounds Clamping
      minDistance={isLocked ? 0.1 : 1.0}
      maxDistance={isLocked ? 1.5 : 12.0} // Stopped at 1.5 max when locked so you can't back up through walls

      // Look Up / Look Down Angular Constraints (Polar Angle Limits)
      minPolarAngle={isLocked ? Math.PI / 2.5 : 0}
      maxPolarAngle={isLocked ? Math.PI / 1.7 : Math.PI}
    />
  );
}