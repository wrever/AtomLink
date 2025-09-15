import { useState } from "react";
import { useStellar } from "../contexts/StellarContext";
import "../css/tokenize.css";
import Swal from 'sweetalert2';

const categories = [
  { key: "agro", label: "Agriculture", icon: "🌱" },
  { key: "real", label: "Real Estate", icon: "🏢" },
  { key: "energy", label: "Energy", icon: "⚡" },
  { key: "mining", label: "Mining", icon: "⛏️" },
  { key: "other", label: "Other", icon: "📦" },
];

const initialForm = {
  ownerName: "",
  ownerEmail: "",
  ownerIdNumber: "",
  ownerDocNumber: "",
  name: "",
  title: "",
  descripcion_corta: "",
  descripcion_larga: "",
  category: "Agriculture",
  tokenType: "Fractional (ERC-1155)",
  supply: 100,
  price: 100,
  location: "",
  superficie: "",
  coordenadas: "",
  altitud: "",
  clima: "",
  materiales: [] as string[],
  infraestructura: [] as string[],
  documentacion: [] as File[], // ahora archivos
  imagen: null as File | null,
  imagenes: [] as File[],
  file: null as File | null, // legacy, para compatibilidad
};

const Tokenize = () => {
  const [activeTab, setActiveTab] = useState("agro");
  const [form, setForm] = useState(initialForm);
  const [materialInput, setMaterialInput] = useState("");
  const [infraInput, setInfraInput] = useState("");
  const { isConnected, address, connectWallet } = useStellar();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAddMaterial = () => {
    if (materialInput.trim() !== "") {
      setForm(f => ({ ...f, materiales: [...f.materiales, materialInput.trim()] }));
      setMaterialInput("");
    }
  };
  const handleRemoveMaterial = (idx: number) => {
    setForm(f => ({ ...f, materiales: f.materiales.filter((_, i) => i !== idx) }));
  };
  const handleAddInfra = () => {
    if (infraInput.trim() !== "") {
      setForm(f => ({ ...f, infraestructura: [...f.infraestructura, infraInput.trim()] }));
      setInfraInput("");
    }
  };
  const handleRemoveInfra = (idx: number) => {
    setForm(f => ({ ...f, infraestructura: f.infraestructura.filter((_, i) => i !== idx) }));
  };
  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(f => ({ ...f, imagen: e.target.files![0] }));
    }
  };
  const handleAddImagenGaleria = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm(f => ({ ...f, imagenes: [...f.imagenes, ...Array.from(e.target.files!)] }));
    }
  };
  const handleRemoveImagenGaleria = (idx: number) => {
    setForm(f => ({ ...f, imagenes: f.imagenes.filter((_, i) => i !== idx) }));
  };

  // Handler para documentación como archivos
  const handleAddDocFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm(f => ({ ...f, documentacion: [...f.documentacion, ...Array.from(e.target.files!)] }));
    }
  };
  const handleRemoveDocFile = (idx: number) => {
    setForm(f => ({ ...f, documentacion: f.documentacion.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación de campos obligatorios
    if (!isConnected || !address) {
      Swal.fire({ icon: 'warning', title: 'Conecta tu wallet', text: 'Debes conectar tu wallet antes de tokenizar un activo.' });
      await connectWallet();
      return;
    }
    if (!form.ownerName.trim() || !form.ownerIdNumber.trim() || !form.ownerDocNumber.trim() || !form.ownerEmail.trim() ||
        !form.name.trim() || !form.title.trim() || !form.descripcion_corta.trim() || !form.descripcion_larga.trim() ||
        !form.category || !form.tokenType || !form.supply || !form.price || !form.location.trim() || !form.superficie.trim() ||
        !form.coordenadas.trim() || !form.altitud.trim() || !form.clima.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campos obligatorios', text: 'Por favor completa todos los campos obligatorios.' });
      return;
    }
    // Validar email simple
    if (!/^\S+@\S+\.\S+$/.test(form.ownerEmail)) {
      Swal.fire({ icon: 'warning', title: 'Email inválido', text: 'Por favor ingresa un correo electrónico válido.' });
      return;
    }
    if (form.materiales.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Materiales requeridos', text: 'Agrega al menos un recurso mineral.' });
      return;
    }
    if (form.infraestructura.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Infraestructura requerida', text: 'Agrega al menos una infraestructura.' });
      return;
    }
    if (form.documentacion.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Documentación requerida', text: 'Agrega al menos un documento.' });
      return;
    }
    if (!form.imagen) {
      Swal.fire({ icon: 'warning', title: 'Imagen requerida', text: 'Debes subir una imagen principal.' });
      return;
    }
    if (form.imagenes.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Galería requerida', text: 'Agrega al menos una imagen a la galería.' });
      return;
    }

    // --- NUEVO: Enviar a backend con FormData ---
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('title', form.title);
    formData.append('ownerName', form.ownerName);
    formData.append('ownerEmail', form.ownerEmail);
    formData.append('ownerIdNumber', form.ownerIdNumber);
    formData.append('ownerDocNumber', form.ownerDocNumber);
    formData.append('descripcion_corta', form.descripcion_corta);
    formData.append('descripcion_larga', form.descripcion_larga);
    formData.append('category', form.category);
    formData.append('tokenType', form.tokenType);
    formData.append('supply', String(form.supply));
    formData.append('price', String(form.price));
    formData.append('location', form.location);
    formData.append('superficie', form.superficie);
    formData.append('coordenadas', form.coordenadas);
    formData.append('altitud', form.altitud);
    formData.append('clima', form.clima);
    formData.append('materiales', JSON.stringify(form.materiales));
    formData.append('infraestructura', JSON.stringify(form.infraestructura));
    // Documentación (archivos)
    form.documentacion.forEach((file: File) => {
      formData.append('documentacion[]', file);
    });
    // Imagen principal
    formData.append('imagen', form.imagen);
    // Galería de imágenes
    form.imagenes.forEach((img: File) => {
      formData.append('imagenes[]', img);
    });
    // Wallet conectada
      formData.append('ownerWallet', address);

    try {
      const res = await fetch("https://atomlink.pro/backend/api/propuestas/crear.php", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: 'success', title: '¡Propuesta enviada!', text: 'Será revisada por los administradores.' });
      } else {
        Swal.fire({ icon: 'error', title: 'Error al enviar', text: data.error || 'Error desconocido' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error de red o servidor', text: 'Intenta de nuevo.' });
    }
  };

  // Mostrar botón de conectar wallet si no está conectada
  const walletRequired = !isConnected || !address;

  return (
    <main className="tokenize-main">
      <h1 className="tokenize-title">Tokenize Your Asset</h1>
      <div className="tokenize-sub">Complete the form below to tokenize your real-world asset on the blockchain.</div>
      <div className="tokenize-tabs">
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`tokenize-tab${activeTab === cat.key ? " active" : ""}`}
            onClick={() => {
              setActiveTab(cat.key);
              setForm(f => ({ ...f, category: cat.label }));
            }}
            type="button"
          >
            <span style={{marginRight: 6}}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
      <form className="tokenize-form" onSubmit={handleSubmit}>
        <label className="tokenize-label">Nombre del titular o responsable</label>
        <input className="tokenize-input" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="e.g., Juan Pérez" required />
        <label className="tokenize-label">Número de identificación fiscal (RUT, CUIT, NIF, etc.)</label>
        <input className="tokenize-input" name="ownerIdNumber" value={form.ownerIdNumber} onChange={handleChange} placeholder="e.g., 12.345.678-9" required />
        <label className="tokenize-label">Número de documento de identidad</label>
        <input className="tokenize-input" name="ownerDocNumber" value={form.ownerDocNumber} onChange={handleChange} placeholder="e.g., 12345678" required />
        <label className="tokenize-label">Correo electrónico de contacto</label>
        <input className="tokenize-input" name="ownerEmail" value={form.ownerEmail} onChange={handleChange} placeholder="e.g., juan@email.com" type="email" required />
        <div className="tokenize-form-title">{form.category} Asset</div>
        <div className="tokenize-form-sub">
          {form.category === "Agriculture" && "Tokenize farmland, crops, and agricultural projects for fractional ownership."}
          {form.category === "Real Estate" && "Convert properties (e.g., apartments, offices) into digital tokens for easy trading and investment."}
          {form.category === "Energy" && "Tokenize energy projects (solar, wind, etc.) and participate in the future of decentralized assets."}
          {form.category === "Mining" && "Tokenize mining concessions, mineral rights, and mining projects for shared investment."}
          {form.category === "Other" && "Tokenize any other type of asset not covered by the categories above."}
        </div>
        <label className="tokenize-label">Asset Name</label>
        <input className="tokenize-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g., Organic Farm #123" required />
        <label className="tokenize-label">Title</label>
        <input
          className="tokenize-input"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder={
            form.category === "Agriculture" ? "e.g., Soybean Field in Santa Fe" :
            form.category === "Real Estate" ? "e.g., Department in Palermo Soho" :
            form.category === "Energy" ? "e.g., Solar Park Jujuy" :
            form.category === "Mining" ? "e.g., Salar del Sol: Lithium Deposit" :
            "e.g., Asset Title"
          }
          required
        />
        <label className="tokenize-label">Short Description</label>
        <input 
          className="tokenize-input" 
          name="descripcion_corta" 
          value={form.descripcion_corta} 
          onChange={handleChange} 
          placeholder="Short summary of the asset..." 
          required 
          maxLength={100}
        />
        <div style={{ fontSize: 12, color: '#7b8794', marginBottom: 8, textAlign: 'right' }}>
          {form.descripcion_corta.length}/100
        </div>
        <label className="tokenize-label">Long Description</label>
        <textarea 
          className="tokenize-textarea" 
          name="descripcion_larga" 
          value={form.descripcion_larga} 
          onChange={handleChange} 
          placeholder="Detailed description of the asset..." 
          rows={3} 
          required 
          maxLength={600}
        />
        <div style={{ fontSize: 12, color: '#7b8794', marginBottom: 8, textAlign: 'right' }}>
          {form.descripcion_larga.length}/600
        </div>
        <div className="tokenize-row">
          <div>
            <label className="tokenize-label">Category</label>
            <select className="tokenize-select" name="category" value={form.category} onChange={handleChange}>
              {categories.map(cat => <option key={cat.key}>{cat.label}</option>)}
            </select>
          </div>
          <div>
            <label className="tokenize-label">Token Type</label>
            <select className="tokenize-select" name="tokenType" value={form.tokenType} onChange={handleChange}>
              <option>Fractional (ERC-1155)</option>
              <option>Unique (ERC-721)</option>
            </select>
            <div style={{ color: "#7b8794", fontSize: 12, marginTop: 2 }}>
              • 1155 for fractional ownership, ERC-721 for unique assets.
            </div>
          </div>
        </div>
        <div className="tokenize-row">
          <div>
            <label className="tokenize-label">Total Supply</label>
            <input className="tokenize-input" name="supply" type="number" min={1} value={form.supply} onChange={handleChange} required />
            <div style={{ color: "#7b8794", fontSize: 13, marginBottom: 12 }}>Number of tokens to create.</div>
          </div>
          <div>
            <label className="tokenize-label">Price Per Token (ETH)</label>
            <input className="tokenize-input" name="price" type="number" step="any" min="0" value={form.price} onChange={handleChange} required />
            <div style={{ color: "#7b8794", fontSize: 13, marginBottom: 12 }}>Price in ETH for each token.</div>
          </div>
        </div>
        <label className="tokenize-label">Location</label>
        <input className="tokenize-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Salta, Argentina" required />
        <label className="tokenize-label">Surface</label>
        <input className="tokenize-input" name="superficie" value={form.superficie} onChange={handleChange} placeholder="e.g., 1,200 hectáreas" required />
        <label className="tokenize-label">Coordinates</label>
        <input className="tokenize-input" name="coordenadas" value={form.coordenadas} onChange={handleChange} placeholder="e.g., -24.7859, -65.4116" required />
        <label className="tokenize-label">Altitude</label>
        <input className="tokenize-input" name="altitud" value={form.altitud} onChange={handleChange} placeholder="e.g., 3,800 msnm" required />
        <label className="tokenize-label">Climate</label>
        <input className="tokenize-input" name="clima" value={form.clima} onChange={handleChange} placeholder="e.g., Árido de altura" required />
        {/* Materiales dinámicos */}
        <label className="tokenize-label">Mineral Resources (add one by one)</label>
        <div className="tokenize-list-input-row">
          <input className="tokenize-input" value={materialInput} onChange={e => setMaterialInput(e.target.value)} placeholder="e.g., Litio" />
          <button type="button" className="tokenize-add-btn pretty-btn" onClick={handleAddMaterial}>➕ Agregar</button>
        </div>
        <div className="tokenize-list-tags">
          {form.materiales.map((mat, idx) => (
            <span className="tokenize-tag" key={idx}>{mat} <button type="button" onClick={() => handleRemoveMaterial(idx)} style={{background:'none',border:'none',color:'#ef4444',fontWeight:700,cursor:'pointer',marginLeft:4}}>&times;</button></span>
          ))}
        </div>
        {/* Infraestructura dinámica */}
        <label className="tokenize-label">Infrastructure (add one by one)</label>
        <div className="tokenize-list-input-row">
          <input className="tokenize-input" value={infraInput} onChange={e => setInfraInput(e.target.value)} placeholder="e.g., Acceso por ruta" />
          <button type="button" className="tokenize-add-btn pretty-btn" onClick={handleAddInfra}>➕ Agregar</button>
        </div>
        <div className="tokenize-list-tags">
          {form.infraestructura.map((inf, idx) => (
            <span className="tokenize-tag" key={idx}>{inf} <button type="button" onClick={() => handleRemoveInfra(idx)} style={{background:'none',border:'none',color:'#ef4444',fontWeight:700,cursor:'pointer',marginLeft:4}}>&times;</button></span>
          ))}
        </div>
        {/* Documentación como archivos */}
        <label className="tokenize-label">Documentation (add files)</label>
        <label className="pretty-file-btn" style={{display:'inline-block',background:'#232b3b',color:'#38bdf8',borderRadius:8,padding:'10px 22px',fontWeight:600,cursor:'pointer',marginBottom:8,boxShadow:'0 2px 8px #38bdf822',transition:'background 0.2s'}}>
          📄 Subir documentos
          <input className="tokenize-input" type="file" multiple onChange={handleAddDocFiles} style={{display:'none'}} />
        </label>
        <div className="tokenize-list-tags">
          {form.documentacion.map((doc, idx) => (
            <span className="tokenize-tag" key={idx}>{doc.name} <button type="button" onClick={() => handleRemoveDocFile(idx)} style={{background:'none',border:'none',color:'#ef4444',fontWeight:700,cursor:'pointer',marginLeft:4}}>&times;</button></span>
          ))}
        </div>
        {/* Imagen principal */}
        <label className="tokenize-label">Main Image</label>
        <label className="pretty-file-btn" style={{display:'inline-block',background:'#232b3b',color:'#38bdf8',borderRadius:8,padding:'10px 22px',fontWeight:600,cursor:'pointer',marginBottom:8,boxShadow:'0 2px 8px #38bdf822',transition:'background 0.2s'}}>
          📷 Seleccionar archivo
          <input className="tokenize-input" type="file" accept="image/*" onChange={handleImagenChange} style={{display:'none'}} />
        </label>
        {form.imagen && <div style={{ margin: '8px 0' }}>{form.imagen.name}</div>}
        {/* Galería de imágenes */}
        <label className="tokenize-label">Gallery Images (add one or more)</label>
        <label className="pretty-file-btn" style={{display:'inline-block',background:'#232b3b',color:'#38bdf8',borderRadius:8,padding:'10px 22px',fontWeight:600,cursor:'pointer',marginBottom:8,boxShadow:'0 2px 8px #38bdf822',transition:'background 0.2s'}}>
          🖼️ Elegir archivos
          <input className="tokenize-input" type="file" accept="image/*" multiple onChange={handleAddImagenGaleria} style={{display:'none'}} />
        </label>
        <div className="tokenize-list-tags">
          {form.imagenes.map((img, idx) => (
            <span className="tokenize-tag" key={idx}>{img.name} <button type="button" onClick={() => handleRemoveImagenGaleria(idx)} style={{background:'none',border:'none',color:'#ef4444',fontWeight:700,cursor:'pointer',marginLeft:4}}>&times;</button></span>
          ))}
        </div>
        <button
          className="tokenize-btn"
          type="submit"
          style={walletRequired ? { background: '#ef4444', marginBottom: 12 } : {}}
          onClick={async (e) => {
            if (walletRequired) {
              e.preventDefault();
              await connectWallet();
            }
          }}
        >
          {walletRequired ? 'Conectar Wallet para Tokenizar' : 'Submit for Tokenization'}
        </button>
      </form>
    </main>
  );
};

export default Tokenize; 