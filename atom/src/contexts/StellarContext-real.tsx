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

// Declarar la interfaz de Freighter
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      connect: () => Promise<{ publicKey: string }>;
      disconnect: () => Promise<void>;
      signTransaction: (xdr: string) => Promise<string>;
    };
  }
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
        
        // Esperar a que Freighter esté disponible
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts && !window.freighter) {
          console.log(`🔍 Esperando Freighter... intento ${attempts + 1}/${maxAttempts}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (!window.freighter) {
          console.warn('⚠️ Freighter no está disponible. Usando modo simulación.');
          // Crear kit mock si Freighter no está disponible
          const mockKit = {
            isConnected: () => false,
            connect: async () => {
              throw new Error('Freighter no está instalado. Por favor instala Freighter desde https://freighter.app');
            },
            signTransaction: async () => {
              throw new Error('Freighter no está instalado');
            }
          };
          setKit(mockKit);
          setIsInitializing(false);
          return;
        }
        
        console.log('✅ Freighter detectado');
        
        // Verificar si ya está conectado
        const alreadyConnected = await window.freighter.isConnected();
        if (alreadyConnected) {
          console.log('🔍 Ya hay una wallet conectada');
          setIsConnected(true);
          // No podemos obtener la dirección sin conectar explícitamente
        }
        
        setKit(window.freighter);
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
      
      if (kit.connect) {
        const result = await kit.connect();
        
        if (result && result.publicKey) {
          console.log('🔍 Wallet conectada exitosamente');
          setIsConnected(true);
          setAddress(result.publicKey);
          console.log('🔍 Address:', result.publicKey);
        }
      } else {
        throw new Error('Freighter no está instalado. Por favor instala Freighter desde https://freighter.app');
      }
      
    } catch (error) {
      console.error('❌ Error conectando wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    console.log('🔍 Desconectando wallet...');
    
    if (kit && kit.disconnect) {
      try {
        await kit.disconnect();
      } catch (error) {
        console.error('Error desconectando:', error);
      }
    }
    
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
      
      if (kit.signTransaction) {
        const signedTxXdr = await kit.signTransaction(xdr);
        console.log('✅ Transacción firmada exitosamente');
        return signedTxXdr;
      } else {
        throw new Error('Función de firma no disponible');
      }
      
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

