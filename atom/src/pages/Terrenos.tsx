import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/terrenos.css";

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost/Atom/backend/api';

const Terrenos = () => {
  const [search, setSearch] = useState("");
  const [terrenos, setTerrenos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/terrenos/listar.php`)
      .then(res => {
        if (!res.ok) throw new Error('Error en la respuesta del backend');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setTerrenos(data.data || []);
        } else {
          setTerrenos([]);
          console.error('Error del backend:', data.error);
        }
      })
      .catch(err => {
        setTerrenos([]);
        console.error('Error en fetch:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleComprar = (terrenoId: number) => {
    navigate(`/terreno/${terrenoId}`);
  };

  const filteredTerrenos = terrenos.filter(t =>
    (t.titulo || t.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.descripcion_corta || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.ubicacion || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.categoria || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.tipo_token || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="terrenos-main">
      <h1 className="terrenos-title">Marketplace</h1>
      <div className="terrenos-sub">Discover and invest in tokenized mining terrains and high-value real assets.</div>
      <div className="terrenos-searchbar">
        <input
          className="terrenos-search"
          type="text"
          placeholder="Search terrains..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="terrenos-filters-btn">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          Filters
        </button>
      </div>
      {loading ? (
        <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Loading terrains...</div>
      ) : (
      <div className="terrenos-grid">
        {filteredTerrenos.length === 0 && <div style={{ color: '#fff', textAlign: 'center', width: '100%' }}>No terrains available.</div>}
        {filteredTerrenos.map((t) => (
          <div className="terreno-mp-card" key={t.id}>
            {t.imagen && (
              <div
                className="terreno-mp-img"
                style={{
                  width: '100%',
                  height: '180px',
                  overflow: 'hidden',
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px',
                  background: '#222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={t.imagen}
                  alt={t.titulo}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: 10,
                    display: 'block',
                    imageRendering: 'auto',
                    filter: 'none',
                    boxShadow: '0 2px 8px #0002',
                    background: '#222'
                  }}
                  loading="lazy"
                  decoding="async"
                  srcSet={t.imagen + ' 1x, ' + t.imagen + ' 2x'}
                />
              </div>
            )}
            <div className="terreno-mp-content">
              {/* Categoría */}
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                background: '#38bdf8', 
                color: '#fff', 
                padding: '4px 12px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: '600' 
              }}>
                {t.categoria || 'General'}
              </div>
              
              {/* Título y descripción */}
              <div className="terreno-mp-title">{t.nombre || t.titulo}</div>
              <div className="terreno-mp-desc">{t.descripcion_corta || t.descripcion_larga}</div>
              
              {/* Información clave en dos columnas */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                {/* Columna izquierda */}
                <div style={{ flex: 1 }}>
                  <div className="terreno-mp-label">Price</div>
                  <div className="terreno-mp-value">{t.precio || 0} XLM</div>
                  <div className="terreno-mp-label" style={{ marginTop: '8px' }}>Available</div>
                  <div className="terreno-mp-value">{t.tokens_totales ? t.tokens_totales.toLocaleString() : 'N/A'}</div>
                </div>
                
                {/* Columna derecha */}
                <div style={{ flex: 1 }}>
                  <div className="terreno-mp-label">Type</div>
                  <div className="terreno-mp-value">{t.tipo_token || 'Fraccional'}</div>
                  <div className="terreno-mp-label" style={{ marginTop: '8px' }}>Location</div>
                  <div className="terreno-mp-value">{t.ubicacion || 'No specified'}</div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="terreno-mp-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  className="terreno-mp-btn" 
                  style={{ 
                    flex: 1, 
                    background: '#22c55e', 
                    color: '#fff', 
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => handleComprar(t.id)}
                >
                  Buy
                </button>
                <button 
                  className="terreno-mp-btn" 
                  style={{ 
                    flex: 1, 
                    background: 'transparent', 
                    color: '#fff', 
                    border: '1px solid #64748b',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                  onClick={() => handleComprar(t.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </main>
  );
};

export default Terrenos; 