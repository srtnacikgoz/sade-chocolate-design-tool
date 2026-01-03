import { db } from '../config/firebase.js';
import { Workflow, WorkflowStep } from '../types/workflow.types.js';
import { WorkflowOrchestrator } from './workflowOrchestrator.js';

/**
 * Workflow Service
 *
 * Workflow CRUD işlemleri ve orkestrasyon yönetimi
 */
export const workflowService = {
  /**
   * Yeni workflow oluşturur ve başlatır
   */
  async createAndStart(
    designId: string,
    type: Workflow['type'] = 'full-pipeline'
  ): Promise<Workflow> {
    // Workflow document oluştur
    const workflowRef = db.collection('workflows').doc();
    const workflowId = workflowRef.id;

    // İlk adımları tanımla
    const steps: WorkflowStep[] = [
      {
        name: 'trend',
        displayName: 'Trend Analizi',
        status: 'pending',
        icon: '🔍',
        agentName: 'trend-analisti',
      },
      {
        name: 'visual',
        displayName: 'Görsel Tasarım',
        status: 'pending',
        icon: '🎨',
        agentName: 'gorsel-tasarimci',
      },
      {
        name: 'technical',
        displayName: 'Teknik Çizim',
        status: 'pending',
        icon: '📐',
        agentName: 'teknik-cizimci',
      },
      {
        name: 'cost',
        displayName: 'Maliyet Hesaplama',
        status: 'pending',
        icon: '💰',
        agentName: 'maliyet-uzmani',
      },
    ];

    const workflow: Workflow = {
      id: workflowId,
      designId,
      type,
      steps,
      currentStep: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Firestore'a kaydet
    await workflowRef.set(workflow);

    // Design'ın workflowId'sini güncelle
    await db.collection('designs').doc(designId).update({
      workflowId: workflowId,
      status: 'processing',
      updatedAt: new Date(),
    });

    // Orkestratörü başlat (asenkron, arka planda çalışacak)
    this.startOrchestrator(workflowId, designId).catch((error) => {
      console.error(`[Workflow ${workflowId}] Orkestratör hatası:`, error);
    });

    return workflow;
  },

  /**
   * Workflow orkestratörünü başlatır
   */
  async startOrchestrator(workflowId: string, designId: string): Promise<void> {
    const orchestrator = new WorkflowOrchestrator(workflowId, designId);
    await orchestrator.start();
  },

  /**
   * Workflow'u ID'ye göre getirir
   */
  async getById(workflowId: string): Promise<Workflow | null> {
    const doc = await db.collection('workflows').doc(workflowId).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as Workflow;
  },

  /**
   * Design'a ait workflow'u getirir
   */
  async getByDesignId(designId: string): Promise<Workflow | null> {
    const snapshot = await db
      .collection('workflows')
      .where('designId', '==', designId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Workflow;
  },

  /**
   * Tüm workflow'ları listeler
   */
  async list(
    filters?: {
      status?: Workflow['status'];
      designId?: string;
    },
    limit: number = 50
  ): Promise<Workflow[]> {
    let query: any = db.collection('workflows');

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.designId) {
      query = query.where('designId', '==', filters.designId);
    }

    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Workflow[];
  },

  /**
   * Workflow'u günceller
   */
  async update(workflowId: string, updates: Partial<Workflow>): Promise<Workflow> {
    const workflowRef = db.collection('workflows').doc(workflowId);

    await workflowRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    const updated = await workflowRef.get();
    return {
      id: updated.id,
      ...updated.data(),
    } as Workflow;
  },

  /**
   * Workflow'u durdurur (pause)
   */
  async pause(workflowId: string): Promise<void> {
    await db.collection('workflows').doc(workflowId).update({
      status: 'paused',
      updatedAt: new Date(),
    });
  },

  /**
   * Workflow'u yeniden başlatır (resume)
   */
  async resume(workflowId: string): Promise<void> {
    const workflow = await this.getById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Durdurulan yerden devam et
    this.startOrchestrator(workflowId, workflow.designId).catch((error) => {
      console.error(`[Workflow ${workflowId}] Resume hatası:`, error);
    });
  },

  /**
   * Workflow'u siler
   */
  async delete(workflowId: string): Promise<void> {
    await db.collection('workflows').doc(workflowId).delete();
  },
};
