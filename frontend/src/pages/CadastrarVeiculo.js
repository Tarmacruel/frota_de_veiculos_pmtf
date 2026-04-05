import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const CadastrarVeiculo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    ano_fabricacao: '',
    chassi: '',
    status: 'EM_ATIVIDADE',
    lotacao_atual: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value) => {
    setFormData({ ...formData, status: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${BACKEND_URL}/api/vehicles`,
        { ...formData, ano_fabricacao: parseInt(formData.ano_fabricacao) },
        { withCredentials: true }
      );
      toast.success('Veículo cadastrado com sucesso!');
      navigate('/dashboard/veiculos-atividade');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao cadastrar veículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="cadastrar-veiculo-page">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
          data-testid="back-to-dashboard-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Cadastrar Veículo</h1>
        <p className="text-base text-slate-600 mt-2">Adicione um novo veículo à frota</p>
      </div>

      <div className="bg-card border border-border rounded-md p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                name="placa"
                placeholder="ABC-1234"
                value={formData.placa}
                onChange={handleChange}
                required
                data-testid="placa-input"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                name="marca"
                placeholder="Ex: Toyota"
                value={formData.marca}
                onChange={handleChange}
                required
                data-testid="marca-input"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                name="modelo"
                placeholder="Ex: Hilux"
                value={formData.modelo}
                onChange={handleChange}
                required
                data-testid="modelo-input"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="ano_fabricacao">Ano de Fabricação *</Label>
              <Input
                id="ano_fabricacao"
                name="ano_fabricacao"
                type="number"
                placeholder="2020"
                value={formData.ano_fabricacao}
                onChange={handleChange}
                required
                data-testid="ano-input"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="chassi">Número do Chassi *</Label>
            <Input
              id="chassi"
              name="chassi"
              placeholder="9BWZZZ377VT004251"
              value={formData.chassi}
              onChange={handleChange}
              required
              data-testid="chassi-input"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="mt-1" data-testid="status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EM_ATIVIDADE">Em Atividade</SelectItem>
                <SelectItem value="EM_MANUTENCAO">Em Manutenção</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lotacao_atual">Lotação Atual *</Label>
            <Input
              id="lotacao_atual"
              name="lotacao_atual"
              placeholder="Ex: Secretaria de Saúde"
              value={formData.lotacao_atual}
              onChange={handleChange}
              required
              data-testid="lotacao-input"
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} data-testid="submit-vehicle-button">
              {loading ? 'Cadastrando...' : 'Cadastrar Veículo'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              data-testid="cancel-button"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
