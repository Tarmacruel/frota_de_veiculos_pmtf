import React from 'react';
import { VehicleList } from '../components/VehicleList';

export const VeiculosInativos = () => {
  return (
    <VehicleList
      status="INATIVO"
      title="Veículos Inativos"
      endpoint="/inativos"
      dataTestId="veiculos-inativos-page"
    />
  );
};
