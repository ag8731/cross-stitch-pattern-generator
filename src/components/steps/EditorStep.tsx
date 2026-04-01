'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CrossStitchPattern, Tool, DMCColor } from '@/types/pattern';
import EditorToolbar from '@/components/editor/EditorToolbar';
import EditorCanvas from '@/components/editor/EditorCanvas';
import EditorColorPanel from '@/components/editor/EditorColorPanel';
import Button from '@/components/ui/Button';

interface EditorStepProps {
  pattern: CrossStitchPattern;
  onPatternChange: (pattern: CrossStitchPattern) => void;
  onExport: () => void;
  onBack: () => void;
}

export default function EditorStep({
  pattern,
  onPatternChange,
  onExport,
  onBack,
}: EditorStepProps) {
  const [selectedTool, setSelectedTool] = useState<Tool>({ type: 'draw', size: 1 });
  const [selectedColor, setSelectedColor] = useState<DMCColor | null>(
    pattern.colors[0] || null
  );
  const [showGrid, setShowGrid] = useState(true);
  const [showSymbols, setShowSymbols] = useState(true);
  const [showColors, setShowColors] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'd':
          setSelectedTool((prev) => ({ ...prev, type: 'draw' }));
          break;
        case 'e':
          setSelectedTool((prev) => ({ ...prev, type: 'erase' }));
          break;
        case 'f':
          setSelectedTool((prev) => ({ ...prev, type: 'fill' }));
          break;
        case 'p':
          setSelectedTool((prev) => ({ ...prev, type: 'colorPicker' }));
          break;
        case 'g':
          setShowGrid((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-[calc(100vh-180px)]"
    >
      {/* Editor header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-linen border-b border-rose-light/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Settings
          </Button>
          <div className="text-sm text-warm-gray">
            <span className="font-medium text-charcoal">{pattern.title || 'Untitled Pattern'}</span>
            <span className="mx-2">·</span>
            <span>{pattern.width} × {pattern.height}</span>
            <span className="mx-2">·</span>
            <span>{pattern.colors.length} colors</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onExport} icon={<span>📤</span>}>
            Export
          </Button>
        </div>
      </div>

      {/* Editor body - toolbar | canvas | color panel */}
      <div className="flex flex-1 overflow-hidden">
        <EditorToolbar
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          showGrid={showGrid}
          showSymbols={showSymbols}
          showColors={showColors}
          onToggleGrid={() => setShowGrid((prev) => !prev)}
          onToggleSymbols={() => setShowSymbols((prev) => !prev)}
          onToggleColors={() => setShowColors((prev) => !prev)}
        />

        <EditorCanvas
          pattern={pattern}
          tool={{ ...selectedTool, color: selectedColor }}
          onPatternChange={onPatternChange}
          showGrid={showGrid}
          showSymbols={showSymbols}
          showColors={showColors}
        />

        <EditorColorPanel
          colors={pattern.colors}
          pattern={pattern}
        />
      </div>
    </motion.div>
  );
}
