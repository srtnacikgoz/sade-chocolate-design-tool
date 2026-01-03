import { getDb } from '../config/firestore.js';
import { Design, CreateDesignInput } from '../models/Design.js';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'designs';

export class DesignService {
  private db = getDb();

  async create(input: CreateDesignInput): Promise<Design> {
    const now = Timestamp.now();

    const design: Omit<Design, 'id'> = {
      boxId: input.boxId || '',
      status: 'draft',
      createdAt: now,
      updatedAt: now
    };

    const docRef = await this.db.collection(COLLECTION_NAME).add(design);

    return {
      id: docRef.id,
      ...design
    };
  }

  async getById(id: string): Promise<Design | null> {
    const doc = await this.db.collection(COLLECTION_NAME).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data()
    } as Design;
  }

  async list(limit: number = 20, offset: number = 0): Promise<Design[]> {
    const snapshot = await this.db
      .collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Design[];
  }

  async update(id: string, data: Partial<Design>): Promise<Design | null> {
    const docRef = this.db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    await docRef.update({
      ...data,
      updatedAt: Timestamp.now()
    });

    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const docRef = this.db.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return false;
    }

    await docRef.delete();
    return true;
  }

  async updateStatus(
    id: string,
    status: Design['status']
  ): Promise<Design | null> {
    return this.update(id, { status });
  }
}

export const designService = new DesignService();
