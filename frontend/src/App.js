import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CadastrarVeiculo } from './pages/CadastrarVeiculo';
import { VeiculosAtividade } from './pages/VeiculosAtividade';
import { VeiculosManutencao } from './pages/VeiculosManutencao';
import { VeiculosInativos } from './pages/VeiculosInativos';
import { Usuarios } from './pages/Usuarios';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="cadastrar-veiculo"
              element={
                <ProtectedRoute adminOnly>
                  <CadastrarVeiculo />
                </ProtectedRoute>
              }
            />
            <Route path="veiculos-atividade" element={<VeiculosAtividade />} />
            <Route path="veiculos-manutencao" element={<VeiculosManutencao />} />
            <Route path="veiculos-inativos" element={<VeiculosInativos />} />
            <Route
              path="usuarios"
              element={
                <ProtectedRoute adminOnly>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
