import logoAtom from "../img/logoatominvisible.png";
import "../css/loader.css";

const Loader = () => {
  const handleLogoClick = () => {
    // Navegar al home cuando se hace clic en el logo
    window.location.href = '/';
  };

  return (
    <div className="loader-bg">
      <div className="loader-content">
        <div className="loader-logo-link" onClick={handleLogoClick}>
          <img src={logoAtom} alt="AtomLink Logo" className="loader-logo" />
        </div>
        <div className="loader-spinner"></div>
      </div>
    </div>
  );
};

export default Loader; 