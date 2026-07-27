import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import { HistoryProvider } from '@/context/HistoryContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RefreshCw } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import LoadingScreen from '@/components/layout/LoadingScreen';
import HomePage from '@/pages/HomePage';
import DetectPage from '@/pages/DetectPage';
import ResultPage from '@/pages/ResultPage';
import CropsPage from '@/pages/CropsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdminPage from '@/pages/AdminPage';
import AdminLoginPage from '@/pages/AdminLoginPage';

function Routes() {
  const { pathSegments } = useRouter();
  const root = (pathSegments[0] || '').split('?')[0];
  const sub = (pathSegments[1] || '').split('?')[0];

  if (root === '') return <HomePage />;
  if (root === 'detect') return <DetectPage />;
  if (root === 'result') return <ResultPage />;
  if (root === 'crops') return <CropsPage />;
  if (root === 'about') return <AboutPage />;
  if (root === 'contact') return <ContactPage />;

  if (root === 'admin') {
    if (sub === 'login') return <AdminLoginPage />;
    return <ProtectedAdmin />;
  }

  return <NotFoundPage />;
}

function ProtectedAdmin() {
  const { isAdmin, loading } = useAuth();
  const { navigate } = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin text-brand-500" size={28} />
      </div>
    );
  }

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  return <AdminPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider>
            <HistoryProvider>
              <LoadingScreen />
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes />
                </main>
                <Footer />
              </div>
              <ScrollToTop />
            </HistoryProvider>
          </RouterProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
