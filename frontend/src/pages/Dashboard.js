import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, Activity, Wrench, XCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Veículos em Atividade',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      path: '/dashboard/veiculos-atividade'
    },
    {
      title: 'Veículos em Manutenção',
      icon: Wrench,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      path: '/dashboard/veiculos-manutencao'
    },
    {
      title: 'Veículos Inativos',
      icon: XCircle,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      path: '/dashboard/veiculos-inativos'
    }
  ];

  if (user?.role === 'ADMIN') {
    cards.unshift({
      title: 'Cadastrar Veículo',
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      path: '/dashboard/cadastrar-veiculo'
    });
    cards.push({
      title: 'Gerenciar Usuários',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      path: '/dashboard/usuarios'
    });
  }

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          Bem-vindo, {user?.name}
        </h1>
        <p className="text-base text-slate-600">
          Sistema de Gerenciamento de Frota de Veículos - PMTF
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              className="bg-card border border-border rounded-md p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1"
              data-testid={`dashboard-card-${index}`}
            >
              <div className="flex items-start gap-4">
                <div className={`${card.bgColor} ${card.color} p-3 rounded-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-slate-800">{card.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">Clique para acessar</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
