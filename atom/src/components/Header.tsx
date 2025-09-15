import { NavLink } from "react-router-dom";
import WalletButton from "./WalletButton";
import logoAtom from "../img/logoatominvisible.png";
import "../css/header.css";

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-content">
        <NavLink to="/" className="header-logo">
          <img src={logoAtom} alt="AtomLink Logo" className="header-logo-img" />
        </NavLink>
        <nav className="header-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "header-link active" : "header-link"}>Home</NavLink>
          <NavLink to="/terrenos" className={({ isActive }) => isActive ? "header-link active" : "header-link"}>Marketplace</NavLink>
          <NavLink to="/tokenize" className={({ isActive }) => isActive ? "header-link active" : "header-link"}>Tokenize</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "header-link active" : "header-link"}>Dashboard</NavLink>
          <NavLink to="/contacto" className={({ isActive }) => isActive ? "header-link active" : "header-link"}>Contact</NavLink>
        </nav>
        <div className="header-wallet">
          <WalletButton />
        </div>
      </div>
    </header>
  );
};

export default Header; 