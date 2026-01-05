/**
 * Simple Development API Server
 * Firebase'e ihtiyaç duymadan çalışan basit mock API
 *
 * Kullanım: node dev-server.js
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Uploads klasörü
const UPLOADS_DIR = join(__dirname, 'uploads');
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/svg+xml', 'application/pdf', 'image/png', 'image/jpeg'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ===================== MOCK DATA =====================
const mockBoxes = [
  {
    id: 'gift-9',
    name: '9\'lu Pralin Kutusu',
    dimensions: { length: 120, width: 120, height: 40 },
    type: 'gift',
    capacity: 9,
    description: 'Kompakt hediye kutusu, 3x3 pralin dizilimi',
  },
  {
    id: 'gift-16',
    name: '16\'lı Premium Kutu',
    dimensions: { length: 160, width: 160, height: 45 },
    type: 'gift',
    capacity: 16,
    description: 'Orta boy premium kutu, 4x4 pralin dizilimi',
  },
  {
    id: 'gift-25',
    name: '25\'li Hediye Kutusu',
    dimensions: { length: 200, width: 200, height: 50 },
    type: 'gift',
    capacity: 25,
    description: 'Büyük hediye kutusu, 5x5 pralin dizilimi',
  },
  {
    id: 'truffle-4',
    name: '4\'lü Truffle Kutusu',
    dimensions: { length: 80, width: 80, height: 35 },
    type: 'truffle',
    capacity: 4,
    description: 'Mini truffle kutusu, 2x2 dizilim',
  },
  {
    id: 'bar-single',
    name: 'Tablet Çikolata',
    dimensions: { length: 180, width: 80, height: 15 },
    type: 'bar',
    capacity: 1,
    description: 'Tek tablet çikolata ambalajı',
  },
];

const mockDesigns = new Map();
const customBoxes = new Map(); // Custom box'lar için

// ===================== ROUTES =====================

// Health check
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      mode: 'development',
    },
  });
});

// List boxes
app.get(['/v1/boxes', '/api/v1/boxes'], (req, res) => {
  const { type } = req.query;
  let boxes = mockBoxes;
  if (type) {
    boxes = boxes.filter(b => b.type === type);
  }
  res.json({
    success: true,
    data: boxes,
  });
});

// Get box by ID
app.get(['/v1/boxes/:id', '/api/v1/boxes/:id'], (req, res) => {
  const { id } = req.params;

  // Check preset boxes first
  let box = mockBoxes.find(b => b.id === id);

  // Check custom boxes
  if (!box && customBoxes.has(id)) {
    box = customBoxes.get(id);
  }

  // If it's a custom-* ID that we haven't seen, return a placeholder
  if (!box && id.startsWith('custom-')) {
    box = {
      id,
      name: 'Özel Kutu',
      dimensions: { length: 100, width: 100, height: 50 },
      type: 'custom',
      capacity: 1,
      description: 'Kullanıcı tanımlı özel kutu',
    };
    customBoxes.set(id, box);
  }

  if (!box) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Box not found' },
    });
  }
  res.json({ success: true, data: box });
});

// Create custom box
app.post(['/v1/boxes', '/api/v1/boxes'], (req, res) => {
  const { name, dimensions, type, capacity, description } = req.body;
  const id = `custom-${Date.now()}`;

  const box = {
    id,
    name: name || 'Özel Kutu',
    dimensions: dimensions || { length: 100, width: 100, height: 50 },
    type: type || 'custom',
    capacity: capacity || 1,
    description: description || 'Kullanıcı tanımlı özel kutu',
  };

  customBoxes.set(id, box);

  res.status(201).json({
    success: true,
    data: box,
    message: 'Custom box created successfully',
  });
});

// Create design
app.post(['/v1/designs', '/api/v1/designs'], (req, res) => {
  const { boxId, customDimensions, preferences } = req.body;

  const id = randomUUID();
  const now = new Date().toISOString();

  const design = {
    id,
    boxId: boxId || null,
    customDimensions: customDimensions || null,
    preferences: preferences || {},
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  mockDesigns.set(id, design);

  res.status(201).json({
    success: true,
    data: design,
    message: 'Design created successfully',
  });
});

// Get design by ID
app.get(['/v1/designs/:id', '/api/v1/designs/:id'], (req, res) => {
  const { id } = req.params;
  let design = mockDesigns.get(id);

  // UUID formatında ama bulunamadıysa, placeholder oluştur
  if (!design && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    const now = new Date().toISOString();
    design = {
      id,
      boxId: 'gift-16',
      customDimensions: null,
      preferences: {},
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    mockDesigns.set(id, design);
    console.log(`[Auto-created design: ${id}]`);
  }

  if (!design) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Design not found' },
    });
  }
  res.json({ success: true, data: design });
});

// List designs
app.get(['/v1/designs', '/api/v1/designs'], (req, res) => {
  const designs = Array.from(mockDesigns.values());
  res.json({
    success: true,
    data: {
      items: designs,
      total: designs.length,
      limit: 20,
      offset: 0,
    },
  });
});

// Update design
app.patch(['/v1/designs/:id', '/api/v1/designs/:id'], (req, res) => {
  const design = mockDesigns.get(req.params.id);
  if (!design) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Design not found' },
    });
  }

  const updated = {
    ...design,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  mockDesigns.set(req.params.id, updated);

  res.json({
    success: true,
    data: updated,
    message: 'Design updated successfully',
  });
});

// Upload custom design
app.post(['/v1/designs/:id/upload', '/api/v1/designs/:id/upload'], upload.single('file'), (req, res) => {
  const design = mockDesigns.get(req.params.id);
  if (!design) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Design not found' },
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_FILE', message: 'No file uploaded' },
    });
  }

  // Save file locally
  const filename = `${req.params.id}-${Date.now()}-${req.file.originalname}`;
  const filepath = join(UPLOADS_DIR, filename);
  writeFileSync(filepath, req.file.buffer);

  const fileUrl = `http://localhost:${PORT}/uploads/${filename}`;

  // Update design with custom design info
  const updated = {
    ...design,
    customDesign: {
      fileName: req.file.originalname,
      fileUrl,
      fileType: req.file.mimetype.split('/')[1],
      fileSize: req.file.size,
      uploadedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };
  mockDesigns.set(req.params.id, updated);

  res.json({
    success: true,
    data: {
      design: updated,
      upload: {
        fileName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype.split('/')[1],
        fileSize: req.file.size,
      },
    },
    message: 'Custom design uploaded successfully',
  });
});

// Delete design
app.delete(['/v1/designs/:id', '/api/v1/designs/:id'], (req, res) => {
  if (!mockDesigns.has(req.params.id)) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Design not found' },
    });
  }

  mockDesigns.delete(req.params.id);
  res.json({ success: true, message: 'Design deleted successfully' });
});

// Workflows (mock)
// Support both /v1/workflows/start (with designId in body) and /v1/workflows/:designId/start
app.post(['/v1/workflows/start', '/api/v1/workflows/start'], (req, res) => {
  const { designId, type } = req.body;

  if (!designId) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'designId is required' },
    });
  }

  // Update design status to 'processing'
  if (mockDesigns.has(designId)) {
    const design = mockDesigns.get(designId);
    mockDesigns.set(designId, {
      ...design,
      status: 'processing',
      updatedAt: new Date().toISOString(),
    });
    console.log(`[Workflow] Design ${designId} status -> processing`);
  }

  // Simulate workflow completion after 5 seconds
  setTimeout(() => {
    if (mockDesigns.has(designId)) {
      const design = mockDesigns.get(designId);
      const now = new Date().toISOString();
      mockDesigns.set(designId, {
        ...design,
        status: 'completed',
        updatedAt: now,
        trendAnalysis: {
          summary: 'Mock trend analysis completed',
          completedAt: now,
        },
        visualDesign: {
          colorPalette: ['#8B7355', '#D4AF37', '#F5F5DC'],
          completedAt: now,
        },
        technicalDrawing: {
          dieLine: { svg: '<svg>mock</svg>' },
          completedAt: now,
        },
        costReport: {
          totalCost: 125.50,
          totalUnitCost: 125.50,
          materialCost: 45.20,
          printingCost: 60.30,
          laborCost: 20.00,
          breakdown: {
            paper: 25.00,
            printing: 60.30,
            assembly: 20.00,
            finishing: 20.20,
          },
          completedAt: now,
        },
      });
      console.log(`[Workflow] Design ${designId} status -> completed`);
    }
  }, 5000);

  res.json({
    success: true,
    data: {
      workflowId: randomUUID(),
      designId,
      type: type || 'full-pipeline',
      status: 'running',
      startedAt: new Date().toISOString(),
      stages: {
        trendAnalysis: { status: 'pending' },
        visualDesign: { status: 'pending' },
        technicalDrawing: { status: 'pending' },
        costAnalysis: { status: 'pending' },
      },
    },
    message: 'Workflow started (mock)',
  });
});

// Also support the old route format
app.post(['/v1/workflows/:designId/start', '/api/v1/workflows/:designId/start'], (req, res) => {
  res.json({
    success: true,
    data: {
      workflowId: randomUUID(),
      designId: req.params.designId,
      status: 'running',
      startedAt: new Date().toISOString(),
    },
    message: 'Workflow started (mock)',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: err.message },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🍫 Sade Chocolate - Development API Server               ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Server: http://localhost:${PORT}                           ║
║  Mode:   Development (Mock Data)                          ║
║                                                           ║
║  Endpoints:                                               ║
║    GET  /health              - Health check               ║
║    GET  /v1/boxes            - List box templates         ║
║    GET  /v1/boxes/:id        - Get box by ID              ║
║    POST /v1/designs          - Create design              ║
║    GET  /v1/designs          - List designs               ║
║    GET  /v1/designs/:id      - Get design by ID           ║
║    PATCH /v1/designs/:id     - Update design              ║
║    POST /v1/designs/:id/upload - Upload custom design     ║
║    DELETE /v1/designs/:id    - Delete design              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
