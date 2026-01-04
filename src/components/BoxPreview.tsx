import { forwardRef } from 'react';
import type { DieLine } from '../lib/box-generator';

interface BoxPreviewProps {
    viewBox: string;
    paths: DieLine[];
    facePolygons?: { id: string; path: string; x: number; y: number; width: number; height: number }[];
    customColor?: string;
    customTexture?: string;
    faceTextures?: Record<string, string>;
    textureFit?: 'cover' | 'contain' | 'stretch';
    textureScale?: number;
    textureOffset?: { x: number; y: number };
}

const BoxPreview = forwardRef<SVGSVGElement, BoxPreviewProps>(({ viewBox, paths, facePolygons, customColor, customTexture, faceTextures, textureFit = 'cover', textureScale = 1, textureOffset = { x: 0, y: 0 } }, ref) => {
    const outlinePath = paths.find(p => p.id === 'outline')?.path;

    const getAspectRatio = (fit: string) => {
        switch (fit) {
            case 'contain': return 'xMidYMid meet';
            case 'stretch': return 'none';
            case 'cover':
            default: return 'xMidYMid slice';
        }
    };

    const aspectRatio = getAspectRatio(textureFit);

    return (
        <div className="w-full h-full flex items-center justify-center bg-stone-50 rounded-xl border border-stone-200 p-8 overflow-hidden relative group">
            <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] grid-rows-[repeat(40,minmax(0,1fr))] opacity-[0.03] pointer-events-none">
                {/* Grid background */}
                {Array.from({ length: 1600 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-stone-900" />
                ))}
            </div>

            <svg
                ref={ref}
                viewBox={viewBox}
                className="w-full h-full drop-shadow-xl transition-all duration-700 ease-spring"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {outlinePath && (
                        <mask id="box-mask">
                            <path d={outlinePath} fill="white" />
                        </mask>
                    )}
                    {/* Define clip paths for each face */}
                    {facePolygons?.map(face => (
                        <clipPath key={`clip-${face.id}`} id={`clip-${face.id}`}>
                            <path d={face.path} />
                        </clipPath>
                    ))}
                </defs>

                {/* Base Material / Custom Color */}
                {outlinePath && (
                    <g mask="url(#box-mask)">
                        <rect x="-1000" y="-1000" width="3000" height="3000" fill={customColor || '#F5F5F0'} />
                        {/* Global Texture */}
                        {customTexture && (
                            <image
                                href={customTexture}
                                x="-1000"
                                y="-1000"
                                width="3000"
                                height="3000"
                                preserveAspectRatio={aspectRatio}
                            />
                        )}
                    </g>
                )}

                {/* Per-Face Textures */}
                {facePolygons?.map(face => {
                    const textureUrl = faceTextures?.[face.id];
                    if (!textureUrl) return null;

                    // Calculate scaled dimensions
                    const scaledWidth = face.width * textureScale;
                    const scaledHeight = face.height * textureScale;

                    // Calculate position with offset (centered scaling + offset)
                    const offsetX = face.x - (scaledWidth - face.width) / 2 + textureOffset.x;
                    const offsetY = face.y - (scaledHeight - face.height) / 2 + textureOffset.y;

                    return (
                        <image
                            key={`tex-${face.id}`}
                            href={textureUrl}
                            x={offsetX}
                            y={offsetY}
                            width={scaledWidth}
                            height={scaledHeight}
                            clipPath={`url(#clip-${face.id})`}
                            preserveAspectRatio={aspectRatio}
                        />
                    );
                })}

                {paths.map((p) => (
                    <path
                        key={p.id}
                        d={p.path}
                        stroke={p.stroke}
                        strokeWidth={p.strokeWidth}
                        strokeDasharray={p.strokeDasharray}
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        className="transition-all duration-500 ease-in-out"
                    />
                ))}
            </svg>

            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-stone-500 border border-stone-200 shadow-sm">
                Scale: 1:1 (Preview)
            </div>
        </div>
    );
});

BoxPreview.displayName = 'BoxPreview';

export default BoxPreview;
