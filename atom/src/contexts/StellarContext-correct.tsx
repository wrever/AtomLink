import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules,
  FREIGHTER_ID,
  XBULL_ID,
  ALBEDO_ID
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
        console.log('🔍 Inicializando Stellar Wallets Kit...');
        
        const networkConfig = getCurrentNetworkConfig();
        console.log('🔍 Network config:', networkConfig);
        
        // Crear el kit con todos los módulos disponibles
        const newKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          modules: allowAllModules(),
        });
        
        console.log('🔍 Kit creado:', newKit);
        setKit(newKit);
        
        // Verificar si ya hay wallets conectadas
        try {
          const connectedWallets = await newKit.getConnectedWallets();
          console.log('🔍 Wallets conectadas:', connectedWallets);
          
          if (connectedWallets && connectedWallets.length > 0) {
            const wallet = connectedWallets[0];
            console.log('🔍 Wallet encontrada:', wallet);
            setIsConnected(true);
            setAddress(wallet.publicKey);
            setSelectedWallet(wallet.id);
          }
        } catch (walletError) {
          console.log('🔍 No hay wallets conectadas:', walletError);
        }
        
        setIsInitializing(false);
        console.log('✅ Stellar Wallets Kit inicializado correctamente');
        
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
      console.log('🔍 Abriendo modal de selección de wallet...');
      
      // Usar el modal integrado del kit
      await kit.openModal({
        onWalletSelected: async (option) => {
          console.log('🔍 Wallet seleccionada:', option);
          
          // Configurar la wallet seleccionada
          await kit.setWallet(option.id);
          setSelectedWallet(option.id);
          
          // Obtener la dirección
          const { address: walletAddress } = await kit.getAddress();
          console.log('🔍 Dirección obtenida:', walletAddress);
          
          setIsConnected(true);
          setAddress(walletAddress);
          console.log('✅ Wallet conectada exitosamente');
        },
        onClosed: (err) => {
          if (err) {
            console.error('❌ Modal cerrado con error:', err);
          } else {
            console.log('🔍 Modal cerrado sin selección');
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Error conectando wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    console.log('🔍 Desconectando wallet...');
    
    if (kit && selectedWallet) {
      try {
        // Desconectar la wallet específica
        await kit.setWallet(selectedWallet);
        // El kit maneja la desconexión internamente
      } catch (error) {
        console.error('Error desconectando:', error);
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
      console.log('🔍 Firmando transacción...');
      console.log('🔍 Transaction:', transaction);
      console.log('🔍 Address:', address);
      console.log('🔍 Selected Wallet:', selectedWallet);
      
      // Asegurar que la wallet correcta está seleccionada
      await kit.setWallet(selectedWallet);
      
      const xdr = transaction.toXDR();
      console.log('🔍 XDR creado:', xdr);
      
      const networkConfig = getCurrentNetworkConfig();
      console.log('🔍 Network passphrase:', networkConfig.networkPassphrase);
      
      const { signedTxXdr } = await kit.signTransaction(xdr, {
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

