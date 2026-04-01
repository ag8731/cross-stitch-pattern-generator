'use client';

import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

interface UploadStepProps {
  onImageSelected: (image: HTMLImageElement, file: File) => void;
}

export default function UploadStep({ onImageSelected }: UploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);

        const img = new Image();
        img.onload = () => {
          setIsLoading(false);
          onImageSelected(img, file);
        };
        img.onerror = () => {
          setIsLoading(false);
          setPreview(null);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl text-charcoal mb-2">
          Start with an Image
        </h2>
        <p className="text-warm-gray">
          Upload a photo or image to transform into a cross stitch pattern
        </p>
      </div>

      <Card padding="lg">
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center
            transition-all duration-200 cursor-pointer
            ${
              dragActive
                ? 'border-rose bg-rose-light/30 scale-[1.01]'
                : 'border-warm-gray-light hover:border-rose hover:bg-rose-light/10'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={isLoading}
          />

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-rose-light border-t-rose rounded-full animate-spin" />
              </div>
            ) : preview ? (
              <div className="flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 rounded-lg shadow-md"
                />
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-rose-light/50 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-rose"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p className="text-lg font-medium text-charcoal">
                    Drop your image here
                  </p>
                  <p className="text-sm text-warm-gray mt-1">
                    or click to browse your files
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {['JPG', 'PNG', 'GIF', 'WebP'].map((format) => (
                    <span
                      key={format}
                      className="px-2 py-0.5 bg-rose-light/40 text-warm-gray text-xs rounded-md"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-10"
      >
        <h3 className="font-serif text-lg text-charcoal text-center mb-6">
          How it works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { icon: '📸', title: 'Upload', desc: 'Choose any image' },
            { icon: '⚙️', title: 'Configure', desc: 'Set size & colors' },
            { icon: '✏️', title: 'Edit', desc: 'Fine-tune your pattern' },
            { icon: '📤', title: 'Export', desc: 'PDF, PNG, or JSON' },
          ].map((item, i) => (
            <Card key={i} padding="sm" className="text-center">
              <span className="text-2xl block mb-2">{item.icon}</span>
              <p className="text-sm font-medium text-charcoal">{item.title}</p>
              <p className="text-xs text-warm-gray mt-0.5">{item.desc}</p>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
