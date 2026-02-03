import { CrossStitchPattern } from '@/types/pattern';
import jsPDF from 'jspdf';

export class PatternExporter {
  static exportAsImage(pattern: CrossStitchPattern, cellSize: number = 20): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = pattern.width * cellSize;
    canvas.height = pattern.height * cellSize;

    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pattern
    for (let y = 0; y < pattern.height; y++) {
      for (let x = 0; x < pattern.width; x++) {
        const cell = pattern.cells[y][x];
        const xPos = x * cellSize;
        const yPos = y * cellSize;

        // Draw cell background
        if (cell.color) {
          ctx.fillStyle = cell.color.hex;
          ctx.fillRect(xPos, yPos, cellSize, cellSize);
        }

        // Draw symbol
        if (cell.symbol) {
          ctx.fillStyle = cell.color ? this.getContrastColor(cell.color.hex) : '#000000';
          ctx.font = `${cellSize * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.symbol, xPos + cellSize / 2, yPos + cellSize / 2);
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= pattern.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, pattern.height * cellSize);
      ctx.stroke();
    }
    
    for (let y = 0; y <= pattern.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(pattern.width * cellSize, y * cellSize);
      ctx.stroke();
    }

    // Download image
    const link = document.createElement('a');
    link.download = `${pattern.title || 'pattern'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  static exportAsPDF(pattern: CrossStitchPattern): void {
    const pdf = new jsPDF();
    const cellSize = 10; // Smaller for PDF
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    
    // Add title page
    pdf.setFontSize(16);
    pdf.text(pattern.title || 'Cross Stitch Pattern', margin, 20);
    
    // Add pattern info
    pdf.setFontSize(10);
    pdf.text(`Size: ${pattern.width} x ${pattern.height} stitches`, margin, 30);
    pdf.text(`Cloth count: ${pattern.clothCount}`, margin, 37);
    pdf.text(`Colors: ${pattern.colors.length}`, margin, 44);

    // Calculate available area for pattern on each page
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    
    // Calculate how many cells fit per page
    const cellsPerPageX = Math.floor(availableWidth / cellSize);
    const cellsPerPageY = Math.floor(availableHeight / cellSize);
    
    // Calculate how many pages needed
    const pagesX = Math.ceil(pattern.width / cellsPerPageX);
    const pagesY = Math.ceil(pattern.height / cellsPerPageY);
    
    // Draw pattern pages
    for (let pageY = 0; pageY < pagesY; pageY++) {
      for (let pageX = 0; pageX < pagesX; pageX++) {
        pdf.addPage();
        
        // Add page header with coordinates
        pdf.setFontSize(10);
        pdf.setTextColor('#000000');
        pdf.text(
          `Pattern section (${pageX + 1}, ${pageY + 1}) of (${pagesX}, ${pagesY})`,
          margin,
          margin - 5
        );
        
        // Calculate which cells to draw on this page
        const startCellX = pageX * cellsPerPageX;
        const startCellY = pageY * cellsPerPageY;
        const endCellX = Math.min(startCellX + cellsPerPageX, pattern.width);
        const endCellY = Math.min(startCellY + cellsPerPageY, pattern.height);
        
        // Draw cells for this page section
        this.drawPatternSectionOnPDF(
          pdf,
          pattern,
          margin,
          margin,
          cellSize,
          startCellX,
          startCellY,
          endCellX,
          endCellY
        );
      }
    }

    // Add color legend on new page
    pdf.addPage();
    this.drawColorLegendOnPDF(pdf, pattern, margin, 20);

    // Download PDF
    pdf.save(`${pattern.title || 'pattern'}.pdf`);
  }

  private static drawPatternSectionOnPDF(
    pdf: jsPDF,
    pattern: CrossStitchPattern,
    startX: number,
    startY: number,
    cellSize: number,
    startCellX: number,
    startCellY: number,
    endCellX: number,
    endCellY: number
  ): void {
    for (let y = startCellY; y < endCellY; y++) {
      for (let x = startCellX; x < endCellX; x++) {
        const cell = pattern.cells[y][x];
        const xPos = startX + (x - startCellX) * cellSize;
        const yPos = startY + (y - startCellY) * cellSize;

        // Draw cell background
        if (cell.color) {
          pdf.setFillColor(cell.color.hex);
          pdf.rect(xPos, yPos, cellSize, cellSize, 'F');
        }

        // Draw symbol
        if (cell.symbol) {
          pdf.setTextColor(cell.color ? this.getContrastColor(cell.color.hex) : '#000000');
          pdf.setFontSize(8);
          pdf.text(cell.symbol, xPos + cellSize / 2, yPos + cellSize / 2 + 2, { align: 'center' });
        }

        // Draw grid
        pdf.setDrawColor('#E5E7EB');
        pdf.rect(xPos, yPos, cellSize, cellSize);
      }
    }
  }

  private static drawColorLegendOnPDF(
    pdf: jsPDF,
    pattern: CrossStitchPattern,
    startX: number,
    startY: number
  ): void {
    pdf.setFontSize(14);
    pdf.text('Color Legend', startX, startY);

    let currentY = startY + 15;
    
    for (const color of pattern.colors) {
      // Draw color box
      pdf.setFillColor(color.hex);
      pdf.rect(startX, currentY, 10, 10, 'F');
      
      // Draw color info
      pdf.setTextColor('#000000');
      pdf.setFontSize(10);
      pdf.text(`DMC-${color.id} - ${color.name}`, startX + 15, currentY + 7);
      
      currentY += 15;
      
      // Add new page if needed
      if (currentY > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        currentY = 20;
      }
    }
  }

  private static getContrastColor(hexColor: string): string {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  static exportAsJSON(pattern: CrossStitchPattern): void {
    const dataStr = JSON.stringify(pattern, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.download = `${pattern.title || 'pattern'}.json`;
    link.href = URL.createObjectURL(dataBlob);
    link.click();
  }

  static importFromJSON(file: File): Promise<CrossStitchPattern> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const pattern = JSON.parse(e.target?.result as string);
          resolve(pattern);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
