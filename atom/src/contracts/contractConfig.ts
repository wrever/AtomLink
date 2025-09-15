import { ethers } from "ethers";
import TerrenoTokenABI from "./TerrenoToken.json";

// Función para obtener la dirección del contrato de forma dinámica
export const getContractAddress = (terreno: any): string => {
  // Si el terreno tiene contrato específico asignado por el admin
  if (terreno?.smart_contract_address && 
      typeof terreno.smart_contract_address === 'string' && 
      terreno.smart_contract_address.trim() !== '') {
    return terreno.smart_contract_address.trim();
  }
  
  // Fallback al contrato por defecto (solo para testing/desarrollo)
  return "0x17ea950822A909aA540061f29E9B5d0BeB4B52F1";
};

// Configuración de la red Sepolia
export const NETWORK_CONFIG = {
  chainId: "0xaa36a7", // 11155111 en decimal
  chainName: "Sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "SEP",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

// Función para validar dirección Ethereum
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Función para obtener la instancia del contrato dinámico
export const getContract = (provider: ethers.Provider, terreno?: any) => {
  const contractAddress = getContractAddress(terreno);
  return new ethers.Contract(contractAddress, TerrenoTokenABI, provider);
};

// Función para obtener la instancia del contrato con signer dinámico
export const getContractWithSigner = (signer: ethers.Signer, terreno?: any) => {
  const contractAddress = getContractAddress(terreno);
  return new ethers.Contract(contractAddress, TerrenoTokenABI, signer);
};

// Función para obtener un contrato específico asignado por el admin
export const getSpecificContract = (contractAddress: string, signer: ethers.Signer) => {
  if (!isValidEthereumAddress(contractAddress)) {
    throw new Error(`Dirección de contrato inválida: ${contractAddress}`);
  }
  return new ethers.Contract(contractAddress, TerrenoTokenABI, signer);
};

// Función para obtener un contrato específico con provider (solo lectura)
export const getSpecificContractWithProvider = (contractAddress: string, provider: ethers.Provider) => {
  if (!isValidEthereumAddress(contractAddress)) {
    throw new Error(`Dirección de contrato inválida: ${contractAddress}`);
  }
  return new ethers.Contract(contractAddress, TerrenoTokenABI, provider);
};

// Función para obtener el contrato correcto basado en el terreno
export const getContractForTerreno = (terreno: any, signer: ethers.Signer) => {
  // Validar que el terreno existe
  if (!terreno) {
    throw new Error('Terreno no proporcionado');
  }
  
  // Obtener la dirección del contrato específico del terreno
  const contractAddress = getContractAddress(terreno);
  
  // Si hay una dirección específica asignada por el admin
  if (contractAddress !== "0x17ea950822A909aA540061f29E9B5d0BeB4B52F1") {
    return getSpecificContract(contractAddress, signer);
  } else {
    // Usar el contrato por defecto (solo para testing)
    return getContractWithSigner(signer);
  }
};

// Función para obtener información completa del contrato ERC-1155
export const getContractInfo = async (contract: ethers.Contract, tokenId: number = 1) => {
  try {
    // Para ERC-1155, necesitamos un tokenId específico
    let nombre = 'Unknown Token';
    let ubicacion = 'Unknown Location';
    let precioPorToken = BigInt(0);
    let supplyTotal = BigInt(0);
    let tokensDisponibles = BigInt(0);
    let activo = false;
    
    try {
      const infoTerreno = await contract.obtenerInfoTerreno(tokenId);
      nombre = infoTerreno.nombre;
      ubicacion = infoTerreno.ubicacion;
      precioPorToken = infoTerreno.precioPorToken;
      supplyTotal = infoTerreno.supplyTotal;
      tokensDisponibles = infoTerreno.tokensDisponibles;
      activo = infoTerreno.activo;
    } catch (error) {
      console.log('No se pudo obtener info del terreno:', error);
    }
    
    try {
      const totalTerrenos = await contract.obtenerTotalTerrenos();
      return {
        name: nombre,
        symbol: 'LITIO',
        totalSupply: parseInt(supplyTotal.toString()),
        tokenPrice: parseFloat(ethers.formatEther(precioPorToken)),
        decimals: 18,
        isValid: true,
        hasValidPrice: precioPorToken > BigInt(0),
        ubicacion,
        tokensDisponibles: parseInt(tokensDisponibles.toString()),
        activo,
        totalTerrenos: parseInt(totalTerrenos.toString()),
        contractAddress: contract.target
      };
    } catch (error) {
      return {
        name: nombre,
        symbol: 'LITIO',
        totalSupply: parseInt(supplyTotal.toString()),
        tokenPrice: parseFloat(ethers.formatEther(precioPorToken)),
        decimals: 18,
        isValid: true,
        hasValidPrice: precioPorToken > BigInt(0),
        ubicacion,
        tokensDisponibles: parseInt(tokensDisponibles.toString()),
        activo,
        totalTerrenos: 0,
        contractAddress: contract.target
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      contractAddress: contract.target
    };
  }
};

// Función para verificar si un contrato es válido y responde
export const validateContract = async (contract: ethers.Contract): Promise<boolean> => {
  try {
    // Intentar llamar a una función básica del contrato ERC-1155
    await contract.obtenerTotalTerrenos();
    return true;
  } catch (error) {
    return false;
  }
};

// Función para verificar la compatibilidad completa del contrato ERC-1155
export const checkContractCompatibility = async (contract: ethers.Contract) => {
  const checks = {
    hasObtenerTotalTerrenos: false,
    hasObtenerInfoTerreno: false,
    hasComprarTokens: false,
    hasObtenerPrecioPorToken: false,
    hasObtenerTokensDisponibles: false,
    isCompatible: false
  };
  
  try {
    // Verificar funciones básicas del ERC-1155
    try {
      await contract.obtenerTotalTerrenos();
      checks.hasObtenerTotalTerrenos = true;
    } catch (error) {
    }
    
    try {
      await contract.obtenerInfoTerreno(1);
      checks.hasObtenerInfoTerreno = true;
    } catch (error) {
    }
    
    try {
      await contract.obtenerPrecioPorToken(1);
      checks.hasObtenerPrecioPorToken = true;
    } catch (error) {
    }
    
    try {
      await contract.obtenerTokensDisponibles(1);
      checks.hasObtenerTokensDisponibles = true;
    } catch (error) {
    }
    
    // Verificar función crítica para compras
    try {
      const comprarTokensFragment = contract.interface.getFunction('comprarTokens');
      checks.hasComprarTokens = comprarTokensFragment !== null;
    } catch (error) {
    }
    
    // Un contrato es compatible si tiene al menos las funciones básicas
    checks.isCompatible = checks.hasObtenerTotalTerrenos && checks.hasComprarTokens;
    
    return checks;
  } catch (error) {
    return checks;
  }
};

// Función para verificar si el contrato tiene la función buyTokens
export const hasBuyTokensFunction = async (contract: ethers.Contract): Promise<boolean> => {
  try {
    const comprarTokensFragment = contract.interface.getFunction('comprarTokens');
    return comprarTokensFragment !== null;
  } catch (error) {
    return false;
  }
};

// Función para obtener el precio del token desde el contrato ERC-1155
export const getTokenPriceFromContract = async (contract: ethers.Contract, tokenId: number = 1): Promise<number> => {
  try {
    const precio = await contract.obtenerPrecioPorToken(tokenId);
    return parseFloat(ethers.formatEther(precio));
  } catch (error) {
    console.error('Error obteniendo precio del contrato:', error);
    return 0;
  }
};

// Función para obtener tokens disponibles desde el contrato ERC-1155
export const getAvailableTokens = async (contract: ethers.Contract, tokenId: number = 1): Promise<number> => {
  try {
    const disponibles = await contract.obtenerTokensDisponibles(tokenId);
    return parseInt(disponibles.toString());
  } catch (error) {
    console.error('Error obteniendo tokens disponibles:', error);
    return 0;
  }
};

// Función para comprar tokens de forma segura en ERC-1155
export const buyTokensSafely = async (
  contract: ethers.Contract, 
  amount: number, 
  pricePerToken: number,
  tokenId: number = 1
): Promise<ethers.ContractTransactionResponse> => {
  try {
    // Calcular el precio total en Wei
    const priceInWei = ethers.parseEther(pricePerToken.toString());
    const totalPrice = priceInWei * BigInt(amount);
    
    // Verificar que hay suficientes tokens disponibles
    const tokensDisponibles = await contract.obtenerTokensDisponibles(tokenId);
    if (tokensDisponibles < BigInt(amount)) {
      throw new Error(`Solo hay ${tokensDisponibles.toString()} tokens disponibles`);
    }
    
    // Verificar que el precio es correcto
    const precioContrato = await contract.obtenerPrecioPorToken(tokenId);
    if (precioContrato !== priceInWei) {
      throw new Error(`Precio del contrato (${ethers.formatEther(precioContrato)} ETH) no coincide con el precio esperado (${pricePerToken} ETH)`);
    }
    
    // Ejecutar la compra
    const tx = await contract.comprarTokens(tokenId, amount, { value: totalPrice });
    return tx;
  } catch (error) {
    throw new Error(`Error al comprar tokens: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Función para formatear el precio del token
export const formatTokenPrice = (priceInWei: bigint) => {
  return parseFloat(ethers.formatEther(priceInWei));
};

// Función para parsear Ether
export const parseEther = (amount: string) => {
  return ethers.parseEther(amount);
};

// Función para formatear Ether
export const formatEther = (amount: bigint) => {
  return ethers.formatEther(amount);
};

// Función para verificar discrepancias de precio en ERC-1155
export const checkPriceDiscrepancy = async (
  contract: ethers.Contract, 
  databasePrice: number,
  tokenId: number = 1
): Promise<{
  contractPrice: number;
  databasePrice: number;
  hasDiscrepancy: boolean;
  discrepancyPercentage: number;
}> => {
  try {
    const precioContrato = await contract.obtenerPrecioPorToken(tokenId);
    const contractPrice = parseFloat(ethers.formatEther(precioContrato));
    
    const hasDiscrepancy = Math.abs(contractPrice - databasePrice) > 0.0001; // Tolerancia de 0.0001 ETH
    const discrepancyPercentage = hasDiscrepancy 
      ? ((Math.abs(contractPrice - databasePrice) / databasePrice) * 100)
      : 0;
    
    return {
      contractPrice,
      databasePrice,
      hasDiscrepancy,
      discrepancyPercentage
    };
  } catch (error) {
    return {
      contractPrice: 0,
      databasePrice,
      hasDiscrepancy: true,
      discrepancyPercentage: 100
    };
  }
};

// Función para obtener el precio recomendado en ERC-1155
export const getRecommendedPrice = async (
  contract: ethers.Contract, 
  databasePrice: number,
  tokenId: number = 1
): Promise<{
  price: number;
  source: 'contract' | 'database' | 'fallback';
  reason: string;
}> => {
  try {
    const precioContrato = await contract.obtenerPrecioPorToken(tokenId);
    const contractPrice = parseFloat(ethers.formatEther(precioContrato));
    
    if (contractPrice > 0) {
      return {
        price: contractPrice,
        source: 'contract',
        reason: 'Precio obtenido del smart contract específico del terreno'
      };
    } else if (databasePrice > 0) {
      return {
        price: databasePrice,
        source: 'database',
        reason: 'Precio obtenido de la base de datos (contrato sin precio)'
      };
    } else {
      return {
        price: 0.01, // Precio por defecto
        source: 'fallback',
        reason: 'Usando precio por defecto (0.01 ETH)'
      };
    }
  } catch (error) {
    if (databasePrice > 0) {
      return {
        price: databasePrice,
        source: 'database',
        reason: 'Precio de la base de datos (error al obtener precio del contrato)'
      };
    } else {
      return {
        price: 0.01,
        source: 'fallback',
        reason: 'Precio por defecto (error al obtener precio)'
      };
    }
  }
}; 

// Función para validar un contrato desde el panel de administración
export const validateContractForAdmin = async (contractAddress: string): Promise<{
  isValid: boolean;
  info?: any;
  error?: string;
}> => {
  try {
    if (!isValidEthereumAddress(contractAddress)) {
      return {
        isValid: false,
        error: 'Dirección de contrato inválida'
      };
    }

    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
    const contract = getSpecificContractWithProvider(contractAddress, provider);
    
    // Verificar que el contrato responde
    const totalTerrenos = await contract.obtenerTotalTerrenos();
    
    // Obtener información del primer terreno si existe
    let terrenoInfo = null;
    if (totalTerrenos > 0) {
      try {
        const info = await contract.obtenerInfoTerreno(1);
        terrenoInfo = {
          nombre: info.nombre,
          ubicacion: info.ubicacion,
          precioPorToken: parseFloat(ethers.formatEther(info.precioPorToken)),
          supplyTotal: parseInt(info.supplyTotal.toString()),
          tokensDisponibles: parseInt(info.tokensDisponibles.toString()),
          activo: info.activo
        };
      } catch (error) {
        console.log('No se pudo obtener info del terreno:', error);
      }
    }

    return {
      isValid: true,
      info: {
        totalTerrenos: parseInt(totalTerrenos.toString()),
        terrenoInfo
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Función para obtener información completa de un contrato específico
export const getContractInfoByAddress = async (contractAddress: string, tokenId: number = 1) => {
  try {
    if (!isValidEthereumAddress(contractAddress)) {
      throw new Error('Dirección de contrato inválida');
    }

    const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
    const contract = getSpecificContractWithProvider(contractAddress, provider);
    
    return await getContractInfo(contract, tokenId);
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      contractAddress
    };
  }
}; 