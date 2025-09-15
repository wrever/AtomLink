// Configuración de Stellar Network para AtomLink
export const STELLAR_CONFIG = {
  // Redes
  NETWORKS: {
    TESTNET: {
      networkPassphrase: 'Test SDF Network ; September 2015',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      rpcUrl: 'https://soroban-testnet.stellar.org',
      friendbotUrl: 'https://friendbot.stellar.org',
      name: 'Stellar Testnet'
    },
    MAINNET: {
      networkPassphrase: 'Public Global Stellar Network ; September 2015',
      horizonUrl: 'https://horizon.stellar.org',
      rpcUrl: 'https://soroban-mainnet.stellar.org',
      name: 'Stellar Mainnet'
    }
  },

  // Configuración actual (usar testnet para desarrollo)
  CURRENT_NETWORK: 'TESTNET',

  // Configuración de contratos (actualizar con IDs reales después del deploy)
  CONTRACTS: {
    LAND_TOKENIZATION: {
      address: 'CB2U5RWNYTWGAU2T2CQVJVK7ZADUNEM3QCVQWIVL6ES7Y3FNAEYRQCPY', // Contract ID del LandTokenization
      name: 'LandTokenization'
    },
    MARKETPLACE: {
      address: 'CD7FJRQ2LKKW5LIFIMXNFPUHLZXCLVDPYIZHOGYCLC5P4M4OWMLZ3XS4', // Contract ID del Marketplace
      name: 'Marketplace'
    }
  },

  // Configuración de tokens
  TOKENS: {
    XLM: {
      code: 'XLM',
      issuer: 'native',
      name: 'Stellar Lumens'
    },
    // TODO: Agregar tokens personalizados cuando se creen
  },

  // Configuración de transacciones
  TRANSACTION: {
    // Tiempo de timeout para transacciones (en segundos)
    timeout: 30,
    // Fee base para transacciones (en stroops)
    baseFee: 100,
    // Número máximo de intentos para transacciones
    maxRetries: 3
  },

  // Configuración de UI
  UI: {
    // Número de decimales para mostrar balances
    decimals: 7,
    // Símbolo de la moneda
    currencySymbol: 'XLM',
    // Formato de fecha para transacciones
    dateFormat: 'DD/MM/YYYY HH:mm:ss'
  }
};

// Función helper para obtener la configuración de la red actual
export const getCurrentNetworkConfig = () => {
  return STELLAR_CONFIG.NETWORKS[STELLAR_CONFIG.CURRENT_NETWORK as keyof typeof STELLAR_CONFIG.NETWORKS];
};

// Función helper para formatear balances
export const formatBalance = (balance: string | number, decimals: number = STELLAR_CONFIG.UI.decimals): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  return num.toFixed(decimals);
};

// Función helper para formatear direcciones
export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// Función helper para validar direcciones Stellar
export const isValidStellarAddress = (address: string): boolean => {
  // Las direcciones Stellar tienen 56 caracteres y empiezan con G, M, S, o T
  const stellarAddressRegex = /^[G-M][A-Z0-9]{55}$/;
  return stellarAddressRegex.test(address);
};

// Función helper para obtener el nombre de la red
export const getNetworkName = (): string => {
  return getCurrentNetworkConfig().name;
};

// Función helper para obtener la URL de Horizon
export const getHorizonUrl = (): string => {
  return getCurrentNetworkConfig().horizonUrl;
};

// Función helper para obtener el network passphrase
export const getNetworkPassphrase = (): string => {
  return getCurrentNetworkConfig().networkPassphrase;
};

export default STELLAR_CONFIG;
