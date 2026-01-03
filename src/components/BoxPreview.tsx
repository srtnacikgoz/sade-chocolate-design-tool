import { forwardRef } from 'react';
import type { DieLine } from '../lib/box-generator';

interface BoxPreviewProps {
    viewBox: string;
    paths: DieLine[];
    customColor?: string;
    customTexture?: string;
}

const BoxPreview = forwardRef<SVGSVGElement, BoxPreviewProps>(({ viewBox, paths, customColor, customTexture }, ref) => {
    const outlinePath = paths.find(p => p.id === 'outline')?.path;

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
                className="w-full h-full max-w-2xl max-h-[70vh] drop-shadow-xl transition-all duration-700 ease-spring"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {outlinePath && (
                        <mask id="box-mask">
                            <path d={outlinePath} fill="white" />
                        </mask>
                    )}
                </defs>

                {/* Base Material / Custom Color */}
                {outlinePath && (
                    <g mask="url(#box-mask)">
                        <rect x="-1000" y="-1000" width="3000" height="3000" fill={customColor || '#F5F5F0'} />
                        {customTexture && (
                            <image
                                href={customTexture}
                                x="-1000"
                                y="-1000"
                                width="3000"
                                height="3000"
                                preserveAspectRatio="xMidYMid slice"
                            />
                        )}
                    </g>
                )}

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
