import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  XBULL_ID,
  xBullModule,
  FreighterModule,
  AlbedoModule,
  RabetModule,
  LobstrModule,
  HanaModule,
  HotWalletModule,
  KleverModule,
  type ISupportedWallet
} from '@creit.tech/stellar-wallets-kit';
import { getCurrentNetworkConfig, formatBalance } from '../config/stellar';

// Tipos para el contexto
interface StellarContextType {
  // Estado de conexión
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  selectedWallet: string | null;
  
  // Funciones de conexión
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // Funciones de transacción
  signTransaction: (xdr: string) => Promise<string>;
  callContract: (contractAddress: string, functionName: string, args?: any[]) => Promise<any>;
  
  // Estado de carga
  isLoading: boolean;
  error: string | null;
  
  // Kit instance
  kit: StellarWalletsKit | null;
}

// Crear el contexto
const StellarContext = createContext<StellarContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useStellar = () => {
  const context = useContext(StellarContext);
  if (context === undefined) {
    throw new Error('useStellar must be used within a StellarProvider');
  }
  return context;
};

// Props del provider
interface StellarProviderProps {
  children: ReactNode;
}

// Provider component
export const StellarProvider: React.FC<StellarProviderProps> = ({ children }) => {
  // Estados
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [networkConfig] = useState(getCurrentNetworkConfig());

  // Inicializar el kit al montar el componente
  useEffect(() => {
    const initializeKit = async () => {
      try {
        // Usar solo módulos específicos para evitar conflictos
        const modules = [
          new xBullModule(),
          new FreighterModule(),
          new AlbedoModule(),
          new RabetModule(),
          new LobstrModule(),
          new HanaModule(),
          new HotWalletModule(),
          new KleverModule(),
        ];

        const stellarKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: XBULL_ID,
          modules: modules,
        });
        
        setKit(stellarKit);
        console.log('Stellar Wallets Kit inicializado correctamente');
      } catch (err) {
        console.error('Error al inicializar Stellar Wallets Kit:', err);
        setError('Error al inicializar el kit de wallets');
      }
    };

    // Delay para evitar conflictos con extensiones
    const timer = setTimeout(initializeKit, 100);
    return () => clearTimeout(timer);
  }, []);

  // Función para conectar wallet
  const connectWallet = async () => {
    if (!kit) {
      setError('Kit de wallets no inicializado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          try {
            // Configurar la wallet seleccionada
            await kit.setWallet(option.id);
            setSelectedWallet(option.id);
            
            // Obtener la dirección
            const { address: walletAddress } = await kit.getAddress();
            setAddress(walletAddress);
            setIsConnected(true);
            
            // Obtener balance usando Horizon API
            try {
              const response = await fetch(`${networkConfig.horizonUrl}/accounts/${walletAddress}`);
              if (response.ok) {
                const accountData = await response.json();
                const xlmBalance = accountData.balances.find((b: any) => b.asset_type === 'native');
                if (xlmBalance) {
                  setBalance(`${formatBalance(xlmBalance.balance)} XLM`);
                } else {
                  setBalance('0.00 XLM');
                }
              } else {
                setBalance('N/A');
              }
            } catch (balanceError) {
              console.warn('No se pudo obtener el balance:', balanceError);
              setBalance('N/A');
            }
            
            console.log('Wallet conectada:', option.name, walletAddress);
          } catch (err) {
            console.error('Error al conectar wallet:', err);
            setError('Error al conectar la wallet');
            setIsConnected(false);
            setAddress(null);
            setSelectedWallet(null);
          }
        },
        onClosed: (err) => {
          if (err) {
            console.error('Modal cerrado con error:', err);
            setError('Error al seleccionar wallet');
          }
          setIsLoading(false);
        },
        modalTitle: `Conectar Wallet Stellar - ${networkConfig.name}`,
        notAvailableText: 'Wallet no disponible'
      });
    } catch (err) {
      console.error('Error al abrir modal de wallets:', err);
      setError('Error al abrir modal de wallets');
      setIsLoading(false);
    }
  };

  // Función para desconectar wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance(null);
    setSelectedWallet(null);
    setError(null);
    console.log('Wallet desconectada');
  };

  // Función para firmar transacciones
  const signTransaction = async (xdr: string): Promise<string> => {
    if (!kit || !isConnected) {
      throw new Error('Wallet no conectada');
    }

    try {
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        address: address!,
        networkPassphrase: networkConfig.networkPassphrase
      });
      
      return signedTxXdr;
    } catch (err) {
      console.error('Error al firmar transacción:', err);
      throw new Error('Error al firmar la transacción');
    }
  };

  // Función para interactuar con contratos Stellar
  const callContract = async (contractAddress: string, functionName: string, args: any[] = []) => {
    if (!kit || !isConnected) {
      throw new Error('Wallet no conectada');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(`Llamando función ${functionName} en contrato ${contractAddress} con args:`, args);
      
      // Construir la transacción para llamar al contrato
      const { Server } = await import('@stellar/stellar-sdk');
      const server = new Server(networkConfig.horizonUrl);
      
      // Obtener la cuenta del usuario
      const account = await server.loadAccount(address!);
      
      // Crear la operación de invocación del contrato
      const operation = Server.operation.invokeHostFunction({
        contractAddress: contractAddress,
        functionName: functionName,
        args: args.map(arg => {
          // Convertir argumentos según el tipo
          if (typeof arg === 'string') {
            return Server.scVal.scvString(arg);
          } else if (typeof arg === 'number') {
            return Server.scVal.scvU32(arg);
          } else if (typeof arg === 'boolean') {
            return Server.scVal.scvBool(arg);
          } else {
            return Server.scVal.scvString(JSON.stringify(arg));
          }
        })
      });

      // Crear la transacción
      const transaction = new Server.TransactionBuilder(account, {
        fee: Server.BASE_FEE,
        networkPassphrase: networkConfig.networkPassphrase
      })
      .addOperation(operation)
      .setTimeout(30)
      .build();

      // Firmar la transacción
      const signedXdr = await signTransaction(transaction.toXDR());
      
      // Enviar la transacción
      const response = await server.submitTransaction(Server.TransactionBuilder.fromXDR(signedXdr, networkConfig.networkPassphrase));
      
      console.log('Transacción enviada:', response);
      
      return { 
        success: true, 
        result: response.resultXdr,
        hash: response.hash
      };
    } catch (err: any) {
      console.error('Error llamando contrato:', err);
      setError(err.message || 'Error al llamar contrato');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Valores del contexto
  const contextValue: StellarContextType = {
    isConnected,
    address,
    balance,
    selectedWallet,
    connectWallet,
    disconnectWallet,
    signTransaction,
    callContract,
    isLoading,
    error,
    kit
  };

  return (
    <StellarContext.Provider value={contextValue}>
      {children}
    </StellarContext.Provider>
  );
};

export default StellarContext;
