import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/admin.css";

interface Proposal {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  description: string;
  location: string;
  price: string;
  supply: number;
  status: "pending" | "approved" | "rejected";
  submittedBy: string;
  submittedDate: string;
  documents: string[];
  smartContract: string;
  tokenId: string;
}

const mockDisputes = [
  {
    id: "DISP-001",
    proposalId: "PROP-002",
    user: "juan.perez@email.com",
    title: "No recibí mis tokens tras la aprobación",
    description: "Mi propuesta fue aprobada pero no veo los tokens en mi wallet.",
    status: "open",
    date: "2024-01-21",
    resolution: null
  },
  {
    id: "DISP-002",
    proposalId: "PROP-003",
    user: "carlos.rodriguez@email.com",
    title: "Documentación rechazada incorrectamente",
    description: "Creo que mi propuesta fue rechazada por error, los permisos están completos.",
    status: "open",
    date: "2024-01-20",
    resolution: null
  },
  {
    id: "DISP-003",
    proposalId: "PROP-001",
    user: "maria.gonzalez@email.com",
    title: "Error en la cantidad de tokens asignados",
    description: "La cantidad de tokens asignados no coincide con lo solicitado.",
    status: "resolved",
    date: "2024-01-18",
    resolution: "Se corrigió la cantidad de tokens y se notificó al usuario."
  }
];

const AdminDashboard = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [expandedProposal] = useState<string | null>(null);
  const [tab, setTab] = useState("proposals");
  const [disputes] = useState(mockDisputes);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el admin está logueado (flag localStorage)
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("https://atomlink.pro/backend/api/propuestas/listar.php")
      .then(res => res.json())
      .then(data => {
        console.log("Propuestas recibidas:", data); // LOG DE DEPURACIÓN
        if (data.success && Array.isArray(data.data)) {
          setProposals(data.data.map((p: any) => ({
            id: p.id ?? '',
            name: p.name ?? '',
            category: p.category ?? '',
            categoryColor: '#3b82f6',
            description: p.descripcion_corta || p.descripcion_larga || '',
            location: p.location ?? '',
            price: p.price ?? '',
            supply: Number(p.supply) || 0,
            status: p.status === 'aceptada'
              ? 'approved'
              : p.status === 'rechazada'
              ? 'rejected'
              : p.status === 'pendiente'
              ? 'pending'
              : 'pending',
            submittedBy: p.ownerEmail || p.submittedBy || '',
            submittedDate: p.submittedDate || '',
            documents: Array.isArray(p.documentacion) ? p.documentacion : [],
            smartContract: p.smart_contract_address || '',
            tokenId: p.token_id || ''
          })));
        } else {
          setError(data.error || 'No se pudieron cargar las propuestas');
        }
      })
      .catch((e) => {
        setError('Error de red o servidor al cargar propuestas');
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    navigate("/admin/login");
  };

  const handleStatusChange = (proposalId: string, newStatus: "approved" | "rejected") => {
    setProposals(prev => 
      prev.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, status: newStatus }
          : proposal
      )
    );
  };



  const filteredProposals = proposals
    .filter(proposal => {
      const matchesFilter = filter === "all" || proposal.status === filter;
      const matchesSearch = String(proposal.id).toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()); // Ordenar por fecha de llegada (más reciente primero)

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === "pending").length,
    approved: proposals.filter(p => p.status === "approved").length,
    rejected: proposals.filter(p => p.status === "rejected").length
  };

  if (loading) {
    return <div className="admin-dashboard-root"><div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Cargando propuestas...</div></div>;
  }
  if (error) {
    return <div className="admin-dashboard-root"><div style={{ color: '#ef4444', textAlign: 'center', marginTop: 40 }}>{error}</div></div>;
  }

  return (
    <div className="admin-dashboard-root">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">Panel de Administración</h1>
          <p className="admin-subtitle">Gestión de propuestas y disputas</p>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">
          Cerrar Sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={tab === "proposals" ? "active" : ""} onClick={() => setTab("proposals")}>Revisión de Propuestas</button>
        <button className={tab === "disputes" ? "active" : ""} onClick={() => setTab("disputes")}>Resolución de Disputas</button>
      </div>

      {/* Sección de Propuestas */}
      {tab === "proposals" && (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-value">{stats.total}</div>
              <div className="admin-stat-label">Total Propuestas</div>
            </div>
            <div className="admin-stat-card pending">
              <div className="admin-stat-value">{stats.pending}</div>
              <div className="admin-stat-label">Pendientes</div>
            </div>
            <div className="admin-stat-card approved">
              <div className="admin-stat-value">{stats.approved}</div>
              <div className="admin-stat-label">Aprobadas</div>
            </div>
            <div className="admin-stat-card rejected">
              <div className="admin-stat-value">{stats.rejected}</div>
              <div className="admin-stat-label">Rechazadas</div>
            </div>
          </div>

          <div className="admin-controls">
            <div className="admin-search">
              <input
                type="text"
                placeholder="Buscar propuestas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <div className="admin-filters">
              <button 
                className={`admin-filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Todas
              </button>
              <button 
                className={`admin-filter-btn ${filter === "pending" ? "active" : ""}`}
                onClick={() => setFilter("pending")}
              >
                Pendientes
              </button>
              <button 
                className={`admin-filter-btn ${filter === "approved" ? "active" : ""}`}
                onClick={() => setFilter("approved")}
              >
                Aprobadas
              </button>
              <button 
                className={`admin-filter-btn ${filter === "rejected" ? "active" : ""}`}
                onClick={() => setFilter("rejected")}
              >
                Rechazadas
              </button>
            </div>
          </div>

          <div className="admin-proposals">
            {filteredProposals.length === 0 && (
              <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>
                No hay propuestas para mostrar.
              </div>
            )}
            {filteredProposals.map((proposal) => (
              <div key={proposal.id} className="admin-proposal-card">
                <div className="admin-proposal-header">
                  <div className="admin-proposal-title" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <h3>{proposal.name}</h3>
                    {/* Etiqueta de status SIEMPRE visible debajo del título */}
                    <div style={{
                      marginTop: 10,
                      marginBottom: 4,
                      fontWeight: 700,
                      fontSize: 15,
                      background: proposal.status === 'approved' ? '#22c55e22' : proposal.status === 'rejected' ? '#ef444422' : '#f59e4222',
                      color: proposal.status === 'approved' ? '#22c55e' : proposal.status === 'rejected' ? '#ef4444' : '#f59e42',
                      borderRadius: 8,
                      padding: '4px 16px',
                      display: 'inline-block'
                    }}>
                      {proposal.status === 'approved' && 'Aprobado'}
                      {proposal.status === 'pending' && 'Pendiente'}
                      {proposal.status === 'rejected' && 'Rechazado'}
                    </div>
                    <div style={{ color: '#7b8794', fontSize: 13, fontFamily: 'monospace', marginTop: 2 }}>ID: {proposal.id}</div>
                    <span 
                      className="admin-proposal-category"
                      style={{ backgroundColor: proposal.categoryColor + "22", color: proposal.categoryColor }}
                    >
                      {proposal.category}
                    </span>
                  </div>
                  <div className="admin-proposal-status">
                    <span className={`admin-status-badge ${proposal.status}`}>
                      {proposal.status === "pending" && "⏳ Pendiente"}
                      {proposal.status === "approved" && "✅ Aprobada"}
                      {proposal.status === "rejected" && "❌ Rechazada"}
                    </span>
                  </div>
                </div>

                <div className="admin-proposal-content">
                  <div className="admin-proposal-summary">
                    <div className="admin-summary-item">
                      <span className="admin-summary-label">📍 Ubicación:</span>
                      <span className="admin-summary-value">{proposal.location}</span>
                    </div>
                    <div className="admin-summary-item">
                      <span className="admin-summary-label">💰 Precio:</span>
                      <span className="admin-summary-value">{proposal.price}</span>
                    </div>
                    <div className="admin-summary-item">
                      <span className="admin-summary-label">👤 Solicitante:</span>
                      <span className="admin-summary-value">{proposal.submittedBy}</span>
                    </div>
                    <div className="admin-summary-item">
                      <span className="admin-summary-label">📅 Fecha:</span>
                      <span className="admin-summary-value">{new Date(proposal.submittedDate).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  {expandedProposal === proposal.id && (
                    <div className="admin-proposal-expanded">
                      <p className="admin-proposal-desc">{proposal.description}</p>
                      
                      <div className="admin-proposal-details">
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Supply total:</span>
                          <span className="admin-detail-value">{proposal.supply.toLocaleString()}</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Token ID (contrato):</span>
                          <span className="admin-detail-value">{proposal.tokenId || 'No asignado'}</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Smart Contract:</span>
                          <span className="admin-detail-value" style={{fontFamily:'monospace',fontSize:13}}>{proposal.smartContract || 'No asignado'}</span>
                        </div>
                        <div className="admin-detail-item">
                          <span className="admin-detail-label">Documentos:</span>
                          <span className="admin-detail-value">{proposal.documents.length} archivos</span>
                        </div>
                      </div>

                      <div className="admin-proposal-documents">
                        <h4>Documentos adjuntos:</h4>
                        <div className="admin-documents-list">
                          {proposal.documents.map((doc, index) => (
                            <span key={index} className="admin-document-item">
                              📄 {doc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {proposal.status === "pending" && (
                        <div className="admin-proposal-actions">
                          <button 
                            className="admin-action-btn approve"
                            onClick={() => handleStatusChange(proposal.id, "approved")}
                          >
                            ✅ Aprobar
                          </button>
                          <button 
                            className="admin-action-btn reject"
                            onClick={() => handleStatusChange(proposal.id, "rejected")}
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="admin-proposal-footer">
                    <button 
                      className="admin-details-btn"
                      onClick={() => navigate(`/admin/propuesta/${proposal.id}`)}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sección de Disputas */}
      {tab === "disputes" && (
        <div className="admin-disputes-list">
          <h2 className="admin-section-title">Disputas de Usuarios</h2>
          {disputes.map((d) => (
            <div key={d.id} className="admin-dispute-card">
              <div className="admin-dispute-header">
                <div>
                  <strong>{d.title}</strong>
                  <div className="admin-dispute-meta">
                    <span>ID: {d.id}</span> | <span>Propuesta: {d.proposalId}</span> | <span>Usuario: {d.user}</span> | <span>Fecha: {new Date(d.date).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                <span className={`admin-dispute-status ${d.status}`}>{d.status === "open" ? "Abierta" : "Resuelta"}</span>
              </div>
              <div className="admin-dispute-desc">{d.description}</div>
              <button className="admin-dispute-chat-btn" onClick={() => navigate(`/chat-disputa/${d.id}?rol=admin`)}>
                Abrir chat
              </button>
              {d.status === "open" && (
                <div className="admin-dispute-actions">
                  {/* Eliminar el botón de resolver disputa y el formulario */}
                </div>
              )}
              {d.status === "resolved" && (
                <div className="admin-dispute-resolution">
                  <strong>Resolución:</strong> {d.resolution}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 