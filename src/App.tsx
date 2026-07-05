import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { SettingsProvider } from '@/features/settings/SettingsContext';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Attendance } from '@/pages/Attendance';
import { Students } from '@/pages/Students';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { Admin } from '@/pages/Admin';
import { Showroom } from '@/pages/Showroom';
import { Help } from '@/pages/Help';
import { Support } from '@/pages/Support';

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/support" element={<Support />} />
                </Route>

                {/* Private Protected Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/help" element={<Help />} />
                  <Route path="/settings/support" element={<Support />} />
                  <Route path="/showroom" element={<Showroom />} />

                  {/* Super Admin Restricted Route */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['super_admin']}>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Fallbacks */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
