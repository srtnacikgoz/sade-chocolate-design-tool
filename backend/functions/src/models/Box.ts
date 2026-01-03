import { Timestamp } from 'firebase-admin/firestore';

export interface Box {
  id: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  type: 'gift' | 'truffle' | 'bar' | 'seasonal';
  capacity: number;
  material?: {
    paperType: string;
    thickness: number;
    coating?: string;
    grammage?: number;
  };
  isCustom: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
