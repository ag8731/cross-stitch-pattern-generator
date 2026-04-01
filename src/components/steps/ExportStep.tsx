'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrossStitchPattern } from '@/types/pattern';
import { PatternExporter } from '@/utils/exportUtils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface ExportStepProps {
  pattern: CrossStitchPattern;
  onBack: () => void;
  onNewPattern: () => void;
}

export default function ExportStep({ pattern, onBack, onNewPattern }: ExportStepProps) {
  const { showToast } = useToast();
  const [hoveredColorId, setHoveredColorId] = useState<string | null>(null);

  const totalStitches = pattern.cells.flat().filter((cell) => cell.color).length;
  const estimatedSkeins = pattern.colors.reduce((total, color) => {
    let count = 0;
    for (const row of pattern.cells) {
      for (const cell of row) {
        if (cell.color?.id === color.id) count++;
      }
    }
    return total + Math.max(1, Math.ceil(count / 2000));
  }, 0);

  const handleExportImage = () => {
    try {
      PatternExporter.exportAsImage(pattern, 20);
      showToast('Pattern exported as PNG!', 'success');
    } catch {
      showToast('Failed to export image', 'error');
    }
  };

  const handleExportPDF = () => {
    try {
      PatternExporter.exportAsPDF(pattern);
      showToast('Pattern exported as PDF!', 'success');
    } catch {
      showToast('Failed to export PDF', 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      PatternExporter.exportAsJSON(pattern);
      showToast('Pattern saved as JSON!', 'success');
    } catch {
      showToast('Failed to export JSON', 'error');
    }
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await PatternExporter.importFromJSON(file);
          showToast('Pattern imported successfully!', 'success');
        } catch {
          showToast('Error importing pattern. Check the file format.', 'error');
        }
      }
    };
    input.click();
  };

  const exportFormats = [
    {
      id: 'image',
      icon: '🖼️',
      title: 'PNG Image',
      description: 'High-resolution image with grid and symbols. Perfect for digital viewing.',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      action: handleExportImage,
    },
    {
      id: 'pdf',
      icon: '📄',
      title: 'PDF Document',
      description: 'Printable pattern with color legend and stitch counts. Ready for crafting.',
      color: 'bg-red-50 border-red-200 hover:border-red-400',
      action: handleExportPDF,
    },
    {
      id: 'json',
      icon: '💾',
      title: 'Save Project',
      description: 'Save your pattern as JSON to continue editing later.',
      color: 'bg-green-50 border-green-200 hover:border-green-400',
      action: handleExportJSON,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl text-charcoal mb-2">
          Export Your Pattern
        </h2>
        <p className="text-warm-gray">
          Choose a format to save or share your cross stitch pattern
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pattern Summary */}
        <Card padding="md" className="lg:col-span-1">
          <h3 className="font-serif text-lg text-charcoal mb-4">
            Pattern Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-warm-gray">Title</span>
              <span className="font-medium text-charcoal">
                {pattern.title || 'Untitled'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-gray">Dimensions</span>
              <span className="font-medium text-charcoal">
                {pattern.width} × {pattern.height}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-gray">Cloth Count</span>
              <span className="font-medium text-charcoal">
                {pattern.clothCount}-count
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-gray">Colors</span>
              <span className="font-medium text-charcoal">
                {pattern.colors.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-gray">Total Stitches</span>
              <span className="font-medium text-charcoal">
                {totalStitches.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-gray">Est. Skeins</span>
              <span className="font-medium text-charcoal">{estimatedSkeins}</span>
            </div>

            <div className="pt-3 border-t border-rose-light/50">
              <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                Physical Size
              </h4>
              <p className="text-sm text-charcoal">
                {((pattern.width / pattern.clothCount) * 2.54).toFixed(1)} cm ×{' '}
                {((pattern.height / pattern.clothCount) * 2.54).toFixed(1)} cm
              </p>
            </div>

            {/* Color swatches */}
            <div className="pt-3 border-t border-rose-light/50">
              <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                Colors Used
              </h4>
              <div className="flex flex-wrap gap-1">
                {pattern.colors.map((color) => (
                  <div
                    key={color.id}
                    className="relative"
                    onMouseEnter={() => setHoveredColorId(color.id)}
                    onMouseLeave={() => setHoveredColorId(null)}
                  >
                    <div
                      className="w-6 h-6 rounded-md border border-rose-light/50 cursor-pointer transition-transform hover:scale-125 hover:z-10"
                      style={{ backgroundColor: color.hex }}
                    />
                    <AnimatePresence>
                      {hoveredColorId === color.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                        >
                          <div className="bg-charcoal text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                            <div className="font-semibold">{color.name}</div>
                            <div className="text-white/70">DMC {color.id}</div>
                          </div>
                          <div className="w-2 h-2 bg-charcoal rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Export Format Cards */}
        <div className="lg:col-span-2 space-y-4">
          {exportFormats.map((format, index) => (
            <motion.div
              key={format.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={format.action}
                className={`
                  w-full text-left p-6 rounded-xl border-2 transition-all duration-200
                  hover:shadow-md cursor-pointer
                  ${format.color}
                `}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{format.icon}</span>
                  <div>
                    <h4 className="text-lg font-medium text-charcoal">
                      {format.title}
                    </h4>
                    <p className="text-sm text-warm-gray mt-1">
                      {format.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-warm-gray-light ml-auto mt-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
              </button>
            </motion.div>
          ))}

          {/* Import */}
          <div className="pt-2 border-t border-rose-light/30">
            <button
              onClick={handleImportJSON}
              className="w-full text-left p-4 rounded-xl border border-dashed border-warm-gray-light hover:border-rose transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📂</span>
                <div>
                  <h4 className="text-sm font-medium text-charcoal">
                    Import Saved Pattern
                  </h4>
                  <p className="text-xs text-warm-gray">
                    Load a previously saved JSON pattern file
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex justify-center gap-4">
        <Button variant="secondary" onClick={onBack} icon={<span>✏️</span>}>
          Back to Editor
        </Button>
        <Button variant="ghost" onClick={onNewPattern} icon={<span>🆕</span>}>
          Start New Pattern
        </Button>
      </div>
    </motion.div>
  );
}
