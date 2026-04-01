'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CrossStitchPattern, PatternCell, Tool, DMCColor } from '@/types/pattern';
import ZoomControls from './ZoomControls';

interface EditorCanvasProps {
  pattern: CrossStitchPattern;
  tool: Tool;
  onPatternChange: (pattern: CrossStitchPattern) => void;
  showGrid: boolean;
  showSymbols: boolean;
  showColors: boolean;
}

export default function EditorCanvas({
  pattern,
  tool,
  onPatternChange,
  showGrid,
  showSymbols,
  showColors,
}: EditorCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const baseCellSize = 15;
  const cellSize = baseCellSize * zoom;
  const labelMargin = cellSize * 1.5;

  const drawPattern = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, cells } = pattern;

    canvas.width = width * cellSize + labelMargin;
    canvas.height = height * cellSize + labelMargin;

    // Clear canvas
    ctx.fillStyle = '#FFFDFB';
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
          ctx.fillStyle = cell.color && !showColors ? cell.color.hex : '#3D3D3D';
          ctx.font = `${cellSize * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.symbol, xPos + cellSize / 2, yPos + cellSize / 2);
        }

        // Highlight hovered cell
        if (hoveredCell && hoveredCell.x === x && hoveredCell.y === y) {
          ctx.strokeStyle = '#E8B4B8';
          ctx.lineWidth = 2;
          ctx.strokeRect(xPos + 1, yPos + 1, cellSize - 2, cellSize - 2);
        }
      }
    }

    // Draw grid
    if (showGrid) {
      // Regular grid lines
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

      // Bold lines every 10 cells
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
      ctx.fillStyle = '#6B6360';
      ctx.font = `${Math.max(10, cellSize * 0.55)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      for (let x = 0; x <= width; x += 10) {
        ctx.fillText(String(x), labelMargin + x * cellSize, labelMargin - 4);
      }

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let y = 0; y <= height; y += 10) {
        ctx.fillText(String(y), labelMargin - 4, labelMargin + y * cellSize);
      }
    }
  }, [pattern, showGrid, showSymbols, showColors, hoveredCell, cellSize, labelMargin]);

  useEffect(() => {
    drawPattern();
  }, [drawPattern]);

  const getCellFromPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - labelMargin) / cellSize);
    const y = Math.floor((e.clientY - rect.top - labelMargin) / cellSize);

    if (x >= 0 && x < pattern.width && y >= 0 && y < pattern.height) {
      return { x, y };
    }
    return null;
  };

  const applyTool = (x: number, y: number) => {
    const newPattern = { ...pattern };
    const newCells = newPattern.cells.map((row) => [...row]);

    switch (tool.type) {
      case 'draw':
        if (tool.color) {
          const colorIndex = newPattern.colors.findIndex((c) => c.id === tool.color!.id);
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
        // Handled in parent
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

    const colorIndex = colors.findIndex((c) => c.id === fillColor.id);
    const symbol = colorIndex >= 0 ? String.fromCharCode(65 + (colorIndex % 26)) : '';

    cells[y][x] = { x, y, color: fillColor, symbol };

    floodFill(cells, x + 1, y, targetColor, fillColor, colors);
    floodFill(cells, x - 1, y, targetColor, fillColor, colors);
    floodFill(cells, x, y + 1, targetColor, fillColor, colors);
    floodFill(cells, x, y - 1, targetColor, fillColor, colors);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle mouse button or space+click for panning
    if (e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const cell = getCellFromPosition(e);
    if (cell) {
      setIsDrawing(true);
      applyTool(cell.x, cell.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const cell = getCellFromPosition(e);
    setHoveredCell(cell);

    if (isDrawing && cell && (tool.type === 'draw' || tool.type === 'erase')) {
      applyTool(cell.x, cell.y);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    setIsDrawing(false);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.2, Math.min(5, prev + delta)));
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(5, prev + 0.25));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.2, prev - 0.25));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleZoomFit = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 80;
    const patternWidth = pattern.width * baseCellSize + baseCellSize * 1.5;
    const patternHeight = pattern.height * baseCellSize + baseCellSize * 1.5;

    const fitZoom = Math.min(
      containerWidth / patternWidth,
      containerHeight / patternHeight,
      3
    );
    setZoom(Math.max(0.2, fitZoom));
    setPan({ x: 0, y: 0 });
  };

  const canvasWidth = pattern.width * cellSize + labelMargin;
  const canvasHeight = pattern.height * cellSize + labelMargin;

  return (
    <div ref={containerRef} className="flex-1 flex flex-col relative overflow-hidden bg-warm-white">
      {/* Canvas area */}
      <div
        className="flex-1 overflow-auto"
        style={{
          cursor: isPanning ? 'grabbing' : 'crosshair',
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            padding: '20px',
            display: 'inline-block',
            minWidth: '100%',
            minHeight: '100%',
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="block shadow-sm rounded-lg"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          />
        </div>
      </div>

      {/* Zoom controls - floating bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <ZoomControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomFit={handleZoomFit}
          onZoomReset={handleZoomReset}
        />
      </div>

      {/* Hovered cell info - floating top right */}
      {hoveredCell && (
        <div className="absolute top-3 right-3 bg-linen/90 backdrop-blur-sm border border-rose-light rounded-lg px-3 py-1.5 text-xs text-charcoal shadow-sm">
          Cell: ({hoveredCell.x}, {hoveredCell.y})
          {pattern.cells[hoveredCell.y]?.[hoveredCell.x]?.color && (
            <span className="ml-2 text-warm-gray">
              {pattern.cells[hoveredCell.y][hoveredCell.x].color?.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
