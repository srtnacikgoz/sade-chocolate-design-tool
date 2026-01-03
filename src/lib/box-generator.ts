export type BoxDimensions = {
    width: number;
    height: number;
    depth: number;
};

export type BoxType = 'gift-box' | 'truffle-box';

export interface DieLine {
    id: string;
    path: string;
    type: 'cut' | 'fold' | 'bleed';
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
}

export function generateBoxDieLine(type: BoxType, dimensions: BoxDimensions): { viewBox: string; paths: DieLine[] } {
    const { width: w, height: h, depth: d } = dimensions;

    // Basic validation
    if (w <= 0 || h <= 0 || d <= 0) {
        return { viewBox: '0 0 100 100', paths: [] };
    }

    // Colors
    const CUT_COLOR = '#000000';
    const FOLD_COLOR = '#E63946';

    // Stroke styles
    const CUT_STYLE = { stroke: CUT_COLOR, strokeWidth: 1, type: 'cut' as const };
    const FOLD_STYLE = { stroke: FOLD_COLOR, strokeWidth: 1, strokeDasharray: '4 2', type: 'fold' as const };

    if (type === 'gift-box') {
        // Standard Reverse Tuck End box (simplified)
        // Layout: [Glue Tab] [Side 1 (d)] [Front (w)] [Side 2 (d)] [Back (w)]
        // Height is the vertical dimension of main panels.

        const glueTabWidth = 15;
        const totalWidth = glueTabWidth + (2 * w) + (2 * d);
        const flapHeight = d * 0.6; // Top/Bottom flaps
        const tuckHeight = 15; // Tuck in tab
        const totalHeight = h + (2 * flapHeight) + (2 * tuckHeight);

        const startX = 10;
        const startY = tuckHeight + flapHeight + 10;

        const paths: DieLine[] = [];

        // 1. Main Horizontal Fold Lines (Top and Bottom of main panels)
        // Top line
        paths.push({
            id: 'main-fold-top',
            path: `M ${startX} ${startY} L ${startX + totalWidth} ${startY}`,
            ...FOLD_STYLE
        });
        // Bottom line
        paths.push({
            id: 'main-fold-bottom',
            path: `M ${startX} ${startY + h} L ${startX + totalWidth} ${startY + h}`,
            ...FOLD_STYLE
        });

        // 2. Vertical Fold Lines
        let currentX = startX;

        // Glue tab fold
        paths.push({
            id: 'fold-glue',
            path: `M ${currentX + glueTabWidth} ${startY} L ${currentX + glueTabWidth} ${startY + h}`,
            ...FOLD_STYLE
        });
        currentX += glueTabWidth;

        // Side 1 fold
        paths.push({
            id: 'fold-side1',
            path: `M ${currentX + d} ${startY} L ${currentX + d} ${startY + h}`,
            ...FOLD_STYLE
        });
        currentX += d;

        // Front fold
        paths.push({
            id: 'fold-front',
            path: `M ${currentX + w} ${startY} L ${currentX + w} ${startY + h}`,
            ...FOLD_STYLE
        });
        currentX += w;

        // Side 2 fold
        paths.push({
            id: 'fold-side2',
            path: `M ${currentX + d} ${startY} L ${currentX + d} ${startY + h}`,
            ...FOLD_STYLE
        });

        // 3. Cut Lines (Outline)
        // This is complex, tracing the entire outer boundary.
        // Simplified outline for visualization:

        // Glue tab outer edge
        const gluePath = `M ${startX} ${startY} L ${startX} ${startY + h} L ${startX + glueTabWidth} ${startY + h}`;

        // Bottom Flaps
        // Side 1 Bottom Flap
        const s1Bottom = `L ${startX + glueTabWidth} ${startY + h + flapHeight} L ${startX + glueTabWidth + d} ${startY + h + flapHeight} L ${startX + glueTabWidth + d} ${startY + h}`;
        // Front Bottom Flap (Tuck)
        const fBottom = `L ${startX + glueTabWidth + d} ${startY + h + flapHeight} L ${startX + glueTabWidth + d + w} ${startY + h + flapHeight} L ${startX + glueTabWidth + d + w} ${startY + h}`;
        // Side 2 Bottom Flap
        const s2Bottom = `L ${startX + glueTabWidth + d + w} ${startY + h + flapHeight} L ${startX + glueTabWidth + d + w + d} ${startY + h + flapHeight} L ${startX + glueTabWidth + d + w + d} ${startY + h}`;
        // Back Bottom Flap
        const bBottom = `L ${startX + glueTabWidth + d + w + d} ${startY + h + flapHeight} L ${startX + glueTabWidth + d + w + d + w} ${startY + h + flapHeight} L ${startX + glueTabWidth + d + w + d + w} ${startY + h}`;

        // Right edge
        const rightEdge = `L ${startX + totalWidth} ${startY}`;

        // Top Flaps (Mirror of bottom roughly)
        // Back Top Flap
        const bTop = `L ${startX + glueTabWidth + d + w + d + w} ${startY - flapHeight} L ${startX + glueTabWidth + d + w + d} ${startY - flapHeight} L ${startX + glueTabWidth + d + w + d} ${startY}`;
        // Side 2 Top Flap
        const s2Top = `L ${startX + glueTabWidth + d + w + d} ${startY - flapHeight} L ${startX + glueTabWidth + d + w} ${startY - flapHeight} L ${startX + glueTabWidth + d + w} ${startY}`;
        // Front Top Flap
        const fTop = `L ${startX + glueTabWidth + d + w} ${startY - flapHeight} L ${startX + glueTabWidth + d} ${startY - flapHeight} L ${startX + glueTabWidth + d} ${startY}`;
        // Side 1 Top Flap
        const s1Top = `L ${startX + glueTabWidth + d} ${startY - flapHeight} L ${startX + glueTabWidth} ${startY - flapHeight} L ${startX + glueTabWidth} ${startY}`;

        // Close loop
        const close = `Z`;

        paths.push({
            id: 'outline',
            path: gluePath + s1Bottom + fBottom + s2Bottom + bBottom + rightEdge + bTop + s2Top + fTop + s1Top + close,
            ...CUT_STYLE
        });

        const viewBox = `0 0 ${totalWidth + 20} ${totalHeight + 20}`;
        return { viewBox, paths };
    }

    return { viewBox: '0 0 100 100', paths: [] };
}
