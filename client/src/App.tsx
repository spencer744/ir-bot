import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DealProvider } from './context/DealContext';
import DealRoom from './pages/DealRoom';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';

// Lazy imports for admin pages
const DashboardPage = lazy(() => import('./components/admin/DashboardPage'));
const DealListPage = lazy(() => import('./components/admin/DealListPage'));
const DealEditorPage = lazy(() => import('./components/admin/DealEditorPage'));
const KBManagerPage = lazy(() => import('./components/admin/KBManagerPage'));
const InvestorListPage = lazy(() => import('./components/admin/InvestorListPage'));
const InvestorDetailPage = lazy(() => import('./components/admin/InvestorDetailPage'));

function AdminLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gc-text-secondary">Loading...</div>
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
      </Route>

      {/* Investor-facing routes — wrapped in DealProvider */}
      <Route path="/deals/:slug/*" element={<DealProvider><DealRoom /></DealProvider>} />
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gc-text mb-2">Gray Capital Deal Room</h1>
            <p className="text-gc-text-secondary">No deal specified. Access via /deals/[deal-slug]</p>
          </div>
        </div>
      } />
    </Routes>
  );
}
