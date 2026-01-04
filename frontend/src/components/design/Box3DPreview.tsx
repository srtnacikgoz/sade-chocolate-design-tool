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

// Realistic Folding Box - Die-line to 3D animation
// Die-line layout (cross pattern):
//
//           [Back Panel]
//    [Left] [  Bottom  ] [Right]
//           [Front Panel]
//
function FoldingBox({
  dimensions,
  color,
  foldProgress, // 0 = completely flat die-line, 1 = fully assembled box
  lidGraphic,
}: {
  dimensions: BoxDimensions;
  color: string;
  foldProgress: number;
  lidGraphic?: UploadedGraphic;
}) {
  // Load texture from uploaded graphic
  const texture = useDataUrlTexture(lidGraphic?.dataUrl);
  const { length, width, height } = dimensions;
  const s = SCALE;

  // Eased fold progress for smoother animation
  const eased = foldProgress < 0.5
    ? 2 * foldProgress * foldProgress
    : 1 - Math.pow(-2 * foldProgress + 2, 2) / 2;

  // Fold angle: 0 = flat, PI/2 = fully folded (90 degrees)
  const foldAngle = (Math.PI / 2) * eased;

  const thickness = 0.003;

  return (
    <group>
      {/* ===== BOTTOM - Always flat (main lid surface for graphics) ===== */}
      <mesh position={[0, thickness / 2, 0]}>
        <boxGeometry args={[length * s, thickness, width * s]} />
        {texture ? (
          <meshStandardMaterial map={texture} color="#ffffff" />
        ) : (
          <meshStandardMaterial color={color} />
        )}
      </mesh>

      {/* Texture overlay plane on top of bottom panel */}
      {texture && (
        <mesh position={[0, thickness + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[
            length * s * (lidGraphic?.scale || 100) / 100,
            width * s * (lidGraphic?.scale || 100) / 100
          ]} />
          <meshBasicMaterial map={texture} transparent={true} />
        </mesh>
      )}

      {/* ===== FRONT PANEL - Folds up from front edge (z+) ===== */}
      {/* Pivot at z = width/2, rotate around X axis, NEGATIVE angle folds UP */}
      <group position={[0, 0, (width * s) / 2]}>
        <group rotation={[-foldAngle, 0, 0]}>
          <mesh position={[0, thickness / 2, (height * s) / 2]}>
            <boxGeometry args={[length * s, thickness, height * s]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      </group>

      {/* ===== BACK PANEL - Folds up from back edge (z-) ===== */}
      {/* Pivot at z = -width/2, rotate around X axis, POSITIVE angle folds UP */}
      <group position={[0, 0, -(width * s) / 2]}>
        <group rotation={[foldAngle, 0, 0]}>
          <mesh position={[0, thickness / 2, -(height * s) / 2]}>
            <boxGeometry args={[length * s, thickness, height * s]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      </group>

      {/* ===== LEFT PANEL - Folds up from left edge (x-) ===== */}
      {/* Pivot at x = -length/2, rotate around Z axis, NEGATIVE angle folds UP */}
      <group position={[-(length * s) / 2, 0, 0]}>
        <group rotation={[0, 0, -foldAngle]}>
          <mesh position={[-(height * s) / 2, thickness / 2, 0]}>
            <boxGeometry args={[height * s, thickness, width * s]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      </group>

      {/* ===== RIGHT PANEL - Folds up from right edge (x+) ===== */}
      {/* Pivot at x = length/2, rotate around Z axis, POSITIVE angle folds UP */}
      <group position={[(length * s) / 2, 0, 0]}>
        <group rotation={[0, 0, foldAngle]}>
          <mesh position={[(height * s) / 2, thickness / 2, 0]}>
            <boxGeometry args={[height * s, thickness, width * s]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      </group>
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
}: {
  dimensions: BoxDimensions;
  color: string;
  viewMode: ViewMode;
  foldProgress: number;
  wireframe: boolean;
  lidGraphic?: UploadedGraphic;
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
