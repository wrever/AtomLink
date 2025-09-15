import { NavLink } from "react-router-dom";
import logoAtom from "../img/logoatominvisible.png";
import "../css/footer.css";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        {/* Logo y descripción */}
        <div className="footer-logo-section">
          <NavLink to="/" className="footer-logo">
            <img src={logoAtom} alt="AtomLink Logo" className="footer-logo-img" />
          </NavLink>
          <div className="footer-description">
            Transforming real assets into secure and tradable digital tokens on blockchain.
          </div>
          <div className="footer-social">
            <a href="#" className="footer-social-link" aria-label="Twitter">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M22.46 5.924c-.793.352-1.646.59-2.54.697a4.48 4.48 0 0 0 1.963-2.47 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 12.07 9.03c0 .35.04.69.115 1.016-3.728-.187-7.034-1.97-9.244-4.68a4.48 4.48 0 0 0-.606 2.254c0 1.555.792 2.927 2.002 3.73a4.48 4.48 0 0 1-2.03-.56v.057a4.48 4.48 0 0 0 3.6 4.393c-.193.052-.397.08-.607.08-.148 0-.292-.014-.432-.04a4.48 4.48 0 0 0 4.18 3.11A8.98 8.98 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.77 0-.195-.004-.39-.013-.583A9.13 9.13 0 0 0 24 4.59a8.98 8.98 0 0 1-2.54.697z"/></svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Instagram">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="5" fill="currentColor"/><circle cx="12" cy="12" r="4.5" fill="#111827"/><circle cx="17" cy="7" r="1.5" fill="#111827"/></svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Telegram">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M21.944 4.667a1.5 1.5 0 0 0-1.62-.24L3.5 11.5a1.5 1.5 0 0 0 .13 2.78l3.7 1.3 1.4 4.2a1.5 1.5 0 0 0 2.7.2l2.1-3.5 3.7 2.7a1.5 1.5 0 0 0 2.36-1.02l1.5-11a1.5 1.5 0 0 0-.15-.99z"/></svg>
            </a>
            <a href="#" className="footer-social-link" aria-label="Facebook">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="5" fill="currentColor"/><path fill="#111827" d="M15.5 12H13v6h-2v-6H9v-2h2V8.5A2.5 2.5 0 0 1 13.5 6h2V8h-2A.5.5 0 0 0 13 8.5V10h2.5v2z"/></svg>
            </a>
          </div>
        </div>
        {/* Enlaces rápidos */}
        <div style={{ flex: 1, minWidth: 180, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 10 }}>Quick Links</div>
          <div><a href="/terrenos" style={{ color: "#b6c2d1", textDecoration: "none", display: "block", marginBottom: 6 }}>Marketplace</a></div>
          <div><a href="/tokenize" style={{ color: "#b6c2d1", textDecoration: "none", display: "block", marginBottom: 6 }}>Tokenize Assets</a></div>
          <div><a href="/dashboard" style={{ color: "#b6c2d1", textDecoration: "none", display: "block", marginBottom: 6 }}>My Dashboard</a></div>
          <div><a href="#" style={{ color: "#b6c2d1", textDecoration: "none", display: "block" }}>Learn</a></div>
        </div>
        {/* Recursos */}
        <div style={{ flex: 1, minWidth: 180, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 10 }}>Resources</div>
          <div><a href="#" style={{ color: "#b6c2d1", textDecoration: "none", display: "block", marginBottom: 6 }}>FAQ</a></div>
          <div><a href="#" style={{ color: "#b6c2d1", textDecoration: "none", display: "block", marginBottom: 6 }}>Glossary</a></div>
          <div><a href="#" style={{ color: "#b6c2d1", textDecoration: "none", display: "block", marginBottom: 6 }}>Guides</a></div>
          <div><a href="/contacto" style={{ color: "#b6c2d1", textDecoration: "none", display: "block" }}><span style={{ marginRight: 6 }}>ⓘ</span>Help Center</a></div>
        </div>
        {/* Contacto */}
        <div style={{ flex: 1, minWidth: 180, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 10 }}>Contact</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>✉️</span>
            <span>support@atomlink.pro</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📞</span>
            <span>+1 (234) 567-890</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #232b3b", margin: "2.2rem 0 1.2rem 0" }} />
      <div className="footer-bottom">
        <div className="footer-copyright">© 2025 Atom. All rights reserved.</div>
        <div className="footer-policies">
          <a href="#" className="footer-policy-link">Privacy Policy</a>
          <a href="#" className="footer-policy-link">Terms of Service</a>
          <a href="#" className="footer-policy-link">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 