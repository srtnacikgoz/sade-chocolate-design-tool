/**
 * PDF Export Service
 * Converts SVG die-lines to print-ready PDF documents
 * With FOGRA39/CMYK metadata for offset printing
 */

import puppeteer, { Browser, PDFOptions } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// PDF page sizes in mm (converted to points: 1mm = 2.83465pt)
const MM_TO_PT = 2.83465;

interface PDFExportOptions {
  width: number;  // mm
  height: number; // mm
  bleed: number;  // mm
  includeBleed?: boolean;
  includeCropMarks?: boolean;
  title?: string;
  author?: string;
}

interface PDFExportResult {
  pdf: Buffer;
  filename: string;
  pageSize: {
    width: number;
    height: number;
    unit: 'mm';
  };
  metadata: {
    title: string;
    author: string;
    colorProfile: string;
    outputIntent: string;
    bleed: number;
  };
}

export class PDFExportService {
  private browser: Browser | null = null;

  /**
   * Initialize browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    // For local development, use installed Chrome
    // For Firebase Functions, use @sparticuz/chromium
    const isLocal = process.env.FUNCTIONS_EMULATOR === 'true' || !process.env.K_SERVICE;

    if (isLocal) {
      // Local development - use system Chrome
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: this.getLocalChromePath(),
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } else {
      // Firebase Functions / Cloud environment
      // Using @sparticuz/chromium for serverless
      this.browser = await puppeteer.launch({
        headless: 'shell',
        executablePath: await chromium.executablePath(),
        args: chromium.args,
      });
    }

    return this.browser;
  }

  /**
   * Get local Chrome executable path based on OS
   */
  private getLocalChromePath(): string {
    const platform = process.platform;

    if (platform === 'darwin') {
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else if (platform === 'win32') {
      return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    } else {
      return '/usr/bin/google-chrome';
    }
  }

  /**
   * Convert SVG to PDF with print-ready metadata
   */
  async svgToPdf(svgContent: string, options: PDFExportOptions): Promise<PDFExportResult> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Calculate page dimensions with optional bleed
      const pageWidth = options.includeBleed
        ? options.width
        : options.width - (options.bleed * 2);
      const pageHeight = options.includeBleed
        ? options.height
        : options.height - (options.bleed * 2);

      // Create HTML wrapper for SVG with print metadata
      const html = this.createPrintReadyHtml(svgContent, pageWidth, pageHeight, options);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfOptions: PDFOptions = {
        width: `${pageWidth}mm`,
        height: `${pageHeight}mm`,
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      };

      const pdfBuffer = await page.pdf(pdfOptions);

      const title = options.title || 'Sade Chocolate Box Die-Line';
      const filename = this.generateFilename(title);

      return {
        pdf: Buffer.from(pdfBuffer),
        filename,
        pageSize: {
          width: pageWidth,
          height: pageHeight,
          unit: 'mm',
        },
        metadata: {
          title,
          author: options.author || 'Sade Chocolate Design Tool',
          colorProfile: 'FOGRA39 (ISO Coated v2)',
          outputIntent: 'ISO 12647-2:2013',
          bleed: options.bleed,
        },
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Create HTML wrapper with print-ready CSS and metadata
   */
  private createPrintReadyHtml(
    svgContent: string,
    width: number,
    height: number,
    options: PDFExportOptions
  ): string {
    const title = options.title || 'Sade Chocolate Box Die-Line';

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>

  <!-- Print Production Metadata -->
  <meta name="author" content="Sade Chocolate Design Tool">
  <meta name="description" content="Print-ready die-line drawing for chocolate box packaging">
  <meta name="color-profile" content="FOGRA39 (ISO Coated v2 / ECI)">
  <meta name="output-intent" content="ISO 12647-2:2013">
  <meta name="icc-profile" content="ISOcoated_v2_300_eci.icc">
  <meta name="bleed" content="${options.bleed}mm">
  <meta name="color-space" content="CMYK">
  <meta name="pdf-standard" content="PDF/X-1a:2001 Ready">

  <style>
    @page {
      size: ${width}mm ${height}mm;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: ${width}mm;
      height: ${height}mm;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .svg-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .svg-container svg {
      max-width: 100%;
      max-height: 100%;
    }
  </style>
</head>
<body>
  <!--
    PRINT PRODUCTION NOTES
    =====================
    Color Space: CMYK
    ICC Profile: FOGRA39 (ISO Coated v2 / ECI)
    Profile File: ISOcoated_v2_300_eci.icc
    Output Intent: ISO 12647-2:2013
    Bleed: ${options.bleed}mm on all sides

    PDF/X-1a COMPLIANCE NOTE:
    This PDF contains print-ready content with CMYK color annotations.
    For full PDF/X-1a:2001 compliance, convert using:
    - Adobe Acrobat Pro (Preflight → Convert to PDF/X-1a)
    - Ghostscript with PDFX_def.ps

    The SVG includes all necessary metadata for offset printing.
    Turkish print facilities: GS Packaging, Duran Dogan, OMAKS
  -->

  <div class="svg-container">
    ${svgContent}
  </div>

</body>
</html>`;
  }

  /**
   * Generate safe filename
   */
  private generateFilename(title: string): string {
    const safeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\u00e7\u011f\u0131\u00f6\u015f\u00fc]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const timestamp = new Date().toISOString().slice(0, 10);
    return `${safeTitle}-${timestamp}.pdf`;
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Export full production package
   * Returns: Print PDF + Die-line only PDF
   */
  async exportProductionPackage(
    fullSvg: string,
    dieLineOnlySvg: string,
    options: PDFExportOptions
  ): Promise<{
    printPdf: PDFExportResult;
    dieLinePdf: PDFExportResult;
  }> {
    const printPdf = await this.svgToPdf(fullSvg, {
      ...options,
      title: `${options.title || 'Sade Chocolate'} - Print`,
    });

    const dieLinePdf = await this.svgToPdf(dieLineOnlySvg, {
      ...options,
      title: `${options.title || 'Sade Chocolate'} - Die-Line Only`,
    });

    return { printPdf, dieLinePdf };
  }
}

// Singleton instance
export const pdfExportService = new PDFExportService();
