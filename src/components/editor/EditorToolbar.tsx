'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tool, DMCColor } from '@/types/pattern';
import { DMC_COLORS } from '@/data/dmc-colors';

interface EditorToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedColor: DMCColor | null;
  onColorChange: (color: DMCColor | null) => void;
  showGrid: boolean;
  showSymbols: boolean;
  showColors: boolean;
  onToggleGrid: () => void;
  onToggleSymbols: () => void;
  onToggleColors: () => void;
}

const tools = [
  { type: 'draw' as const, icon: '✏️', label: 'Draw', shortcut: 'D' },
  { type: 'erase' as const, icon: '🧹', label: 'Erase', shortcut: 'E' },
  { type: 'fill' as const, icon: '🪣', label: 'Fill', shortcut: 'F' },
  { type: 'colorPicker' as const, icon: '💉', label: 'Pick', shortcut: 'P' },
];

export default function EditorToolbar({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  showGrid,
  showSymbols,
  showColors,
  onToggleGrid,
  onToggleSymbols,
  onToggleColors,
}: EditorToolbarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [colorSearch, setColorSearch] = useState('');

  const filteredColors = colorSearch
    ? DMC_COLORS.filter(
        (c) =>
          c.name.toLowerCase().includes(colorSearch.toLowerCase()) ||
          c.id.includes(colorSearch)
      ).slice(0, 30)
    : DMC_COLORS.slice(0, 20);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1, width: collapsed ? 48 : 220 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 bg-linen border-r border-rose-light overflow-hidden flex flex-col"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-warm-gray hover:text-charcoal transition-colors self-end cursor-pointer"
          aria-label={collapsed ? 'Expand toolbar' : 'Collapse toolbar'}
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {!collapsed && (
          <div className="px-3 pb-4 space-y-4 overflow-y-auto flex-1">
            {/* Tools Section */}
            <div>
              <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                Tools
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {tools.map((tool) => (
                  <button
                    key={tool.type}
                    onClick={() => onToolChange({ ...selectedTool, type: tool.type })}
                    className={`
                      flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-xs font-medium
                      transition-all duration-150 cursor-pointer
                      ${
                        selectedTool.type === tool.type
                          ? 'bg-rose text-white shadow-sm shadow-rose/30'
                          : 'bg-warm-white text-warm-gray hover:bg-rose-light/40 hover:text-charcoal'
                      }
                    `}
                    title={`${tool.label} (${tool.shortcut})`}
                  >
                    <span className="text-base">{tool.icon}</span>
                    <span>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Size */}
            {selectedTool.type === 'draw' && (
              <div>
                <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                  Brush Size
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={selectedTool.size || 1}
                    onChange={(e) =>
                      onToolChange({ ...selectedTool, size: parseInt(e.target.value) })
                    }
                    className="flex-1"
                  />
                  <span className="text-xs text-charcoal font-medium w-4 text-center">
                    {selectedTool.size || 1}
                  </span>
                </div>
              </div>
            )}

            {/* Display Toggles */}
            <div>
              <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                Display
              </h3>
              <div className="space-y-1.5">
                {[
                  { label: 'Grid', active: showGrid, toggle: onToggleGrid, icon: '▦' },
                  { label: 'Symbols', active: showSymbols, toggle: onToggleSymbols, icon: 'Aa' },
                  { label: 'Colors', active: showColors, toggle: onToggleColors, icon: '🎨' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.toggle}
                    className={`
                      w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-150 cursor-pointer
                      ${
                        item.active
                          ? 'bg-sage-light/50 text-charcoal'
                          : 'bg-warm-white text-warm-gray hover:bg-rose-light/30'
                      }
                    `}
                  >
                    <span className="w-5 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                    <span className="ml-auto">
                      {item.active ? (
                        <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Color */}
            <div>
              <h3 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                Color
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-rose-light flex-shrink-0"
                  style={{
                    backgroundColor: selectedColor?.hex || '#FFFFFF',
                  }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-charcoal truncate">
                    {selectedColor?.name || 'None'}
                  </p>
                  <p className="text-[10px] text-warm-gray">
                    {selectedColor ? `DMC-${selectedColor.id}` : 'Select a color'}
                  </p>
                </div>
              </div>

              {/* Color Search */}
              <input
                type="text"
                placeholder="Search colors..."
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                className="w-full text-xs mb-2"
              />

              {/* Color Grid */}
              <div className="grid grid-cols-5 gap-1">
                {filteredColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onColorChange(color)}
                    className={`
                      w-8 h-8 rounded-md border-2 transition-all duration-150 cursor-pointer
                      hover:scale-110 hover:shadow-md
                      ${
                        selectedColor?.id === color.id
                          ? 'border-rose shadow-md ring-1 ring-rose/30'
                          : 'border-transparent hover:border-rose-light'
                      }
                    `}
                    style={{ backgroundColor: color.hex }}
                    title={`${color.name} (DMC-${color.id})`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed state - just icons */}
        {collapsed && (
          <div className="flex flex-col items-center gap-2 px-1 pb-4">
            {tools.map((tool) => (
              <button
                key={tool.type}
                onClick={() => onToolChange({ ...selectedTool, type: tool.type })}
                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center text-base
                  transition-all duration-150 cursor-pointer
                  ${
                    selectedTool.type === tool.type
                      ? 'bg-rose text-white shadow-sm'
                      : 'bg-warm-white text-warm-gray hover:bg-rose-light/40'
                  }
                `}
                title={`${tool.label} (${tool.shortcut})`}
              >
                {tool.icon}
              </button>
            ))}
            <div className="w-6 h-px bg-rose-light my-1" />
            {selectedColor && (
              <div
                className="w-8 h-8 rounded-md border-2 border-rose-light"
                style={{ backgroundColor: selectedColor.hex }}
                title={selectedColor.name}
              />
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
