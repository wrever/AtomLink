import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/terrenoDetalles.css";
import Swal from 'sweetalert2';

const AdminPropuestaDetalles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [propuesta, setPropuesta] = useState<any>(null);
  const [motivo, setMotivo] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [smartContractAddress, setSmartContractAddress] = useState("");
  const [showContractForm, setShowContractForm] = useState(false);
  const [tokenId, setTokenId] = useState("");

  useEffect(() => {
    if (!id) return;
    setFetching(true);
    setError(null);
    fetch(`https://atomlink.pro/backend/api/propuestas/detalle.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPropuesta(data.data);
          setStatus(data.data.status || "");
        } else {
          setError(data.error || "No se pudo cargar la propuesta");
        }
      })
      .catch(() => setError("Error de red o servidor al cargar la propuesta"))
      .finally(() => setFetching(false));
  }, [id]);

  if (fetching) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Cargando propuesta...</div>;
  }
  if (error || !propuesta) {
    return (
      <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>
        {error || 'Propuesta no encontrada.'}<br />
        <button onClick={() => navigate('/admin/dashboard')} style={{ marginTop: 16 }}>Volver al Dashboard</button>
      </div>
    );
  }

  const handleAprobar = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://atomlink.pro/backend/api/propuestas/aprobar.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propuesta_id: propuesta.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus("aceptada");
        Swal.fire({ 
          icon: 'success', 
          title: 'Propuesta aprobada', 
          text: 'La propuesta ha sido aprobada y ahora aparece automáticamente en el marketplace (/terrenos)',
          showConfirmButton: false, 
          timer: 3000 
        });
      } else {
        Swal.fire({ 
          icon: 'error', 
          title: 'Error al aprobar', 
          text: data.error || 'No se pudo aprobar la propuesta',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error de conexión', 
        text: 'No se pudo conectar con el servidor',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!motivo.trim()) {
      Swal.fire({ icon: 'warning', title: 'Debes ingresar un motivo para el rechazo' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://atomlink.pro/backend/api/propuestas/rechazar.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propuesta_id: propuesta.id,
          motivo: motivo
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus("rechazada");
        Swal.fire({ 
          icon: 'error', 
          title: 'Propuesta rechazada', 
          text: `Motivo: ${motivo}`,
          showConfirmButton: false, 
          timer: 2000 
        });
      } else {
        Swal.fire({ 
          icon: 'error', 
          title: 'Error al rechazar', 
          text: data.error || 'No se pudo rechazar la propuesta',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error de conexión', 
        text: 'No se pudo conectar con el servidor',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarContract = async () => {
    if (!smartContractAddress.trim()) {
      Swal.fire({ icon: 'warning', title: 'Debes ingresar la dirección del smart contract' });
      return;
    }
    if (!tokenId.trim()) {
      Swal.fire({ icon: 'warning', title: 'Debes ingresar el token ID del contrato' });
      return;
    }
    
    // Validar formato de dirección Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(smartContractAddress)) {
      Swal.fire({ icon: 'error', title: 'Formato inválido', text: 'La dirección debe tener 42 caracteres y empezar con 0x' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('https://atomlink.pro/backend/api/propuestas/actualizar_contract.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propuesta_id: propuesta.id,
          smart_contract_address: smartContractAddress,
          token_id: tokenId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowContractForm(false);
        setSmartContractAddress("");
        setTokenId("");
        Swal.fire({ 
          icon: 'success', 
          title: 'Smart contract asignado', 
          text: 'El smart contract y token ID han sido asignados exitosamente',
          showConfirmButton: false, 
          timer: 2000 
        });
        // Recargar los datos de la propuesta
        window.location.reload();
      } else {
        Swal.fire({ 
          icon: 'error', 
          title: 'Error al asignar', 
          text: data.error || 'No se pudo asignar el smart contract',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Error de conexión', 
        text: 'No se pudo conectar con el servidor',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terreno-detalles-main" style={{ background: '#181c24', minHeight: '100vh', padding: 0 }}>
      <div className="terreno-detalles-container" style={{ maxWidth: '98vw', width: '100%', margin: '32px auto', background: 'transparent', borderRadius: 18, boxShadow: 'none', padding: 0, display: 'block' }}>
        {/* Header elegante */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#22273a', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: '24px 40px 18px 40px', boxShadow: '0 2px 12px #0002' }}>
          <button className="terreno-detalles-back" onClick={() => navigate('/admin/dashboard')} style={{ background: '#232b3b', color: '#fff', borderRadius: 8, padding: '6px 18px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 15, opacity: 0.85 }}>← Volver</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span className="terreno-detalles-badge" style={{ backgroundColor: '#38bdf822', color: '#38bdf8', fontWeight: 700, fontSize: 16, padding: '6px 18px', borderRadius: 8 }}>{propuesta.category || 'No especificado'}</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: status === 'aceptada' ? '#22c55e' : status === 'rechazada' ? '#ef4444' : '#f59e0b', background: (status === 'aceptada' ? '#22c55e22' : status === 'rechazada' ? '#ef444422' : '#f59e0b22'), borderRadius: 8, padding: '6px 18px' }}>
              {status === 'aceptada' ? 'Aprobada' : status === 'rechazada' ? 'Rechazada' : 'Pendiente'}
            </span>
          </div>
        </div>
        {/* Contenido principal en una sola columna */}
        <div className="terreno-detalles-content" style={{ marginTop: 0, padding: 40, background: '#23283a', borderRadius: 18, boxShadow: '0 4px 24px #0006', display: 'block' }}>
          {/* Título, descripciones y stats */}
          <h2 className="terreno-detalles-title" style={{ color: '#fff', fontSize: 36, marginBottom: 8, fontWeight: 800 }}>{propuesta.name || 'No especificado'}</h2>
          <div style={{ color: '#7b8794', fontSize: 15, fontFamily: 'monospace', marginBottom: 10 }}>ID: {propuesta.id}</div>
          <div style={{ color: '#bfc9e0', fontSize: 22, marginBottom: 12, fontWeight: 600 }}>{propuesta.title || 'No especificado'}</div>
          <div className="terreno-detalles-desc" style={{ color: '#bfc9e0', fontSize: 17, marginBottom: 10 }}>{propuesta.descripcion_corta || 'No especificado'}</div>
          <div style={{ color: '#bfc9e0', fontSize: 15, marginBottom: 18 }}>{propuesta.descripcion_larga || 'No especificado'}</div>
          {/* Galería de imágenes */}
          <div className="terreno-detalles-main-image" style={{ textAlign: 'center', marginBottom: 18 }}>
            <img
              src={
                propuesta.imagenes && propuesta.imagenes.length > 0
                  ? propuesta.imagenes[imagenActiva]
                  : propuesta.imagen || 'https://via.placeholder.com/400x250?text=Propuesta'
              }
              alt={propuesta.name}
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                width: '100%',
                height: 400,
                objectFit: 'contain',
                borderRadius: 16,
                border: '2.5px solid #23283a',
                background: '#222',
                display: 'block',
                margin: '0 auto',
                boxShadow: '0 2px 16px #0004'
              }}
            />
          </div>
          {propuesta.imagenes && propuesta.imagenes.length > 1 && (
            <div className="terreno-detalles-thumbnails" style={{ marginTop: 0, display: 'flex', gap: 12, justifyContent: 'center', width: '100%' }}>
              {propuesta.imagenes.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  onClick={() => setImagenActiva(idx)}
                  style={{
                    maxWidth: 90,
                    maxHeight: 60,
                    objectFit: 'contain',
                    borderRadius: 8,
                    border: imagenActiva === idx ? '2.5px solid #38bdf8' : '1.5px solid #444',
                    cursor: 'pointer',
                    background: '#222',
                    opacity: imagenActiva === idx ? 1 : 0.7,
                    boxShadow: imagenActiva === idx ? '0 0 8px #38bdf855' : 'none',
                    transition: 'border 0.2s, opacity 0.2s'
                  }}
                />
              ))}
            </div>
          )}
          {/* Stats principales en tarjetas */}
          <div style={{ display: 'flex', gap: 18, margin: '32px 0 24px 0', flexWrap: 'wrap' }}>
            <div style={{ background: '#20243a', borderRadius: 12, padding: 18, minWidth: 140, flex: 1, textAlign: 'center', boxShadow: '0 2px 8px #0002' }}>
              <span className="stat-label" style={{ color: '#7b8794', fontWeight: 600 }}>PRECIO</span>
              <div className="stat-value" style={{ color: '#38bdf8', fontWeight: 700, fontSize: 20 }}>{propuesta.price || 'No especificado'}</div>
            </div>
            <div style={{ background: '#20243a', borderRadius: 12, padding: 18, minWidth: 140, flex: 1, textAlign: 'center', boxShadow: '0 2px 8px #0002' }}>
              <span className="stat-label" style={{ color: '#7b8794', fontWeight: 600 }}>SUPPLY</span>
              <div className="stat-value" style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{propuesta.supply || 'No especificado'}</div>
            </div>
            <div style={{ background: '#20243a', borderRadius: 12, padding: 18, minWidth: 140, flex: 1, textAlign: 'center', boxShadow: '0 2px 8px #0002' }}>
              <span className="stat-label" style={{ color: '#7b8794', fontWeight: 600 }}>FECHA</span>
              <div className="stat-value" style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{propuesta.submittedDate || 'No especificado'}</div>
            </div>
          </div>
          {/* Datos del titular */}
          <div style={{ marginBottom: 18, background: '#20243a', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #0002', marginTop: 18 }}>
            <h3 style={{ color: '#38bdf8', fontSize: 19, marginBottom: 10, fontWeight: 700 }}>Datos del titular</h3>
            <div style={{ color: '#bfc9e0', fontSize: 16, display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              <div><b>👤 Nombre:</b> {propuesta.ownerName || 'No especificado'}</div>
              <div><b>✉️ Email:</b> {propuesta.ownerEmail || 'No especificado'}</div>
              <div><b>🆔 ID Fiscal:</b> {propuesta.ownerIdNumber || 'No especificado'}</div>
              <div><b>🪪 Doc. Identidad:</b> {propuesta.ownerDocNumber || 'No especificado'}</div>
            </div>
          </div>
          {/* Datos técnicos y de ubicación */}
          <div style={{ marginBottom: 18, background: '#20243a', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #0002' }}>
            <h3 style={{ color: '#38bdf8', fontSize: 19, marginBottom: 10, fontWeight: 700 }}>Datos técnicos y ubicación</h3>
            <div style={{ color: '#bfc9e0', fontSize: 16, display: 'flex', flexWrap: 'wrap', gap: 32 }}>
              <div><b>📍 Ubicación:</b> {propuesta.location || 'No especificado'}</div>
              <div><b>📏 Superficie:</b> {propuesta.superficie || 'No especificado'}</div>
              <div><b>🌐 Coordenadas:</b> {propuesta.coordenadas || 'No especificado'}</div>
              <div><b>⛰️ Altitud:</b> {propuesta.altitud || 'No especificado'}</div>
              <div><b>☀️ Clima:</b> {propuesta.clima || 'No especificado'}</div>
              <div><b>🔗 Tipo de token:</b> {propuesta.tokenType || 'No especificado'}</div>
              <div><b>🏷️ Categoría:</b> {propuesta.category || 'No especificado'}</div>
              <div><b>🕒 Enviado por:</b> {propuesta.submittedBy || 'No especificado'}</div>
            </div>
          </div>
          {/* Materiales e Infraestructura */}
          <div style={{ marginBottom: 18, background: '#20243a', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #0002', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#38bdf8', fontSize: 16, marginBottom: 8, fontWeight: 700 }}>Materiales</h4>
              <ul style={{ color: '#bfc9e0', fontSize: 15, margin: 0, paddingLeft: 18, listStyle: 'none' }}>
                {propuesta.materiales && propuesta.materiales.length > 0 ? propuesta.materiales.map((mat: string, i: number) => (
                  <li key={i} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#38bdf8', fontSize: 18 }}>⛏️</span> {mat}</li>
                )) : <li>No especificado</li>}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#38bdf8', fontSize: 16, marginBottom: 8, fontWeight: 700 }}>Infraestructura</h4>
              <ul style={{ color: '#bfc9e0', fontSize: 15, margin: 0, paddingLeft: 18, listStyle: 'none' }}>
                {propuesta.infraestructura && propuesta.infraestructura.length > 0 ? propuesta.infraestructura.map((inf: string, i: number) => (
                  <li key={i} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#38bdf8', fontSize: 18 }}>🏗️</span> {inf}</li>
                )) : <li>No especificado</li>}
              </ul>
            </div>
          </div>
          {/* Documentación */}
          <div style={{ marginBottom: 18, background: '#20243a', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px #0002' }}>
            <h3 style={{ color: '#38bdf8', fontSize: 19, marginBottom: 10, fontWeight: 700 }}>Documentación adjunta</h3>
            <ul style={{ color: '#bfc9e0', fontSize: 15, margin: 0, paddingLeft: 18 }}>
              {propuesta.documentacion && propuesta.documentacion.length > 0 ? propuesta.documentacion.map((doc: string, i: number) => {
                const fileName = doc.split('/').pop() || '';
                const url = `https://atomlink.pro/backend/api/propuestas/descargar.php?file=${encodeURIComponent(fileName)}`;
                return (
                  <li key={i} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ background: '#2d334a', padding: '4px 10px', borderRadius: 6, color: '#fff', fontSize: 15, marginRight: 8, display: 'flex', alignItems: 'center', gap: 6 }}>📄 {fileName}</span>
                    <a href={url} style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: 15, fontWeight: 600, background: '#232b3b', borderRadius: 6, padding: '6px 18px', display: 'inline-block', transition: 'background 0.2s' }}>
                      <span style={{ fontSize: 17, marginRight: 6 }}>⬇️</span> Descargar
                    </a>
                  </li>
                );
              }) : <li>No hay documentos adjuntos</li>}
            </ul>
          </div>
        </div>
        {/* Panel de acciones de admin debajo, ocupando todo el ancho */}
        <div style={{ width: '100%', background: '#20243a', borderRadius: 18, boxShadow: '0 2px 12px #0002', padding: 32, marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {status === 'pendiente' && (
            <div style={{ width: '100%', maxWidth: 600 }}>
              <h3 style={{ color: '#fff', marginBottom: 18, fontWeight: 700, fontSize: 20, textAlign: 'center' }}>Acciones de administración</h3>
              {/* Formulario para asignar/cambiar smart contract y token id */}
              <div style={{ background: '#20243a', borderRadius: 12, padding: 24, marginBottom: 18, boxShadow: '0 2px 8px #0003' }}>
                <h4 style={{ color: '#38bdf8', fontSize: 18, marginBottom: 18, fontWeight: 700, textAlign: 'center' }}>
                  Asignar Smart Contract y Token ID
                </h4>
                <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#bfc9e0', fontWeight: 500, marginBottom: 6, display: 'block' }}>Token ID</label>
                    <input
                      type="number"
                      placeholder="Token ID (ej: 1, 2, 3...)"
                      value={tokenId}
                      onChange={e => setTokenId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        background: '#23283a',
                        color: '#fff',
                        fontSize: '16px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <div style={{ flex: 3 }}>
                    <label style={{ color: '#bfc9e0', fontWeight: 500, marginBottom: 6, display: 'block' }}>Dirección del Smart Contract</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={smartContractAddress}
                      onChange={(e) => setSmartContractAddress(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        background: '#23283a',
                        color: '#fff',
                        fontSize: '16px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </div>
                <button 
                  className="admin-action-btn approve"
                  onClick={handleAsignarContract}
                  disabled={loading}
                  style={{ width: '100%', marginTop: 8, background: '#38bdf8', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 8, padding: '12px 0', boxShadow: '0 2px 8px #38bdf822', letterSpacing: 1 }}
                >
                  {loading ? 'Asignando...' : 'Asignar Smart Contract y Token ID'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <button onClick={handleAprobar} disabled={loading} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 8, boxShadow: '0 2px 8px #22c55e33', transition: 'background 0.2s' }}>✅ Aprobar propuesta</button>
                <textarea
                  placeholder="Motivo del rechazo (obligatorio para rechazar)"
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  style={{ minHeight: 60, borderRadius: 10, border: '1.5px solid #444', padding: 12, fontSize: 16, resize: 'vertical', background: '#23283a', color: '#fff', marginBottom: 8, fontWeight: 500 }}
                  disabled={loading}
                />
                <button onClick={handleRechazar} disabled={loading} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 2px 8px #ef444433', transition: 'background 0.2s' }}>❌ Rechazar propuesta</button>
              </div>
            </div>
          )}
          {status === 'aceptada' && (
            <div style={{ width: '100%', maxWidth: 600 }}>
              <div style={{ marginTop: 0, color: '#22c55e', fontWeight: 700, fontSize: 20, textAlign: 'center', background: '#232b3b', borderRadius: 10, padding: 18, marginBottom: 16 }}>✅ Propuesta aprobada</div>
              
              {/* Sección de Smart Contract */}
              <div style={{ background: '#20243a', borderRadius: 12, padding: 24, marginBottom: 16 }}>
                <h3 style={{ color: '#38bdf8', fontSize: 18, marginBottom: 16, fontWeight: 700 }}>Smart Contract</h3>
                
                {propuesta.smart_contract_address ? (
                  <div style={{ color: '#bfc9e0', fontSize: 16 }}>
                    <div style={{ marginBottom: 8 }}><strong>Dirección actual:</strong></div>
                    <div style={{ 
                      background: '#2d334a', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      wordBreak: 'break-all',
                      border: '1px solid #444'
                    }}>
                      {propuesta.smart_contract_address}
                    </div>
                    <button 
                      onClick={() => setShowContractForm(true)}
                      style={{ 
                        marginTop: 12,
                        background: '#38bdf8', 
                        color: '#fff', 
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cambiar Smart Contract
                    </button>
                  </div>
                ) : (
                  <div style={{ color: '#bfc9e0', fontSize: 16 }}>
                    <div style={{ marginBottom: 12 }}>No hay smart contract asignado</div>
                    <button 
                      onClick={() => setShowContractForm(true)}
                      style={{ 
                        background: '#22c55e', 
                        color: '#fff', 
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Asignar Smart Contract
                    </button>
                  </div>
                )}
              </div>
              
              {/* Formulario para asignar/cambiar smart contract */}
              {showContractForm && (
                <div style={{ background: '#20243a', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px #0003', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                  <h4 style={{ color: '#38bdf8', fontSize: 18, marginBottom: 18, fontWeight: 700, textAlign: 'center' }}>
                    {propuesta.smart_contract_address ? 'Cambiar Smart Contract' : 'Asignar Smart Contract'}
                  </h4>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#bfc9e0', fontWeight: 500, marginBottom: 6, display: 'block' }}>Token ID</label>
                      <input
                        type="number"
                        placeholder="Token ID (ej: 1, 2, 3...)"
                        value={tokenId}
                        onChange={e => setTokenId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #444',
                          background: '#23283a',
                          color: '#fff',
                          fontSize: '16px',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                    <div style={{ flex: 3 }}>
                      <label style={{ color: '#bfc9e0', fontWeight: 500, marginBottom: 6, display: 'block' }}>Dirección del Smart Contract</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={smartContractAddress}
                    onChange={(e) => setSmartContractAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      background: '#23283a',
                      color: '#fff',
                      fontSize: '16px',
                      fontFamily: 'monospace',
                    }}
                  />
                    </div>
                  </div>
                    <button 
                    className="admin-action-btn approve"
                      onClick={handleAsignarContract}
                      disabled={loading}
                    style={{ width: '100%', marginTop: 8, background: '#38bdf8', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 8, padding: '12px 0', boxShadow: '0 2px 8px #38bdf822', letterSpacing: 1 }}
                    >
                    {loading ? 'Asignando...' : 'Asignar Smart Contract y Token ID'}
                    </button>
                    <button 
                      onClick={() => {
                        setShowContractForm(false);
                        setSmartContractAddress("");
                      setTokenId("");
                      }}
                    style={{ width: '100%', marginTop: 12, background: 'transparent', color: '#bfc9e0', border: '1px solid #64748b', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                </div>
              )}
            </div>
          )}
          {status === 'rechazada' && (
            <div style={{ marginTop: 0, color: '#ef4444', fontWeight: 700, fontSize: 20, textAlign: 'center', background: '#232b3b', borderRadius: 10, padding: 18, width: '100%', maxWidth: 600 }}>❌ Propuesta rechazada<br /><span style={{ fontWeight: 400, fontSize: 15 }}>Motivo: {motivo}</span></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPropuestaDetalles; 