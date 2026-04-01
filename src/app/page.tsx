'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import StepIndicator, { Step } from '@/components/layout/StepIndicator';
import UploadStep from '@/components/steps/UploadStep';
import SettingsStep from '@/components/steps/SettingsStep';
import EditorStep from '@/components/steps/EditorStep';
import ExportStep from '@/components/steps/ExportStep';
import { ToastProvider } from '@/components/ui/Toast';
import { CrossStitchPattern, PatternSettings } from '@/types/pattern';
import { ImageProcessor } from '@/utils/imageProcessor';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pattern, setPattern] = useState<CrossStitchPattern | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<PatternSettings>({
    width: 100,
    height: 100,
    clothCount: 14,
    maxColors: 30,
    dithering: false,
  });

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(step);
      return next;
    });
  }, []);

  const handleImageSelected = useCallback(
    (image: HTMLImageElement, _file: File) => {
      setUploadedImage(image);
      setImagePreview(image.src);
      markStepCompleted(1);
      setCurrentStep(2);
    },
    [markStepCompleted]
  );

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    try {
      const processor = new ImageProcessor();
      const newPattern = processor.processImage(uploadedImage, settings);
      setPattern(newPattern);
      markStepCompleted(2);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating pattern:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, settings, markStepCompleted]);

  const handlePatternChange = useCallback((updatedPattern: CrossStitchPattern) => {
    setPattern(updatedPattern);
  }, []);

  const handleNewPattern = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setUploadedImage(null);
    setImagePreview(null);
    setPattern(null);
    setIsProcessing(false);
  }, []);

  const handleStepClick = useCallback(
    (step: Step) => {
      // Prevent navigating to editor/export without a pattern
      if ((step === 3 || step === 4) && !pattern) return;
      // Prevent navigating to settings without an image
      if (step === 2 && !uploadedImage) return;
      setCurrentStep(step);
    },
    [pattern, uploadedImage]
  );

  const goToExport = useCallback(() => {
    if (pattern) {
      markStepCompleted(3);
      setCurrentStep(4);
    }
  }, [pattern, markStepCompleted]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-cream flex flex-col">
        <Header
          onNewPattern={handleNewPattern}
          hasPattern={!!pattern}
        />

        <StepIndicator
          currentStep={currentStep}
          onStepClick={handleStepClick}
          completedSteps={completedSteps}
        />

        <main className={`flex-1 ${currentStep === 3 ? '' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <UploadStep
                key="upload"
                onImageSelected={handleImageSelected}
              />
            )}

            {currentStep === 2 && (
              <SettingsStep
                key="settings"
                imagePreview={imagePreview}
                settings={settings}
                onSettingsChange={setSettings}
                onGenerate={handleGenerate}
                onBack={() => setCurrentStep(1)}
                isProcessing={isProcessing}
              />
            )}

            {currentStep === 3 && pattern && (
              <EditorStep
                key="editor"
                pattern={pattern}
                onPatternChange={handlePatternChange}
                onExport={goToExport}
                onBack={() => setCurrentStep(2)}
              />
            )}

            {currentStep === 4 && pattern && (
              <ExportStep
                key="export"
                pattern={pattern}
                onBack={() => setCurrentStep(3)}
                onNewPattern={handleNewPattern}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Decorative footer */}
        {currentStep !== 3 && (
          <footer className="py-4 text-center">
            <div className="cross-stitch-border-subtle h-4 mb-2" />
            <p className="text-xs text-warm-gray-light">
              Made with 🧵 for Katia
            </p>
          </footer>
        )}
      </div>
    </ToastProvider>
  );
}
