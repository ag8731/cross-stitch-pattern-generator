'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import PatternGrid from '@/components/PatternGrid';
import ToolPalette from '@/components/ToolPalette';
import PatternSettingsComponent from '@/components/PatternSettings';
import ColorLegend from '@/components/ColorLegend';
import ExportOptions from '@/components/ExportOptions';
import { CrossStitchPattern, Tool, DMCColor, PatternSettings } from '@/types/pattern';

export default function Home() {
  const [pattern, setPattern] = useState<CrossStitchPattern | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>({ type: 'draw', size: 1 });
  const [selectedColor, setSelectedColor] = useState<DMCColor | null>(null);
  const [settings, setSettings] = useState<PatternSettings>({
    width: 100,
    height: 100,
    clothCount: 14,
    maxColors: 30,
    dithering: false,
  });

  const handlePatternGenerated = (newPattern: CrossStitchPattern) => {
    setPattern(newPattern);
  };

  const handlePatternChange = (updatedPattern: CrossStitchPattern) => {
    setPattern(updatedPattern);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Cross Stitch Pattern Generator
            </h1>
            <div className="text-sm text-gray-500">
              Create beautiful cross stitch patterns from images
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools and Settings */}
          <div className="lg:col-span-1 space-y-6">
            <PatternSettingsComponent
              settings={settings}
              onSettingsChange={setSettings}
            />
            
            <ToolPalette
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
            
            <ExportOptions pattern={pattern} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {!pattern ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Create Your Pattern
                </h2>
                <ImageUploader
                  onImageProcessed={handlePatternGenerated}
                  settings={settings}
                />
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    How it works:
                  </h3>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Upload an image from your device</li>
                    <li>Adjust pattern settings as needed</li>
                    <li>Generate your cross stitch pattern</li>
                    <li>Edit with drawing tools if desired</li>
                    <li>Export as PDF, image, or save for later</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pattern Editor
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{pattern.width} × {pattern.height} stitches</span>
                    <span>{pattern.colors.length} colors</span>
                  </div>
                </div>
                
                <PatternGrid
                  pattern={pattern}
                  tool={{ ...selectedTool, color: selectedColor }}
                  onPatternChange={handlePatternChange}
                  cellSize={15}
                  showGrid={true}
                  showSymbols={true}
                  showColors={true}
                />
                
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={() => setPattern(null)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    New Pattern
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Color Legend */}
          <div className="lg:col-span-1">
            <ColorLegend
              colors={pattern?.colors || []}
              pattern={pattern}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
