import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';

export async function exportToPdf(svgElement: SVGSVGElement, filename: string) {
    // Create a new PDF document
    // Orientation: portrait, Unit: mm, Format: a4
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // Add Metadata
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text('Sade Chocolate - Technical Drawing', 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);

    // Get SVG dimensions
    const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 100, 100];
    const width = viewBox[2];
    const height = viewBox[3];

    // Render SVG to PDF
    // We place it at x=20, y=40
    await svg2pdf(svgElement, doc, {
        x: 20,
        y: 40,
        width: width,
        height: height,
    });

    // Save the PDF
    doc.save(filename);
}
