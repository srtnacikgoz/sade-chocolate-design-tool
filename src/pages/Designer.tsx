import { useState, useMemo, useRef } from 'react';
import { generateBoxDieLine } from '../lib/box-generator';
import type { BoxDimensions, BoxType } from '../lib/box-generator';
import { calculateCost, MATERIALS, FINISHES } from '../lib/cost-calculator';
import { exportToPdf } from '../lib/pdf-exporter';
import BoxPreview from '../components/BoxPreview';
import CostSummary from '../components/CostSummary';
import { Settings2, Download, Share2, Loader2 } from 'lucide-react';

const Designer = () => {
    const [dimensions, setDimensions] = useState<BoxDimensions>({ width: 80, height: 120, depth: 40 });
    const [boxType, setBoxType] = useState<BoxType>('gift-box');
    const [materialId, setMaterialId] = useState(MATERIALS[0].id);
    const [finishId, setFinishId] = useState(FINISHES[0].id);
    const [quantity, setQuantity] = useState(500);
    const [isExporting, setIsExporting] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const { viewBox, paths } = useMemo(() =>
        generateBoxDieLine(boxType, dimensions),
        [boxType, dimensions]
    );

    const cost = useMemo(() =>
        calculateCost(dimensions.width, dimensions.height, dimensions.depth, materialId, finishId, quantity),
        [dimensions, materialId, finishId, quantity]
    );

    const handleDimensionChange = (key: keyof BoxDimensions, value: string) => {
        const num = parseInt(value) || 0;
        setDimensions(prev => ({ ...prev, [key]: num }));
    };

    const handleExport = async () => {
        if (!svgRef.current) return;

        try {
            setIsExporting(true);
            const filename = `sade-box-${boxType}-${dimensions.width}x${dimensions.height}x${dimensions.depth}.pdf`;
            await exportToPdf(svgRef.current, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-xl font-serif font-bold text-brand-dark">New Design</h1>
                    <p className="text-xs text-stone-500">Untitled Project 1</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 rounded-lg transition-colors">
                        <Share2 size={16} />
                        Share
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-dark text-white hover:bg-stone-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex">
                {/* Controls Sidebar */}
                <div className="w-80 bg-white border-r border-stone-200 overflow-y-auto p-6 space-y-8 shrink-0">

                    <section>
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Settings2 size={16} />
                            Configuration
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Box Type</label>
                                <select
                                    value={boxType}
                                    onChange={(e) => setBoxType(e.target.value as BoxType)}
                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50 bg-white"
                                >
                                    <option value="gift-box">Gift Box</option>
                                    <option value="truffle-box">Truffle Box</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Settings2 size={16} />
                            Dimensions (mm)
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Width</label>
                                <input
                                    type="number"
                                    value={dimensions.width}
                                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Height</label>
                                <input
                                    type="number"
                                    value={dimensions.height}
                                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Depth</label>
                                <input
                                    type="number"
                                    value={dimensions.depth}
                                    onChange={(e) => handleDimensionChange('depth', e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all"
                                />
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Materials</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Paper Type</label>
                                <select
                                    value={materialId}
                                    onChange={(e) => setMaterialId(e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50 bg-white"
                                >
                                    {MATERIALS.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Finish</label>
                                <select
                                    value={finishId}
                                    onChange={(e) => setFinishId(e.target.value)}
                                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50 bg-white"
                                >
                                    {FINISHES.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Production</h3>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1">Quantity</label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/50 transition-all"
                            />
                        </div>
                    </section>

                </div>

                {/* Main Preview Area */}
                <div className="flex-1 bg-stone-100 p-8 flex flex-col min-w-0">
                    <div className="flex-1 min-h-0">
                        <BoxPreview ref={svgRef} viewBox={viewBox} paths={paths} />
                    </div>
                </div>

                {/* Right Sidebar - Cost */}
                <div className="w-80 bg-white border-l border-stone-200 p-6 shrink-0">
                    <CostSummary unitCost={cost.unitCost} totalCost={cost.totalCost} quantity={quantity} />

                    <div className="mt-8">
                        <h4 className="text-sm font-bold text-stone-900 mb-2">AI Suggestions</h4>
                        <div className="p-4 bg-brand-pink/20 rounded-lg border border-brand-pink/30">
                            <p className="text-xs text-brand-dark leading-relaxed">
                                Based on current trends, adding <strong>Gold Foil</strong> to this size increases perceived value by 40%.
                            </p>
                            <button
                                onClick={() => setFinishId('gold-foil')}
                                className="mt-3 text-xs font-medium text-brand-dark underline hover:text-brand-gold transition-colors"
                            >
                                Apply Gold Foil
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Designer;
