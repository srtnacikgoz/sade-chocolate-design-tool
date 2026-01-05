/**
 * ECMA Panel Hesaplama Utility
 * Sade Chocolate - Luks Cikolata Ambalaj Tasarim Araci
 *
 * ECMA A20.20.03.01 standardina uygun panel boyutlari,
 * pozisyonlari ve katlama parametrelerini hesaplar.
 */

import type { BoxDimensions } from '../types/box.types';
import type {
  ECMAPanel,
  ECMABoxSpec,
  ECMACode,
  BoxStyle,
  ECMATolerances,
  FoldPhase,
} from '../types/ecma-box.types';
import {
  DEFAULT_ECMA_TOLERANCES,
  PANEL_CALC_CONSTANTS,
  ECMA_A20_FOLD_PHASES,
} from '../types/ecma-box.types';

// ============================================================
// Temel Hesaplama Fonksiyonlari
// ============================================================

/**
 * Tutkal payi (Glue Flap) genisligini hesaplar
 * ECMA standardi: 7-15mm, yukseklige bagli
 */
export function calculateGlueFlapWidth(height: number): number {
  const calculated = height * PANEL_CALC_CONSTANTS.GLUE_FLAP_FACTOR;
  return Math.min(
    PANEL_CALC_CONSTANTS.GLUE_FLAP_MAX,
    Math.max(PANEL_CALC_CONSTANTS.GLUE_FLAP_MIN, calculated)
  );
}

/**
 * Kapak dili (Tuck Flap) yuksekligini hesaplar
 * Genellikle kutunun genisliginin %75'i
 */
export function calculateTuckFlapHeight(width: number): number {
  return width * PANEL_CALC_CONSTANTS.TUCK_FLAP_FACTOR;
}

/**
 * Toz kulakcigi (Dust Flap) yuksekligini hesaplar
 * Genellikle kutunun genisliginin %45'i
 */
export function calculateDustFlapHeight(width: number): number {
  return width * PANEL_CALC_CONSTANTS.DUST_FLAP_FACTOR;
}

/**
 * Panel toleransini uygular
 * A1/A2 (main) panelleri B1/B2 (side) panellerden 0.5mm uzun olmali
 */
export function applyPanelTolerance(
  panelType: 'main' | 'side',
  height: number,
  tolerance: number = DEFAULT_ECMA_TOLERANCES.panelTolerance
): number {
  return panelType === 'main' ? height + tolerance : height;
}

// ============================================================
// ECMA A20.20.03.01 Panel Olusturma
// ============================================================

/**
 * Tek Parca Kutu icin tum panelleri olusturur
 * ECMA A20.20.03.01 - Reverse Tuck End Box
 *
 * Layout (soldan saga):
 * [Glue Tab] [B1] [A1] [B2] [A2]
 *
 * Her ana panel icin (A1, A2):
 * - Ust: Dust Flap + Tuck Flap
 * - Alt: Dust Flap + Tuck Flap
 */
export function generateSinglePiecePanels(
  dims: BoxDimensions,
  tolerances: ECMATolerances = DEFAULT_ECMA_TOLERANCES
): ECMAPanel[] {
  const { length, width, height } = dims;
  const panels: ECMAPanel[] = [];

  // Hesaplamalar
  const glueFlapWidth = calculateGlueFlapWidth(height);
  const tuckFlapHeight = calculateTuckFlapHeight(width);
  const dustFlapHeight = calculateDustFlapHeight(width);
  const mainPanelHeight = applyPanelTolerance('main', height, tolerances.panelTolerance);
  const sidePanelHeight = applyPanelTolerance('side', height, tolerances.panelTolerance);

  // X pozisyonlari (soldan saga)
  let currentX = tolerances.bleed;

  // ============================================================
  // 1. GLUE TAB (C) - Tutkal Payi
  // ============================================================
  panels.push({
    id: 'glue-tab',
    name: 'Tutkal Payi',
    type: 'glue',
    width: glueFlapWidth,
    height: width,
    position: { x: currentX, y: tolerances.bleed + dustFlapHeight + tuckFlapHeight },
    foldType: 'mountain',
    maxFoldAngle: 90,
    foldAxis: 'y',
    pivotOffset: { x: glueFlapWidth, y: 0, z: 0 },
    parentId: 'B1',
    foldOrder: 2,
    foldStartProgress: 0.25,
    foldEndProgress: 0.50,
  });
  currentX += glueFlapWidth;

  // ============================================================
  // 2. SIDE PANEL B1 (Sol Yan)
  // ============================================================
  panels.push({
    id: 'B1',
    name: 'Sol Yan Panel',
    type: 'side',
    width: width,
    height: sidePanelHeight,
    position: { x: currentX, y: tolerances.bleed + dustFlapHeight + tuckFlapHeight },
    foldType: 'mountain',
    maxFoldAngle: 90,
    foldAxis: 'y',
    pivotOffset: { x: width, y: 0, z: 0 },
    parentId: 'A1',
    childIds: ['glue-tab'],
    foldOrder: 1,
    foldStartProgress: 0,
    foldEndProgress: 0.25,
  });

  // B1 Dust Flaps
  panels.push({
    id: 'dust-top-B1',
    name: 'B1 Ust Toz Kulakcigi',
    type: 'dust',
    width: width,
    height: dustFlapHeight,
    position: { x: currentX, y: tolerances.bleed + tuckFlapHeight },
    foldType: 'valley',
    maxFoldAngle: 90,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: dustFlapHeight, z: 0 },
    parentId: 'B1',
    foldOrder: 3,
    foldStartProgress: 0.50,
    foldEndProgress: 0.65,
  });

  panels.push({
    id: 'dust-bottom-B1',
    name: 'B1 Alt Toz Kulakcigi',
    type: 'dust',
    width: width,
    height: dustFlapHeight,
    position: { x: currentX, y: tolerances.bleed + dustFlapHeight + tuckFlapHeight + sidePanelHeight },
    foldType: 'valley',
    maxFoldAngle: 90,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: 0, z: 0 },
    parentId: 'B1',
    foldOrder: 3,
    foldStartProgress: 0.50,
    foldEndProgress: 0.65,
  });

  currentX += width;

  // ============================================================
  // 3. MAIN PANEL A1 (On Yuz) - Ana Panel
  // ============================================================
  const a1Y = tolerances.bleed + dustFlapHeight + tuckFlapHeight;
  panels.push({
    id: 'A1',
    name: 'On Panel (Ana)',
    type: 'main',
    width: length,
    height: mainPanelHeight,
    position: { x: currentX, y: a1Y },
    foldType: 'none', // A1 sabit - referans panel
    maxFoldAngle: 0,
    foldAxis: 'y',
    pivotOffset: { x: 0, y: 0, z: 0 },
    childIds: ['B1', 'B2', 'tuck-top-A1', 'tuck-bottom-A1', 'dust-top-A1', 'dust-bottom-A1'],
    foldOrder: 0,
    foldStartProgress: 0,
    foldEndProgress: 0,
  });

  // A1 Ust Dust Flap
  panels.push({
    id: 'dust-top-A1',
    name: 'A1 Ust Toz Kulakcigi',
    type: 'dust',
    width: length,
    height: dustFlapHeight,
    position: { x: currentX, y: tolerances.bleed + tuckFlapHeight },
    foldType: 'valley',
    maxFoldAngle: 90,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: dustFlapHeight, z: 0 },
    parentId: 'A1',
    childIds: ['tuck-top-A1'],
    foldOrder: 3,
    foldStartProgress: 0.50,
    foldEndProgress: 0.65,
  });

  // A1 Ust Tuck Flap
  panels.push({
    id: 'tuck-top-A1',
    name: 'A1 Ust Kapak Dili',
    type: 'tuck',
    width: length,
    height: tuckFlapHeight,
    position: { x: currentX, y: tolerances.bleed },
    foldType: 'valley',
    maxFoldAngle: 180, // Tam kapanir
    foldAxis: 'x',
    pivotOffset: { x: 0, y: tuckFlapHeight, z: 0 },
    parentId: 'dust-top-A1',
    foldOrder: 5,
    foldStartProgress: 0.80,
    foldEndProgress: 1.0,
  });

  // A1 Alt Dust Flap
  panels.push({
    id: 'dust-bottom-A1',
    name: 'A1 Alt Toz Kulakcigi',
    type: 'dust',
    width: length,
    height: dustFlapHeight,
    position: { x: currentX, y: a1Y + mainPanelHeight },
    foldType: 'valley',
    maxFoldAngle: 90,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: 0, z: 0 },
    parentId: 'A1',
    childIds: ['tuck-bottom-A1'],
    foldOrder: 3,
    foldStartProgress: 0.50,
    foldEndProgress: 0.65,
  });

  // A1 Alt Tuck Flap - ONE KAPANIR (pozitif aci)
  panels.push({
    id: 'tuck-bottom-A1',
    name: 'A1 Alt Kapak Dili',
    type: 'tuck',
    width: length,
    height: tuckFlapHeight,
    position: { x: currentX, y: a1Y + mainPanelHeight + dustFlapHeight },
    foldType: 'valley',
    maxFoldAngle: 180,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: 0, z: 0 },
    parentId: 'dust-bottom-A1',
    foldOrder: 4,
    foldStartProgress: 0.65,
    foldEndProgress: 0.80,
  });

  currentX += length;

  // ============================================================
  // 4. SIDE PANEL B2 (Sag Yan)
  // ============================================================
  panels.push({
    id: 'B2',
    name: 'Sag Yan Panel',
    type: 'side',
    width: width,
    height: sidePanelHeight,
    position: { x: currentX, y: tolerances.bleed + dustFlapHeight + tuckFlapHeight },
    foldType: 'mountain',
    maxFoldAngle: 90,
    foldAxis: 'y',
    pivotOffset: { x: 0, y: 0, z: 0 },
    parentId: 'A1',
    childIds: ['A2'],
    foldOrder: 1,
    foldStartProgress: 0,
    foldEndProgress: 0.25,
  });

  // B2 Dust Flaps
  panels.push({
    id: 'dust-top-B2',
    name: 'B2 Ust Toz Kulakcigi',
    type: 'dust',
    width: width,
    height: dustFlapHeight,
    position: { x: currentX, y: tolerances.bleed + tuckFlapHeight },
    foldType: 'valley',
    maxFoldAngle: 90,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: dustFlapHeight, z: 0 },
    parentId: 'B2',
    foldOrder: 3,
    foldStartProgress: 0.50,
    foldEndProgress: 0.65,
  });

  panels.push({
    id: 'dust-bottom-B2',
    name: 'B2 Alt Toz Kulakcigi',
    type: 'dust',
    width: width,
    height: dustFlapHeight,
    position: { x: currentX, y: tolerances.bleed + dustFlapHeight + tuckFlapHeight + sidePanelHeight },
    foldType: 'valley',
    maxFoldAngle: 90,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: 0, z: 0 },
    parentId: 'B2',
    foldOrder: 3,
    foldStartProgress: 0.50,
    foldEndProgress: 0.65,
  });

  currentX += width;

  // ============================================================
  // 5. MAIN PANEL A2 (Arka Yuz)
  // ============================================================
  const a2Y = tolerances.bleed + dustFlapHeight + tuckFlapHeight;
  panels.push({
    id: 'A2',
    name: 'Arka Panel',
    type: 'main',
    width: length,
    height: mainPanelHeight,
    position: { x: currentX, y: a2Y },
    foldType: 'mountain',
    maxFoldAngle: 90,
    foldAxis: 'y',
    pivotOffset: { x: 0, y: 0, z: 0 },
    parentId: 'B2',
    childIds: ['tuck-top-A2', 'tuck-bottom-A2', 'dust-top-A2', 'dust-bottom-A2'],
    foldOrder: 2,
    foldStartProgress: 0.25,
    foldEndProgress: 0.50,
  });

  // A2 Ust Dust Flap
  panels.push({
    id: 'dust-top-A2',
    name: 'A2 Ust Toz Kulakcigi',
    type: 'dust',
    width: length,
    height: dustFlapHeight,
    position: { x: currentX, y: tolerances.bleed + tuckFlapHeight },
    foldType: 'valley',
    maxFoldAngle: 90,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: dustFlapHeight, z: 0 },
    parentId: 'A2',
    childIds: ['tuck-top-A2'],
    foldOrder: 3,
    foldStartProgress: 0.50,
    foldEndProgress: 0.65,
  });

  // A2 Ust Tuck Flap - ARKAYA KAPANIR (negatif aci - REVERSE)
  panels.push({
    id: 'tuck-top-A2',
    name: 'A2 Ust Kapak Dili (REVERSE)',
    type: 'tuck',
    width: length,
    height: tuckFlapHeight,
    position: { x: currentX, y: tolerances.bleed },
    foldType: 'mountain', // Dis katlama - arkaya
    maxFoldAngle: -180, // Negatif = arkaya dogru (REVERSE TUCK)
    foldAxis: 'x',
    pivotOffset: { x: 0, y: tuckFlapHeight, z: 0 },
    parentId: 'dust-top-A2',
    foldOrder: 5,
    foldStartProgress: 0.80,
    foldEndProgress: 1.0,
  });

  // A2 Alt Dust Flap
  panels.push({
    id: 'dust-bottom-A2',
    name: 'A2 Alt Toz Kulakcigi',
    type: 'dust',
    width: length,
    height: dustFlapHeight,
    position: { x: currentX, y: a2Y + mainPanelHeight },
    foldType: 'valley',
    maxFoldAngle: 90,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: 0, z: 0 },
    parentId: 'A2',
    childIds: ['tuck-bottom-A2'],
    foldOrder: 3,
    foldStartProgress: 0.50,
    foldEndProgress: 0.65,
  });

  // A2 Alt Tuck Flap
  panels.push({
    id: 'tuck-bottom-A2',
    name: 'A2 Alt Kapak Dili',
    type: 'tuck',
    width: length,
    height: tuckFlapHeight,
    position: { x: currentX, y: a2Y + mainPanelHeight + dustFlapHeight },
    foldType: 'valley',
    maxFoldAngle: 180,
    foldAxis: 'x',
    pivotOffset: { x: 0, y: 0, z: 0 },
    parentId: 'dust-bottom-A2',
    foldOrder: 4,
    foldStartProgress: 0.65,
    foldEndProgress: 0.80,
  });

  return panels;
}

// ============================================================
// Die-Line Boyut Hesaplama
// ============================================================

/**
 * Die-line duz boyutlarini hesaplar (bleed dahil)
 */
export function calculateFlatDimensions(
  dims: BoxDimensions,
  tolerances: ECMATolerances = DEFAULT_ECMA_TOLERANCES
): { width: number; height: number } {
  const { length, width, height } = dims;
  const glueFlapWidth = calculateGlueFlapWidth(height);
  const tuckFlapHeight = calculateTuckFlapHeight(width);
  const dustFlapHeight = calculateDustFlapHeight(width);

  // Yatay: Glue + B1 + A1 + B2 + A2 + (2 * bleed)
  const flatWidth = glueFlapWidth + width + length + width + length + (tolerances.bleed * 2);

  // Dikey: TuckTop + DustTop + MainPanel + DustBottom + TuckBottom + (2 * bleed)
  const flatHeight = (tuckFlapHeight * 2) + (dustFlapHeight * 2) + height + (tolerances.bleed * 2);

  return { width: flatWidth, height: flatHeight };
}

// ============================================================
// Ana Spec Olusturma Fonksiyonu
// ============================================================

/**
 * ECMA kutu spesifikasyonunu olusturur
 */
export function generateECMABoxSpec(
  dims: BoxDimensions,
  options: {
    ecmaCode?: ECMACode;
    style?: BoxStyle;
    tolerances?: Partial<ECMATolerances>;
  } = {}
): ECMABoxSpec {
  const {
    ecmaCode = 'A20.20.03.01',
    style = 'single-piece',
    tolerances: customTolerances = {},
  } = options;

  // Toleranslari birlestir
  const tolerances: ECMATolerances = {
    ...DEFAULT_ECMA_TOLERANCES,
    ...customTolerances,
  };

  // Panelleri olustur
  const panels = style === 'single-piece'
    ? generateSinglePiecePanels(dims, tolerances)
    : generateSinglePiecePanels(dims, tolerances); // TODO: two-piece icin ayri fonksiyon

  // Duz boyutlari hesapla
  const flatDimensions = calculateFlatDimensions(dims, tolerances);

  // Katlama sirasini olustur
  const foldSequence = panels
    .sort((a, b) => a.foldOrder - b.foldOrder)
    .map(p => p.id);

  return {
    ecmaCode,
    style,
    dimensions: dims,
    tolerances,
    panels,
    foldSequence,
    flatDimensions,
  };
}

// ============================================================
// Katlama Hesaplama Yardimcilari
// ============================================================

/**
 * Verilen progress degerine gore panelin mevcut katlama acisini hesaplar
 */
export function calculatePanelFoldAngle(
  panel: ECMAPanel,
  globalProgress: number
): number {
  const { foldStartProgress, foldEndProgress, maxFoldAngle } = panel;

  // Progress bu panel icin henuz baslamadiysa
  if (globalProgress < foldStartProgress) {
    return 0;
  }

  // Progress bu panel icin tamamlandiysa
  if (globalProgress >= foldEndProgress) {
    return maxFoldAngle;
  }

  // Progress bu panel icin devam ediyorsa - lineer interpolasyon
  const localProgress = (globalProgress - foldStartProgress) / (foldEndProgress - foldStartProgress);

  // Easing uygula (easeInOutQuad)
  const easedProgress = localProgress < 0.5
    ? 2 * localProgress * localProgress
    : 1 - Math.pow(-2 * localProgress + 2, 2) / 2;

  return maxFoldAngle * easedProgress;
}

/**
 * Tum paneller icin katlama acilarini hesaplar
 */
export function calculateAllPanelAngles(
  panels: ECMAPanel[],
  globalProgress: number
): Record<string, number> {
  const angles: Record<string, number> = {};

  for (const panel of panels) {
    angles[panel.id] = calculatePanelFoldAngle(panel, globalProgress);
  }

  return angles;
}

/**
 * Katlama fazini bulur (hangi fazda oldugunu)
 */
export function getCurrentFoldPhase(
  globalProgress: number,
  phases: FoldPhase[] = ECMA_A20_FOLD_PHASES
): FoldPhase | null {
  for (const phase of phases) {
    if (globalProgress >= phase.startProgress && globalProgress < phase.endProgress) {
      return phase;
    }
  }

  // Tamamlandiysa son fazi dondur
  if (globalProgress >= 1) {
    return phases[phases.length - 1];
  }

  return null;
}

// Fonksiyonlar zaten "export function" olarak tanimli
