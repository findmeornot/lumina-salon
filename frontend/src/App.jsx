import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n';
import './index.css';

import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import BookingCalendarPage from './pages/BookingCalendarPage';
import CreateBookingPage from './pages/CreateBookingPage';
import EditBookingPage from './pages/EditBookingPage';
import CancelBookingPage from './pages/CancelBookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import FacilityInfoPage from './pages/FacilityInfoPage';
import ToolsDirectoryPage from './pages/ToolsDirectoryPage';
import ProfilePage from './pages/ProfilePage';
import QrScannerPage from './pages/QrScannerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BookingManagementPage from './pages/BookingManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import CreateAdminPage from './pages/CreateAdminPage';
import AdminRoomQrPage from './pages/AdminRoomQrPage';
import AdminCheckinLogsPage from './pages/AdminCheckinLogsPage';
import AdminFacilityInfoPage from './pages/AdminFacilityInfoPage';
import AdminBeautyToolsPage from './pages/AdminBeautyToolsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent auto-polling/refresh storms that can feel laggy on slower devices/networks.
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="calendar" element={<BookingCalendarPage />} />
              <Route path="bookings/create" element={<CreateBookingPage />} />
              <Route path="bookings/edit" element={<EditBookingPage />} />
              <Route path="bookings/cancel" element={<CancelBookingPage />} />
              <Route path="history" element={<BookingHistoryPage />} />
              <Route path="facility" element={<FacilityInfoPage />} />
              <Route path="tools" element={<ToolsDirectoryPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="scanner" element={<QrScannerPage />} />
              <Route
                path="admin/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/bookings"
                element={
                  <ProtectedRoute role="admin">
                    <BookingManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute role="admin">
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/analytics"
                element={
                  <ProtectedRoute role="admin">
                    <AnalyticsDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/room"
                element={
                  <ProtectedRoute role="admin">
                    <AdminRoomQrPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/facility"
                element={
                  <ProtectedRoute role="admin">
                    <AdminFacilityInfoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/tools"
                element={
                  <ProtectedRoute role="admin">
                    <AdminBeautyToolsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/logs"
                element={
                  <ProtectedRoute role="admin">
                    <AdminCheckinLogsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/create-admin"
                element={
                  <ProtectedRoute role="admin">
                    <CreateAdminPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
