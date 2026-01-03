import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Box } from '../models/Box.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export class BoxService {
  private templates: BoxTemplate[] = [];

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates() {
    try {
      // Load from data/materials/box-templates.json
      const dataPath = join(__dirname, '../../../data/materials/box-templates.json');
      const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
      this.templates = data.templates || [];
    } catch (error) {
      console.error('Error loading box templates:', error);
      this.templates = [];
    }
  }

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
