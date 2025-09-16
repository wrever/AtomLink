import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StellarWalletsKit } from '@stellar/wallets-kit';
import { WalletNetwork } from '@stellar/wallets-kit';
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

  useEffect(() => {
    const initializeKit = async () => {
      try {
        const networkConfig = getCurrentNetworkConfig();
        
        const newKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: 'freighter',
          modal: true
        });
        
        setKit(newKit);
        
        const connectedWallets = await newKit.getConnectedWallets();
        
        if (connectedWallets.length > 0) {
          const wallet = connectedWallets[0];
          setIsConnected(true);
          setAddress(wallet.publicKey);
        }
        
      } catch (error) {
        console.error('Error inicializando kit:', error);
      }
    };

    initializeKit();
  }, []);

  const connectWallet = async () => {
    if (!kit) {
      throw new Error('Kit no inicializado');
    }

    try {
      const result = await kit.openModal({
        onWalletSelected: async (option) => {
          return option;
        }
      });
      
      if (result) {
        setIsConnected(true);
        setAddress(result.publicKey);
      }
      
    } catch (error) {
      console.error('Error conectando wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  const signTransaction = async (transaction: any) => {
    if (!kit || !address) {
      throw new Error('Wallet no conectada');
    }

    try {
      const xdr = transaction.toXDR();
      const networkConfig = getCurrentNetworkConfig();
      
      const signedTxXdr = await kit.signTransaction(xdr, {
        address: address,
        networkPassphrase: networkConfig.networkPassphrase
      });
      
      return signedTxXdr;
      
    } catch (err) {
      console.error('Error al firmar transacción:', err);
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

  return (
    <StellarContext.Provider value={value}>
      {children}
    </StellarContext.Provider>
  );
};

