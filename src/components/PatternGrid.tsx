'use client';

import { useState, useRef, useEffect } from 'react';
import { CrossStitchPattern, PatternCell, Tool, DMCColor } from '@/types/pattern';

interface PatternGridProps {
  pattern: CrossStitchPattern;
  tool: Tool;
  onPatternChange: (pattern: CrossStitchPattern) => void;
  cellSize?: number;
  showGrid?: boolean;
  showSymbols?: boolean;
  showColors?: boolean;
}

export default function PatternGrid({
  pattern,
  tool,
  onPatternChange,
  cellSize = 20,
  showGrid = true,
  showSymbols = true,
  showColors = true
}: PatternGridProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawPattern();
  }, [pattern, showGrid, showSymbols, showColors, hoveredCell]);

  const drawPattern = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, cells } = pattern;
    const labelMargin = cellSize * 1.5; // margin for row/column labels

    canvas.width = width * cellSize + labelMargin;
    canvas.height = height * cellSize + labelMargin;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Offset all drawing by labelMargin
    ctx.save();
    ctx.translate(labelMargin, labelMargin);

    // Draw cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = cells[y][x];
        const xPos = x * cellSize;
        const yPos = y * cellSize;

        // Draw cell background
        if (showColors && cell.color) {
          ctx.fillStyle = cell.color.hex;
          ctx.fillRect(xPos, yPos, cellSize, cellSize);
        }

        // Draw symbol
        if (showSymbols && cell.symbol) {
          ctx.fillStyle = cell.color && !showColors ? cell.color.hex : '#000000';
          ctx.font = `${cellSize * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.symbol, xPos + cellSize / 2, yPos + cellSize / 2);
        }

        // Highlight hovered cell
        if (hoveredCell && hoveredCell.x === x && hoveredCell.y === y) {
          ctx.strokeStyle = '#3B82F6';
          ctx.lineWidth = 2;
          ctx.strokeRect(xPos, yPos, cellSize, cellSize);
        }
      }
    }

    // Draw grid
    if (showGrid) {
      // Draw regular grid lines
      ctx.strokeStyle = '#F0A0C0';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, height * cellSize);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(width * cellSize, y * cellSize);
        ctx.stroke();
      }

      // Draw bold lines every 10 cells
      ctx.strokeStyle = '#3B3B9A';
      ctx.lineWidth = 1.5;

      for (let x = 0; x <= width; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, height * cellSize);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += 10) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(width * cellSize, y * cellSize);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Draw grid count labels
    if (showGrid) {
      ctx.fillStyle = '#6B7280';
      ctx.font = `${Math.max(10, cellSize * 0.55)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      // Column labels along the top
      for (let x = 0; x <= width; x += 10) {
        ctx.fillText(String(x), labelMargin + x * cellSize, labelMargin - 4);
      }

      // Row labels along the left
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let y = 0; y <= height; y += 10) {
        ctx.fillText(String(y), labelMargin - 4, labelMargin + y * cellSize);
      }
    }
  };

  const getCellFromPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const labelMargin = cellSize * 1.5;
    const x = Math.floor((e.clientX - rect.left - labelMargin) / cellSize);
    const y = Math.floor((e.clientY - rect.top - labelMargin) / cellSize);

    if (x >= 0 && x < pattern.width && y >= 0 && y < pattern.height) {
      return { x, y };
    }
    return null;
  };

  const applyTool = (x: number, y: number) => {
    const newPattern = { ...pattern };
    const newCells = newPattern.cells.map(row => [...row]);

    switch (tool.type) {
      case 'draw':
        if (tool.color) {
          const colorIndex = newPattern.colors.findIndex(c => c.id === tool.color!.id);
          const symbol = colorIndex >= 0 ? String.fromCharCode(65 + (colorIndex % 26)) : '';
          newCells[y][x] = { x, y, color: tool.color, symbol };
        }
        break;

      case 'erase':
        newCells[y][x] = { x, y, color: null, symbol: '' };
        break;

      case 'fill':
        if (tool.color) {
          const targetColor = newCells[y][x].color;
          const fillColor = tool.color;
          
          if (targetColor?.id !== fillColor.id) {
            floodFill(newCells, x, y, targetColor, fillColor, newPattern.colors);
          }
        }
        break;

      case 'colorPicker':
        const pickedColor = newCells[y][x].color;
        if (pickedColor) {
          // This would typically update the selected tool color
          // For now, we'll just log it
          console.log('Picked color:', pickedColor);
        }
        break;
    }

    newPattern.cells = newCells;
    onPatternChange(newPattern);
  };

  const floodFill = (
    cells: PatternCell[][],
    x: number,
    y: number,
    targetColor: DMCColor | null,
    fillColor: DMCColor,
    colors: DMCColor[]
  ) => {
    if (x < 0 || x >= pattern.width || y < 0 || y >= pattern.height) return;
    if (cells[y][x].color?.id !== targetColor?.id) return;

    const colorIndex = colors.findIndex(c => c.id === fillColor.id);
    const symbol = colorIndex >= 0 ? String.fromCharCode(65 + (colorIndex % 26)) : '';
    
    cells[y][x] = { x, y, color: fillColor, symbol };

    floodFill(cells, x + 1, y, targetColor, fillColor, colors);
    floodFill(cells, x - 1, y, targetColor, fillColor, colors);
    floodFill(cells, x, y + 1, targetColor, fillColor, colors);
    floodFill(cells, x, y - 1, targetColor, fillColor, colors);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromPosition(e);
    if (cell) {
      setIsDrawing(true);
      applyTool(cell.x, cell.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromPosition(e);
    setHoveredCell(cell);

    if (isDrawing && cell && (tool.type === 'draw' || tool.type === 'erase')) {
      applyTool(cell.x, cell.y);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    setIsDrawing(false);
  };

  const labelMargin = cellSize * 1.5;
  const canvasWidth = pattern.width * cellSize + labelMargin;
  const canvasHeight = pattern.height * cellSize + labelMargin;

  return (
    <div className="overflow-auto border border-gray-300 rounded-lg" style={{ maxHeight: '70vh' }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="cursor-crosshair block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
