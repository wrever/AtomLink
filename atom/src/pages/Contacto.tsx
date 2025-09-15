import { useState } from "react";
import Swal from 'sweetalert2';
import "../css/contacto.css";

const Contacto = () => {
  const [form, setForm] = useState({ nombre: "", correo: "", asunto: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Enviar al backend
    try {
      const res = await fetch("https://atomlink.pro/backend/api/contacto/enviar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.correo,
          mensaje: `Asunto: ${form.asunto}\n\n${form.mensaje}`
        })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Message sent!',
          text: 'We will contact you soon.',
          timer: 2500,
          showConfirmButton: false
        });
        setForm({ nombre: "", correo: "", asunto: "", mensaje: "" });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Could not send message. Try again later.'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Network error',
        text: 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="contacto-root">
      <h1 className="contacto-title">Help Center</h1>
      <div className="contacto-sub">We're here to help you with any questions or issues you may have.</div>
      <div className="contacto-row">
        <div className="contacto-col">
          <div className="contacto-block">
            <div className="contacto-block-title">Quick Links</div>
            <a className="contacto-link" href="#"><span className="contacto-link-icon">❓</span> Frequently Asked Questions <span className="contacto-link-arrow">→</span></a>
            <a className="contacto-link" href="#"><span className="contacto-link-icon">💬</span> Guides and Tutorials <span className="contacto-link-arrow">→</span></a>
            <a className="contacto-link" href="#"><span className="contacto-link-icon">📘</span> Terms Glossary <span className="contacto-link-arrow">→</span></a>
          </div>
          <div className="contacto-block">
            <div className="contacto-block-title">Direct Contact</div>
            <div className="contacto-contact-item">
              <span className="contacto-contact-icon">✉️</span>
              <div>
                <div className="contacto-contact-label">Email</div>
                <div className="contacto-contact-value">support@atomlink.pro</div>
              </div>
            </div>
            <div className="contacto-contact-item">
              <span className="contacto-contact-icon">📞</span>
              <div>
                <div className="contacto-contact-label">Phone</div>
                <div className="contacto-contact-value">+1 (234) 567-890</div>
                <div className="contacto-contact-horario">Mon-Fri: 9am - 6pm (CET)</div>
              </div>
            </div>
          </div>
        </div>
        <div className="contacto-col">
          <form className="contacto-form" onSubmit={handleSubmit}>
            <div className="contacto-form-title">Send us your Inquiry</div>
            <div className="contacto-form-row">
              <div className="contacto-form-group">
                <label>Name</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Your name" required disabled={loading} />
              </div>
              <div className="contacto-form-group">
                <label>Email</label>
                <input name="correo" value={form.correo} onChange={handleChange} placeholder="your@email.com" required type="email" disabled={loading} />
              </div>
            </div>
            <div className="contacto-form-group">
              <label>Subject</label>
              <input name="asunto" value={form.asunto} onChange={handleChange} placeholder="Subject of your inquiry" required disabled={loading} />
            </div>
            <div className="contacto-form-group">
              <label>Message</label>
              <textarea name="mensaje" value={form.mensaje} onChange={handleChange} placeholder="Describe your inquiry in detail" rows={4} required disabled={loading} />
            </div>
            <button className="contacto-btn" type="submit" disabled={loading}>{loading ? "Sending..." : "Send Message"}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto; 