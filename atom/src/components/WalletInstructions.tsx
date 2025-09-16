import React from 'react';

interface WalletInstructionsProps {
  onClose: () => void;
}

export const WalletInstructions: React.FC<WalletInstructionsProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        maxWidth: '500px',
        margin: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>🔗 Conectar Wallet Stellar</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>Para usar AtomLink necesitas una wallet Stellar:</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#007bff', marginBottom: '5px' }}>1. Freighter (Recomendado)</h4>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
              La wallet más popular para Stellar
            </p>
            <a 
              href="https://freighter.app" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: '#007bff',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Instalar Freighter
            </a>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#28a745', marginBottom: '5px' }}>2. Albedo</h4>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
              Wallet web para Stellar
            </p>
            <a 
              href="https://albedo.link" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: '#28a745',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Usar Albedo
            </a>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#ffc107', marginBottom: '5px' }}>3. xBull Wallet</h4>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
              Wallet móvil para Stellar
            </p>
            <a 
              href="https://xbull.app" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: '#ffc107',
                color: 'black',
                padding: '8px 16px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Descargar xBull
            </a>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#333', marginBottom: '10px' }}>📋 Instrucciones:</h4>
          <ol style={{ color: '#666', fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
            <li>Instala una de las wallets arriba</li>
            <li>Configura tu wallet en Testnet</li>
            <li>Obtén XLM de testnet desde <a href="https://friendbot.stellar.org" target="_blank" rel="noopener noreferrer">Friendbot</a></li>
            <li>Vuelve aquí y conecta tu wallet</li>
          </ol>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

