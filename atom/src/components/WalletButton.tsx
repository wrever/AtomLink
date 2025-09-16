import React, { useState } from "react";
import { useStellar } from "../contexts/StellarContext";
import { formatAddress } from "../config/stellar";
// import { WalletInstructions } from "./WalletInstructions";

const WalletButton: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const { 
    isConnected, 
    address, 
    connectWallet, 
    disconnectWallet,
    selectedWallet
  } = useStellar();

  const getWalletName = (walletId: string | null) => {
    const walletNames: { [key: string]: string } = {
      'xBull': 'xBull Wallet',
      'freighter': 'Freighter',
      'albedo': 'Albedo',
      'rabet': 'Rabet',
      'walletConnect': 'WalletConnect',
      'lobstr': 'Lobstr',
      'hana': 'Hana',
      'hotWallet': 'Hot Wallet',
      'klever': 'Klever'
    };
    return walletNames[walletId || ''] || 'Stellar Wallet';
  };

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      // Si hay error, mostrar instrucciones
      setShowInstructions(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
    }
  };

  if (isConnected && address) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 500 }}>
            {getWalletName(selectedWallet)}
          </span>
          <span style={{ fontSize: 14, color: "var(--color-primary)", fontWeight: 600 }}>
            {formatAddress(address)}
          </span>
        </div>
        <button onClick={handleDisconnect} style={{
          background: "#232b3b",
          color: "var(--color-primary)",
          border: "1px solid var(--color-primary)",
          borderRadius: "var(--radius)",
          padding: "0.3rem 0.8rem",
          fontWeight: 600,
          cursor: "pointer"
        }}>
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <>
       <button 
         onClick={handleConnect} 
         style={{
           background: "var(--color-primary)",
           color: "#181f2a",
           border: "none",
           borderRadius: "var(--radius)",
           padding: "0.5rem 1.2rem",
           fontWeight: 600,
           cursor: "pointer",
           boxShadow: "var(--shadow)"
         }}
       >
         Conectar Wallet
       </button>
      
      {showInstructions && (
        {/* <WalletInstructions onClose={() => setShowInstructions(false)} /> */}
      )}
    </>
  );
};

export default WalletButton;
