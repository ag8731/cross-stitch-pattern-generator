'use client';

import { useCallback, useState } from 'react';
import { ImageProcessor } from '@/utils/imageProcessor';

interface ImageUploaderProps {
  onImageProcessed: (pattern: any) => void;
  settings: any;
}

export default function ImageUploader({ onImageProcessed, settings }: ImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processor = new ImageProcessor();

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsProcessing(true);
    try {
      const img = await processor.loadImage(file);
      const pattern = processor.processImage(img, settings);
      onImageProcessed(pattern);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [processor, settings, onImageProcessed]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleChange}
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            ) : (
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isProcessing ? 'Processing...' : 'Drop your image here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse
            </p>
          </div>
          
          <p className="text-xs text-gray-400">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    </div>
  );
}
