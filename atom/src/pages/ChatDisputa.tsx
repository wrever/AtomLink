import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../css/dashboard.css";

const getRolFromQuery = (search: string) => {
  const params = new URLSearchParams(search);
  return params.get('rol') || 'cliente';
};

const ChatDisputa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const rol = getRolFromQuery(location.search);
  return (
    <div className="chat-disputa-root">
      <div className="chat-disputa-header">
        <button className="chat-disputa-back" onClick={() => navigate(-1)}>&larr; Back</button>
        <h2 className="chat-disputa-title">
          Live Chat <span className="chat-disputa-id">- Dispute #{id}</span> <span className="chat-disputa-rol">({rol === "admin" ? "Admin" : "Client"})</span>
        </h2>
      </div>
      <div className="chat-disputa-messages">
        {/* Mensaje de ejemplo del admin */}
        <div className="chat-disputa-message admin">
          <span className="chat-disputa-author">{rol === "admin" ? "You (Admin):" : "Admin:"}</span> Hello, how can we help you with your dispute?
        </div>
        {/* Mensaje de ejemplo del usuario */}
        <div className="chat-disputa-message user">
          <span className="chat-disputa-author">You:</span> (Your messages and Atom team messages will appear here)
        </div>
        <div className="chat-disputa-placeholder">Live chat will be available soon.</div>
      </div>
      <div className="chat-disputa-input-bar">
        <input className="chat-disputa-input" placeholder="Type your message..." disabled />
        <button className="chat-disputa-send-btn" disabled>Send</button>
      </div>
    </div>
  );
};

export default ChatDisputa; 