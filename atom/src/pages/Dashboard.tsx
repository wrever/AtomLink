import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStellar } from "../contexts/StellarContext";
import "../css/dashboard.css";

const API = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const { isConnected, address, connectWallet } = useStellar();
  const [tab, setTab] = useState("portfolio");
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Estados para cada sección
  const [metrics, setMetrics] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tokenizationProposals, setTokenizationProposals] = useState<any[]>([]);
  const [userDisputes, setUserDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
    if (!isConnected || !address) return;
    setLoading(true);
    const wallet = address;
   
    // Función robusta para fetch seguro de JSON
    const safeFetchJson = async (url: string) => {
      try {
        const res = await fetch(url);
        const text = await res.text();
        if (!text) return { data: [] };
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("Respuesta malformada en:", url, text);
          return { data: [] };
        }
      } catch (e) {
        console.error("Error de red en:", url, e);
        return { data: [] };
      }
    };
    Promise.all([
      safeFetchJson(`${API}/wallet/portfolio.php?wallet=${wallet}`),
      safeFetchJson(`${API}/transacciones/listar.php?wallet=${wallet}`),
      safeFetchJson(`${API}/analitycs/resumen.php?wallet=${wallet}`),
      safeFetchJson(`${API}/notificaciones/listar.php?wallet=${wallet}`),
      safeFetchJson(`${API}/propuestas/listar.php?wallet=${wallet}`),
      safeFetchJson(`${API}/disputas/listar.php?wallet=${wallet}`),
    ]).then(([assetsRes, txRes, analyticsRes, notifRes, propRes, dispRes]) => {
      setAssets(assetsRes.data || []);
      setTransactions(txRes.data || []);
      setAnalytics(analyticsRes.data || []);
      setNotifications(notifRes.data || []);
      setTokenizationProposals(propRes.data || []);
      setUserDisputes(dispRes.data || []);
      // Calcular el valor total del portafolio sumando el valor de cada activo (tokens * precio)
      const totalPortfolioValue = (assetsRes.data || []).reduce((acc: number, a: any) => {
        const cantidad = Number(a.tokens) || 0;
        const precio = Number(a.precio) || 0;
        return acc + (cantidad * precio);
      }, 0);
      setMetrics([
        { label: "Portfolio Value", value: totalPortfolioValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }), icon: "$", dark: false },
        { label: "Total Assets", value: assetsRes.data?.length || 0, icon: "💼", dark: true },
        { label: "Transactions", value: txRes.data?.length || 0, icon: "📈", dark: false },
        { label: "Categories", value: analyticsRes.data?.length || 0, icon: "📅", dark: true },
      ]);
    }).catch(err => {
      console.error("Error al obtener datos del dashboard:", err);
      setTransactions([]);
    }).finally(() => setLoading(false));
  }, [isConnected, address]);

  if (!isConnected || !address) {
    return (
      <div className="dashboard-root">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#38bdf8',
            marginBottom: '1rem'
          }}>
            🔗 Connect Your Wallet
          </div>
          <div style={{
            fontSize: '1.1rem',
            color: '#b6c2d1',
            marginBottom: '2rem',
            maxWidth: '500px',
            lineHeight: '1.5'
          }}>
            You must connect your wallet to view your dashboard and manage your tokenized assets.
          </div>
          <button 
            onClick={connectWallet}
            style={{
              background: '#38bdf8',
              color: '#181f2a',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#38bdf8';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-root">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1.5rem',
            color: '#38bdf8',
            marginBottom: '1rem'
          }}>
            ⏳ Loading your information...
          </div>
          <div style={{
            fontSize: '1rem',
            color: '#b6c2d1'
          }}>
            Please wait while we fetch your portfolio data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-header-bar">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-header-actions">
          <button className="dashboard-notif-btn" onClick={() => setShowNotifications((v) => !v)}>
            <span className="dashboard-notif-icon">🔔</span>
            {notifications.some((n: any) => !n.read) && <span className="dashboard-notif-dot" />}
          </button>
          {showNotifications && (
            <div className="dashboard-notif-dropdown">
              <div className="dashboard-notif-dropdown-title">Notifications</div>
              {notifications.length === 0 && <div className="dashboard-notif-empty">You don't have any notifications.</div>}
              {notifications.map((n: any) => (
                <div key={n.id} className={`dashboard-notif-item${n.read ? "" : " unread"}`}>
                  <div className="dashboard-notif-msg">{n.message}</div>
                  <div className="dashboard-notif-date">{new Date(n.date).toLocaleDateString('en-US')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-sub">Manage your tokenized assets and track your portfolio performance.</div>
      <div className="dashboard-metrics">
        {metrics.map((m, i) => (
          <div className={`dashboard-metric-card${m.dark ? " dark" : ""}`} key={i}>
            <div className="dashboard-metric-label">{m.label}</div>
            <div className="dashboard-metric-value">{m.value}</div>
            <div className="dashboard-metric-icon">{m.icon}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-tabs">
        <button className={tab === "portfolio" ? "active" : ""} onClick={() => setTab("portfolio")}>Portfolio</button>
        <button className={tab === "transactions" ? "active" : ""} onClick={() => setTab("transactions")}>Transactions</button>
        <button className={tab === "tokenization" ? "active" : ""} onClick={() => setTab("tokenization")}>Tokenization</button>
        <button className={tab === "analytics" ? "active" : ""} onClick={() => setTab("analytics")}>Analytics</button>
        <button className={tab === "disputes" ? "active" : ""} onClick={() => setTab("disputes")}>Disputes</button>
      </div>
      {tab === "portfolio" && (
        <div>
          <div className="dashboard-section-title">Your Assets</div>
          <div className="dashboard-assets" style={{display: 'flex', flexWrap: 'wrap', gap: 32}}>
            {assets.length === 0 && <div>You don't have any assets yet.</div>}
            {assets.map((a: any, i: number) => {
              const cantidad = Number(a.tokens) || 0;
              const precio = Number(a.precio) || 0;
              const valorTotal = cantidad * precio;
              const tipoToken = a.tipo_token || 'Fractional';
              const categoria = a.categoria || 'Other';
              const imagen = a.imagen || (Array.isArray(a.imagenes) && a.imagenes[0]) || '';
              return (
                <div className="dashboard-asset-card" key={i} style={{width: 340, minHeight: 380, borderRadius: 16, background: '#23293a', boxShadow: '0 2px 12px #0002', padding: 0, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', marginBottom: 24}}>
                  {/* Badge de categoría */}
                  <div style={{position: 'absolute', top: 16, left: 16, zIndex: 2}}>
                    <span style={{background: '#38bdf822', color: '#38bdf8', borderRadius: 12, padding: '2px 12px', fontSize: 14, fontWeight: 600}}>{categoria}</span>
                  </div>
                  {/* Imagen */}
                  <div style={{height: 140, background: '#1a1f2b', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {imagen ? (
                      <img src={imagen} alt={a.nombre || a.titulo} style={{maxHeight: 120, maxWidth: '90%', borderRadius: 10, objectFit: 'cover'}} />
                    ) : (
                      <span style={{fontSize: 48, color: '#64748b'}}>&#128247;</span>
                    )}
                  </div>
                  {/* Info principal */}
                  <div style={{padding: '20px 20px 0 20px', flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <div style={{fontWeight: 700, fontSize: 20, marginBottom: 4}}>{a.nombre || a.titulo}</div>
                    <div style={{fontSize: 15, color: '#b0b8d1', marginBottom: 10}}>{a.descripcion_corta || a.descripcion || '-'}</div>
                    <div style={{display: 'flex', gap: 16, marginBottom: 8}}>
                      <div style={{fontSize: 15}}><b>Price</b> <span style={{color: '#38bdf8'}}>${precio.toLocaleString()}</span></div>
                      <div style={{fontSize: 15}}><b>Type</b> <span style={{fontWeight: 600}}>{tipoToken}</span></div>
                    </div>
                    <div style={{display: 'flex', gap: 16, marginBottom: 8}}>
                      <div style={{fontSize: 15}}><b>Ownership</b> <span>{cantidad}</span></div>
                      <div style={{fontSize: 15}}><b>Value</b> <span style={{color: '#38bdf8'}}>${valorTotal.toLocaleString()}</span></div>
                    </div>
                    <div style={{marginTop: 'auto'}}>
                      <button className="dashboard-action-btn details" style={{marginTop: 12, width: '100%'}} onClick={() => a.id && navigate(`/terreno/${a.id}`)}>
                        View details &rarr;
                      </button>
                    </div>
                  </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
      {tab === "transactions" && transactions && (
        <div>
          <div className="dashboard-section-title">Transaction History</div>
          <div className="dashboard-transactions-header">
            <div>
              <div className="dashboard-transactions-title">Transaction History</div>
              <div className="dashboard-transactions-sub">View all your purchase, sale and tokenization activities</div>
            </div>
            <button className="dashboard-export-btn">Export</button>
          </div>
          <input className="dashboard-search" placeholder="Search by asset, ID or counterparty..." />
          <div className="dashboard-transactions-list">
            {transactions.length === 0 && <div>You don't have any transactions yet.</div>}
            {transactions.map((t: any, i: number) => (
              <div className="dashboard-transaction-row" key={i}>
                <div className="dashboard-transaction-main">
                  <div className="dashboard-transaction-icon" style={{background: '#38bdf822', color: '#38bdf8'}}>
                    💸
                  </div>
                  <div>
                    <div className="dashboard-transaction-title">{t.terreno_name || t.name} <span className="dashboard-transaction-badge">{t.category}</span></div>
                    <div className="dashboard-transaction-id">ID: {t.id} • {new Date(t.date).toLocaleString('en-US')} • {t.type}</div>
                  </div>
                </div>
                <div className="dashboard-transaction-details">
                  <div className="dashboard-transaction-amount">{t.amount} tokens</div>
                  <div className="dashboard-transaction-value">{t.price} per token</div>
                  <div className="dashboard-transaction-value">Total: {t.total_value} ETH</div>
                  <div className="dashboard-transaction-status">{t.type === 'compra' ? 'Completed' : t.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "tokenization" && (
        <div>
          <div className="dashboard-section-title">My Tokenization Proposals</div>
          <div className="dashboard-transactions-header">
            <div>
              <div className="dashboard-transactions-title">Proposal Tracking</div>
              <div className="dashboard-transactions-sub">Review the status of your tokenization requests</div>
            </div>
            <button 
              className="dashboard-export-btn"
              onClick={() => navigate("/tokenize")}
            >
              New Proposal
            </button>
          </div>
          <div className="dashboard-proposals-list">
            {tokenizationProposals.length === 0 && (
              <div className="dashboard-proposals-empty">You don't have any tokenization proposals yet.</div>
            )}
            {tokenizationProposals.map((proposal: any, i: number) => (
              <div key={i} className="dashboard-proposal-card">
                <div className="dashboard-proposal-header">
                  <div className="dashboard-proposal-title">
                    <h3>{proposal.name}</h3>
                    <span 
                      className="dashboard-proposal-category"
                      style={{ backgroundColor: proposal.categoryColor + "22", color: proposal.categoryColor }}
                    >
                      {proposal.category}
                    </span>
                  </div>
                  <div className="dashboard-proposal-status">
                    <span className={`dashboard-status-badge ${proposal.status}`}>
                      {proposal.status === "pending" && "⏳ Under Review"}
                      {proposal.status === "approved" && "✅ Approved"}
                      {proposal.status === "rejected" && "❌ Rejected"}
                    </span>
                  </div>
                </div>
                <div className="dashboard-proposal-content">
                  <div className="dashboard-proposal-summary">
                    <div className="dashboard-summary-item">
                      <span className="dashboard-summary-label">📍 Location:</span>
                      <span className="dashboard-summary-value">{proposal.location}</span>
                    </div>
                    <div className="dashboard-summary-item">
                      <span className="dashboard-summary-label">💰 Price:</span>
                      <span className="dashboard-summary-value">{proposal.price}</span>
                    </div>
                    <div className="dashboard-summary-item">
                      <span className="dashboard-summary-label">📅 Submitted:</span>
                      <span className="dashboard-summary-value">{new Date(proposal.submittedDate).toLocaleDateString('en-US')}</span>
                    </div>
                    <div className="dashboard-summary-item">
                      <span className="dashboard-summary-label">📄 Documents:</span>
                      <span className="dashboard-summary-value">{proposal.documents?.length || 0} files</span>
                    </div>
                  </div>
                  {proposal.adminNotes && (
                    <div className="dashboard-admin-notes">
                      <h4>📝 Administrator Comments:</h4>
                      <p>{proposal.adminNotes}</p>
                    </div>
                  )}
                  <div className="dashboard-proposal-actions">
                    <button className="dashboard-action-btn details">
                      View Complete Details
                    </button>
                    {proposal.status === "rejected" && (
                      <button className="dashboard-action-btn resubmit">
                        Resubmit Proposal
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "disputes" && (
        <div>
          <div className="dashboard-section-title">Dispute Resolution</div>
          <div className="dashboard-disputes-list">
            {userDisputes.length === 0 && <div className="dashboard-disputes-empty">You don't have any active disputes.</div>}
            {userDisputes.map((d: any) => (
              <div key={d.id} className="dashboard-dispute-card">
                <div className="dashboard-dispute-header">
                  <div>
                    <strong>{d.proposal}</strong>
                    <div className="dashboard-dispute-meta">ID: {d.id} | Date: {new Date(d.date).toLocaleDateString('en-US')}</div>
                  </div>
                  <span className={`dashboard-dispute-status ${d.status}`}>{d.status === "open" ? "Open" : "Resolved"}</span>
                </div>
                <div className="dashboard-dispute-reason">{d.reason}</div>
                <button className="dashboard-dispute-chat-btn" onClick={() => navigate(`/chat-disputa/${d.id}`)}>
                  View chat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "analytics" && (
        <div>
          <div className="dashboard-section-title">Portfolio Analytics</div>
          {analytics.length === 0 ? (
            <div style={{background:'#232b3b', borderRadius:12, padding:'2rem', color:'#b6c2d1', textAlign:'center', fontSize:'1.1rem'}}>No analytics data available yet.</div>
          ) : (
            <>
              <div style={{display:'flex', gap:24, flexWrap:'wrap', marginBottom:32}}>
            {analytics.map((a: any, i: number) => (
                  <div key={i} className="dashboard-analytics-card" style={{minWidth:220, flex:1, background:'#181f2a', border:`2px solid ${a.color||'#38bdf8'}22`}}>
                    <div className="dashboard-analytics-icon" style={{background:(a.color||'#38bdf8')+'22', color:a.color||'#38bdf8'}}>
                      {a.icon || '📊'}
                </div>
                    <div className="dashboard-analytics-label">{a.categoria || a.label}</div>
                    <div className="dashboard-analytics-value">{a.valor_total?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || a.value}</div>
                    <div style={{color:'#b6c2d1', fontSize:14, marginTop:4}}>{a.cantidad_activos || 0} activos</div>
              </div>
            ))}
          </div>
              {/* Gráfico de barras horizontal */}
              <div style={{background:'#232b3b', borderRadius:16, padding:'2rem', marginBottom:24}}>
                <div style={{fontWeight:700, fontSize:18, marginBottom:18, color:'#fff'}}>Distribución por Categoría</div>
                {analytics.map((a: any, i: number) => {
                  const total = analytics.reduce((acc: number, b: any) => acc + (b.valor_total || 0), 0);
                  const porcentaje = total > 0 ? ((a.valor_total || 0) / total) * 100 : 0;
                  return (
                    <div key={i} style={{marginBottom:18}}>
                      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:4}}>
                        <span style={{fontSize:20}}>{a.icon || '📊'}</span>
                        <span style={{fontWeight:600, color:a.color||'#38bdf8'}}>{a.categoria || a.label}</span>
                        <span style={{color:'#b6c2d1', fontSize:14}}>{porcentaje.toFixed(1)}%</span>
                        <span style={{color:'#b6c2d1', fontSize:14, marginLeft:'auto'}}>{a.valor_total?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                      </div>
                      <div style={{height:14, background:'#181f2a', borderRadius:8, overflow:'hidden', boxShadow:'0 1px 4px #0002'}}>
                        <div style={{width:`${porcentaje}%`, height:'100%', background:a.color||'#38bdf8', transition:'width 0.5s'}}></div>
            </div>
          </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 