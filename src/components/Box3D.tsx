import { useRef, useMemo, useState, Suspense, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { generateBoxFaces, type BoxDimensions, type BoxType, type BoxFace } from '../lib/box-generator';

interface Box3DProps {
    dimensions: BoxDimensions;
    boxType: BoxType;
    customColor?: string;
    customTexture?: string;
    faceTextures?: Record<string, string>;
    finishId?: string;
    textureFit?: 'cover' | 'contain' | 'stretch';
    textureScale?: number;
    textureOffset?: { x: number; y: number };
}

export interface Box3DRef {
    captureSnapshot: () => string;
}

const EMPTY_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const FINISH_PROPERTIES: Record<string, { roughness: number; metalness: number }> = {
    'matte': { roughness: 0.8, metalness: 0.0 },
    'glossy': { roughness: 0.2, metalness: 0.1 },
    'soft-touch': { roughness: 0.9, metalness: 0.0 },
    'gold-foil': { roughness: 0.3, metalness: 0.8 },
    'spot-uv': { roughness: 0.2, metalness: 0.1 },
};

function Loader() {
    return <Html center><div className="text-xs text-stone-500 font-mono">Loading...</div></Html>
}

interface FoldableFaceProps {
    face: BoxFace;
    foldProgress: number; // 0 to 1
    materialProps: any;
    globalTexture?: THREE.Texture;
    faceTextures?: Record<string, string>;
    textureFit?: 'cover' | 'contain' | 'stretch';
    textureScale?: number;
    textureOffset?: { x: number; y: number };
}

const FoldableFace = ({ face, foldProgress, materialProps, globalTexture, faceTextures, textureFit = 'cover', textureScale = 1, textureOffset = { x: 0, y: 0 } }: FoldableFaceProps) => {
    const groupRef = useRef<THREE.Group>(null);

    // Load specific texture for this face if it exists
    const faceTextureUrl = faceTextures?.[face.id];
    const faceTexture = useLoader(THREE.TextureLoader, faceTextureUrl || EMPTY_TEXTURE);

    useMemo(() => {
        if (faceTexture && faceTextureUrl) {
            faceTexture.wrapS = THREE.RepeatWrapping;
            faceTexture.wrapT = THREE.RepeatWrapping;
            faceTexture.center.set(0.5, 0.5);

            if (textureFit === 'stretch') {
                faceTexture.repeat.set(1 / textureScale, 1 / textureScale);
                faceTexture.offset.set(-textureOffset.x, -textureOffset.y);
            } else {
                // Calculate aspect ratios
                const imageAspect = faceTexture.image.width / faceTexture.image.height;
                const faceAspect = face.width / face.height;

                let scaleX = 1;
                let scaleY = 1;

                if (textureFit === 'cover') {
                    if (imageAspect > faceAspect) {
                        // Image is wider than face: scale to match height, crop width
                        scaleY = 1;
                        scaleX = imageAspect / faceAspect;
                    } else {
                        // Image is taller than face: scale to match width, crop height
                        scaleX = 1;
                        scaleY = faceAspect / imageAspect;
                    }
                } else if (textureFit === 'contain') {
                    if (imageAspect > faceAspect) {
                        // Image is wider: fit to width
                        scaleX = 1;
                        scaleY = faceAspect / imageAspect;
                    } else {
                        // Image is taller: fit to height
                        scaleY = 1;
                        scaleX = imageAspect / faceAspect;
                    }
                }

                // Apply manual scale
                scaleX /= textureScale;
                scaleY /= textureScale;

                faceTexture.repeat.set(1 / scaleX, 1 / scaleY);
                // Offset needs to be adjusted because we are using center rotation
                faceTexture.offset.set(-textureOffset.x, textureOffset.y);
            }

            faceTexture.needsUpdate = true;
        }
    }, [faceTexture, faceTextureUrl, textureFit, face.width, face.height, textureScale, textureOffset]);

    useFrame(() => {
        if (groupRef.current) {
            const targetAngle = THREE.MathUtils.degToRad(face.maxFoldAngle * foldProgress);
            if (face.foldAxis[0]) groupRef.current.rotation.x = targetAngle * face.foldAxis[0];
            if (face.foldAxis[1]) groupRef.current.rotation.y = targetAngle * face.foldAxis[1];
            if (face.foldAxis[2]) groupRef.current.rotation.z = targetAngle * face.foldAxis[2];
        }
    });

    let meshPosition: [number, number, number] = [0, 0, 0];

    if (face.id === 'right-panel') meshPosition = [face.width / 2, 0, 0];
    else if (face.id === 'back-panel') meshPosition = [face.width / 2, 0, 0];
    else if (face.id === 'left-panel') meshPosition = [face.width / 2, 0, 0];
    else if (face.id === 'glue-tab') meshPosition = [face.width / 2, 0, 0];
    else if (face.id === 'top-flap') meshPosition = [0, face.height / 2, 0];
    else if (face.id === 'bottom-flap') meshPosition = [0, -face.height / 2, 0];
    else if (face.id === 'top-tuck') meshPosition = [0, face.height / 2, 0];
    else if (face.id === 'bottom-tuck') meshPosition = [0, -face.height / 2, 0];
    else if (face.id.includes('dust')) {
        if (face.position[1] > 0) meshPosition = [0, face.height / 2, 0];
        else meshPosition = [0, -face.height / 2, 0];
    }

    const geometry = useMemo(() => {
        if (face.hole) {
            const shape = new THREE.Shape();
            const w = face.width;
            const h = face.height;
            // Draw main rectangle centered
            shape.moveTo(-w / 2, -h / 2);
            shape.lineTo(w / 2, -h / 2);
            shape.lineTo(w / 2, h / 2);
            shape.lineTo(-w / 2, h / 2);
            shape.lineTo(-w / 2, -h / 2);

            // Create hole
            const holePath = new THREE.Path();
            const hw = face.hole.width;
            const hh = face.hole.height;
            const hx = face.hole.x;
            const hy = face.hole.y;

            holePath.moveTo(hx - hw / 2, hy - hh / 2);
            holePath.lineTo(hx + hw / 2, hy - hh / 2);
            holePath.lineTo(hx + hw / 2, hy + hh / 2);
            holePath.lineTo(hx - hw / 2, hy + hh / 2);
            holePath.lineTo(hx - hw / 2, hy - hh / 2);

            shape.holes.push(holePath);

            return new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: false });
        } else {
            return new THREE.BoxGeometry(face.width, face.height, 0.01);
        }
    }, [face.width, face.height, face.hole]);

    // Determine which texture to use: Face-specific > Global > None
    const rawTexture = faceTextureUrl ? faceTexture : globalTexture;

    // Clone the texture to allow unique transforms per face and ensure we can modify it
    const activeTexture = useMemo(() => {
        if (!rawTexture) return null;
        const clone = rawTexture.clone();
        return clone;
    }, [rawTexture]);

    useMemo(() => {
        if (activeTexture) {
            console.log(`[Box3D] Updating texture for ${face.id}`, { textureFit, textureScale, textureOffset });

            activeTexture.wrapS = THREE.RepeatWrapping;
            activeTexture.wrapT = THREE.RepeatWrapping;
            activeTexture.center.set(0.5, 0.5);

            if (textureFit === 'stretch') {
                activeTexture.repeat.set(1 / textureScale, 1 / textureScale);
                activeTexture.offset.set(-textureOffset.x, -textureOffset.y);
            } else {
                // Calculate aspect ratios
                // Note: activeTexture.image might be undefined if cloned from a texture that isn't fully loaded yet, 
                // but useLoader suspends so it should be fine. 
                // However, cloned textures share the image reference.
                const image = activeTexture.image as HTMLImageElement;
                if (image && image.width && image.height) {
                    const imageAspect = image.width / image.height;
                    const faceAspect = face.width / face.height;

                    let scaleX = 1;
                    let scaleY = 1;

                    if (textureFit === 'cover') {
                        if (imageAspect > faceAspect) {
                            // Image is wider than face: scale to match height, crop width
                            scaleY = 1;
                            scaleX = imageAspect / faceAspect;
                        } else {
                            // Image is taller than face: scale to match width, crop height
                            scaleX = 1;
                            scaleY = faceAspect / imageAspect;
                        }
                    } else if (textureFit === 'contain') {
                        if (imageAspect > faceAspect) {
                            // Image is wider: fit to width
                            scaleX = 1;
                            scaleY = faceAspect / imageAspect;
                        } else {
                            // Image is taller: fit to height
                            scaleY = 1;
                            scaleX = imageAspect / faceAspect;
                        }
                    }

                    // Apply manual scale
                    scaleX /= textureScale;
                    scaleY /= textureScale;

                    activeTexture.repeat.set(1 / scaleX, 1 / scaleY);
                    // Offset needs to be adjusted because we are using center rotation
                    activeTexture.offset.set(-textureOffset.x, textureOffset.y);
                }
            }

            activeTexture.needsUpdate = true;
        }
    }, [activeTexture, textureFit, face.width, face.height, textureScale, textureOffset.x, textureOffset.y]);

    // Clone material props to apply specific texture
    const finalMaterialProps = useMemo(() => {
        const props = { ...materialProps };
        if (activeTexture) {
            props.map = activeTexture;
            props.color = '#ffffff'; // Reset color if texture is present
        }
        return props;
    }, [materialProps, activeTexture]);

    return (
        <group ref={groupRef} position={face.position}>
            <mesh position={meshPosition} castShadow receiveShadow geometry={geometry}>
                <meshStandardMaterial {...finalMaterialProps} />
            </mesh>

            {face.children?.map(child => (
                <FoldableFace
                    key={child.id + (faceTextures?.[child.id] || '')}
                    face={child}
                    foldProgress={foldProgress}
                    materialProps={materialProps}
                    globalTexture={globalTexture}
                    faceTextures={faceTextures}
                    textureFit={textureFit}
                    textureScale={textureScale}
                    textureOffset={textureOffset}
                />
            ))}
        </group>
    );
};

const Scene = ({ dimensions, boxType, customColor, customTexture, faceTextures, finishId, foldProgress, textureFit, textureScale, textureOffset }: Box3DProps & { foldProgress: number }) => {
    const globalTexture = useLoader(THREE.TextureLoader, customTexture || EMPTY_TEXTURE);

    useMemo(() => {
        if (globalTexture && customTexture) {
            globalTexture.wrapS = THREE.RepeatWrapping;
            globalTexture.wrapT = THREE.RepeatWrapping;
            globalTexture.repeat.set(1, 1);
        }
    }, [globalTexture, customTexture]);

    const rootFace = useMemo(() => generateBoxFaces(boxType, dimensions), [boxType, dimensions]);

    const materialProps = useMemo(() => {
        const finish = FINISH_PROPERTIES[finishId || 'matte'] || FINISH_PROPERTIES['matte'];
        return {
            color: customColor || '#F5F5F0',
            roughness: finish.roughness,
            metalness: finish.metalness,
        };
    }, [customColor, finishId]);

    return (
        <>
            <Stage environment="city" intensity={0.5} adjustCamera={false}>
                <FoldableFace
                    key={rootFace.id + (faceTextures?.[rootFace.id] || '')}
                    face={rootFace}
                    foldProgress={foldProgress}
                    materialProps={materialProps}
                    globalTexture={customTexture ? globalTexture : undefined}
                    faceTextures={faceTextures}
                    textureFit={textureFit}
                    textureScale={textureScale}
                    textureOffset={textureOffset}
                />
            </Stage>
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </>
    );
};

const Box3D = forwardRef<Box3DRef, Box3DProps>((props, ref) => {
    const [foldProgress, setFoldProgress] = useState(1);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useImperativeHandle(ref, () => ({
        captureSnapshot: () => {
            if (canvasRef.current) {
                return canvasRef.current.toDataURL('image/png');
            }
            return '';
        }
    }));

    return (
        <div className="w-full h-full bg-stone-100 rounded-xl overflow-hidden relative group">
            <Canvas
                ref={canvasRef}
                shadows
                dpr={[1, 2]}
                camera={{ position: [5, 5, 5], fov: 45 }}
                gl={{ preserveDrawingBuffer: true }}
            >
                <Suspense fallback={<Loader />}>
                    <Scene {...props} foldProgress={foldProgress} />
                </Suspense>
                <OrbitControls autoRotate={false} makeDefault />
            </Canvas>

            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-white/90 backdrop-blur p-3 rounded-xl border border-stone-200 shadow-sm z-20">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider w-12">Fold</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={foldProgress}
                    onChange={(e) => setFoldProgress(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                />
                <span className="text-xs font-mono text-stone-500 w-8 text-right">
                    {Math.round(foldProgress * 100)}%
                </span>
            </div>

            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-stone-500 border border-stone-200 shadow-sm z-10">
                Interactive 3D Preview
            </div>
        </div>
    );
});

Box3D.displayName = 'Box3D';

export default Box3D;
