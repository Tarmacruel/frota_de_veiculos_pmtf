import React from 'react';
import { VehicleList } from '../components/VehicleList';

export const VeiculosAtividade = () => {
  return (
    <VehicleList
      status="EM_ATIVIDADE"
      title="Veículos em Atividade"
      endpoint="/em-atividade"
      dataTestId="veiculos-atividade-page"
    />
  );
};
