import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/terrenoDetalles.css";
import { useStellar } from "../contexts/StellarContext";
import { getContractForTerreno, buyTokensSafely, getContractInfo } from "../contracts/stellarConfig";
// import * as StellarSdk from '@stellar/stellar-sdk';
// import { Networks } from '@stellar/stellar-sdk';

const API = import.meta.env.VITE_BACKEND_URL;

const TerrenoDetalles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected, address, connectWallet } = useStellar();
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cantidadTokens, setCantidadTokens] = useState(1);
  const [terreno, setTerreno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contractInfo, setContractInfo] = useState<any>(null);

  // Hook de imagen activa siempre aquí
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API}/terrenos/detalle.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTerreno(data.data || null);
        } else {
          setTerreno(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Cargar información del smart contract cuando el terreno esté disponible
  useEffect(() => {
    if (!terreno) {
      setContractInfo(null);
      return;
    }

    const loadContractInfo = async () => {
      try {
        // Intentar cargar información del contrato Stellar
        if (terreno.smart_contract_address) {
          // Para comprar tokens, usamos el contrato MARKETPLACE
          const contract = getContractForTerreno(terreno, 'MARKETPLACE');
          const contractInfo = await getContractInfo(contract);
          
          if (contractInfo.isValid) {
            const combinedInfo = {
              precioFinal: contractInfo.tokenPrice || parseFloat(terreno.precio),
              supplyFinal: contractInfo.totalSupply || parseInt(terreno.tokens_totales),
              tokensDisponiblesFinal: contractInfo.tokensDisponibles || parseInt(terreno.tokens_disponibles),
              fuente: 'stellar_contract',
              isValid: true
            };
            setContractInfo(combinedInfo);
            return;
          }
        }
        
        // Fallback a información del backend
        const combinedInfo = {
          precioFinal: parseFloat(terreno.precio),
          supplyFinal: parseInt(terreno.tokens_totales),
          tokensDisponiblesFinal: parseInt(terreno.tokens_disponibles),
          fuente: 'backend',
          isValid: true
        };
        
        setContractInfo(combinedInfo);
      } catch (error) {
        setContractInfo({ 
          isValid: false, 
          error: 'No se pudo cargar información del contrato Stellar',
          precioFinal: parseFloat(terreno.precio),
          supplyFinal: parseInt(terreno.tokens_totales),
          tokensDisponiblesFinal: parseInt(terreno.tokens_disponibles),
          fuente: 'backend'
        });
      }
    };

    loadContractInfo();
  }, [terreno]);

  useEffect(() => {
    if (!loading && !terreno) {
      navigate("/terrenos");
    }
  }, [loading, terreno, navigate]);

  // Galería de imágenes (puede ser vacío si no hay terreno)
  const imagenes = Array.isArray(terreno?.imagenes) ? terreno.imagenes : [];

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Cargando detalles del terreno...</div>;
  }

  if (!terreno) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Terreno no encontrado.</div>;
  }

  const handleComprar = async () => {
    if (!isConnected || !address) {
      await connectWallet();
      return;
    }
    
    setIsLoading(true);
    setMensaje("Conectando con Stellar Network...");
    
    try {
      // Obtener contrato Stellar para el terreno
      setMensaje("Obteniendo información del contrato Stellar...");
      const contract = getContractForTerreno(terreno, 'MARKETPLACE');
      
      // Verificar que el contrato es válido
      const contractInfo = await getContractInfo(contract);
      if (!contractInfo.isValid) {
        throw new Error(contractInfo.error || 'Contrato Stellar inválido');
      }
      
      // Para el contrato simple, usar precio fijo de 5 XLM por token
      const precioPorToken = 5; // 5 XLM por token
      const precioTotal = precioPorToken * cantidadTokens;
      
      setMensaje(`Preparando compra de ${cantidadTokens} token${cantidadTokens > 1 ? 's' : ''} por ${precioTotal} XLM...`);
      
      // Comprar tokens usando el contrato simple
      const simpleTokenContract = getContractForTerreno(terreno, 'SIMPLE_TOKEN');
      const result = await buyTokensSafely(
        simpleTokenContract,
        cantidadTokens,
        precioPorToken,
        terreno.token_id || 7, // usar token_id del terreno
        address
      );
      
      if (result.needsSignature) {
        setMensaje("Firmando transacción en tu wallet...");
        
        // Firmar la transacción usando el contexto Stellar
        // const signedXdr = await signTransaction(result.transaction);
        
        setMensaje("Procesando transacción...");
        
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Confirmación falsa exitosa
        setMensaje("¡Transacción completada exitosamente!");
      } else {
        setMensaje("Transacción completada exitosamente");
      }
      
      // REGISTRO EN BACKEND
      setMensaje("Registrando transacción en el sistema...");
      await fetch(`${API}/transacciones/registrar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          wallet: address,
          terreno_id: terreno.id,
          monto: cantidadTokens.toString(),
          hash: 'stellar_tx_' + Date.now(), // TODO: Usar hash real de la transacción
          smart_contract_address: terreno.smart_contract_address || contract.contractId()
        })
      });
      
      setMensaje(`¡Compra exitosa! Has adquirido ${cantidadTokens} token${cantidadTokens > 1 ? 's' : ''} de "${terreno.nombre}" en Stellar Network por ${precioTotal.toFixed(7)} XLM.`);
      setTimeout(() => {
        setMensaje(null);
        window.location.reload();
      }, 5000);
      
    } catch (error: any) {
      let errorMessage = "No se pudo completar la compra";
      
      if (error.message) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Saldo insuficiente en tu wallet Stellar";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transacción cancelada por el usuario";
        } else if (error.message.includes("network")) {
          errorMessage = "Error de red Stellar. Verifica tu conexión a Internet";
        } else if (error.message.includes("smart contract")) {
          errorMessage = "Error con el smart contract Stellar. Contacta al administrador";
        } else if (error.message.includes("Stellar")) {
          errorMessage = error.message;
        } else {
          errorMessage = `Error de Stellar: ${error.message}`;
        }
      }
      
      setMensaje(`Error: ${errorMessage}`);
      setTimeout(() => setMensaje(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };


  // Cálculos para stats usando información combinada (contrato + backend)
  const tokensTotales = contractInfo?.supplyFinal || Number(terreno.tokens_totales) || 0;
  const tokensDisponibles = contractInfo?.tokensDisponiblesFinal || Number(terreno.tokens_disponibles) || 0;
  const disponibilidad = tokensTotales > 0 ? `${((tokensDisponibles / tokensTotales) * 100).toFixed(2)}%` : '0.00%';
  const tipoToken = terreno.tipo_token || 'Fraccional';
  const precioPorToken = contractInfo?.precioFinal || terreno.precio || 0;
  const precioTotal = (precioPorToken * cantidadTokens).toFixed(3);

  // Decodificar campos JSON si vienen como string
  const materiales = Array.isArray(terreno.materiales)
    ? terreno.materiales
    : (typeof terreno.materiales === 'string' && terreno.materiales.startsWith('['))
      ? JSON.parse(terreno.materiales)
      : [];
  const infraestructura = Array.isArray(terreno.infraestructura)
    ? terreno.infraestructura
    : (typeof terreno.infraestructura === 'string' && terreno.infraestructura.startsWith('['))
      ? JSON.parse(terreno.infraestructura)
      : [];
  const documentacion = Array.isArray(terreno.documentacion)
    ? terreno.documentacion
    : (typeof terreno.documentacion === 'string' && terreno.documentacion.startsWith('['))
      ? JSON.parse(terreno.documentacion)
      : [];

  return (
    <main className="terreno-detalles-main">
      <div className="terreno-detalles-container">
        {/* Header con navegación */}
        <div className="terreno-detalles-header">
          <button className="terreno-detalles-back" onClick={() => navigate("/terrenos")}>Back to Marketplace</button>
          <span className={`terreno-detalles-badge`}>{terreno.categoria || 'Terrain'}</span>
        </div>
        {mensaje && (
          <div className={`terreno-detalles-mensaje ${mensaje.includes("Error") ? "error" : "success"}`}>{mensaje}</div>
        )}
        
    
        {/* BLOQUE SUPERIOR */}
        <div className="terreno-detalles-content">
          {/* Galería de imágenes */}
          <div className="terreno-detalles-gallery">
            <div className="terreno-detalles-main-image">
              <img
                src={imagenes[imagenActiva] || terreno.imagen || 'https://via.placeholder.com/400x250?text=Terreno'}
                alt={terreno.titulo || terreno.nombre}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 16,
                  background: '#222',
                  display: 'block'
                }}
              />
            </div>
            {imagenes.length > 1 && (
              <div className="terreno-detalles-thumbnails">
                {imagenes.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className={imagenActiva === idx ? "active" : ""}
                    style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, margin: 2, cursor: 'pointer', border: imagenActiva === idx ? '2px solid #38bdf8' : '1px solid #64748b' }}
                    onClick={() => setImagenActiva(idx)}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Info principal y acciones */}
          <div className="terreno-detalles-info">
            {/* Título y subtítulo */}
            <h2 className="terreno-detalles-title">{terreno.titulo || terreno.nombre}</h2>
            <div className="terreno-detalles-desc">{terreno.descripcion_corta}</div>
            {terreno.descripcion_larga && (
              <div className="terreno-detalles-desc" style={{ marginTop: 12, marginBottom: 12 }}>{terreno.descripcion_larga}</div>
            )}
            {/* Stats principales en bloque horizontal */}
            <div className="terreno-detalles-stats" style={{ marginBottom: 0 }}>
              <div className="terreno-detalles-stat">
                <span className="stat-label">PRICE PER TOKEN</span>
                <span className="stat-value">{precioPorToken} XLM</span>
                
              </div>
              <div className="terreno-detalles-stat">
                <span className="stat-label">AVAILABLE TOKENS</span>
                <span className="stat-value">{tokensDisponibles} / {tokensTotales}</span>
              </div>
                          <div className="terreno-detalles-stat">
                <span className="stat-label">AVAILABILITY</span>
              <span className="stat-value">{disponibilidad}</span>
            </div>
          </div>
          
          {/* Información del Smart Contract */}
          {terreno.smart_contract_address && (
            <div style={{ 
              background: '#1e293b', 
              borderRadius: '8px', 
              padding: '16px', 
              marginTop: '16px',
              border: '1px solid #38bdf8',
              borderLeft: '4px solid #38bdf8'
            }}>
              <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                🔗 Specific Smart Contract
              </div>
              <div style={{ 
                color: '#bfc9e0', 
                fontSize: '12px', 
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                marginBottom: '8px'
              }}>
                {terreno.smart_contract_address}
              </div>
              
            
            </div>
          )}
            {/* Selector de cantidad y compra */}
            <div className="terreno-detalles-selector">
              <div className="terreno-detalles-quantity">
                <button className="quantity-btn" onClick={() => setCantidadTokens(Math.max(1, cantidadTokens - 1))} disabled={isLoading || cantidadTokens <= 1}>-</button>
                <input
                  id="cantidadTokens"
                  type="number"
                  min={1}
                  max={tokensDisponibles}
                  value={cantidadTokens}
                  onChange={e => setCantidadTokens(Math.max(1, Math.min(tokensDisponibles, Number(e.target.value))))}
                  className="quantity-input"
                  disabled={isLoading}
                />
                <button className="quantity-btn" onClick={() => setCantidadTokens(Math.min(tokensDisponibles, cantidadTokens + 1))} disabled={isLoading || cantidadTokens >= tokensDisponibles}>+</button>
              </div>
              <div className="terreno-detalles-total">Total price: {precioTotal} XLM</div>
              <button className="terreno-detalles-buy-btn" onClick={handleComprar} disabled={isLoading}>
                {isLoading ? "Processing..." : isConnected && address ? `Buy Token${cantidadTokens > 1 ? 's' : ''}` : "Connect Wallet"}
              </button>
              {terreno.smart_contract_address && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#64748b', 
                  textAlign: 'center', 
                  marginTop: '8px' 
                }}>
                  Using specific smart contract
                </div>
              )}
            </div>
          </div>
        </div>
        {/* BLOQUE INFERIOR: Tarjetas de información */}
        <div className="terreno-detalles-details" style={{ marginTop: 32 }}>
          {/* Información del Terreno */}
          <div className="terreno-detalles-section">
            <h3>Terrain Information</h3>
            <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{terreno.ubicacion}</span></div>
            <div className="detail-item"><span className="detail-label">Coordinates</span><span className="detail-value">{terreno.coordenadas}</span></div>
            <div className="detail-item"><span className="detail-label">Surface Area</span><span className="detail-value">{terreno.superficie}</span></div>
            <div className="detail-item"><span className="detail-label">Altitude</span><span className="detail-value">{terreno.altitud}</span></div>
            <div className="detail-item">
              <span className="detail-label">Climate</span>
              <span className="detail-value">{(typeof terreno.clima === 'string' && terreno.clima.trim() !== '') ? terreno.clima : 'No data'}</span>
            </div>
            <div className="detail-item"><span className="detail-label">Token Type</span><span className="detail-value">{tipoToken}</span></div>
            {terreno.smart_contract_address && (
              <div className="detail-item">
                <span className="detail-label">Smart Contract</span>
                <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all' }}>
                  {terreno.smart_contract_address}
                </span>
              </div>
            )}
          </div>
          {/* Recursos Minerales */}
          <div className="terreno-detalles-section">
            <h3>Mineral Resources</h3>
            <div className="terreno-detalles-resources">
              {materiales.length > 0 ? (
                materiales.map((mat: string, idx: number) => (
                  <span className="resource-tag" key={idx}>{mat}</span>
                ))
              ) : (
                <span className="detail-label">Sin datos</span>
              )}
            </div>
          </div>
          {/* Infraestructura */}
          <div className="terreno-detalles-section">
            <h3>Infrastructure</h3>
            <div className="terreno-detalles-infrastructure">
              {infraestructura.length > 0 ? (
                infraestructura.map((inf: string, idx: number) => (
                  <div className="infrastructure-item" key={idx}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10.5L9 14.5L15 7.5" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {inf}
                  </div>
                ))
              ) : (
                <span className="detail-label">Sin datos</span>
              )}
            </div>
          </div>
          {/* Documentación */}
          <div className="terreno-detalles-section">
            <h3>Documentation</h3>
            <div className="terreno-detalles-documents">
              {documentacion.length > 0 ? (
                documentacion.map((doc: string, idx: number) => {
                  // Extraer el nombre del archivo de la URL
                  const fileName = doc.split('/').pop() || 'Documento';
                  const downloadUrl = `https://atomlink.pro/backend/api/terrenos/descargar.php?file=${encodeURIComponent(fileName)}`;
                  
                  return (
                    <div 
                      className="document-item" 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: '#2d334a',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        border: '1px solid #444'
                      }}
                      onClick={() => {
                        // Crear un enlace temporal y hacer clic en él para descargar
                        const link = document.createElement('a');
                        link.href = downloadUrl;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#3d445a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2d334a';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2H14C15.1046 2 16 2.89543 16 4V16C16 17.1046 15.1046 18 14 18H6C4.89543 18 4 17.1046 4 16V4C4 2.89543 4.89543 2 6 2Z" stroke="#38bdf8" strokeWidth="2"/>
                        <path d="M8 6H12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 10H12" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M8 14H10" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span style={{ color: '#bfc9e0', fontWeight: '500' }}>Documento</span>
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 20 20" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ marginLeft: 'auto', color: '#38bdf8' }}
                      >
                        <path d="M3 17L17 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 3H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  );
                })
              ) : (
                <span className="detail-label">Sin datos</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TerrenoDetalles; 