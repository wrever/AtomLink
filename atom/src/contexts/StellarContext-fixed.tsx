// Contexto Stellar CORREGIDO para AtomLink
// Versión funcional sin errores de sintaxis

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
        console.log('🔍 DEBUG: Inicializando Stellar Wallets Kit...');
        
        const networkConfig = getCurrentNetworkConfig();
        console.log('🔍 DEBUG: Network config:', networkConfig);
        
        const newKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: 'freighter',
          modal: true
        });
        
        console.log('🔍 DEBUG: Kit creado:', newKit);
        setKit(newKit);
        
        // Verificar si ya hay una conexión
        const connectedWallets = await newKit.getConnectedWallets();
        console.log('🔍 DEBUG: Wallets conectadas:', connectedWallets);
        
        if (connectedWallets.length > 0) {
          const wallet = connectedWallets[0];
          console.log('🔍 DEBUG: Wallet encontrada:', wallet);
          setIsConnected(true);
          setAddress(wallet.publicKey);
        }
        
      } catch (error) {
        console.error('❌ ERROR inicializando kit:', error);
      }
    };

    initializeKit();
  }, []);

  const connectWallet = async () => {
    if (!kit) {
      throw new Error('Kit no inicializado');
    }

    try {
      console.log('🔍 DEBUG: Conectando wallet...');
      
      const result = await kit.openModal({
        onWalletSelected: async (option) => {
          console.log('🔍 DEBUG: Wallet seleccionada:', option);
          return option;
        }
      });
      
      console.log('🔍 DEBUG: Resultado de conexión:', result);
      
      if (result) {
        console.log('🔍 DEBUG: Wallet conectada exitosamente');
        setIsConnected(true);
        setAddress(result.publicKey);
        console.log('🔍 DEBUG: Address:', result.publicKey);
      }
      
    } catch (error) {
      console.error('❌ ERROR conectando wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    console.log('🔍 DEBUG: Desconectando wallet...');
    setIsConnected(false);
    setAddress(null);
  };

  const signTransaction = async (transaction: any) => {
    if (!kit || !address) {
      throw new Error('Wallet no conectada');
    }

    try {
      console.log('🔍 DEBUG: Firmando transacción...');
      console.log('🔍 DEBUG: Transaction:', transaction);
      console.log('🔍 DEBUG: Address:', address);
      
      // Convertir transacción a XDR
      const xdr = transaction.toXDR();
      console.log('🔍 DEBUG: XDR creado:', xdr);
      
      const networkConfig = getCurrentNetworkConfig();
      console.log('🔍 DEBUG: Network passphrase:', networkConfig.networkPassphrase);
      
      // Intentar firmar con diferentes configuraciones
      let signedTxXdr;
      
      try {
        // Método 1: Firma básica
        console.log('🔍 DEBUG: Intentando firma básica...');
        signedTxXdr = await kit.signTransaction(xdr, {
          address: address,
          networkPassphrase: networkConfig.networkPassphrase
        });
        console.log('✅ DEBUG: Firma básica exitosa');
        
      } catch (error1) {
        console.error('❌ ERROR en firma básica:', error1);
        
        try {
          // Método 2: Firma sin networkPassphrase
          console.log('🔍 DEBUG: Intentando firma sin networkPassphrase...');
          signedTxXdr = await kit.signTransaction(xdr, {
            address: address
          });
          console.log('✅ DEBUG: Firma sin networkPassphrase exitosa');
          
        } catch (error2) {
          console.error('❌ ERROR en firma sin networkPassphrase:', error2);
          
          try {
            // Método 3: Firma con configuración mínima
            console.log('🔍 DEBUG: Intentando firma con configuración mínima...');
            signedTxXdr = await kit.signTransaction(xdr);
            console.log('✅ DEBUG: Firma con configuración mínima exitosa');
            
          } catch (error3) {
            console.error('❌ ERROR en firma con configuración mínima:', error3);
            throw new Error(`Error al firmar transacción: ${error3.message}`);
          }
        }
      }
      
      console.log('✅ DEBUG: Transacción firmada exitosamente');
      return signedTxXdr;
      
    } catch (err) {
      console.error('❌ ERROR GENERAL al firmar transacción:', err);
      console.error('❌ Stack trace:', err.stack);
      throw new Error(`Error al firmar la transacción: ${err.message}`);
    }
  };

  const callContract = async (contractAddress: string, functionName: string, args: any[] = []) => {
    if (!kit || !isConnected) {
      throw new Error('Wallet no conectada');
    }

    try {
      console.log('🔍 DEBUG: Llamando contrato...');
      console.log('🔍 DEBUG: Contract address:', contractAddress);
      console.log('🔍 DEBUG: Function:', functionName);
      console.log('🔍 DEBUG: Args:', args);
      
      // Esta función se puede implementar más tarde
      // Por ahora, solo retornamos un mock
      return {
        success: true,
        result: 'Mock result'
      };
      
    } catch (error) {
      console.error('❌ ERROR llamando contrato:', error);
      throw error;
    }
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

