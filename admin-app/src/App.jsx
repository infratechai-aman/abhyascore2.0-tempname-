import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './auth/AdminRoute';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Questions from './pages/Questions';

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main-wrapper">
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="app-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <Users />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <AdminRoute>
              <AdminLayout>
                <Questions />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
