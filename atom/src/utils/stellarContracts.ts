import { useStellar } from '../contexts/StellarContext';
import { STELLAR_CONTRACTS } from '../contracts/stellarConfig';

// Tipos para los contratos
export interface LandInfo {
  id: number;
  owner: string;
  metadata: string;
  price: number;
  created_at: number;
  is_available: boolean;
}

export interface SaleInfo {
  land_id: number;
  seller: string;
  price: number;
  is_active: boolean;
  created_at: number;
}

// Funciones para el contrato Land Token
export const useLandTokenContract = () => {
  const { callContract } = useStellar();
  const contractAddress = STELLAR_CONTRACTS.LAND_TOKENIZATION.address;

  const initialize = async (admin: string) => {
    return await callContract(contractAddress, 'initialize', [admin]);
  };

  const createLand = async (owner: string, metadata: string, price: number) => {
    return await callContract(contractAddress, 'create_land', [owner, metadata, price]);
  };

  const getLand = async (landId: number) => {
    return await callContract(contractAddress, 'get_land', [landId]);
  };

  const transferLand = async (from: string, to: string, landId: number) => {
    return await callContract(contractAddress, 'transfer_land', [from, to, landId]);
  };

  const getOwnerLands = async (owner: string) => {
    return await callContract(contractAddress, 'get_owner_lands', [owner]);
  };

  const getLandCount = async () => {
    return await callContract(contractAddress, 'get_land_count', []);
  };

  return {
    initialize,
    createLand,
    getLand,
    transferLand,
    getOwnerLands,
    getLandCount
  };
};

// Funciones para el contrato Marketplace
export const useMarketplaceContract = () => {
  const { callContract } = useStellar();
  const contractAddress = STELLAR_CONTRACTS.MARKETPLACE.address;

  const initialize = async (admin: string, commissionRate: number) => {
    return await callContract(contractAddress, 'initialize', [admin, commissionRate]);
  };

  const listLand = async (seller: string, landId: number, price: number) => {
    return await callContract(contractAddress, 'list_land', [seller, landId, price]);
  };

  const buyLand = async (buyer: string, landId: number) => {
    return await callContract(contractAddress, 'buy_land', [buyer, landId]);
  };

  const cancelSale = async (seller: string, landId: number) => {
    return await callContract(contractAddress, 'cancel_sale', [seller, landId]);
  };

  const getSaleInfo = async (landId: number) => {
    return await callContract(contractAddress, 'get_sale_info', [landId]);
  };

  const getSellerSales = async (seller: string) => {
    return await callContract(contractAddress, 'get_seller_sales', [seller]);
  };

  const getBuyerPurchases = async (buyer: string) => {
    return await callContract(contractAddress, 'get_buyer_purchases', [buyer]);
  };

  const isLandForSale = async (landId: number) => {
    return await callContract(contractAddress, 'is_land_for_sale', [landId]);
  };

  return {
    initialize,
    listLand,
    buyLand,
    cancelSale,
    getSaleInfo,
    getSellerSales,
    getBuyerPurchases,
    isLandForSale
  };
};

// Función para obtener la dirección del contrato según el tipo
export const getContractAddress = (contractType: 'LAND_TOKENIZATION' | 'MARKETPLACE'): string => {
  return STELLAR_CONTRACTS[contractType].address;
};
