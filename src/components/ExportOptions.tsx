'use client';

import { CrossStitchPattern } from '@/types/pattern';
import { PatternExporter } from '@/utils/exportUtils';

interface ExportOptionsProps {
  pattern: CrossStitchPattern | null;
}

export default function ExportOptions({ pattern }: ExportOptionsProps) {
  if (!pattern) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
        <p className="text-sm text-gray-500">Create a pattern first to export it</p>
      </div>
    );
  }

  const handleExportImage = () => {
    PatternExporter.exportAsImage(pattern, 20);
  };

  const handleExportPDF = () => {
    PatternExporter.exportAsPDF(pattern);
  };

  const handleExportJSON = () => {
    PatternExporter.exportAsJSON(pattern);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const importedPattern = await PatternExporter.importFromJSON(file);
          // This would typically update the parent state
          console.log('Imported pattern:', importedPattern);
          alert('Pattern imported successfully!');
        } catch (error) {
          console.error('Import error:', error);
          alert('Error importing pattern. Please check the file format.');
        }
      }
    };
    input.click();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
      
      <div className="space-y-3">
        <button
          onClick={handleExportImage}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Export as Image</span>
        </button>

        <button
          onClick={handleExportPDF}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Export as PDF</span>
        </button>

        <button
          onClick={handleExportJSON}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
          </svg>
          <span>Export as JSON</span>
        </button>

        <div className="border-t border-gray-200 pt-3">
          <button
            onClick={handleImportJSON}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Image: PNG format with grid and symbols</p>
        <p>• PDF: Printable pattern with legend</p>
        <p>• JSON: Save and reload patterns</p>
      </div>
    </div>
  );
}
