'use client';

import { Tool, DMCColor } from '@/types/pattern';
import { DMC_COLORS } from '@/data/dmc-colors';

interface ToolPaletteProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedColor: DMCColor | null;
  onColorChange: (color: DMCColor | null) => void;
}

export default function ToolPalette({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange
}: ToolPaletteProps) {
  const tools = [
    { type: 'draw' as const, icon: '✏️', label: 'Draw' },
    { type: 'erase' as const, icon: '🧹', label: 'Erase' },
    { type: 'fill' as const, icon: '🪣', label: 'Fill' },
    { type: 'colorPicker' as const, icon: '💉', label: 'Color Picker' },
  ];

  const recentColors = DMC_COLORS.slice(0, 20);

  return (
    <div className="space-y-4">
      {/* Tools */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => onToolChange({ ...selectedTool, type: tool.type })}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTool.type === tool.type
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Colors</h3>
        
        {/* Selected Color Display */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded border-2 border-gray-300"
              style={{
                backgroundColor: selectedColor?.hex || '#FFFFFF',
                backgroundImage: selectedColor?.hex === '#FFFFFF' 
                  ? 'repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 20px 20px'
                  : 'none'
              }}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedColor?.name || 'No color selected'}
              </p>
              <p className="text-xs text-gray-500">
                {selectedColor?.id || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Colors */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Recent Colors</p>
          <div className="grid grid-cols-10 gap-1">
            {recentColors.map((color) => (
              <button
                key={color.id}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                  selectedColor?.id === color.id
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-300'
                }`}
                style={{
                  backgroundColor: color.hex,
                  backgroundImage: color.hex === '#FFFFFF' 
                    ? 'repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 10px 10px'
                    : 'none'
                }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Color Search */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search DMC colors..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Brush Size (for draw tool) */}
      {selectedTool.type === 'draw' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Brush Size</h3>
          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="5"
              value={selectedTool.size || 1}
              onChange={(e) => onToolChange({ ...selectedTool, size: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-600">
              Size: {selectedTool.size || 1}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
