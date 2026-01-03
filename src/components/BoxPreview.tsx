import { forwardRef } from 'react';
import type { DieLine } from '../lib/box-generator';

interface BoxPreviewProps {
    viewBox: string;
    paths: DieLine[];
}

const BoxPreview = forwardRef<SVGSVGElement, BoxPreviewProps>(({ viewBox, paths }, ref) => {
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
