/**
 * Box3DPreview Component
 * Interactive 3D visualization of chocolate box packaging
 * Supports single-piece and two-piece (tray + lid) boxes
 */

import { useRef, useState, Suspense, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Hook to load texture from dataURL
function useDataUrlTexture(dataUrl: string | undefined): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!dataUrl) {
      setTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      dataUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Texture load error:', error);
        setTexture(null);
      }
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [dataUrl]);

  return texture;
}

interface BoxDimensions {
  length: number;
  width: number;
  height: number;
}

interface UploadedGraphic {
  dataUrl: string;
  scale: number;
  alignment: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface Box3DPreviewProps {
  dimensions: BoxDimensions;
  lidDimensions?: BoxDimensions;
  isTwoPiece?: boolean;
  primaryColor?: string;
  accentColor?: string;
  showLabels?: boolean;
  className?: string;
  lidGraphic?: UploadedGraphic;
}

// Scale factor: 1mm = 0.01 units in 3D
const SCALE = 0.01;

// View mode types
type ViewMode = 'assembled' | 'exploded' | 'folding' | 'flat';

// ============================================================
// ECMA A20.20.03.01 - Realistic Folding Box
// Basitleştirilmiş ve Doğru Çalışan Versiyon
// ============================================================
//
// Die-line layout:
//           [Back Panel]
//    [Left] [  Bottom  ] [Right]
//           [Front Panel]
//
// + Her panelde üst/alt dust flap'ler
// + Üst kapak (tuck flap) öne kapanır
//

function FoldingBox({
  dimensions,
  color,
  foldProgress, // 0 = completely flat die-line, 1 = fully assembled box
  lidGraphic,
  showFoldLines = true,
}: {
  dimensions: BoxDimensions;
  color: string;
  foldProgress: number;
  lidGraphic?: UploadedGraphic;
  showFoldLines?: boolean;
}) {
  const texture = useDataUrlTexture(lidGraphic?.dataUrl);
  const { length, width, height } = dimensions;
  const s = SCALE;
  const t = 0.003; // thickness

  // Eased fold progress
  const eased = foldProgress < 0.5
    ? 2 * foldProgress * foldProgress
    : 1 - Math.pow(-2 * foldProgress + 2, 2) / 2;

  // Ana katlama açısı (0 -> 90 derece)
  const mainAngle = (Math.PI / 2) * eased;

  // Dust flap ve tuck flap boyutları
  const dustH = Math.min(height * 0.4, width * 0.35); // Dust flap height
  const tuckH = Math.min(height * 0.6, width * 0.5);  // Tuck flap height

  // Dust ve tuck flap'ler daha geç katlanmaya başlar
  const dustProgress = Math.max(0, (foldProgress - 0.3) / 0.4);
  const dustAngle = (Math.PI / 2) * Math.min(1, dustProgress);

  const tuckProgress = Math.max(0, (foldProgress - 0.6) / 0.4);
  const tuckAngle = (Math.PI / 2) * Math.min(1, tuckProgress);

  // Renk varyasyonları
  const mainColor = color;
  const dustColor = color;
  const tuckColor = color;

  // Fold line çizgileri - toggle ile göster/gizle
  const FoldLine = ({ start, end, color = '#ff0000' }: { start: [number, number, number], end: [number, number, number], color?: string }) => {
    if (!showFoldLines) return null;

    return (
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...start, ...end])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={3} opacity={0.8} transparent />
      </line>
    );
  };

  return (
    <group>
      {/* ===== BOTTOM PANEL (A1 - Taban, Sabit) ===== */}
      <mesh position={[0, t / 2, 0]}>
        <boxGeometry args={[length * s, t, width * s]} />
        {texture ? (
          <meshStandardMaterial map={texture} color="#ffffff" />
        ) : (
          <meshStandardMaterial color={mainColor} />
        )}
      </mesh>

      {/* Texture overlay */}
      {texture && (
        <mesh position={[0, t + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[
            length * s * (lidGraphic?.scale || 100) / 100,
            width * s * (lidGraphic?.scale || 100) / 100
          ]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      )}

      {/* ===== FRONT PANEL ===== */}
      {/* Pivot: Tabanın ön kenarı (z = +width/2) */}
      <group position={[0, 0, (width * s) / 2]}>
        <group rotation={[-mainAngle, 0, 0]}>
          {/* Front panel kendisi */}
          <mesh position={[0, t / 2, (height * s) / 2]}>
            <boxGeometry args={[length * s, t, height * s]} />
            <meshStandardMaterial color={mainColor} />
          </mesh>

          {/* Front üst dust flap - panel üst kenarından içeri */}
          <group position={[0, 0, height * s]}>
            <group rotation={[-dustAngle, 0, 0]}>
              <mesh position={[0, t / 2, (dustH * s) / 2]}>
                <boxGeometry args={[(length - 2) * s, t, dustH * s]} />
                <meshStandardMaterial color={dustColor} />
              </mesh>

              {/* Front tuck flap - dust'ın üstünden içeri (kapak) */}
              <group position={[0, 0, dustH * s]}>
                <group rotation={[-tuckAngle, 0, 0]}>
                  <mesh position={[0, t / 2, (tuckH * s) / 2]}>
                    <boxGeometry args={[(length - 6) * s, t, tuckH * s]} />
                    <meshStandardMaterial color={tuckColor} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ===== BACK PANEL ===== */}
      {/* Pivot: Tabanın arka kenarı (z = -width/2) */}
      <group position={[0, 0, -(width * s) / 2]}>
        <group rotation={[mainAngle, 0, 0]}>
          {/* Back panel kendisi */}
          <mesh position={[0, t / 2, -(height * s) / 2]}>
            <boxGeometry args={[length * s, t, height * s]} />
            <meshStandardMaterial color={mainColor} />
          </mesh>

          {/* Back üst dust flap */}
          <group position={[0, 0, -height * s]}>
            <group rotation={[dustAngle, 0, 0]}>
              <mesh position={[0, t / 2, -(dustH * s) / 2]}>
                <boxGeometry args={[(length - 2) * s, t, dustH * s]} />
                <meshStandardMaterial color={dustColor} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* ===== LEFT PANEL ===== */}
      {/* Pivot: Tabanın sol kenarı (x = -length/2) */}
      <group position={[-(length * s) / 2, 0, 0]}>
        <group rotation={[0, 0, -mainAngle]}>
          {/* Left panel kendisi */}
          <mesh position={[-(height * s) / 2, t / 2, 0]}>
            <boxGeometry args={[height * s, t, width * s]} />
            <meshStandardMaterial color={mainColor} />
          </mesh>

          {/* Left üst dust flap (z+ tarafı) */}
          <group position={[-(height * s) / 2, 0, (width * s) / 2]}>
            <group rotation={[-dustAngle, 0, 0]}>
              <mesh position={[0, t / 2, (dustH * s) / 2]}>
                <boxGeometry args={[(height - 2) * s, t, dustH * s]} />
                <meshStandardMaterial color={dustColor} />
              </mesh>
            </group>
          </group>

          {/* Left alt dust flap (z- tarafı) */}
          <group position={[-(height * s) / 2, 0, -(width * s) / 2]}>
            <group rotation={[dustAngle, 0, 0]}>
              <mesh position={[0, t / 2, -(dustH * s) / 2]}>
                <boxGeometry args={[(height - 2) * s, t, dustH * s]} />
                <meshStandardMaterial color={dustColor} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* ===== RIGHT PANEL ===== */}
      {/* Pivot: Tabanın sağ kenarı (x = +length/2) */}
      <group position={[(length * s) / 2, 0, 0]}>
        <group rotation={[0, 0, mainAngle]}>
          {/* Right panel kendisi */}
          <mesh position={[(height * s) / 2, t / 2, 0]}>
            <boxGeometry args={[height * s, t, width * s]} />
            <meshStandardMaterial color={mainColor} />
          </mesh>

          {/* Right üst dust flap (z+ tarafı) */}
          <group position={[(height * s) / 2, 0, (width * s) / 2]}>
            <group rotation={[-dustAngle, 0, 0]}>
              <mesh position={[0, t / 2, (dustH * s) / 2]}>
                <boxGeometry args={[(height - 2) * s, t, dustH * s]} />
                <meshStandardMaterial color={dustColor} />
              </mesh>
            </group>
          </group>

          {/* Right alt dust flap (z- tarafı) */}
          <group position={[(height * s) / 2, 0, -(width * s) / 2]}>
            <group rotation={[dustAngle, 0, 0]}>
              <mesh position={[0, t / 2, -(dustH * s) / 2]}>
                <boxGeometry args={[(height - 2) * s, t, dustH * s]} />
                <meshStandardMaterial color={dustColor} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* ===== FOLD LINES (Katlama Çizgileri) ===== */}
      {showFoldLines && (
        <>
          {/* Front panel fold line (kırmızı - mountain fold) */}
          <FoldLine
            start={[-(length * s) / 2, t, (width * s) / 2]}
            end={[(length * s) / 2, t, (width * s) / 2]}
            color="#ff0000"
          />

          {/* Back panel fold line (kırmızı - mountain fold) */}
          <FoldLine
            start={[-(length * s) / 2, t, -(width * s) / 2]}
            end={[(length * s) / 2, t, -(width * s) / 2]}
            color="#ff0000"
          />

          {/* Left panel fold line (kırmızı - mountain fold) */}
          <FoldLine
            start={[-(length * s) / 2, t, -(width * s) / 2]}
            end={[-(length * s) / 2, t, (width * s) / 2]}
            color="#ff0000"
          />

          {/* Right panel fold line (kırmızı - mountain fold) */}
          <FoldLine
            start={[(length * s) / 2, t, -(width * s) / 2]}
            end={[(length * s) / 2, t, (width * s) / 2]}
            color="#ff0000"
          />

          {/* Dust flap fold lines (mavi - valley fold) */}
          <FoldLine
            start={[-(length * s) / 2, t, (width * s) / 2 + height * s]}
            end={[(length * s) / 2, t, (width * s) / 2 + height * s]}
            color="#0066ff"
          />
          <FoldLine
            start={[-(length * s) / 2, t, -(width * s) / 2 - height * s]}
            end={[(length * s) / 2, t, -(width * s) / 2 - height * s]}
            color="#0066ff"
          />
        </>
      )}
    </group>
  );
}

// Tray (base) component with walls
function TrayBase({
  dimensions,
  color,
  position = [0, 0, 0],
  wireframe = false,
}: {
  dimensions: BoxDimensions;
  color: string;
  position?: [number, number, number];
  wireframe?: boolean;
}) {
  const { length, width, height } = dimensions;
  const wallThickness = 2; // 2mm wall thickness

  const scaledDims = {
    x: length * SCALE,
    y: height * SCALE,
    z: width * SCALE,
    wall: wallThickness * SCALE,
  };

  return (
    <group position={position}>
      {/* Bottom */}
      <mesh position={[0, -scaledDims.y / 2 + scaledDims.wall / 2, 0]}>
        <boxGeometry args={[scaledDims.x, scaledDims.wall, scaledDims.z]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.4} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 0, scaledDims.z / 2 - scaledDims.wall / 2]}>
        <boxGeometry args={[scaledDims.x, scaledDims.y, scaledDims.wall]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.4} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 0, -scaledDims.z / 2 + scaledDims.wall / 2]}>
        <boxGeometry args={[scaledDims.x, scaledDims.y, scaledDims.wall]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.4} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-scaledDims.x / 2 + scaledDims.wall / 2, 0, 0]}>
        <boxGeometry args={[scaledDims.wall, scaledDims.y, scaledDims.z - scaledDims.wall * 2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.4} />
      </mesh>

      {/* Right wall */}
      <mesh position={[scaledDims.x / 2 - scaledDims.wall / 2, 0, 0]}>
        <boxGeometry args={[scaledDims.wall, scaledDims.y, scaledDims.z - scaledDims.wall * 2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.4} />
      </mesh>
    </group>
  );
}

// Lid component (telescopic style)
function TelescopicLid({
  dimensions,
  color,
  position = [0, 0, 0],
  openAmount = 0, // 0 = closed, 1 = fully open
  wireframe = false,
  lidGraphic,
}: {
  dimensions: BoxDimensions;
  color: string;
  position?: [number, number, number];
  openAmount?: number;
  wireframe?: boolean;
  lidGraphic?: UploadedGraphic;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useDataUrlTexture(lidGraphic?.dataUrl);
  const { length, width, height } = dimensions;
  const wallThickness = 2;

  const scaledDims = {
    x: length * SCALE,
    y: height * SCALE,
    z: width * SCALE,
    wall: wallThickness * SCALE,
  };

  // Animate lid position
  useFrame(() => {
    if (groupRef.current) {
      const targetY = openAmount * scaledDims.y * 2.5;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY + position[1],
        0.1
      );
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Top */}
      <mesh position={[0, scaledDims.y / 2 - scaledDims.wall / 2, 0]}>
        <boxGeometry args={[scaledDims.x, scaledDims.wall, scaledDims.z]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Texture overlay on lid top */}
      {texture && (
        <mesh position={[0, scaledDims.y / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[
            scaledDims.x * (lidGraphic?.scale || 100) / 100,
            scaledDims.z * (lidGraphic?.scale || 100) / 100
          ]} />
          <meshBasicMaterial map={texture} transparent={true} />
        </mesh>
      )}

      {/* Front wall */}
      <mesh position={[0, 0, scaledDims.z / 2 - scaledDims.wall / 2]}>
        <boxGeometry args={[scaledDims.x, scaledDims.y, scaledDims.wall]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 0, -scaledDims.z / 2 + scaledDims.wall / 2]}>
        <boxGeometry args={[scaledDims.x, scaledDims.y, scaledDims.wall]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-scaledDims.x / 2 + scaledDims.wall / 2, 0, 0]}>
        <boxGeometry args={[scaledDims.wall, scaledDims.y, scaledDims.z - scaledDims.wall * 2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.2} roughness={0.3} />
      </mesh>

      {/* Right wall */}
      <mesh position={[scaledDims.x / 2 - scaledDims.wall / 2, 0, 0]}>
        <boxGeometry args={[scaledDims.wall, scaledDims.y, scaledDims.z - scaledDims.wall * 2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.2} roughness={0.3} />
      </mesh>
    </group>
  );
}

// Two-piece box (Tray + Lid)
function TwoPieceBox({
  baseDimensions,
  lidDimensions,
  baseColor,
  lidColor,
  viewMode,
  lidOpenAmount,
  wireframe,
  lidGraphic,
}: {
  baseDimensions: BoxDimensions;
  lidDimensions: BoxDimensions;
  baseColor: string;
  lidColor: string;
  viewMode: ViewMode;
  lidOpenAmount: number;
  wireframe: boolean;
  lidGraphic?: UploadedGraphic;
}) {
  const baseHeight = baseDimensions.height * SCALE;
  const lidHeight = lidDimensions.height * SCALE;

  // Calculate positions based on view mode
  const basePosition: [number, number, number] = viewMode === 'exploded'
    ? [0, -baseHeight, 0]
    : [0, 0, 0];

  const lidBasePosition: [number, number, number] = viewMode === 'exploded'
    ? [0, baseHeight * 2 + lidHeight, 0]
    : [0, baseHeight / 2 + lidHeight / 2, 0];

  return (
    <group>
      {/* Base (tray) */}
      <TrayBase
        dimensions={baseDimensions}
        color={baseColor}
        position={basePosition}
        wireframe={wireframe}
      />

      {/* Lid */}
      <TelescopicLid
        dimensions={lidDimensions}
        color={lidColor}
        position={lidBasePosition}
        openAmount={viewMode === 'exploded' ? 0 : lidOpenAmount}
        wireframe={wireframe}
        lidGraphic={lidGraphic}
      />
    </group>
  );
}

// Single piece box
function SingleBox({
  dimensions,
  color,
  viewMode,
  foldProgress,
  wireframe,
  lidGraphic,
  showFoldLines,
}: {
  dimensions: BoxDimensions;
  color: string;
  viewMode: ViewMode;
  foldProgress: number;
  wireframe: boolean;
  lidGraphic?: UploadedGraphic;
  showFoldLines?: boolean;
}) {
  const texture = useDataUrlTexture(lidGraphic?.dataUrl);
  const { length, width, height } = dimensions;
  const scaledDims = {
    x: length * SCALE,
    y: height * SCALE,
    z: width * SCALE,
  };

  if (viewMode === 'folding' || viewMode === 'flat') {
    return (
      <FoldingBox
        dimensions={dimensions}
        color={color}
        foldProgress={viewMode === 'flat' ? 0 : foldProgress}
        lidGraphic={lidGraphic}
        showFoldLines={showFoldLines}
      />
    );
  }

  // For assembled view, apply texture to top face
  return (
    <group>
      <mesh>
        <boxGeometry args={[scaledDims.x, scaledDims.y, scaledDims.z]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.1} roughness={0.4} />
      </mesh>

      {/* Texture on top of assembled box */}
      {texture && (
        <mesh position={[0, scaledDims.y / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[
            scaledDims.x * (lidGraphic?.scale || 100) / 100,
            scaledDims.z * (lidGraphic?.scale || 100) / 100
          ]} />
          <meshBasicMaterial map={texture} transparent={true} />
        </mesh>
      )}
    </group>
  );
}

// Auto-rotating group
function AutoRotate({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && enabled) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// Folding animation controller
function FoldingAnimator({
  onProgressChange,
  isAnimating,
}: {
  onProgressChange: (progress: number) => void;
  isAnimating: boolean;
}) {
  const progressRef = useRef(0);
  const directionRef = useRef(1);

  useFrame((_, delta) => {
    if (isAnimating) {
      progressRef.current += delta * 0.5 * directionRef.current;

      if (progressRef.current >= 1) {
        progressRef.current = 1;
        directionRef.current = -1;
      } else if (progressRef.current <= 0) {
        progressRef.current = 0;
        directionRef.current = 1;
      }

      onProgressChange(progressRef.current);
    }
  });

  return null;
}

// Screenshot helper
function ScreenshotHelper({ onCapture }: { onCapture: (dataUrl: string) => void }) {
  const { gl, scene, camera } = useThree();

  const capture = useCallback(() => {
    gl.render(scene, camera);
    const dataUrl = gl.domElement.toDataURL('image/png');
    onCapture(dataUrl);
  }, [gl, scene, camera, onCapture]);

  // Expose capture function
  (window as any).__captureScene = capture;

  return null;
}

// Dimension labels
function DimensionLabels({
  dimensions,
  show,
}: {
  dimensions: BoxDimensions;
  show: boolean;
}) {
  if (!show) return null;

  const { length, width, height } = dimensions;
  const offset = 0.15;

  return (
    <group>
      {/* Length label */}
      <Text
        position={[0, -height * SCALE / 2 - offset, width * SCALE / 2 + offset]}
        fontSize={0.04}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        {length}mm
      </Text>

      {/* Width label */}
      <Text
        position={[length * SCALE / 2 + offset, -height * SCALE / 2 - offset, 0]}
        fontSize={0.04}
        color="#666"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        {width}mm
      </Text>

      {/* Height label */}
      <Text
        position={[length * SCALE / 2 + offset, 0, width * SCALE / 2 + offset]}
        fontSize={0.04}
        color="#666"
        anchorX="center"
        anchorY="middle"
      >
        {height}mm
      </Text>
    </group>
  );
}

// Control button component
function ControlButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-800 text-white'
          : 'bg-white/90 text-gray-700 hover:bg-white border border-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

// Main component
export function Box3DPreview({
  dimensions,
  lidDimensions,
  isTwoPiece = false,
  primaryColor = '#8B7355',
  accentColor = '#D4AF37',
  showLabels = true,
  className = '',
  lidGraphic,
}: Box3DPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('assembled');
  const [lidOpenAmount, setLidOpenAmount] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [foldProgress, setFoldProgress] = useState(1);
  const [isAnimatingFold, setIsAnimatingFold] = useState(false);
  const [showFoldLines, setShowFoldLines] = useState(true);

  // Default lid dimensions if not provided
  const effectiveLidDims = lidDimensions || {
    length: dimensions.length + 4,
    width: dimensions.width + 4,
    height: Math.max(20, dimensions.height * 0.6),
  };

  const handleScreenshot = () => {
    if ((window as any).__captureScene) {
      (window as any).__captureScene();
    }
  };

  const handleScreenshotCapture = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = `sade-chocolate-3d-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const toggleLid = () => {
    setLidOpenAmount(prev => prev === 0 ? 1 : 0);
  };

  const toggleFoldAnimation = () => {
    if (viewMode !== 'folding') {
      setViewMode('folding');
      setIsAnimatingFold(true);
    } else {
      setIsAnimatingFold(!isAnimatingFold);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        {/* View Mode Controls */}
        <div className="flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm">
          <ControlButton
            active={viewMode === 'assembled'}
            onClick={() => { setViewMode('assembled'); setIsAnimatingFold(false); }}
            title="Montajlı görünüm"
          >
            Montajlı
          </ControlButton>
          {isTwoPiece && (
            <ControlButton
              active={viewMode === 'exploded'}
              onClick={() => { setViewMode('exploded'); setIsAnimatingFold(false); }}
              title="Parçaları ayır"
            >
              Ayrık
            </ControlButton>
          )}
          {!isTwoPiece && (
            <>
              <ControlButton
                active={viewMode === 'folding'}
                onClick={toggleFoldAnimation}
                title="Katlama animasyonu"
              >
                {isAnimatingFold ? 'Durdur' : 'Katla'}
              </ControlButton>
              <ControlButton
                active={viewMode === 'flat'}
                onClick={() => { setViewMode('flat'); setIsAnimatingFold(false); setFoldProgress(0); }}
                title="Düz açılım"
              >
                Düz
              </ControlButton>
            </>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {isTwoPiece && viewMode === 'assembled' && (
          <ControlButton onClick={toggleLid} title="Kapağı aç/kapat">
            {lidOpenAmount === 0 ? 'Kapağı Aç' : 'Kapağı Kapat'}
          </ControlButton>
        )}
        <ControlButton
          active={autoRotate}
          onClick={() => setAutoRotate(!autoRotate)}
          title="Otomatik döndür"
        >
          {autoRotate ? '⏸ Durdur' : '▶ Döndür'}
        </ControlButton>
        <ControlButton
          active={wireframe}
          onClick={() => setWireframe(!wireframe)}
          title="Tel kafes görünümü"
        >
          {wireframe ? '◼ Dolgulu' : '▤ Tel Kafes'}
        </ControlButton>
        {!isTwoPiece && (viewMode === 'folding' || viewMode === 'flat') && (
          <ControlButton
            active={showFoldLines}
            onClick={() => setShowFoldLines(!showFoldLines)}
            title="Katlama çizgilerini göster/gizle"
          >
            {showFoldLines ? '📏 Çizgiler Açık' : '📐 Çizgiler Kapalı'}
          </ControlButton>
        )}
        <ControlButton onClick={handleScreenshot} title="Ekran görüntüsü al">
          📷 Kaydet
        </ControlButton>
      </div>

      {/* Lid Slider (for two-piece) */}
      {isTwoPiece && viewMode === 'assembled' && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
            <label className="block text-xs text-gray-600 mb-1">Kapak Açıklığı</label>
            <input
              type="range"
              min="0"
              max="100"
              value={lidOpenAmount * 100}
              onChange={(e) => setLidOpenAmount(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Fold Progress Slider (for single-piece) */}
      {!isTwoPiece && (viewMode === 'folding' || viewMode === 'flat') && !isAnimatingFold && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
            <label className="block text-xs text-gray-600 mb-1">Katlama İlerlemesi</label>
            <input
              type="range"
              min="0"
              max="100"
              value={foldProgress * 100}
              onChange={(e) => setFoldProgress(parseInt(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div className="w-full h-[450px] bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl overflow-hidden">
        <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
          <Suspense fallback={null}>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[3, 2, 3]} fov={45} />

            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <directionalLight position={[-5, 5, -5]} intensity={0.3} />

            {/* Environment */}
            <Environment preset="studio" />

            {/* Screenshot Helper */}
            <ScreenshotHelper onCapture={handleScreenshotCapture} />

            {/* Folding Animator */}
            {isAnimatingFold && (
              <FoldingAnimator
                onProgressChange={setFoldProgress}
                isAnimating={isAnimatingFold}
              />
            )}

            {/* Box */}
            <AutoRotate enabled={autoRotate && !isAnimatingFold}>
              {isTwoPiece ? (
                <TwoPieceBox
                  baseDimensions={dimensions}
                  lidDimensions={effectiveLidDims}
                  baseColor={primaryColor}
                  lidColor={accentColor}
                  viewMode={viewMode}
                  lidOpenAmount={lidOpenAmount}
                  wireframe={wireframe}
                  lidGraphic={lidGraphic}
                />
              ) : (
                <SingleBox
                  dimensions={dimensions}
                  color={primaryColor}
                  viewMode={viewMode}
                  foldProgress={foldProgress}
                  wireframe={wireframe}
                  lidGraphic={lidGraphic}
                  showFoldLines={showFoldLines}
                />
              )}

              {/* Dimension labels */}
              {showLabels && viewMode === 'assembled' && (
                <DimensionLabels dimensions={dimensions} show={showLabels} />
              )}
            </AutoRotate>

            {/* Ground shadow */}
            <ContactShadows
              position={[0, -dimensions.height * SCALE / 2 - 0.01, 0]}
              opacity={0.4}
              scale={5}
              blur={2}
              far={4}
            />

            {/* Controls */}
            <OrbitControls
              enablePan={true}
              minDistance={0.5}
              maxDistance={15}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 1.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Info panel */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {isTwoPiece ? 'İki Parçalı Kutu (Tepsi + Kapak)' : 'Tek Parça Kutu'}
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              {dimensions.length} × {dimensions.width} × {dimensions.height} mm
            </p>
          </div>
          {isTwoPiece && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Kapak Ölçüleri:</p>
              <p className="text-xs text-gray-600">
                {effectiveLidDims.length} × {effectiveLidDims.width} × {effectiveLidDims.height} mm
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
