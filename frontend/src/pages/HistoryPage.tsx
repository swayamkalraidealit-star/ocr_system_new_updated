import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { History, FileText, Calendar, Weight } from 'lucide-react';

interface ScanHistory {
  id: string;
  filename: string;
  calculated_weight_kg: number;
  extracted_data: any;
  timestamp: string;
}

export function HistoryPage() {
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get('/analysis/history');
        setHistory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 dark:bg-green-500 rounded-xl shadow-lg">
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scan History</h1>
          <p className="text-gray-600 dark:text-gray-400">View your previous drawing analyses</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No scans found yet. Start by analyzing a drawing!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((scan) => (
            <div
              key={scan.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{scan.filename}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.2">
                        <Calendar className="w-4 h-4" />
                        {new Date(scan.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Calculated Weight</p>
                    <div className="flex items-center gap-2 justify-end">
                      <Weight className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {scan.calculated_weight_kg.toFixed(3)} kg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                <details className="group">
                  <summary className="text-sm font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline list-none flex items-center gap-1">
                    View Extracted Data
                  </summary>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(scan.extracted_data).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {value === null ? 'N/A' : typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
