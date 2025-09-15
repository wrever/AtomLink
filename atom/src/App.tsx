import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.tsx";
import Footer from "./components/Footer.tsx";
import Home from "./pages/Home";
import Terrenos from "./pages/Terrenos";
import TerrenoDetalles from "./pages/TerrenoDetalles";
import Dashboard from "./pages/Dashboard";
import Contacto from "./pages/Contacto";
import Tokenize from "./pages/Tokenize";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPropuestaDetalles from "./pages/AdminPropuestaDetalles";
import Loader from "./components/Loader";
import ChatDisputa from "./pages/ChatDisputa";

const App = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <Loader />;
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/propuesta/:id" element={<AdminPropuestaDetalles />} />
        <Route path="/chat-disputa/:id" element={<ChatDisputa />} />
        <Route path="/*" element={
          <>
      <Header />
      <main style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terrenos" element={<Terrenos />} />
          <Route path="/terreno/:id" element={<TerrenoDetalles />} />
          <Route path="/tokenize" element={<Tokenize />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </main>
      <Footer />
          </>
        } />
      </Routes>
    </Router>
  );
};

export default App;
