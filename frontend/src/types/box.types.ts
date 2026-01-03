export interface Box {
  id: string;
  name: string;
  dimensions: BoxDimensions;
  type: 'gift' | 'truffle' | 'bar' | 'seasonal';
  capacity: number; // Number of chocolates
  material?: BoxMaterial;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BoxDimensions {
  length: number; // mm
  width: number; // mm
  height: number; // mm
}

export interface BoxMaterial {
  paperType: 'mukavva' | 'kuşe' | 'kraft' | 'special';
  thickness: number; // mm (1.0, 1.5, 2.0)
  coating?: 'mat' | 'parlak' | 'soft-touch' | 'none';
  grammage?: number; // g/m²
}

export interface BoxTemplate {
  id: string;
  name: string;
  dimensions: BoxDimensions;
  capacity: number;
  recommendedMaterial: BoxMaterial;
  previewImage?: string;
}
