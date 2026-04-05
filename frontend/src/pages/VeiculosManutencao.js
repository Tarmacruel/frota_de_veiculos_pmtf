import React from 'react';
import { VehicleList } from '../components/VehicleList';

export const VeiculosManutencao = () => {
  return (
    <VehicleList
      status="EM_MANUTENCAO"
      title="Veículos em Manutenção"
      endpoint="/em-manutencao"
      dataTestId="veiculos-manutencao-page"
    />
  );
};
