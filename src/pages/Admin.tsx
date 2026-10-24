import { Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../lib/auth';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { Dashboard } from './admin/Dashboard';
import { WatchesAdmin } from './admin/WatchesAdmin';
import { WatchEditor } from './admin/WatchEditor';
import { Inquiries } from './admin/Inquiries';
import { SettingsAdmin } from './admin/SettingsAdmin';

function AdminRoutes() {
  const { authed, checking } = useAuth();

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080a]">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border border-ivory/15 border-t-gold" />
          <p className="text-[10px] tracking-[0.24em] text-ivory/30 uppercase">Unlocking</p>
        </div>
      </div>
    );
  }

  if (!authed) return <AdminLogin />;

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="watches" element={<WatchesAdmin />} />
        <Route path="watches/new" element={<WatchEditor />} />
        <Route path="watches/:id" element={<WatchEditor />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="settings" element={<SettingsAdmin />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default function Admin() {
  return (
    <AuthProvider>
      <AdminRoutes />
    </AuthProvider>
  );
}
