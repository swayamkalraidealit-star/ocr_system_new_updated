import { OCRExtractor } from '../components/OCRExtractor';
import { Scan } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl shadow-lg">
            <Scan className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              OCR Text Extractor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload drawings and extract text with AI
            </p>
          </div>
        </div>
      </div>

      <OCRExtractor />
    </div>
  );
}
