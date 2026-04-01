'use client';

import Button from '@/components/ui/Button';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoomReset: () => void;
}

export default function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomReset,
}: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-1 bg-linen/90 backdrop-blur-sm border border-rose-light rounded-xl px-2 py-1.5 shadow-sm">
      <Button variant="ghost" size="sm" onClick={onZoomOut} aria-label="Zoom out">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>

      <button
        onClick={onZoomReset}
        className="px-2 py-0.5 text-xs font-medium text-charcoal hover:bg-rose-light/40 rounded-md transition-colors min-w-[52px] text-center cursor-pointer"
      >
        {Math.round(zoom * 100)}%
      </button>

      <Button variant="ghost" size="sm" onClick={onZoomIn} aria-label="Zoom in">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>

      <div className="w-px h-5 bg-rose-light mx-1" />

      <Button variant="ghost" size="sm" onClick={onZoomFit} aria-label="Fit to view">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </Button>
    </div>
  );
}
