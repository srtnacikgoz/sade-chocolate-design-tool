/**
 * ECMA A20.20.03.01 Uyumlu Kutu Tip Tanimlamalari
 * Sade Chocolate - Luks Cikolata Ambalaj Tasarim Araci
 *
 * ECMA (European Carton Makers Association) standartlarina uygun
 * katlanan kutu (folding carton) tip tanimlari.
 */

import type { BoxDimensions } from './box.types';

// ============================================================
// ECMA Panel Tipleri
// ============================================================

/**
 * Panel tipi tanimlari
 * - main: Ana paneller (A1, A2) - kutunun on ve arka yuzu
 * - side: Yan paneller (B1, B2) - kutunun derinligi
 * - glue: Tutkal payi (C) - yapisma alani
 * - tuck: Kapak dili - kutunun kapanma mekanizmasi
 * - dust: Toz kulakcigi - koruma flepleri
 */
export type ECMAPanelType = 'main' | 'side' | 'glue' | 'tuck' | 'dust';

/**
 * Katlama tipi
 * - mountain: Dis katlama (kirmizi cizgi) - yukari dogru katlanir
 * - valley: Ic katlama (mavi cizgi) - asagi dogru katlanir
 * - none: Katlama yok
 */
export type FoldType = 'mountain' | 'valley' | 'none';

/**
 * Katlama ekseni (3D rotasyon icin)
 */
export type FoldAxis = 'x' | 'y' | 'z';

/**
 * ECMA Panel Arayuzu
 */
export interface ECMAPanel {
  /** Panel kimlik numarasi (A1, A2, B1, B2, C, tuck-top, dust-top, vb.) */
  id: string;

  /** Panel adi (gosterim icin) */
  name: string;

  /** Panel tipi */
  type: ECMAPanelType;

  /** Panel genisligi (mm) */
  width: number;

  /** Panel yuksekligi (mm) */
  height: number;

  /** Die-line uzerindeki pozisyon (mm) */
  position: {
    x: number;
    y: number;
  };

  /** Katlama tipi */
  foldType: FoldType;

  /** Maksimum katlama acisi (derece) */
  maxFoldAngle: number;

  /** Katlama ekseni (3D) */
  foldAxis: FoldAxis;

  /** Pivot noktasi ofseti (3D rotasyon merkezi) */
  pivotOffset: {
    x: number;
    y: number;
    z: number;
  };

  /** Bagli oldugu ust panel ID */
  parentId?: string;

  /** Alt panel ID'leri */
  childIds?: string[];

  /** Panel sIRASI (katlama animasyonu icin) */
  foldOrder: number;

  /** Katlama baslangic progress degeri (0-1) */
  foldStartProgress: number;

  /** Katlama bitis progress degeri (0-1) */
  foldEndProgress: number;
}

// ============================================================
// ECMA Kutu Spesifikasyonlari
// ============================================================

/**
 * Desteklenen ECMA kodlari
 */
export type ECMACode = 'A20.20.03.01' | 'A60' | 'A20.20.01.01';

/**
 * Kutu stili
 * - single-piece: Tek parca katlanan kutu
 * - two-piece: Iki parca (tepsi + kapak)
 */
export type BoxStyle = 'single-piece' | 'two-piece';

/**
 * Tolerans degerleri (mm)
 */
export interface ECMATolerances {
  /** Ana panel toleransi - A1/A2 panelleri B1/B2'den bu kadar uzun */
  panelTolerance: number;

  /** Bleed (tasma payi) - kesim hattindan disari */
  bleed: number;

  /** Safe zone - kesim hattindan iceri */
  safeZone: number;

  /** Bicak toleransi - kesim hassasiyeti */
  dieTolerance: number;
}

/**
 * ECMA Kutu Spesifikasyonu
 */
export interface ECMABoxSpec {
  /** ECMA standart kodu */
  ecmaCode: ECMACode;

  /** Kutu stili */
  style: BoxStyle;

  /** Kutu boyutlari (L x W x H) */
  dimensions: BoxDimensions;

  /** Tolerans degerleri */
  tolerances: ECMATolerances;

  /** Tum paneller */
  panels: ECMAPanel[];

  /** Katlama sirasi (panel ID'leri) */
  foldSequence: string[];

  /** Die-line toplam boyutlari (bleed dahil) */
  flatDimensions: {
    width: number;
    height: number;
  };
}

// ============================================================
// 3D Katlama State
// ============================================================

/**
 * Tek panel katlama durumu
 */
export interface PanelFoldState {
  /** Panel ID */
  panelId: string;

  /** Mevcut katlama acisi (derece) */
  currentAngle: number;

  /** Hedef katlama acisi (derece) */
  targetAngle: number;

  /** Animasyon devam ediyor mu */
  isAnimating: boolean;
}

/**
 * Tum kutu katlama durumu
 */
export interface BoxFoldState {
  /** Genel katlama ilerlemesi (0 = duz, 1 = tam katlanmis) */
  foldProgress: number;

  /** Animasyon calisiyor mu */
  isAnimating: boolean;

  /** Animasyon yonu (1 = kapaniyor, -1 = aciliyor) */
  animationDirection: 1 | -1;

  /** Her panel icin ayri durum */
  panelStates: Record<string, PanelFoldState>;
}

// ============================================================
// Katlama Fazi Tanimlari
// ============================================================

/**
 * Katlama fazi
 */
export interface FoldPhase {
  /** Faz numarasi */
  phase: number;

  /** Faz adi */
  name: string;

  /** Bu fazda katlanan panel ID'leri */
  panelIds: string[];

  /** Baslangic progress degeri (0-1) */
  startProgress: number;

  /** Bitis progress degeri (0-1) */
  endProgress: number;

  /** Katlama acisi (derece) - negatif = ters yon */
  foldAngle: number;
}

/**
 * ECMA A20.20.03.01 icin varsayilan katlama fazlari
 * Reverse Tuck: Ust kapak arkaya, alt kapak one kapanir
 */
export const ECMA_A20_FOLD_PHASES: FoldPhase[] = [
  {
    phase: 1,
    name: 'Yan Paneller',
    panelIds: ['B1', 'B2'],
    startProgress: 0,
    endProgress: 0.25,
    foldAngle: 90,
  },
  {
    phase: 2,
    name: 'Arka Panel + Tutkal',
    panelIds: ['A2', 'glue-tab'],
    startProgress: 0.25,
    endProgress: 0.50,
    foldAngle: 90,
  },
  {
    phase: 3,
    name: 'Toz Kulakciklari',
    panelIds: ['dust-top-front', 'dust-top-back', 'dust-bottom-front', 'dust-bottom-back'],
    startProgress: 0.50,
    endProgress: 0.65,
    foldAngle: 90,
  },
  {
    phase: 4,
    name: 'Alt Kapak (One)',
    panelIds: ['tuck-bottom'],
    startProgress: 0.65,
    endProgress: 0.80,
    foldAngle: 90,
  },
  {
    phase: 5,
    name: 'Ust Kapak (Arkaya - REVERSE)',
    panelIds: ['tuck-top'],
    startProgress: 0.80,
    endProgress: 1.0,
    foldAngle: -90, // Negatif = arkaya dogru
  },
];

// ============================================================
// SVG Die-Line Tipleri
// ============================================================

/**
 * SVG cizgi tipi
 */
export type SVGLineType = 'cut' | 'fold-mountain' | 'fold-valley' | 'bleed' | 'glue-area';

/**
 * SVG Layer bilgisi
 */
export interface SVGLayer {
  /** Layer ID */
  id: string;

  /** Layer adi (Adobe Illustrator uyumlu) */
  name: string;

  /** Cizgi rengi */
  color: string;

  /** Cizgi kalinligi (mm) */
  strokeWidth: number;

  /** Dash pattern (kesikli cizgi icin) */
  dashArray?: string;

  /** Dolgu rengi (opsiyonel) */
  fill?: string;

  /** Dolgu saydamligi */
  fillOpacity?: number;
}

/**
 * SVG Path verisi
 */
export interface SVGPathData {
  /** Path tipi */
  type: SVGLineType;

  /** SVG path string (d attribute) */
  d: string;

  /** Hangi layer'a ait */
  layerId: string;
}

/**
 * Die-Line SVG ciktisi
 */
export interface DieLineSVG {
  /** SVG icerik string */
  content: string;

  /** Dosya adi */
  filename: string;

  /** Boyutlar (mm) */
  dimensions: {
    width: number;
    height: number;
  };

  /** Metadata */
  metadata: {
    ecmaCode: ECMACode;
    bleed: number;
    creaseChannel: number;
    colorProfile: string;
    resolution: number;
  };

  /** Layer listesi */
  layers: SVGLayer[];

  /** Path listesi */
  paths: SVGPathData[];
}

// ============================================================
// Sabit Degerler
// ============================================================

/**
 * ECMA A20.20.03.01 varsayilan toleranslari
 */
export const DEFAULT_ECMA_TOLERANCES: ECMATolerances = {
  panelTolerance: 0.5,  // mm - A1/A2 panelleri B1/B2'den uzun
  bleed: 3,             // mm - standart tasma payi
  safeZone: 5,          // mm - guvenli alan
  dieTolerance: 0.25,   // mm - bicak hassasiyeti
};

/**
 * Panel boyut hesaplama sabitleri
 */
export const PANEL_CALC_CONSTANTS = {
  /** Tutkal payi minimum genisligi (mm) */
  GLUE_FLAP_MIN: 7,

  /** Tutkal payi maksimum genisligi (mm) */
  GLUE_FLAP_MAX: 15,

  /** Tutkal payi carpani (height'in yuzdesI) */
  GLUE_FLAP_FACTOR: 0.15,

  /** Kapak dili carpani (width'in yuzdesi) */
  TUCK_FLAP_FACTOR: 0.75,

  /** Toz kulakcigi carpani (width'in yuzdesi) */
  DUST_FLAP_FACTOR: 0.45,

  /** Kilit centigi derinligi (mm) */
  LOCK_NOTCH_DEPTH: 3,

  /** Kilit centigi genisligi (mm) */
  LOCK_NOTCH_WIDTH: 10,
};

/**
 * 3D render sabitleri
 */
export const RENDER_CONSTANTS = {
  /** 1mm = x birim (Three.js scale) */
  SCALE: 0.01,

  /** Karton kalinligi (3D'de) */
  THICKNESS: 0.003,

  /** Animasyon hizi (saniye) */
  ANIMATION_DURATION: 2,

  /** Easing fonksiyonu tipi */
  EASING: 'easeInOutQuad',
};
