'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DMCColor, CrossStitchPattern } from '@/types/pattern';

interface EditorColorPanelProps {
  colors: DMCColor[];
  pattern: CrossStitchPattern | null;
}

export default function EditorColorPanel({ colors, pattern }: EditorColorPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const calculateThreadUsage = (color: DMCColor) => {
    if (!pattern?.cells) return 0;
    let count = 0;
    for (const row of pattern.cells) {
      for (const cell of row) {
        if (cell.color?.id === color.id) {
          count++;
        }
      }
    }
    return count;
  };

  const estimateSkeins = (stitchCount: number) => {
    const stitchesPerSkein = 2000;
    return Math.max(1, Math.ceil(stitchCount / stitchesPerSkein));
  };

  const totalStitches = pattern?.cells
    ? pattern.cells.flat().filter((cell) => cell.color).length
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: collapsed ? 48 : 240 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 bg-linen border-l border-rose-light overflow-hidden flex flex-col"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-warm-gray hover:text-charcoal transition-colors self-start cursor-pointer"
          aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {!collapsed && (
          <div className="px-3 pb-4 overflow-y-auto flex-1">
            <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">
              Color Legend
            </h3>

            {colors.length === 0 ? (
              <p className="text-xs text-warm-gray-light italic">No colors yet</p>
            ) : (
              <div className="space-y-1">
                {colors.map((color) => {
                  const stitchCount = calculateThreadUsage(color);
                  const skeins = estimateSkeins(stitchCount);

                  return (
                    <div
                      key={color.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-rose-light/20 transition-colors"
                    >
                      <div
                        className="w-6 h-6 rounded-md border border-rose-light flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-charcoal truncate">
                          {color.name}
                        </p>
                        <p className="text-[10px] text-warm-gray">
                          DMC-{color.id} · {stitchCount.toLocaleString()} st · {skeins} sk
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {colors.length > 0 && (
              <div className="mt-4 pt-3 border-t border-rose-light/50">
                <div className="bg-sage-light/20 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-warm-gray">Colors</span>
                    <span className="font-medium text-charcoal">{colors.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-warm-gray">Total stitches</span>
                    <span className="font-medium text-charcoal">
                      {totalStitches.toLocaleString()}
                    </span>
                  </div>
                  {pattern && (
                    <div className="flex justify-between text-xs">
                      <span className="text-warm-gray">Dimensions</span>
                      <span className="font-medium text-charcoal">
                        {pattern.width} × {pattern.height}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsed state */}
        {collapsed && (
          <div className="flex flex-col items-center gap-1 px-1 pb-4">
            <span className="text-[10px] text-warm-gray font-medium mb-1">
              {colors.length}
            </span>
            {colors.slice(0, 8).map((color) => (
              <div
                key={color.id}
                className="w-6 h-6 rounded-md border border-rose-light/50"
                style={{ backgroundColor: color.hex }}
                title={`${color.name} (DMC-${color.id})`}
              />
            ))}
            {colors.length > 8 && (
              <span className="text-[10px] text-warm-gray">+{colors.length - 8}</span>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
