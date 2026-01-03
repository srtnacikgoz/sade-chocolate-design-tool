import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, ContactShadows, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import type { BoxDimensions, BoxType } from '../lib/box-generator';

interface Box3DProps {
    dimensions: BoxDimensions;
    boxType: BoxType;
    customColor?: string;
    customTexture?: string;
    finishId?: string;
}

const FINISH_PROPERTIES: Record<string, { roughness: number; metalness: number }> = {
    'matte': { roughness: 0.8, metalness: 0.0 },
    'glossy': { roughness: 0.2, metalness: 0.1 },
    'soft-touch': { roughness: 0.9, metalness: 0.0 },
    'gold-foil': { roughness: 0.3, metalness: 0.8 },
    'spot-uv': { roughness: 0.2, metalness: 0.1 }, // Similar to glossy but usually localized
};

function Loader() {
    const { progress } = useProgress()
    return <Html center>{progress.toFixed(1)} % loaded</Html>
}

const BoxMesh = ({ dimensions, customColor, customTexture, finishId }: Omit<Box3DProps, 'boxType'>) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = useLoader(THREE.TextureLoader, customTexture || '');

    // Configure texture mapping
    useMemo(() => {
        if (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            // Simple box mapping assumption: texture repeats once per face or stretches
            // For better mapping, we'd need UV unwrapping based on the die line, which is complex.
            // Here we assume the user uploads a texture meant for the face.
            texture.repeat.set(1, 1);
        }
    }, [texture]);

    // Convert mm to generic 3D units (scale down for better view)
    const scale = 0.05;
    const width = dimensions.width * scale;
    const height = dimensions.height * scale;
    const depth = dimensions.depth * scale;

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
        }
    });

    const materialProps = useMemo(() => {
        const finish = FINISH_PROPERTIES[finishId || 'matte'] || FINISH_PROPERTIES['matte'];
        const props: any = {
            color: customColor || '#F5F5F0',
            roughness: finish.roughness,
            metalness: finish.metalness,
        };
        if (customTexture) {
            props.map = texture;
        }
        return props;
    }, [customColor, customTexture, texture, finishId]);

    return (
        <mesh ref={meshRef} castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial {...materialProps} />
        </mesh>
    );
};

// Wrapper to handle texture loading suspense
const Scene = (props: Box3DProps) => {
    return (
        <>
            <Stage environment="city" intensity={0.5} adjustCamera={false}>
                {props.customTexture ? (
                    <BoxMesh {...props} />
                ) : (
                    <BoxMeshNoTexture {...props} />
                )}
            </Stage>
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </>
    );
};

const BoxMeshNoTexture = ({ dimensions, customColor, finishId }: Omit<Box3DProps, 'boxType' | 'customTexture'>) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const scale = 0.05;
    const width = dimensions.width * scale;
    const height = dimensions.height * scale;
    const depth = dimensions.depth * scale;

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
        }
    });

    const materialProps = useMemo(() => {
        const finish = FINISH_PROPERTIES[finishId || 'matte'] || FINISH_PROPERTIES['matte'];
        return {
            color: customColor || '#F5F5F0',
            roughness: finish.roughness,
            metalness: finish.metalness,
        };
    }, [customColor, finishId]);

    return (
        <mesh ref={meshRef} castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial {...materialProps} />
        </mesh>
    );
};

const Box3D = (props: Box3DProps) => {
    return (
        <div className="w-full h-full bg-stone-100 rounded-xl overflow-hidden relative">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
                <Suspense fallback={<Loader />}>
                    <Scene {...props} />
                </Suspense>
                <OrbitControls autoRotate={false} makeDefault />
            </Canvas>

            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-stone-500 border border-stone-200 shadow-sm z-10">
                Interactive 3D Preview
            </div>
        </div>
    );
};

export default Box3D;
