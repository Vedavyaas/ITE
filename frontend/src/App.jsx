import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import { getRole } from './api/client';

function ProtectedRoute({ children, requiredRole }) {
  const role = getRole();
  if (!role) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    // Redirect to the right dashboard for their actual role
    return <Navigate to={role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="ROLE_USER">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect based on existing session */}
        <Route
          path="*"
          element={
            (() => {
              const role = getRole();
              if (role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
              if (role === 'ROLE_USER')  return <Navigate to="/dashboard" replace />;
              return <Navigate to="/login" replace />;
            })()
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
