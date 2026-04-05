import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ArrowLeft, Edit, Trash2, History, FileDown, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const statusColors = {
  EM_ATIVIDADE: 'bg-green-100 text-green-800 border-green-200',
  EM_MANUTENCAO: 'bg-amber-100 text-amber-800 border-amber-200',
  INATIVO: 'bg-slate-100 text-slate-800 border-slate-200'
};

const statusLabels = {
  EM_ATIVIDADE: 'Em Atividade',
  EM_MANUTENCAO: 'Em Manutenção',
  INATIVO: 'Inativo'
};

export const VehicleList = ({ status, title, endpoint, dataTestId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedVehicleHistory, setSelectedVehicleHistory] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const printRef = useRef();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/vehicles${endpoint}`, {
        withCredentials: true
      });
      setVehicles(data);
    } catch (error) {
      toast.error('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle({ ...vehicle });
    setEditDialogOpen(true);
  };

  const handleUpdateVehicle = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/vehicles/${editingVehicle.id}`,
        editingVehicle,
        { withCredentials: true }
      );
      toast.success('Veículo atualizado com sucesso!');
      setEditDialogOpen(false);
      fetchVehicles();
    } catch (error) {
      toast.error('Erro ao atualizar veículo');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Tem certeza que deseja deletar este veículo?')) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/vehicles/${vehicleId}`, {
        withCredentials: true
      });
      toast.success('Veículo deletado com sucesso!');
      fetchVehicles();
    } catch (error) {
      toast.error('Erro ao deletar veículo');
    }
  };

  const handleViewHistory = async (vehicle) => {
    setSelectedVehicle(vehicle);
    try {
      const { data } = await axios.get(
        `${BACKEND_URL}/api/vehicles/${vehicle.id}/historico`,
        { withCredentials: true }
      );
      setSelectedVehicleHistory(data);
      setHistoryDialogOpen(true);
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const img = new Image();
    img.src = 'https://www.teixeiradefreitas.ba.gov.br/wp-content/uploads/2022/05/brasao-pmtf-610x768.png';
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      doc.addImage(img, 'PNG', 14, 10, 15, 18);

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Frota de Veículos PMTF', 35, 18);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(title, 35, 25);

      doc.setFontSize(10);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);

      const tableData = vehicles.map((v) => [
        v.placa,
        v.marca,
        v.modelo,
        v.ano_fabricacao,
        v.chassi,
        statusLabels[v.status],
        v.lotacao_atual
      ]);

      doc.autoTable({
        startY: 40,
        head: [['Placa', 'Marca', 'Modelo', 'Ano', 'Chassi', 'Status', 'Lotação']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
        margin: { top: 40 }
      });

      doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    };

    img.onerror = () => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Frota de Veículos PMTF', 14, 18);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(title, 14, 25);

      doc.setFontSize(10);
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);

      const tableData = vehicles.map((v) => [
        v.placa,
        v.marca,
        v.modelo,
        v.ano_fabricacao,
        v.chassi,
        statusLabels[v.status],
        v.lotacao_atual
      ]);

      doc.autoTable({
        startY: 40,
        head: [['Placa', 'Marca', 'Modelo', 'Ano', 'Chassi', 'Status', 'Lotação']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
        margin: { top: 40 }
      });

      doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    };
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando veículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid={dataTestId}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
          <p className="text-base text-slate-600 mt-2">
            {vehicles.length} veículo(s) encontrado(s)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            data-testid="export-pdf-button"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            data-testid="print-button"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      <div ref={printRef} className="bg-card border border-border rounded-md overflow-hidden">
        <div className="p-6 print-header" style={{ display: 'none' }}>
          <div className="flex items-center gap-4 mb-4">
            <img
              src="https://www.teixeiradefreitas.ba.gov.br/wp-content/uploads/2022/05/brasao-pmtf-610x768.png"
              alt="Brasão PMTF"
              className="w-12 h-16 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold">Frota de Veículos PMTF</h2>
              <p className="text-sm">{title}</p>
              <p className="text-xs text-slate-500">
                Data: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Chassi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lotação</TableHead>
                <TableHead className="print-hidden">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum veículo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} data-testid={`vehicle-row-${vehicle.placa}`}>
                    <TableCell className="font-medium">{vehicle.placa}</TableCell>
                    <TableCell>{vehicle.marca}</TableCell>
                    <TableCell>{vehicle.modelo}</TableCell>
                    <TableCell>{vehicle.ano_fabricacao}</TableCell>
                    <TableCell className="font-mono text-sm">{vehicle.chassi}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                          statusColors[vehicle.status]
                        }`}
                      >
                        {statusLabels[vehicle.status]}
                      </span>
                    </TableCell>
                    <TableCell>{vehicle.lotacao_atual}</TableCell>
                    <TableCell className="print-hidden">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewHistory(vehicle)}
                          data-testid={`history-button-${vehicle.placa}`}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(vehicle)}
                              data-testid={`edit-button-${vehicle.placa}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(vehicle.id)}
                              data-testid={`delete-button-${vehicle.placa}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="edit-vehicle-dialog">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>Atualize as informações do veículo</DialogDescription>
          </DialogHeader>
          {editingVehicle && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-placa">Placa</Label>
                <Input
                  id="edit-placa"
                  value={editingVehicle.placa}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, placa: e.target.value })
                  }
                  data-testid="edit-placa-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-marca">Marca</Label>
                  <Input
                    id="edit-marca"
                    value={editingVehicle.marca}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, marca: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-modelo">Modelo</Label>
                  <Input
                    id="edit-modelo"
                    value={editingVehicle.modelo}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, modelo: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingVehicle.status}
                  onValueChange={(value) =>
                    setEditingVehicle({ ...editingVehicle, status: value })
                  }
                >
                  <SelectTrigger data-testid="edit-status-select">
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
                <Label htmlFor="edit-lotacao">Lotação Atual</Label>
                <Input
                  id="edit-lotacao"
                  value={editingVehicle.lotacao_atual}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, lotacao_atual: e.target.value })
                  }
                  data-testid="edit-lotacao-input"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateVehicle} data-testid="save-vehicle-button">
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl" data-testid="history-dialog">
          <DialogHeader>
            <DialogTitle>
              Histórico de Lotação - {selectedVehicle?.placa}
            </DialogTitle>
            <DialogDescription>Visualize todas as movimentações do veículo</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Local</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedVehicleHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      Nenhum histórico encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  selectedVehicleHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.local}</TableCell>
                      <TableCell>
                        {new Date(entry.data_inicio).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {entry.data_fim
                          ? new Date(entry.data_fim).toLocaleDateString('pt-BR')
                          : 'Atual'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
          .print-header {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
