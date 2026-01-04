import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface SVGViewerProps {
  svgContent: string;
  title?: string;
  downloadFileName?: string;
  onDownload?: () => void;
  className?: string;
}

interface ViewTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

export const SVGViewer = ({
  svgContent,
  title = 'Teknik Cizim',
  downloadFileName = 'die-line.svg',
  onDownload,
  className = '',
}: SVGViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<ViewTransform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Zoom controls
  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 5),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.1),
    }));
  }, []);

  const resetView = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  const fitToView = useCallback(() => {
    if (containerRef.current) {
      setTransform({
        scale: 0.8,
        translateX: 0,
        translateY: 0,
      });
    }
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * delta, 0.1), 5),
    }));
  }, []);

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.translateX, y: e.clientY - transform.translateY });
    }
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        translateX: e.clientX - dragStart.x,
        translateY: e.clientY - dragStart.y,
      }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Download SVG
  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
      return;
    }

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [svgContent, downloadFileName, onDownload]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetView]);

  if (!svgContent) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>SVG yuklenemedi</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className} padding="none">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={zoomOut}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Uzaklastir (-)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-2 text-sm font-medium text-gray-600 min-w-[50px] text-center">
                {Math.round(transform.scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Yakinlastir (+)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* View Controls */}
            <button
              onClick={fitToView}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Ekrana Sigdir"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            <button
              onClick={resetView}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Sifirla (0)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Download Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              SVG Indir
            </Button>
          </div>
        </div>
      </div>

      {/* SVG Display Area */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
        style={{ height: '500px' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* SVG Content */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      {/* Legend / Info Bar */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-4 h-0.5 bg-black mr-2"></span>
              <span>Kesim Cizgisi</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-0.5 mr-2" style={{ background: 'repeating-linear-gradient(90deg, #ff0000, #ff0000 3px, transparent 3px, transparent 6px)' }}></span>
              <span>Katlama (Dag)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-0.5 mr-2" style={{ background: 'repeating-linear-gradient(90deg, #cc0000, #cc0000 2px, transparent 2px, transparent 4px)' }}></span>
              <span>Katlama (Vadi)</span>
            </div>
          </div>
          <div>
            <span>Mouse tekerlek: Zoom | Surukle: Kaydir | Klavye: +/- Zoom, 0 Sifirla</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SVGViewer;
