import { useState, useMemo, useRef } from 'react';
import { generateBoxDieLine } from '../lib/box-generator';
import type { BoxDimensions, BoxType } from '../lib/box-generator';
import { calculateCost, MATERIALS, FINISHES } from '../lib/cost-calculator';
import { exportToPdf } from '../lib/pdf-exporter';
import BoxPreview from '../components/BoxPreview';
import Box3D from '../components/Box3D';
import CostSummary from '../components/CostSummary';
import { Settings2, Download, Share2, Loader2, Box, Eye } from 'lucide-react';

const Designer = () => {
    const [dimensions, setDimensions] = useState<BoxDimensions>({ width: 80, height: 120, depth: 40 });
    const [boxType, setBoxType] = useState<BoxType>('gift-box');
    const [materialId, setMaterialId] = useState(MATERIALS[0].id);
    const [finishId, setFinishId] = useState(FINISHES[0].id);
    const [quantity, setQuantity] = useState(500);
    const [customColor, setCustomColor] = useState('#F5F5F0');
    const [customTexture, setCustomTexture] = useState<string | undefined>(undefined);
    const [isExporting, setIsExporting] = useState(false);
    const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
    const svgRef = useRef<SVGSVGElement>(null);

    const { viewBox, paths, facePolygons } = useMemo(() =>
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

    const [faceTextures, setFaceTextures] = useState<Record<string, string>>({});
    const [selectedFace, setSelectedFace] = useState<string>('front-panel');
    const [textureFit, setTextureFit] = useState<'cover' | 'contain' | 'stretch'>('cover');
    const [textureScale, setTextureScale] = useState<number>(1);
    const [textureOffset, setTextureOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const FACES = [
        { id: 'front-panel', label: 'Front' },
        { id: 'back-panel', label: 'Back' },
        { id: 'top-flap', label: 'Top' },
        { id: 'right-panel', label: 'Right Side' },
        { id: 'left-panel', label: 'Left Side' },
    ];

    const box3DRef = useRef<{ captureSnapshot: () => string }>(null);

    const handleExport = async () => {
        if (!svgRef.current) return;

        try {
            setIsExporting(true);
            const filename = `sade-box-${boxType}-${dimensions.width}x${dimensions.height}x${dimensions.depth}.pdf`;

            // Capture 3D snapshot if available
            let snapshotUrl = undefined;
            if (box3DRef.current) {
                snapshotUrl = box3DRef.current.captureSnapshot();
            }

            await exportToPdf(svgRef.current, filename, snapshotUrl);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            // If in 3D mode, apply to selected face. In 2D mode, apply globally (or ask user).
            // For now, let's keep the logic simple:
            // If "Global" mode is active (or no specific face selected in UI logic), set customTexture.
            // But we introduced a face selector.

            setFaceTextures(prev => ({ ...prev, [selectedFace]: url }));

            // Also set customTexture as a fallback or for 2D preview if needed
            // But 2D preview doesn't support per-face yet.
            // Let's keep customTexture for "All Over" and faceTextures for specific.
        }
    };

    const handleRemoveTexture = () => {
        setFaceTextures(prev => {
            const next = { ...prev };
            delete next[selectedFace];
            return next;
        });
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
                        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">Design</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Base Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => setCustomColor(e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                    />
                                    <span className="text-xs text-stone-500 font-mono">{customColor}</span>
                                </div>
                            </div>

                            {/* Face Selector */}
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-2">Target Face</label>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {FACES.map(face => (
                                        <button
                                            key={face.id}
                                            onClick={() => setSelectedFace(face.id)}
                                            className={`px-2 py-1 text-xs rounded border transition-colors ${selectedFace === face.id
                                                ? 'bg-brand-dark text-white border-brand-dark'
                                                : 'bg-white text-stone-600 border-stone-200 hover:border-brand-dark'
                                                }`}
                                        >
                                            {face.label}
                                        </button>
                                    ))}
                                </div>

                                <label className="block text-xs font-medium text-stone-500 mb-1">
                                    Upload Texture for {FACES.find(f => f.id === selectedFace)?.label}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleTextureUpload}
                                    className="w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-pink file:text-brand-dark hover:file:bg-brand-pink/80"
                                />

                                <div className="mt-2">
                                    <label className="block text-xs font-medium text-stone-500 mb-1">Texture Fit</label>
                                    <select
                                        value={textureFit}
                                        onChange={(e) => setTextureFit(e.target.value as any)}
                                        className="w-full px-2 py-1 text-xs border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-pink/50 bg-white"
                                    >
                                        <option value="cover">Cover (Crop to fit)</option>
                                        <option value="contain">Contain (Show all)</option>
                                        <option value="stretch">Stretch (Fill)</option>
                                    </select>
                                </div>

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-stone-500 mb-1">
                                            Scale ({Math.round(textureScale * 100)}%)
                                        </label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="3"
                                            step="0.1"
                                            value={textureScale}
                                            onChange={(e) => setTextureScale(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-dark"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-stone-500 mb-1">Offset X</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={textureOffset.x}
                                                onChange={(e) => setTextureOffset(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                                                className="w-full px-2 py-1 text-xs border border-stone-200 rounded"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-stone-500 mb-1">Offset Y</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={textureOffset.y}
                                                onChange={(e) => setTextureOffset(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                                                className="w-full px-2 py-1 text-xs border border-stone-200 rounded"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {faceTextures[selectedFace] && (
                                    <button
                                        onClick={handleRemoveTexture}
                                        className="mt-2 text-xs text-red-500 hover:underline"
                                    >
                                        Remove Texture from {FACES.find(f => f.id === selectedFace)?.label}
                                    </button>
                                )}
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
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-white p-1 rounded-lg border border-stone-200 shadow-sm flex">
                            <button
                                onClick={() => setViewMode('2d')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === '2d'
                                    ? 'bg-brand-dark text-white shadow-sm'
                                    : 'text-stone-500 hover:bg-stone-50'
                                    }`}
                            >
                                <Eye size={16} />
                                2D Preview
                            </button>
                            <button
                                onClick={() => setViewMode('3d')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === '3d'
                                    ? 'bg-brand-dark text-white shadow-sm'
                                    : 'text-stone-500 hover:bg-stone-50'
                                    }`}
                            >
                                <Box size={16} />
                                3D Preview
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        {viewMode === '2d' ? (
                            <BoxPreview
                                ref={svgRef}
                                viewBox={viewBox}
                                paths={paths}
                                facePolygons={facePolygons}
                                customColor={customColor}
                                customTexture={customTexture}
                                faceTextures={faceTextures}
                                textureFit={textureFit}
                                textureScale={textureScale}
                                textureOffset={textureOffset}
                            />
                        ) : (
                            <Box3D
                                ref={box3DRef}
                                dimensions={dimensions}
                                boxType={boxType}
                                customColor={customColor}
                                customTexture={customTexture}
                                faceTextures={faceTextures}
                                finishId={finishId}
                                textureFit={textureFit}
                                textureScale={textureScale}
                                textureOffset={textureOffset}
                            />
                        )}
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
