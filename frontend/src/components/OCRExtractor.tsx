import { useState, useRef } from 'react';
import { Upload, FileImage, X, Copy, Check, Loader2 } from 'lucide-react';
import { analyzeBOM } from '../lib/n8n';

export function OCRExtractor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null); // No preview for PDF
      }
      setExtractedText('');
      setIsCopied(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null); // No preview for PDF
      }
      setExtractedText('');
      setIsCopied(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const [error, setError] = useState<string | null>(null);
  const [bomResult, setBomResult] = useState<any>(null);

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setBomResult(null);

    try {
      const data = await analyzeBOM(selectedFile);
      setBomResult(data);
      
      if (data.extracted_data) {
        setExtractedText(JSON.stringify(data.extracted_data, null, 2));
      } else {
        setExtractedText(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      console.error('BOM Analysis failed:', err);
      setError(err.message || 'Failed to analyze BOM through n8n.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (bomResult) {
      await navigator.clipboard.writeText(JSON.stringify(bomResult, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    setBomResult(null);
    setError(null);
    setIsCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Drop your drawing here or click to browse
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Supports JPG, PNG, GIF, and PDF up to 10MB
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative inline-block">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[500px] rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center gap-4 border-2 border-gray-200 dark:border-gray-600 shadow-lg p-4">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                    <FileImage className="w-10 h-10" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center break-all">
                    {selectedFile?.name || 'PDF Document'}
                  </span>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
              <FileImage className="w-5 h-5" />
              <span className="font-medium">{selectedFile?.name}</span>
            </div>
          </div>
        )}
      </div>

      {(previewUrl || selectedFile?.type === 'application/pdf') && !extractedText && (
        <button
          onClick={handleExtract}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            'Extract Text'
          )}
        </button>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {bomResult && (
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white shadow-xl">
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-2">
              Estimated Weight
            </p>
            <h2 className="text-5xl font-bold mb-2">
              {bomResult.calculated_weight_kg || '0.000'} <span className="text-2xl font-normal opacity-80">kg</span>
            </h2>
            <p className="text-indigo-100/80 text-sm">
              Processed by n8n Intelligence
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Extracted Dimensions
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            {bomResult.extracted_data && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(bomResult.extracted_data).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium mb-1">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-gray-900 dark:text-white font-mono font-semibold">
                      {value === null || value === undefined ? 'N/A' : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {bomResult.calculation_details && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Calculation Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(bomResult.calculation_details).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-gray-700 dark:text-gray-200 font-medium">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleClear}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-lg transition"
            >
              Process Another Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
