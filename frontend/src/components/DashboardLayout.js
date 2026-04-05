import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Car,
  Activity,
  Wrench,
  XCircle,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { path: '/dashboard/cadastrar-veiculo', label: 'Cadastrar Veículo', icon: Car, adminOnly: true },
    { path: '/dashboard/veiculos-atividade', label: 'Veículos em Atividade', icon: Activity, adminOnly: false },
    { path: '/dashboard/veiculos-manutencao', label: 'Veículos em Manutenção', icon: Wrench, adminOnly: false },
    { path: '/dashboard/veiculos-inativos', label: 'Veículos Inativos', icon: XCircle, adminOnly: false },
    { path: '/dashboard/usuarios', label: 'Usuários', icon: Users, adminOnly: true }
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN'
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-primary-foreground/10">
            <div className="flex items-center gap-3">
              <img
                src="https://www.teixeiradefreitas.ba.gov.br/wp-content/uploads/2022/05/brasao-pmtf-610x768.png"
                alt="Brasão PMTF"
                className="w-10 h-12 object-contain"
              />
              <div>
                <h1 className="text-lg font-bold leading-tight">Frota de Veículos</h1>
                <p className="text-xs text-primary-foreground/80">PMTF</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-foreground text-primary font-medium'
                        : 'text-primary-foreground/90 hover:bg-primary-foreground/10'
                    }`
                  }
                  data-testid={`nav-${item.path.split('/').pop()}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-primary-foreground/10">
            <div className="mb-3">
              <p className="text-sm font-medium text-primary-foreground">{user?.name}</p>
              <p className="text-xs text-primary-foreground/70">{user?.email}</p>
              <p className="text-xs text-primary-foreground/60 mt-1">
                Perfil: {user?.role}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Frota de Veículos PMTF</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="mobile-menu-button"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
