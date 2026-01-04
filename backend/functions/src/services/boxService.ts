import { Box } from '../models/Box.js';

interface BoxTemplate {
  id: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  type: 'gift' | 'truffle' | 'bar' | 'seasonal';
  capacity: number;
  recommendedMaterial: {
    paperType: string;
    thickness: number;
    coating: string;
    grammage: number;
  };
  description: string;
  previewImage?: string;
}

// Inline box templates data
const BOX_TEMPLATES: BoxTemplate[] = [
  {
    id: 'gift-16',
    name: 'Premium Gift Box - 16\'lik',
    dimensions: { length: 250, width: 200, height: 50 },
    type: 'gift',
    capacity: 16,
    recommendedMaterial: {
      paperType: 'mukavva',
      thickness: 1.5,
      coating: 'soft-touch',
      grammage: 350
    },
    description: 'Standart 16\'lik premium hediye kutusu. En populer boyut.',
    previewImage: '/assets/templates/gift-16.png'
  },
  {
    id: 'gift-24',
    name: 'Large Gift Box - 24\'luk',
    dimensions: { length: 300, width: 240, height: 50 },
    type: 'gift',
    capacity: 24,
    recommendedMaterial: {
      paperType: 'mukavva',
      thickness: 2.0,
      coating: 'soft-touch',
      grammage: 400
    },
    description: 'Buyuk kapasiteli hediye kutusu. Ozel gunler icin ideal.',
    previewImage: '/assets/templates/gift-24.png'
  },
  {
    id: 'gift-9',
    name: 'Compact Gift Box - 9\'luk',
    dimensions: { length: 180, width: 180, height: 40 },
    type: 'gift',
    capacity: 9,
    recommendedMaterial: {
      paperType: 'mukavva',
      thickness: 1.5,
      coating: 'mat',
      grammage: 300
    },
    description: 'Kompakt ve zarif. Kucuk jestler icin.',
    previewImage: '/assets/templates/gift-9.png'
  },
  {
    id: 'truffle-12',
    name: 'Truffle Box - 12\'lik',
    dimensions: { length: 200, width: 160, height: 35 },
    type: 'truffle',
    capacity: 12,
    recommendedMaterial: {
      paperType: 'kuse',
      thickness: 1.0,
      coating: 'parlak',
      grammage: 300
    },
    description: 'Truffle cikolatalar icin ozel bolmeli kutu.',
    previewImage: '/assets/templates/truffle-12.png'
  },
  {
    id: 'bar-single',
    name: 'Single Bar Package',
    dimensions: { length: 160, width: 80, height: 10 },
    type: 'bar',
    capacity: 1,
    recommendedMaterial: {
      paperType: 'kraft',
      thickness: 0.5,
      coating: 'none',
      grammage: 250
    },
    description: 'Tek cikolata bari icin minimalist ambalaj.',
    previewImage: '/assets/templates/bar-single.png'
  },
  {
    id: 'seasonal-valentines',
    name: 'Valentine\'s Heart Box - 20\'lik',
    dimensions: { length: 220, width: 220, height: 45 },
    type: 'seasonal',
    capacity: 20,
    recommendedMaterial: {
      paperType: 'mukavva',
      thickness: 1.5,
      coating: 'soft-touch',
      grammage: 350
    },
    description: 'Sevgililer Gunu ozel kalp seklinde kutu.',
    previewImage: '/assets/templates/seasonal-valentines.png'
  }
];

export class BoxService {
  private templates: BoxTemplate[] = BOX_TEMPLATES;

  async list(): Promise<BoxTemplate[]> {
    return this.templates;
  }

  async getById(id: string): Promise<BoxTemplate | null> {
    const template = this.templates.find(t => t.id === id);
    return template || null;
  }

  async getByType(type: string): Promise<BoxTemplate[]> {
    return this.templates.filter(t => t.type === type);
  }
}

export const boxService = new BoxService();
