export type Material = {
    id: string;
    name: string;
    pricePerSqm: number; // Price per square meter
    currency: string;
};

export type Finish = {
    id: string;
    name: string;
    pricePerUnit: number; // Fixed cost per box
    pricePerSqm?: number; // Variable cost
};

export const MATERIALS: Material[] = [
    { id: 'kraft-300', name: 'Kraft Paper 300gsm', pricePerSqm: 0.5, currency: 'USD' },
    { id: 'coated-350', name: 'Coated Art Paper 350gsm', pricePerSqm: 0.8, currency: 'USD' },
    { id: 'textured-premium', name: 'Premium Textured 300gsm', pricePerSqm: 1.5, currency: 'USD' },
];

export const FINISHES: Finish[] = [
    { id: 'none', name: 'None', pricePerUnit: 0 },
    { id: 'matte-lamination', name: 'Matte Lamination', pricePerUnit: 0.1 },
    { id: 'gold-foil', name: 'Gold Foil Stamping', pricePerSqm: 0.3, pricePerUnit: 0.3 },
    { id: 'spot-uv', name: 'Spot UV', pricePerUnit: 0.2 },
];

export function calculateCost(
    width: number, // mm
    height: number, // mm
    depth: number, // mm
    materialId: string,
    finishId: string,
    quantity: number
): { unitCost: number; totalCost: number } {
    const material = MATERIALS.find(m => m.id === materialId) || MATERIALS[0];
    const finish = FINISHES.find(f => f.id === finishId) || FINISHES[0];

    // Calculate surface area in square meters
    // Approximate area: 2(wh + wd + hd) + flaps (add 20% for waste/flaps)
    const areaMm2 = (2 * (width * height + width * depth + height * depth)) * 1.2;
    const areaM2 = areaMm2 / 1_000_000;

    const materialCost = areaM2 * material.pricePerSqm;
    const finishCost = finish.pricePerUnit + (finish.pricePerSqm ? areaM2 * finish.pricePerSqm : 0);

    const baseUnitCost = materialCost + finishCost;

    // Volume discount
    let discount = 0;
    if (quantity > 1000) discount = 0.1;
    if (quantity > 5000) discount = 0.2;

    const finalUnitCost = baseUnitCost * (1 - discount);

    return {
        unitCost: Number(finalUnitCost.toFixed(2)),
        totalCost: Number((finalUnitCost * quantity).toFixed(2))
    };
}
