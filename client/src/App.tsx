import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DealProvider } from './context/DealContext';
import DealRoom from './pages/DealRoom';
import LegalPage from './pages/LegalPage';
import InstitutionalGate from './pages/InstitutionalGate';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Logo from './components/shared/Logo';

// Lazy imports for admin pages
const DashboardPage = lazy(() => import('./components/admin/DashboardPage'));
const DealListPage = lazy(() => import('./components/admin/DealListPage'));
const DealEditorPage = lazy(() => import('./components/admin/DealEditorPage'));
const KBManagerPage = lazy(() => import('./components/admin/KBManagerPage'));
const InvestorListPage = lazy(() => import('./components/admin/InvestorListPage'));
const InvestorDetailPage = lazy(() => import('./components/admin/InvestorDetailPage'));
const SettingsPage = lazy(() => import('./components/admin/SettingsPage'));

function AdminLoading() {
  return (
    <div className="h-64 p-8 space-y-6">
      <div className="animate-pulse bg-[#1C1C24] rounded-lg h-8 w-1/3" />
      <div className="space-y-3">
        <div className="animate-pulse bg-[#1C1C24] rounded h-4 w-full" />
        <div className="animate-pulse bg-[#1C1C24] rounded h-4 w-full" />
        <div className="animate-pulse bg-[#1C1C24] rounded h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="animate-pulse bg-[#1C1C24] rounded-xl h-24" />
        <div className="animate-pulse bg-[#1C1C24] rounded-xl h-24" />
        <div className="animate-pulse bg-[#1C1C24] rounded-xl h-24" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin routes — no DealProvider */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<AdminLoading />}><DashboardPage /></Suspense>} />
        <Route path="deals" element={<Suspense fallback={<AdminLoading />}><DealListPage /></Suspense>} />
        <Route path="deals/:id" element={<Suspense fallback={<AdminLoading />}><DealEditorPage /></Suspense>} />
        <Route path="kb" element={<Suspense fallback={<AdminLoading />}><KBManagerPage /></Suspense>} />
        <Route path="investors" element={<Suspense fallback={<AdminLoading />}><InvestorListPage /></Suspense>} />
        <Route path="investors/:id" element={<Suspense fallback={<AdminLoading />}><InvestorDetailPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<AdminLoading />}><SettingsPage /></Suspense>} />
      </Route>

      {/* Legal pages */}
      <Route path="/legal/:type" element={<LegalPage />} />
      {/* Institutional fast track gate */}
      <Route path="/institutional/:slug" element={<DealProvider><InstitutionalGate /></DealProvider>} />
      {/* Root redirect to default deal */}
      <Route path="/" element={<Navigate to="/deals/parkview-commons" replace />} />
      {/* Investor-facing routes — wrapped in DealProvider */}
      <Route path="/deals/:slug/*" element={<DealProvider><DealRoom /></DealProvider>} />
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gc-bg">
          <div className="text-center">
            <Logo variant="vertical" tagline="Deal Room" className="mb-4" />
            <p className="text-gc-text-secondary">No deal specified. Access via /deals/[deal-slug]</p>
          </div>
        </div>
      } />
    </Routes>
  );
}
