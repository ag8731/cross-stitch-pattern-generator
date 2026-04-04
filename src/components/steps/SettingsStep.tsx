'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PatternSettings } from '@/types/pattern';

interface SettingsStepProps {
  imagePreview: string | null;
  settings: PatternSettings;
  onSettingsChange: (settings: PatternSettings) => void;
  onGenerate: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

export default function SettingsStep({
  imagePreview,
  settings,
  onSettingsChange,
  onGenerate,
  onBack,
  isProcessing,
}: SettingsStepProps) {
  const clothCounts = [11, 14, 16, 18, 20, 22, 25, 28, 32];
  const maxColorsOptions = [10, 20, 30, 40, 50, 60, 80, 100];

  const updateSetting = <K extends keyof PatternSettings>(
    key: K,
    value: PatternSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  /**
   * Update width, and if aspect ratio is locked, auto-calculate height.
   */
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

  /**
   * Update height, and if aspect ratio is locked, auto-calculate width.
   */
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
      // When locking, adjust height to match current width
      const newHeight = Math.max(10, Math.round(settings.width / settings.sourceAspectRatio));
      onSettingsChange({ ...settings, lockAspectRatio: newLocked, height: newHeight });
    } else {
      onSettingsChange({ ...settings, lockAspectRatio: newLocked });
    }
  }, [settings, onSettingsChange]);

  const widthCm = ((settings.width / settings.clothCount) * 2.54).toFixed(1);
  const heightCm = ((settings.height / settings.clothCount) * 2.54).toFixed(1);
  const totalStitches = settings.width * settings.height;

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
          Configure Your Pattern
        </h2>
        <p className="text-warm-gray">
          Adjust the settings to get the perfect cross stitch pattern
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Preview */}
        <Card padding="md">
          <h3 className="font-serif text-lg text-charcoal mb-4">
            Image Preview
          </h3>
          <div className="bg-warm-white rounded-lg p-4 flex items-center justify-center min-h-[300px]">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Source image"
                className="max-w-full max-h-[350px] rounded-lg shadow-sm"
              />
            ) : (
              <div className="text-warm-gray-light text-sm">No image loaded</div>
            )}
          </div>
          <div className="mt-3 text-center">
            <button
              onClick={onBack}
              className="text-sm text-warm-gray hover:text-rose-dark transition-colors cursor-pointer"
            >
              ← Choose a different image
            </button>
          </div>
        </Card>

        {/* Settings Form */}
        <Card padding="md">
          <h3 className="font-serif text-lg text-charcoal mb-4">
            Pattern Settings
          </h3>

          <div className="space-y-5">
            {/* Width */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Width (stitches)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={settings.width}
                  onChange={(e) =>
                    handleWidthChange(parseInt(e.target.value) || 100)
                  }
                  className="flex-1"
                />
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={settings.width}
                  onChange={(e) =>
                    handleWidthChange(parseInt(e.target.value) || 100)
                  }
                  className="w-20 text-center"
                />
              </div>
            </div>

            {/* Aspect Ratio Lock */}
            <div className="flex items-center justify-center -my-2">
              <button
                onClick={toggleAspectRatioLock}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  settings.lockAspectRatio
                    ? 'bg-rose-light/20 text-rose-dark border border-rose-light'
                    : 'bg-gray-100 text-warm-gray border border-gray-200'
                }`}
                title={settings.lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
              >
                <span>{settings.lockAspectRatio ? '🔗' : '🔓'}</span>
                {settings.lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
              </button>
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Height (stitches)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={settings.height}
                  onChange={(e) =>
                    handleHeightChange(parseInt(e.target.value) || 100)
                  }
                  className="flex-1"
                />
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={settings.height}
                  onChange={(e) =>
                    handleHeightChange(parseInt(e.target.value) || 100)
                  }
                  className="w-20 text-center"
                />
              </div>
            </div>

            {/* Cloth Count */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Cloth Count (threads per inch)
              </label>
              <select
                value={settings.clothCount}
                onChange={(e) =>
                  updateSetting('clothCount', parseInt(e.target.value))
                }
                className="w-full"
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
              <label className="block text-sm font-medium text-charcoal mb-2">
                Maximum Colors
              </label>
              <select
                value={settings.maxColors}
                onChange={(e) =>
                  updateSetting('maxColors', parseInt(e.target.value))
                }
                className="w-full"
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
              <label className="block text-sm font-medium text-charcoal mb-2">
                Dithering Method
              </label>
              <p className="text-xs text-warm-gray mb-2">
                Error-diffusion dithering blends colors for smoother gradients
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => updateSetting('ditheringMethod', 'none')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    settings.ditheringMethod === 'none'
                      ? 'bg-charcoal text-white shadow-sm'
                      : 'bg-gray-100 text-warm-gray hover:bg-gray-200'
                  }`}
                >
                  None
                </button>
                <button
                  onClick={() => updateSetting('ditheringMethod', 'floyd-steinberg')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    settings.ditheringMethod === 'floyd-steinberg'
                      ? 'bg-charcoal text-white shadow-sm'
                      : 'bg-gray-100 text-warm-gray hover:bg-gray-200'
                  }`}
                >
                  Floyd-Steinberg
                </button>
              </div>
            </div>

            {/* Estimated Size Info */}
            <div className="bg-sage-light/30 rounded-xl p-4 border border-sage-light">
              <h4 className="text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
                <span>📐</span> Estimated Size
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-semibold text-charcoal">
                    {widthCm}
                  </p>
                  <p className="text-xs text-warm-gray">cm wide</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-charcoal">
                    {heightCm}
                  </p>
                  <p className="text-xs text-warm-gray">cm tall</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-charcoal">
                    {totalStitches.toLocaleString()}
                  </p>
                  <p className="text-xs text-warm-gray">stitches</p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onGenerate}
              disabled={isProcessing}
              icon={
                isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>🧵</span>
                )
              }
            >
              {isProcessing ? 'Generating Pattern...' : 'Generate Pattern'}
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
