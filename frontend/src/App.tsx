import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';

import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ToastContainer from '@/components/common/Toast';
import AIChat from '@/components/AIChat';

import Home from '@/pages/home/Home';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';

import ToolsList from '@/pages/tools/ToolsList';
import ToolDetails from '@/pages/tools/ToolDetails';
import AddTool from '@/pages/tools/AddTool';
import EditTool from '@/pages/tools/EditTool';
import MyTools from '@/pages/tools/MyTools';

import Bookings from '@/pages/bookings/Bookings';
import PaymentSuccess from '@/pages/payments/PaymentSuccess';

import Profile from '@/pages/profile/Profile';

import AdminDashboard from '@/pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* =========================================
              AUTH ROUTES
              These routes don't use the main Layout.
          ========================================== */}

          <Route
            path="/auth/login"
            element={<Login />}
          />

          <Route
            path="/auth/register"
            element={<Register />}
          />

          <Route
            path="/auth/forgot-password"
            element={<ForgotPassword />}
          />

          {/* =========================================
              MAIN APPLICATION ROUTES
          ========================================== */}

          <Route element={<Layout />}>
            {/* Home */}

            <Route
              path="/"
              element={<Home />}
            />

            {/* Tools */}

            <Route
              path="/tools"
              element={<ToolsList />}
            />

            <Route
              path="/tools/:id"
              element={<ToolDetails />}
            />

            {/* Add Tool */}

            <Route
              path="/tools/add"
              element={
                <ProtectedRoute>
                  <AddTool />
                </ProtectedRoute>
              }
            />

            {/* Edit Tool */}

            <Route
              path="/tools/edit/:id"
              element={
                <ProtectedRoute>
                  <EditTool />
                </ProtectedRoute>
              }
            />

            {/* My Tools */}

            <Route
              path="/tools/my-tools"
              element={
                <ProtectedRoute>
                  <MyTools />
                </ProtectedRoute>
              }
            />

            {/* Bookings */}

            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {/* Profile */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments/success"
              element={<PaymentSuccess />}
            />
          </Route>
        </Routes>

        {/* =========================================
            GLOBAL AI ASSISTANT
            Floating button + popup
        ========================================== */}

        <AIChat />
      </BrowserRouter>

      {/* Global Toast Notifications */}

      <ToastContainer />
    </AuthProvider>
  );
}

export default App;