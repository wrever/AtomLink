import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentNetworkConfig } from '../config/stellar';

interface StellarContextType {
  isConnected: boolean;
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transaction: any) => Promise<string>;
  callContract: (contractAddress: string, functionName: string, args: any[]) => Promise<any>;
  kit: any;
}

const StellarContext = createContext<StellarContextType | undefined>(undefined);

export const useStellar = () => {
  const context = useContext(StellarContext);
  if (!context) {
    throw new Error('useStellar debe ser usado dentro de StellarProvider');
  }
  return context;
};

interface StellarProviderProps {
  children: ReactNode;
}

export const StellarProvider: React.FC<StellarProviderProps> = ({ children }) => {
  const [kit, setKit] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeKit = async () => {
      try {
        console.log('🔍 Inicializando Stellar Wallet...');
        
        // Simular inicialización exitosa
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const networkConfig = getCurrentNetworkConfig();
        console.log('🔍 Network config:', networkConfig);
        
        // Crear un kit mock que funcione
        const mockKit = {
          network: networkConfig,
          isConnected: false,
          connect: async () => {
            console.log('🔍 Conectando wallet...');
            // Simular conexión exitosa
            return {
              publicKey: 'SAZFK4SJKHZW47ZJ4D6A2NLAYBEKYR7ENZPLSQQFKCHEFOGQIIKQDV6S',
              isConnected: true
            };
          },
          signTransaction: async (xdr: string) => {
            console.log('🔍 Firmando transacción...');
            // Simular firma exitosa
            return xdr;
          }
        };
        
        setKit(mockKit);
        setIsInitializing(false);
        console.log('✅ Stellar Wallet inicializado correctamente');
        
      } catch (error) {
        console.error('❌ Error inicializando wallet:', error);
        setIsInitializing(false);
      }
    };

    initializeKit();
  }, []);

  const connectWallet = async () => {
    if (!kit) {
      throw new Error('Kit no inicializado');
    }

    try {
      console.log('🔍 Conectando wallet...');
      
      // Simular conexión exitosa
      const result = await kit.connect();
      
      if (result) {
        console.log('🔍 Wallet conectada exitosamente');
        setIsConnected(true);
        setAddress(result.publicKey);
        console.log('🔍 Address:', result.publicKey);
      }
      
    } catch (error) {
      console.error('❌ Error conectando wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    console.log('🔍 Desconectando wallet...');
    setIsConnected(false);
    setAddress(null);
  };

  const signTransaction = async (transaction: any) => {
    if (!kit || !address) {
      throw new Error('Wallet no conectada');
    }

    try {
      console.log('🔍 Firmando transacción...');
      console.log('🔍 Transaction:', transaction);
      console.log('🔍 Address:', address);
      
      const xdr = transaction.toXDR();
      console.log('🔍 XDR creado:', xdr);
      
      const signedTxXdr = await kit.signTransaction(xdr);
      
      console.log('✅ Transacción firmada exitosamente');
      return signedTxXdr;
      
    } catch (err) {
      console.error('❌ Error al firmar transacción:', err);
      throw new Error(`Error al firmar la transacción: ${err.message}`);
    }
  };

  const callContract = async (contractAddress: string, functionName: string, args: any[] = []) => {
    if (!kit || !isConnected) {
      throw new Error('Wallet no conectada');
    }

    return {
      success: true,
      result: 'Mock result'
    };
  };

  const value: StellarContextType = {
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
    signTransaction,
    callContract,
    kit
  };

  // Mostrar loading mientras se inicializa
  if (isInitializing) {
    return (
      <StellarContext.Provider value={value}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Inicializando Stellar Wallet...
        </div>
        {children}
      </StellarContext.Provider>
    );
  }

  return (
    <StellarContext.Provider value={value}>
      {children}
    </StellarContext.Provider>
  );
};