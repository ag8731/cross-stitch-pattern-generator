'use client';

import { useCallback } from 'react';
import { PatternSettings } from '@/types/pattern';

interface PatternSettingsProps {
  settings: PatternSettings;
  onSettingsChange: (settings: PatternSettings) => void;
}

export default function PatternSettingsComponent({
  settings,
  onSettingsChange
}: PatternSettingsProps) {
  const clothCounts = [11, 14, 16, 18, 20, 22, 25, 28, 32];
  const maxColorsOptions = [10, 20, 30, 40, 50, 60, 80, 100];

  const updateSetting = <K extends keyof PatternSettings>(
    key: K,
    value: PatternSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      if (settings.lockAspectRatio && settings.sourceAspectRatio) {
        const newHeight = Math.max(10, Math.round(newWidth / settings.sourceAspectRatio));
        onSettingsChange({ ...settings, width: newWidth, height: newHeight });
      } else {
        onSettingsChange({ ...settings, width: newWidth });
      }
    },
    [settings, onSettingsChange]
  );

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      if (settings.lockAspectRatio && settings.sourceAspectRatio) {
        const newWidth = Math.max(10, Math.round(newHeight * settings.sourceAspectRatio));
        onSettingsChange({ ...settings, width: newWidth, height: newHeight });
      } else {
        onSettingsChange({ ...settings, height: newHeight });
      }
    },
    [settings, onSettingsChange]
  );

  const toggleAspectRatioLock = useCallback(() => {
    const newLocked = !settings.lockAspectRatio;
    if (newLocked && settings.sourceAspectRatio) {
      const newHeight = Math.max(10, Math.round(settings.width / settings.sourceAspectRatio));
      onSettingsChange({ ...settings, lockAspectRatio: newLocked, height: newHeight });
    } else {
      onSettingsChange({ ...settings, lockAspectRatio: newLocked });
    }
  }, [settings, onSettingsChange]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Pattern Settings</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Width */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (stitches)
          </label>
          <input
            type="number"
            min="10"
            max="500"
            value={settings.width}
            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 100)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Aspect Ratio Lock */}
        <div className="flex items-center justify-center">
          <button
            onClick={toggleAspectRatioLock}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              settings.lockAspectRatio
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-500 border border-gray-200'
            }`}
          >
            <span>{settings.lockAspectRatio ? '🔗' : '🔓'}</span>
            {settings.lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
          </button>
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (stitches)
          </label>
          <input
            type="number"
            min="10"
            max="500"
            value={settings.height}
            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 100)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cloth Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cloth Count (threads per inch)
          </label>
          <select
            value={settings.clothCount}
            onChange={(e) => updateSetting('clothCount', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {clothCounts.map((count) => (
              <option key={count} value={count}>
                {count} count
              </option>
            ))}
          </select>
        </div>

        {/* Max Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Colors
          </label>
          <select
            value={settings.maxColors}
            onChange={(e) => updateSetting('maxColors', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {maxColorsOptions.map((count) => (
              <option key={count} value={count}>
                {count} colors
              </option>
            ))}
          </select>
        </div>

        {/* Dithering Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dithering Method
          </label>
          <select
            value={settings.ditheringMethod}
            onChange={(e) => updateSetting('ditheringMethod', e.target.value as PatternSettings['ditheringMethod'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="floyd-steinberg">Floyd-Steinberg</option>
          </select>
        </div>

        {/* Pattern Size Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Estimated Size</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              Width: {((settings.width / settings.clothCount) * 2.54).toFixed(1)} cm
            </p>
            <p>
              Height: {((settings.height / settings.clothCount) * 2.54).toFixed(1)} cm
            </p>
            <p>
              Total stitches: {(settings.width * settings.height).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
