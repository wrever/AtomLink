import { useLandTokenContract, useMarketplaceContract } from '../utils/stellarContracts';
import { useStellar } from '../contexts/StellarContext';

// Hook principal que combina todos los contratos
export const useStellarContracts = () => {
  const { isConnected, address, isLoading, error } = useStellar();
  const landToken = useLandTokenContract();
  const marketplace = useMarketplaceContract();

  return {
    // Estado de conexión
    isConnected,
    address,
    isLoading,
    error,
    
    // Contratos
    landToken,
    marketplace,
    
    // Funciones de utilidad
    isReady: isConnected && !isLoading && !error,
  };
};

export default useStellarContracts;
