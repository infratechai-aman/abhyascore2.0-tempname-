import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminRoute from './auth/AdminRoute';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Questions from './pages/Questions';
import HomeCardManager from './pages/AppControl/HomeCardManager';
import RewardRuleManager from './pages/AppControl/RewardRuleManager';
import GameConfig from './pages/GameConfig';

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
        <Route
          path="/app-control/home-cards"
          element={
            <AdminRoute>
              <AdminLayout>
                <HomeCardManager />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/app-control/rewards"
          element={
            <AdminRoute>
              <AdminLayout>
                <RewardRuleManager />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/game-config"
          element={
            <AdminRoute>
              <AdminLayout>
                <GameConfig />
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
