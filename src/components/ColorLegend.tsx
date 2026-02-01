'use client';

import { DMCColor, CrossStitchPattern } from '@/types/pattern';

interface ColorLegendProps {
  colors: DMCColor[];
  pattern: CrossStitchPattern | null;
}

export default function ColorLegend({ colors, pattern }: ColorLegendProps) {
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
    // Rough estimate: 1 skein = ~2000 stitches for 14-count Aida
    const stitchesPerSkein = 2000;
    return Math.max(1, Math.ceil(stitchCount / stitchesPerSkein));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Color Legend</h3>
      
      {colors.length === 0 ? (
        <p className="text-sm text-gray-500">No colors used yet</p>
      ) : (
        <div className="space-y-2">
          {colors.map((color) => {
            const stitchCount = calculateThreadUsage(color);
            const skeins = estimateSkeins(stitchCount);
            
            return (
              <div
                key={color.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300 flex-shrink-0"
                  style={{
                    backgroundColor: color.hex,
                    backgroundImage: color.hex === '#FFFFFF' 
                      ? 'repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 10px 10px'
                      : 'none'
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {color.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      DMC-{color.id}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {stitchCount.toLocaleString()} stitches • {skeins} skein(s)
                  </div>
                </div>
                
                <div className="text-xs text-gray-400">
                  {color.hex}
                </div>
              </div>
            );
          })}
          
          {/* Summary */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="text-sm text-gray-600">
              <p>Total colors: {colors.length}</p>
              <p>Total stitches: {pattern?.cells ? 
                pattern.cells.flat().filter(cell => cell.color).length.toLocaleString() : 
                '0'
              }</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
