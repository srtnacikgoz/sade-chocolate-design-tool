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

export interface FacePolygon {
    id: string;
    path: string; // SVG path d attribute
    x: number;
    y: number;
    width: number;
    height: number;
}

export function generateBoxDieLine(type: BoxType, dimensions: BoxDimensions): { viewBox: string; paths: DieLine[]; facePolygons: FacePolygon[] } {
    const { width: w, height: h, depth: d } = dimensions;

    // Basic validation
    if (w <= 0 || h <= 0 || d <= 0) {
        return { viewBox: '0 0 100 100', paths: [], facePolygons: [] };
    }

    // Colors
    const CUT_COLOR = '#000000';
    const FOLD_COLOR = '#E63946';

    // Stroke styles
    const CUT_STYLE = { stroke: CUT_COLOR, strokeWidth: 1, type: 'cut' as const };
    const FOLD_STYLE = { stroke: FOLD_COLOR, strokeWidth: 1, strokeDasharray: '4 2', type: 'fold' as const };

    if (type === 'gift-box' || type === 'truffle-box') {
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
        const facePolygons: FacePolygon[] = [];

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

        // Side 1 Polygon
        facePolygons.push({
            id: 'right-panel', // Mapping to 3D ID
            path: `M ${currentX} ${startY} h ${d} v ${h} h -${d} Z`,
            x: currentX,
            y: startY,
            width: d,
            height: h
        });

        currentX += d;

        // Front fold
        paths.push({
            id: 'fold-front',
            path: `M ${currentX + w} ${startY} L ${currentX + w} ${startY + h}`,
            ...FOLD_STYLE
        });

        // Front Polygon
        facePolygons.push({
            id: 'front-panel',
            path: `M ${currentX} ${startY} h ${w} v ${h} h -${w} Z`,
            x: currentX,
            y: startY,
            width: w,
            height: h
        });

        currentX += w;

        // Side 2 fold
        paths.push({
            id: 'fold-side2',
            path: `M ${currentX + d} ${startY} L ${currentX + d} ${startY + h}`,
            ...FOLD_STYLE
        });

        // Side 2 Polygon
        facePolygons.push({
            id: 'left-panel',
            path: `M ${currentX} ${startY} h ${d} v ${h} h -${d} Z`,
            x: currentX,
            y: startY,
            width: d,
            height: h
        });

        // Back Polygon (Remaining width)
        facePolygons.push({
            id: 'back-panel',
            path: `M ${currentX + d} ${startY} h ${w} v ${h} h -${w} Z`,
            x: currentX + d,
            y: startY,
            width: w,
            height: h
        });

        // Top Flap Polygon (Approximate for Front Top Flap)
        // Front starts at startX + glueTabWidth + d
        const frontX = startX + glueTabWidth + d;
        facePolygons.push({
            id: 'top-flap',
            path: `M ${frontX} ${startY} h ${w} v -${flapHeight} h -${w} Z`,
            x: frontX,
            y: startY - flapHeight,
            width: w,
            height: flapHeight
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

        // For Truffle Box, maybe add a window?
        if (type === 'truffle-box') {
            // Add a window on the Front panel
            // Front panel starts at: startX + glueTabWidth + d
            const frontX = startX + glueTabWidth + d;
            const windowMargin = 15;
            const windowWidth = w - (2 * windowMargin);
            const windowHeight = h - (2 * windowMargin);

            if (windowWidth > 0 && windowHeight > 0) {
                const windowPath = `M ${frontX + windowMargin} ${startY + windowMargin} h ${windowWidth} v ${windowHeight} h -${windowWidth} Z`;
                paths.push({
                    id: 'window-cut',
                    path: windowPath,
                    ...CUT_STYLE
                });

                // Add window hole to face polygon for clipping if needed, 
                // but for texture mapping we usually want the texture to cover the whole face 
                // and the hole to be cut out.
                // The SVG mask logic in BoxPreview handles the cutout if it's part of the outline/paths.
            }
        }

        const viewBox = `0 0 ${totalWidth + 20} ${totalHeight + 20}`;
        return { viewBox, paths, facePolygons };
    }

    return { viewBox: '0 0 100 100', paths: [], facePolygons: [] };
}

export interface BoxFace {
    id: string;
    name: string;
    width: number;
    height: number;
    // Position relative to parent's origin (usually the fold line)
    position: [number, number, number];
    // Axis of rotation for folding [x, y, z]
    foldAxis: [number, number, number];
    // Max fold angle in degrees (usually 90 or 180)
    maxFoldAngle: number;
    children?: BoxFace[];
    // Optional hole definition (relative to face center)
    hole?: { width: number; height: number; x: number; y: number };
}

export function generateBoxFaces(type: BoxType, dimensions: BoxDimensions): BoxFace {
    const { width: w, height: h, depth: d } = dimensions;
    const scale = 0.05; // Match the scale used in Box3D
    const W = w * scale;
    const H = h * scale;
    const D = d * scale;

    // Root: Front Panel
    // We'll build the tree relative to the Front Panel

    // Top Flap (attached to Front top)
    const topFlap: BoxFace = {
        id: 'top-flap',
        name: 'Top Flap',
        width: W,
        height: D,
        position: [0, H / 2, 0], // Top edge of Front
        foldAxis: [1, 0, 0], // Rotate around X axis
        maxFoldAngle: -90,
        children: [
            {
                id: 'top-tuck',
                name: 'Top Tuck',
                width: W,
                height: D * 0.2, // Small tuck tab
                position: [0, D, 0], // Top edge of Top Flap
                foldAxis: [1, 0, 0],
                maxFoldAngle: -90,
            }
        ]
    };

    // Bottom Flap (attached to Front bottom)
    const bottomFlap: BoxFace = {
        id: 'bottom-flap',
        name: 'Bottom Flap',
        width: W,
        height: D,
        position: [0, -H / 2, 0], // Bottom edge of Front
        foldAxis: [1, 0, 0],
        maxFoldAngle: 90,
        children: [
            {
                id: 'bottom-tuck',
                name: 'Bottom Tuck',
                width: W,
                height: D * 0.2,
                position: [0, -D, 0], // Bottom edge of Bottom Flap
                foldAxis: [1, 0, 0],
                maxFoldAngle: 90,
            }
        ]
    };

    // Right Panel (Side 1)
    const rightPanel: BoxFace = {
        id: 'right-panel',
        name: 'Right Panel',
        width: D,
        height: H,
        position: [W / 2, 0, 0], // Right edge of Front
        foldAxis: [0, 1, 0], // Rotate around Y axis
        maxFoldAngle: 90,
        children: [
            // Back Panel (attached to Right Panel)
            {
                id: 'back-panel',
                name: 'Back Panel',
                width: W,
                height: H,
                position: [D, 0, 0], // Right edge of Right Panel
                foldAxis: [0, 1, 0],
                maxFoldAngle: 90,
                children: [
                    // Left Panel (Side 2) (attached to Back Panel)
                    {
                        id: 'left-panel',
                        name: 'Left Panel',
                        width: D,
                        height: H,
                        position: [W, 0, 0], // Right edge of Back Panel
                        foldAxis: [0, 1, 0],
                        maxFoldAngle: 90,
                        children: [
                            // Glue Tab
                            {
                                id: 'glue-tab',
                                name: 'Glue Tab',
                                width: W * 0.1,
                                height: H,
                                position: [D, 0, 0],
                                foldAxis: [0, 1, 0],
                                maxFoldAngle: 90,
                            }
                        ]
                    }
                ]
            },
            // Right Dust Flaps (Top/Bottom)
            {
                id: 'right-top-dust',
                name: 'Dust Flap',
                width: D,
                height: D * 0.2,
                position: [D / 2, H / 2, 0],
                foldAxis: [1, 0, 0],
                maxFoldAngle: -90,
            },
            {
                id: 'right-bottom-dust',
                name: 'Dust Flap',
                width: D,
                height: D * 0.2,
                position: [D / 2, -H / 2, 0],
                foldAxis: [1, 0, 0],
                maxFoldAngle: 90,
            }
        ]
    };

    // Define the Front Panel (Root)
    const frontPanel: BoxFace = {
        id: 'front-panel',
        name: 'Front Panel',
        width: W,
        height: H,
        position: [0, 0, 0],
        foldAxis: [0, 0, 0], // Root doesn't fold relative to world
        maxFoldAngle: 0,
        children: [topFlap, bottomFlap, rightPanel]
    };

    // Apply Truffle Box modifications (Window)
    if (type === 'truffle-box') {
        // Add a window hole to the front panel
        const margin = Math.min(W, H) * 0.2;
        frontPanel.hole = {
            width: W - (2 * margin),
            height: H - (2 * margin),
            x: 0,
            y: 0
        };
    }

    return frontPanel;
}
