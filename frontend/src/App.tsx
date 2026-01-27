import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { Layout } from './components/Layout';
import { useState } from 'react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const [currentView, setCurrentView] = useState<'dashboard' | 'history'>('dashboard');

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      <div style={{ display: currentView === 'dashboard' ? 'block' : 'none' }}>
        <DashboardPage />
      </div>
      <div style={{ display: currentView === 'history' ? 'block' : 'none' }}>
        <HistoryPage />
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
