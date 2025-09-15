import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/admin.css";
import Swal from 'sweetalert2';


const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verificar si ya hay una sesión activa al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        try {
          const res = await fetch("https://atomlink.pro/backend/api/admin/auth_dash.php", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          const data = await res.json();
          if (data.success) {
            // Token válido, redirigir al dashboard
            navigate("/admin/dashboard");
          } else {
            // Token inválido, limpiar localStorage
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("adminEmail");
          }
        } catch (err) {
          // Error de red, limpiar localStorage
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminLoggedIn");
          localStorage.removeItem("adminEmail");
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://atomlink.pro/backend/api/admin/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const text = await res.text();
     
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: "Credenciales incorrectas",
        });
        setLoading(false);
        return;
      }
      if (data.success && data.data) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminEmail", data.data.email);
        localStorage.setItem("adminToken", data.data.token); // Guardar el token JWT
        navigate("/admin/dashboard");
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || "Credenciales incorrectas",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de red o servidor',
        text: "No se pudo conectar con el servidor. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-root">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1 className="admin-login-title">Admin Panel</h1>
          <p className="admin-login-sub">Acceso exclusivo para administradores</p>
        </div>
        
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="admin-input"
              placeholder="admin@atom.com"
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label className="admin-label">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="admin-input"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-btn"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default AdminLogin; 