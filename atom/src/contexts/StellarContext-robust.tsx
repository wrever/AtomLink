import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit';
import { WalletNetwork } from '@creit.tech/stellar-wallets-kit';
import { getCurrentNetworkConfig } from '../config/stellar';

interface StellarContextType {
  isConnected: boolean;
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transaction: any) => Promise<string>;
  callContract: (contractAddress: string, functionName: string, args: any[]) => Promise<any>;
  kit: StellarWalletsKit | null;
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
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeKit = async () => {
      try {
        console.log('🔍 Inicializando Stellar Wallets Kit...');
        
        // Esperar un poco para que el DOM esté listo
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const networkConfig = getCurrentNetworkConfig();
        console.log('🔍 Network config:', networkConfig);
        
        // Crear el kit con configuración más simple
        const newKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          modal: true
        });
        
        console.log('🔍 Kit creado:', newKit);
        setKit(newKit);
        
        // Verificar wallets conectadas
        try {
          const connectedWallets = await newKit.getConnectedWallets();
          console.log('🔍 Wallets conectadas:', connectedWallets);
          
          if (connectedWallets && connectedWallets.length > 0) {
            const wallet = connectedWallets[0];
            console.log('🔍 Wallet encontrada:', wallet);
            setIsConnected(true);
            setAddress(wallet.publicKey);
          }
        } catch (walletError) {
          console.log('🔍 No hay wallets conectadas:', walletError);
        }
        
        setIsInitializing(false);
        console.log('✅ Kit inicializado correctamente');
        
      } catch (error) {
        console.error('❌ Error inicializando kit:', error);
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
      
      const result = await kit.openModal({
        onWalletSelected: async (option) => {
          console.log('🔍 Wallet seleccionada:', option);
          return option;
        }
      });
      
      console.log('🔍 Resultado de conexión:', result);
      
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
      
      const networkConfig = getCurrentNetworkConfig();
      console.log('🔍 Network passphrase:', networkConfig.networkPassphrase);
      
      const signedTxXdr = await kit.signTransaction(xdr, {
        address: address,
        networkPassphrase: networkConfig.networkPassphrase
      });
      
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

