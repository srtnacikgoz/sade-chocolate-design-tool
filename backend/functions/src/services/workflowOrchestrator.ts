import { db } from '../config/firebase';
import { Workflow, WorkflowStep } from '../types/workflow.types';
import { Design } from '../types/design.types';

/**
 * Workflow Orchestrator
 *
 * AI ajanlarını sırayla çalıştırır ve sonuçları Firestore'a kaydeder.
 * Checkpoint sistemi sayesinde hata durumunda kaldığı yerden devam edebilir.
 */
export class WorkflowOrchestrator {
  private workflowId: string;
  private designId: string;

  constructor(workflowId: string, designId: string) {
    this.workflowId = workflowId;
    this.designId = designId;
  }

  /**
   * Workflow başlatır ve tüm adımları sırayla çalıştırır
   */
  async start(): Promise<void> {
    try {
      console.log(`[Workflow ${this.workflowId}] Başlatılıyor...`);

      // Workflow'u running olarak işaretle
      await this.updateWorkflowStatus('running');

      // Design bilgilerini al
      const design = await this.getDesign();
      console.log(`[Workflow ${this.workflowId}] Design yüklendi: ${design.boxId}`);

      // Adımları sırayla çalıştır
      const steps: WorkflowStep['name'][] = ['trend', 'visual', 'technical', 'cost'];

      for (const stepName of steps) {
        await this.executeStep(stepName, design);
      }

      // Tüm adımlar tamamlandı
      await this.updateWorkflowStatus('completed');
      await this.updateDesignStatus('completed');

      console.log(`[Workflow ${this.workflowId}] ✅ Tamamlandı`);
    } catch (error) {
      console.error(`[Workflow ${this.workflowId}] ❌ Hata:`, error);
      await this.updateWorkflowStatus('failed', error as Error);
      await this.updateDesignStatus('failed');
      throw error;
    }
  }

  /**
   * Belirli bir adımı çalıştırır
   */
  private async executeStep(stepName: WorkflowStep['name'], design: Design): Promise<void> {
    console.log(`[Workflow ${this.workflowId}] 🔄 ${stepName} adımı başlıyor...`);

    // Step'i running olarak işaretle
    await this.updateStepStatus(stepName, 'running');

    try {
      let output: any;

      // Her adım için ilgili ajanı çalıştır
      switch (stepName) {
        case 'trend':
          output = await this.executeTrendAgent(design);
          await this.saveTrendAnalysis(output);
          break;

        case 'visual':
          output = await this.executeVisualAgent(design);
          await this.saveVisualDesign(output);
          break;

        case 'technical':
          output = await this.executeTechnicalAgent(design);
          await this.saveTechnicalDrawing(output);
          break;

        case 'cost':
          output = await this.executeCostAgent(design);
          await this.saveCostReport(output);
          break;
      }

      // Step'i completed olarak işaretle
      await this.updateStepStatus(stepName, 'completed', output);

      console.log(`[Workflow ${this.workflowId}] ✅ ${stepName} adımı tamamlandı`);
    } catch (error) {
      console.error(`[Workflow ${this.workflowId}] ❌ ${stepName} adımı başarısız:`, error);
      await this.updateStepStatus(stepName, 'failed', undefined, (error as Error).message);
      throw error;
    }
  }

  /**
   * Trend Analizi Ajanını Çalıştırır
   */
  private async executeTrendAgent(design: Design): Promise<any> {
    // TODO: Gerçek ajan entegrasyonu
    // MVP için simüle edilmiş sonuç dönüyoruz
    console.log('[Trend Agent] Pazar analizi yapılıyor...');

    // Simülasyon: 2 saniye bekle
    await this.delay(2000);

    return {
      summary: 'Lüks çikolata ambalaj trendleri 2025 için minimalist ve sürdürülebilir malzemeler öne çıkıyor.',
      visualReferences: [
        'https://example.com/ladurée-spring-2025',
        'https://example.com/pierre-marcolini-eco-line',
      ],
      recommendations: [
        'Pastel tonlar kullanımı',
        'Altın varak detaylar',
        'Minimalist tipografi',
        'Doğal doku hissiyatı',
      ],
      completedAt: new Date(),
    };
  }

  /**
   * Görsel Tasarım Ajanını Çalıştırır
   */
  private async executeVisualAgent(design: Design): Promise<any> {
    // TODO: Gerçek ajan entegrasyonu
    console.log('[Visual Agent] Renk paleti ve görsel öğeler oluşturuluyor...');

    await this.delay(2000);

    return {
      colorPalette: {
        name: 'Sade Romance',
        colors: [
          { hex: '#f3d1c8', name: 'Peach Blossom', role: 'primary', cmyk: { c: 0, m: 14, y: 18, k: 5 } },
          { hex: '#e7c57d', name: 'Golden Sand', role: 'accent', cmyk: { c: 0, m: 15, y: 46, k: 9 } },
          { hex: '#a4d4bc', name: 'Mint Fresh', role: 'neutral', cmyk: { c: 36, m: 0, y: 22, k: 17 } },
          { hex: '#d4a945', name: 'Gold Foil', role: 'foil', pantone: '871C' },
        ],
      },
      logoPlacement: {
        position: 'center',
        size: { width: 60, height: 40 },
      },
      typography: {
        primaryFont: 'Didot',
        hierarchy: {
          heading: { font: 'Didot', size: 24, weight: 400 },
          body: { font: 'Futura', size: 10, weight: 300 },
        },
      },
      goldFoilAreas: [
        {
          id: 'logo-foil',
          type: 'logo',
          foilColor: 'gold',
          coordinates: { x: 125, y: 100 },
          dimensions: { width: 60, height: 40 },
          technique: 'hot-foil',
        },
      ],
      completedAt: new Date(),
    };
  }

  /**
   * Teknik Çizim Ajanını Çalıştırır
   */
  private async executeTechnicalAgent(design: Design): Promise<any> {
    // TODO: Gerçek ajan entegrasyonu + SVG Generator Skill
    console.log('[Technical Agent] Die-line SVG üretiliyor...');

    await this.delay(3000);

    return {
      svgUrl: 'https://storage.googleapis.com/sade-chocolate.appspot.com/designs/placeholder.svg',
      svgContent: '<svg>...</svg>', // Placeholder
      dieLineData: {
        cutPath: 'M0,0 L250,0 L250,200 L0,200 Z',
        dimensions: {
          flatWidth: 500,
          flatHeight: 300,
        },
      },
      foldLines: [
        {
          id: 'fold-1',
          start: { x: 125, y: 0 },
          end: { x: 125, y: 200 },
          type: 'valley',
        },
      ],
      bleedArea: 3,
      completedAt: new Date(),
    };
  }

  /**
   * Maliyet Hesaplama Ajanını Çalıştırır
   */
  private async executeCostAgent(design: Design): Promise<any> {
    // TODO: Gerçek ajan entegrasyonu + Google Sheets MCP
    console.log('[Cost Agent] Maliyet hesaplaması yapılıyor...');

    await this.delay(1000);

    return {
      breakdown: {
        material: 12.50,
        printing: 8.75,
        labor: 5.00,
        logistics: 3.25,
        overhead: 2.50,
        total: 32.00,
        currency: 'TRY',
      },
      totalUnitCost: 32.00,
      recommendedPrice: 85.00,
      scenarios: [
        { quantity: 500, unitCost: 35.00, totalCost: 17500 },
        { quantity: 1000, unitCost: 32.00, totalCost: 32000, savingsPercent: 8.6 },
        { quantity: 5000, unitCost: 28.50, totalCost: 142500, savingsPercent: 18.6 },
      ],
      completedAt: new Date(),
    };
  }

  /**
   * Sonuçları Firestore'a kaydeder
   */
  private async saveTrendAnalysis(data: any): Promise<void> {
    await db.collection('designs').doc(this.designId).update({
      trendAnalysis: data,
      status: 'processing',
      updatedAt: new Date(),
    });
  }

  private async saveVisualDesign(data: any): Promise<void> {
    await db.collection('designs').doc(this.designId).update({
      visualDesign: data,
      updatedAt: new Date(),
    });
  }

  private async saveTechnicalDrawing(data: any): Promise<void> {
    await db.collection('designs').doc(this.designId).update({
      technicalDrawing: data,
      updatedAt: new Date(),
    });
  }

  private async saveCostReport(data: any): Promise<void> {
    await db.collection('designs').doc(this.designId).update({
      costReport: data,
      updatedAt: new Date(),
    });
  }

  /**
   * Yardımcı metodlar
   */
  private async getDesign(): Promise<Design> {
    const doc = await db.collection('designs').doc(this.designId).get();
    if (!doc.exists) {
      throw new Error(`Design not found: ${this.designId}`);
    }
    return doc.data() as Design;
  }

  private async updateWorkflowStatus(
    status: Workflow['status'],
    error?: Error
  ): Promise<void> {
    const update: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'running') {
      update.startedAt = new Date();
    }

    if (status === 'completed' || status === 'failed') {
      update.completedAt = new Date();
    }

    if (error) {
      update.error = {
        message: error.message,
        timestamp: new Date(),
      };
    }

    await db.collection('workflows').doc(this.workflowId).update(update);
  }

  private async updateStepStatus(
    stepName: WorkflowStep['name'],
    status: WorkflowStep['status'],
    output?: any,
    errorMessage?: string
  ): Promise<void> {
    const workflow = await db.collection('workflows').doc(this.workflowId).get();
    const workflowData = workflow.data() as Workflow;

    const steps = workflowData.steps.map((step) => {
      if (step.name === stepName) {
        const updated: WorkflowStep = {
          ...step,
          status,
        };

        if (status === 'running') {
          updated.startedAt = new Date();
        }

        if (status === 'completed') {
          updated.completedAt = new Date();
          updated.output = output;
        }

        if (status === 'failed' && errorMessage) {
          updated.error = errorMessage;
        }

        return updated;
      }
      return step;
    });

    await db.collection('workflows').doc(this.workflowId).update({
      steps,
      updatedAt: new Date(),
    });
  }

  private async updateDesignStatus(status: Design['status']): Promise<void> {
    await db.collection('designs').doc(this.designId).update({
      status,
      updatedAt: new Date(),
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
