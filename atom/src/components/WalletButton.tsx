import React from "react";
import { useStellar } from "../contexts/StellarContext";
import { formatAddress } from "../config/stellar";

const WalletButton: React.FC = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    selectedWallet, 
    connectWallet, 
    disconnectWallet, 
    isLoading, 
    error 
  } = useStellar();

  const getWalletName = (walletId: string | null) => {
    const walletNames: { [key: string]: string } = {
      'xBull': 'xBull',
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

  return (
    <div>
      {isConnected && address ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 500 }}>
              {getWalletName(selectedWallet)}
            </span>
            <span style={{ fontSize: 14, color: "var(--color-primary)", fontWeight: 600 }}>
              {formatAddress(address)}
            </span>
            {balance && (
              <span style={{ fontSize: 11, color: "#888", fontWeight: 400 }}>
                {balance}
              </span>
            )}
          </div>
          <button onClick={disconnectWallet} style={{
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
      ) : (
        <button 
          onClick={connectWallet} 
          disabled={isLoading}
          style={{
            background: isLoading ? "#666" : "var(--color-primary)",
            color: "#181f2a",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "0.5rem 1.2rem",
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: "var(--shadow)",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? "Conectando..." : "Conectar Wallet"}
        </button>
      )}
      {error && (
        <div style={{ 
          color: "#ff6b6b", 
          fontSize: 12, 
          marginTop: 4, 
          textAlign: "center" 
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletButton; 