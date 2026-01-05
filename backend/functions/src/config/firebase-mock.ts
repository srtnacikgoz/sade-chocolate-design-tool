/**
 * Mock Firebase Services for Local Development
 * Firebase emulator veya service account olmadan çalışır
 */

// In-memory storage for mock data
const mockData: Record<string, Record<string, any>> = {
  designs: {},
  boxes: {
    'gift-9': {
      id: 'gift-9',
      name: '9\'lu Pralin Kutusu',
      dimensions: { length: 120, width: 120, height: 40 },
      type: 'gift',
      capacity: 9,
      description: 'Kompakt hediye kutusu, 3x3 pralin dizilimi',
    },
    'gift-16': {
      id: 'gift-16',
      name: '16\'lı Premium Kutu',
      dimensions: { length: 160, width: 160, height: 45 },
      type: 'gift',
      capacity: 16,
      description: 'Orta boy premium kutu, 4x4 pralin dizilimi',
    },
    'gift-25': {
      id: 'gift-25',
      name: '25\'li Hediye Kutusu',
      dimensions: { length: 200, width: 200, height: 50 },
      type: 'gift',
      capacity: 25,
      description: 'Büyük hediye kutusu, 5x5 pralin dizilimi',
    },
    'truffle-4': {
      id: 'truffle-4',
      name: '4\'lü Truffle Kutusu',
      dimensions: { length: 80, width: 80, height: 35 },
      type: 'truffle',
      capacity: 4,
      description: 'Mini truffle kutusu, 2x2 dizilim',
    },
    'bar-single': {
      id: 'bar-single',
      name: 'Tablet Çikolata',
      dimensions: { length: 180, width: 80, height: 15 },
      type: 'bar',
      capacity: 1,
      description: 'Tek tablet çikolata ambalajı',
    },
  },
};

// Mock Firestore Document Reference
class MockDocumentRef {
  constructor(private collection: string, private docId: string) {}

  async get() {
    const data = mockData[this.collection]?.[this.docId];
    return {
      exists: !!data,
      id: this.docId,
      data: () => data,
    };
  }

  async set(data: any) {
    if (!mockData[this.collection]) {
      mockData[this.collection] = {};
    }
    mockData[this.collection][this.docId] = { ...data, id: this.docId };
  }

  async update(data: any) {
    if (mockData[this.collection]?.[this.docId]) {
      mockData[this.collection][this.docId] = {
        ...mockData[this.collection][this.docId],
        ...data,
      };
    }
  }

  async delete() {
    if (mockData[this.collection]) {
      delete mockData[this.collection][this.docId];
    }
  }
}

// Mock Firestore Collection Reference
class MockCollectionRef {
  constructor(private collectionName: string) {}

  doc(docId?: string) {
    const id = docId || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new MockDocumentRef(this.collectionName, id);
  }

  async get() {
    const docs = Object.entries(mockData[this.collectionName] || {}).map(([id, data]) => ({
      id,
      exists: true,
      data: () => data,
    }));
    return { docs, empty: docs.length === 0 };
  }

  where() {
    return this; // Simplified - returns all docs
  }

  orderBy() {
    return this;
  }

  limit() {
    return this;
  }
}

// Mock Firestore
export const db = {
  collection: (name: string) => new MockCollectionRef(name),
};

// Mock Storage
const mockFiles: Record<string, Buffer> = {};

export const storage = {
  bucket: () => ({
    file: (path: string) => ({
      save: async (buffer: Buffer) => {
        mockFiles[path] = buffer;
        console.log(`[Mock Storage] Saved file: ${path}`);
      },
      getSignedUrl: async () => {
        return [`http://localhost:3001/mock-storage/${path}`];
      },
      exists: async () => [!!mockFiles[path]],
      delete: async () => {
        delete mockFiles[path];
      },
    }),
  }),
};

// Mock Auth (minimal)
export const auth = {
  verifyIdToken: async () => ({ uid: 'mock-user' }),
};

// Mock Timestamp
export const Timestamp = {
  now: () => ({ _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 }),
  fromDate: (date: Date) => ({ _seconds: Math.floor(date.getTime() / 1000), _nanoseconds: 0 }),
};

console.log('🔧 Using MOCK Firebase services (no credentials required)');
