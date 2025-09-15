import { createContext, useContext, useState, type ReactNode } from "react";
import { ethers } from "ethers";

interface WalletContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  connectWallet: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    // Detectar diferentes proveedores de wallet
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
      // Verificar si es móvil y redirigir a MetaMask
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        alert("Por favor instala MetaMask desde la App Store o Google Play Store");
        // Opcional: abrir tienda de apps
        // window.open('https://metamask.io/download/');
      } else {
        alert("Por favor instala MetaMask desde https://metamask.io/");
      }
      return;
    }

    try {
      // Verificar si la página está en HTTPS (requerido para móviles)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        alert("Para conectar tu wallet desde móvil, el sitio debe usar HTTPS");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      
      // Solicitar cuentas
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
    
      } else {
        alert("No se pudo obtener la cuenta de MetaMask");
      }
    } catch (err: any) {
   
      
      if (err.code === 4001) {
        alert("Conexión cancelada por el usuario");
      } else if (err.code === -32002) {
        alert("Por favor desbloquea MetaMask y vuelve a intentar");
      } else {
        alert(`Error al conectar la wallet: ${err.message || 'Error desconocido'}`);
      }
    }
  };

  return (
    <WalletContext.Provider value={{ account, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}; 