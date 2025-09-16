import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules
} from '@creit.tech/stellar-wallets-kit';
import { getCurrentNetworkConfig } from '../config/stellar';

interface StellarContextType {
  isConnected: boolean;
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transaction: any) => Promise<string>;
  callContract: (contractAddress: string, functionName: string, args: any[]) => Promise<any>;
  kit: StellarWalletsKit | null;
  selectedWallet: string | null;
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
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeKit = async () => {
      try {
        
        // const networkConfig = getCurrentNetworkConfig();
        
        // Crear el kit con todos los módulos disponibles
        const newKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          modules: allowAllModules(),
        });
        
        setKit(newKit);
        
        // Verificar si ya hay wallets conectadas
        try {
          // const connectedWallets = await newKit.getConnectedWallets();
          
          // if (connectedWallets && connectedWallets.length > 0) {
          //   const wallet = connectedWallets[0];
          //   setIsConnected(true);
          //   setAddress(wallet.publicKey);
          //   setSelectedWallet(wallet.id);
          // }
        } catch (walletError) {
        }
        
        setIsInitializing(false);
        
      } catch (error) {
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
      
      // Usar el modal integrado del kit
      await kit.openModal({
        onWalletSelected: async (option) => {
          
          // Configurar la wallet seleccionada
          await kit.setWallet(option.id);
          setSelectedWallet(option.id);
          
          // Obtener la dirección
          const { address: walletAddress } = await kit.getAddress();
          
          setIsConnected(true);
          setAddress(walletAddress);
        },
        onClosed: (err) => {
          if (err) {
          } else {
          }
        }
      });
      
    } catch (error) {
      throw error;
    }
  };

  const disconnectWallet = async () => {
    
    if (kit && selectedWallet) {
      try {
        // Desconectar la wallet específica
        await kit.setWallet(selectedWallet);
        // El kit maneja la desconexión internamente
      } catch (error) {
      }
    }
    
    setIsConnected(false);
    setAddress(null);
    setSelectedWallet(null);
  };

  const signTransaction = async (transaction: any) => {
    if (!kit || !address || !selectedWallet) {
      throw new Error('Wallet no conectada');
    }

    try {
      
      // Asegurar que la wallet correcta está seleccionada
      await kit.setWallet(selectedWallet);
      
      const xdr = transaction.toXDR();
      
      const networkConfig = getCurrentNetworkConfig();
      
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: networkConfig.networkPassphrase
      });
      
      return signedTxXdr;
      
    } catch (err) {
      throw new Error(`Error al firmar la transacción: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const callContract = async (_contractAddress: string, _functionName: string, _args: any[] = []) => {
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
    kit,
    selectedWallet
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
          Inicializando Stellar Wallets Kit...
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
