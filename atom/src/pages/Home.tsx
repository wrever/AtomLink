import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import PartnersCarousel from "../components/ui/partners-carousel";
import AnimatedShaderBackground from "../components/ui/animated-shader-background";
import RadialOrbitalTimeline from "../components/ui/radial-orbital-timeline";
import TeamSection from "../components/ui/team";
import { Building2, Mountain, Zap, Shield, Factory, TreePine } from "lucide-react";
import "../css/home.css";
import "../css/team.css";

const Home = () => {
  // Estado para controlar qué tarjeta está activa
  const [activeCard, setActiveCard] = useState<number | null>(1); // 1 = tarjeta del medio por defecto

  // Datos para el timeline orbital de Asset Types
  const assetTypesData = [
    {
      id: 1,
      title: "Real Estate",
      date: "Q1 2024",
      content: "Tokenize residential and commercial properties with verified ownership and legal documentation.",
      category: "Real Estate",
      icon: Building2,
      relatedIds: [2, 3],
      status: "completed" as const,
      energy: 95,
    },
    {
      id: 2,
      title: "Mining Rights",
      date: "Q2 2024",
      content: "Convert mining concessions and extraction rights into tradeable digital assets.",
      category: "Mining",
      icon: Mountain,
      relatedIds: [1, 4],
      status: "in-progress" as const,
      energy: 75,
    },
    {
      id: 3,
      title: "Energy Assets",
      date: "Q3 2024",
      content: "Tokenize renewable energy infrastructure, solar farms, and wind projects.",
      category: "Energy",
      icon: Zap,
      relatedIds: [1, 5],
      status: "in-progress" as const,
      energy: 60,
    },
    {
      id: 4,
      title: "Infrastructure",
      date: "Q4 2024",
      content: "Digitalize infrastructure projects including roads, bridges, and utilities.",
      category: "Infrastructure",
      icon: Factory,
      relatedIds: [2, 6],
      status: "pending" as const,
      energy: 40,
    },
    {
      id: 5,
      title: "Agricultural Land",
      date: "Q1 2025",
      content: "Tokenize farmland, agricultural properties, and crop production rights.",
      category: "Agriculture",
      icon: TreePine,
      relatedIds: [3, 6],
      status: "pending" as const,
      energy: 25,
    },
    {
      id: 6,
      title: "Security Tokens",
      date: "Q2 2025",
      content: "Advanced security tokenization with compliance and regulatory frameworks.",
      category: "Security",
      icon: Shield,
      relatedIds: [4, 5],
      status: "pending" as const,
      energy: 15,
    },
  ];

  // Animaciones de entrada (se ejecutan automáticamente)
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  const fadeInUpDelay = (delay: number) => ({
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay }
  });

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8 }
  };

  // Animaciones de scroll
  const scrollFadeIn = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="home-root">
      {/* HERO SECTION CON FONDO SHADER */}
      <div className="home-hero-container">
        {/* Fondo shader animado */}
        <AnimatedShaderBackground />
        
        <div className="home-hero">
        <div className="home-hero-left">
            <motion.h1 
              className="home-hero-title"
              {...fadeInUp}
            >
              Tokenize Real-World Assets on the Blockchain
            </motion.h1>
            <motion.p 
              className="home-hero-sub"
              {...fadeInUpDelay(0.2)}
            >
              Transform agriculture, real estate, and energy assets into tradable digital tokens with AtomLink.
            </motion.p>
            <motion.div 
              className="home-hero-btns"
              {...fadeInUpDelay(0.4)}
            >
            <Link to="/terrenos" className="home-btn home-btn-blue">Explore Marketplace</Link>
            <Link to="/tokenize" className="home-btn home-btn-orange">Tokenize Your Assets</Link>
            </motion.div>
          </div>
          <motion.div 
            className="home-hero-right"
            {...fadeInRight}
          >
            <div className="home-hero-img">
              <svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" className="complex-tokenization">
                {/* Definiciones de gradientes y filtros */}
                <defs>
                  <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" style={{stopColor: '#38bdf8', stopOpacity: 0.9}}/>
                    <stop offset="70%" style={{stopColor: '#0ea5e9', stopOpacity: 0.6}}/>
                    <stop offset="100%" style={{stopColor: '#14b8a6', stopOpacity: 0.3}}/>
                  </radialGradient>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#38bdf8', stopOpacity: 0.8}}/>
                    <stop offset="50%" style={{stopColor: '#0ea5e9', stopOpacity: 0.6}}/>
                    <stop offset="100%" style={{stopColor: '#14b8a6', stopOpacity: 0.4}}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="strongGlow">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Centro - Token principal */}
                <g className="central-token-group">
                  <circle cx="300" cy="300" r="30" fill="url(#centerGradient)" opacity="0.9" className="central-token" filter="url(#strongGlow)">
                    <animate attributeName="r" values="30;35;30" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="300" cy="300" r="20" fill="#0d141f" opacity="0.8" className="token-inner"/>
                  <text x="300" y="308" textAnchor="middle" fill="#38bdf8" fontSize="20" fontWeight="bold" className="token-symbol" filter="url(#glow)">$</text>
                </g>
                
                {/* Nodos principales - 4 nodos cardinales */}
                
                {/* Real Estate - Superior */}
                <g className="asset-group" transform="translate(300, 150)">
                  <circle cx="0" cy="0" r="25" fill="#0ea5e9" opacity="0.8" className="asset-node" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="3.5s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="5" textAnchor="middle" fill="#0d141f" fontSize="14" fontWeight="bold" className="node-symbol">🏠</text>
                </g>
                
                {/* Mining - Derecha */}
                <g className="asset-group" transform="translate(450, 300)">
                  <circle cx="0" cy="0" r="25" fill="#14b8a6" opacity="0.8" className="asset-node" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="5" textAnchor="middle" fill="#0d141f" fontSize="14" fontWeight="bold" className="node-symbol">⛰️</text>
                </g>
                
                {/* Energy - Inferior */}
                <g className="asset-group" transform="translate(300, 450)">
                  <circle cx="0" cy="0" r="25" fill="#06b6d4" opacity="0.8" className="asset-node" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="3.2s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="5" textAnchor="middle" fill="#0d141f" fontSize="14" fontWeight="bold" className="node-symbol">⚡</text>
                </g>
                
                {/* Infrastructure - Izquierda */}
                <g className="asset-group" transform="translate(150, 300)">
                  <circle cx="0" cy="0" r="25" fill="#8b5cf6" opacity="0.8" className="asset-node" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="3.8s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="5" textAnchor="middle" fill="#0d141f" fontSize="14" fontWeight="bold" className="node-symbol">🏭</text>
                </g>
                
                {/* Nodos secundarios - Sub-nodos de cada categoría principal */}
                
                {/* Sub-nodos de Real Estate */}
                <g className="sub-asset-group" transform="translate(200, 100)">
                  <circle cx="0" cy="0" r="15" fill="#0ea5e9" opacity="0.6" className="sub-node">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="3" textAnchor="middle" fill="#0d141f" fontSize="10" fontWeight="bold" className="sub-symbol">🏢</text>
                </g>
                
                <g className="sub-asset-group" transform="translate(400, 100)">
                  <circle cx="0" cy="0" r="15" fill="#0ea5e9" opacity="0.6" className="sub-node">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4.2s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="3" textAnchor="middle" fill="#0d141f" fontSize="10" fontWeight="bold" className="sub-symbol">🏘️</text>
                </g>
                
                {/* Sub-nodos de Mining */}
                <g className="sub-asset-group" transform="translate(500, 200)">
                  <circle cx="0" cy="0" r="15" fill="#14b8a6" opacity="0.6" className="sub-node">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4.5s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="3" textAnchor="middle" fill="#0d141f" fontSize="10" fontWeight="bold" className="sub-symbol">⛏️</text>
                </g>
                
                <g className="sub-asset-group" transform="translate(500, 400)">
                  <circle cx="0" cy="0" r="15" fill="#14b8a6" opacity="0.6" className="sub-node">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4.3s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="3" textAnchor="middle" fill="#0d141f" fontSize="10" fontWeight="bold" className="sub-symbol">💎</text>
                </g>
                
                {/* Sub-nodos de Energy */}
                <g className="sub-asset-group" transform="translate(200, 500)">
                  <circle cx="0" cy="0" r="15" fill="#06b6d4" opacity="0.6" className="sub-node">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3.8s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="3" textAnchor="middle" fill="#0d141f" fontSize="10" fontWeight="bold" className="sub-symbol">🌞</text>
                </g>
                
                <g className="sub-asset-group" transform="translate(400, 500)">
                  <circle cx="0" cy="0" r="15" fill="#06b6d4" opacity="0.6" className="sub-node">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4.1s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="3" textAnchor="middle" fill="#0d141f" fontSize="10" fontWeight="bold" className="sub-symbol">💨</text>
                </g>
                
                {/* Sub-nodos de Infrastructure */}
                <g className="sub-asset-group" transform="translate(100, 200)">
                  <circle cx="0" cy="0" r="15" fill="#8b5cf6" opacity="0.6" className="sub-node">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4.4s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="3" textAnchor="middle" fill="#0d141f" fontSize="10" fontWeight="bold" className="sub-symbol">🏗️</text>
                </g>
                
                <g className="sub-asset-group" transform="translate(100, 400)">
                  <circle cx="0" cy="0" r="15" fill="#8b5cf6" opacity="0.6" className="sub-node">
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="4.6s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="3" textAnchor="middle" fill="#0d141f" fontSize="10" fontWeight="bold" className="sub-symbol">🚧</text>
                </g>
                
                {/* Nodos terciarios - Micro-nodos */}
                <g className="micro-asset-group" transform="translate(250, 80)">
                  <circle cx="0" cy="0" r="8" fill="#0ea5e9" opacity="0.4" className="micro-node">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="5s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="2" textAnchor="middle" fill="#0d141f" fontSize="8" fontWeight="bold" className="micro-symbol">🏡</text>
                </g>
                
                <g className="micro-asset-group" transform="translate(350, 80)">
                  <circle cx="0" cy="0" r="8" fill="#0ea5e9" opacity="0.4" className="micro-node">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="5.2s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="2" textAnchor="middle" fill="#0d141f" fontSize="8" fontWeight="bold" className="micro-symbol">🏪</text>
                </g>
                
                <g className="micro-asset-group" transform="translate(550, 250)">
                  <circle cx="0" cy="0" r="8" fill="#14b8a6" opacity="0.4" className="micro-node">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="5.5s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="2" textAnchor="middle" fill="#0d141f" fontSize="8" fontWeight="bold" className="micro-symbol">🪨</text>
                </g>
                
                <g className="micro-asset-group" transform="translate(550, 350)">
                  <circle cx="0" cy="0" r="8" fill="#14b8a6" opacity="0.4" className="micro-node">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="5.3s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="2" textAnchor="middle" fill="#0d141f" fontSize="8" fontWeight="bold" className="micro-symbol">🛢️</text>
                </g>
                
                <g className="micro-asset-group" transform="translate(250, 520)">
                  <circle cx="0" cy="0" r="8" fill="#06b6d4" opacity="0.4" className="micro-node">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4.8s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="2" textAnchor="middle" fill="#0d141f" fontSize="8" fontWeight="bold" className="micro-symbol">🌊</text>
                </g>
                
                <g className="micro-asset-group" transform="translate(350, 520)">
                  <circle cx="0" cy="0" r="8" fill="#06b6d4" opacity="0.4" className="micro-node">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="5.1s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="2" textAnchor="middle" fill="#0d141f" fontSize="8" fontWeight="bold" className="micro-symbol">⚡</text>
                </g>
                
                <g className="micro-asset-group" transform="translate(50, 250)">
                  <circle cx="0" cy="0" r="8" fill="#8b5cf6" opacity="0.4" className="micro-node">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="5.4s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="2" textAnchor="middle" fill="#0d141f" fontSize="8" fontWeight="bold" className="micro-symbol">🏭</text>
                </g>
                
                <g className="micro-asset-group" transform="translate(50, 350)">
                  <circle cx="0" cy="0" r="8" fill="#8b5cf6" opacity="0.4" className="micro-node">
                    <animate attributeName="opacity" values="0.4;0.7;0.4" dur="5.6s" repeatCount="indefinite"/>
                  </circle>
                  <text x="0" y="2" textAnchor="middle" fill="#0d141f" fontSize="8" fontWeight="bold" className="micro-symbol">🚇</text>
                </g>
                
                {/* Conexiones principales - Del centro a nodos principales */}
                <g className="main-connections">
                  {/* Conexión Real Estate */}
                  <line x1="300" y1="270" x2="300" y2="175" stroke="url(#connectionGradient)" strokeWidth="4" className="main-connection" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Conexión Mining */}
                  <line x1="330" y1="300" x2="425" y2="300" stroke="url(#connectionGradient)" strokeWidth="4" className="main-connection" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2.8s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Conexión Energy */}
                  <line x1="300" y1="330" x2="300" y2="425" stroke="url(#connectionGradient)" strokeWidth="4" className="main-connection" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Conexión Infrastructure */}
                  <line x1="270" y1="300" x2="175" y2="300" stroke="url(#connectionGradient)" strokeWidth="4" className="main-connection" filter="url(#glow)">
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="2.6s" repeatCount="indefinite"/>
                  </line>
                </g>
                
                {/* Conexiones secundarias - De nodos principales a sub-nodos */}
                <g className="sub-connections">
                  {/* Real Estate a sus sub-nodos */}
                  <line x1="300" y1="150" x2="200" y2="100" stroke="#0ea5e9" strokeWidth="2" opacity="0.5" className="sub-connection">
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite"/>
                  </line>
                  <line x1="300" y1="150" x2="400" y2="100" stroke="#0ea5e9" strokeWidth="2" opacity="0.5" className="sub-connection">
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3.2s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Mining a sus sub-nodos */}
                  <line x1="450" y1="300" x2="500" y2="200" stroke="#14b8a6" strokeWidth="2" opacity="0.5" className="sub-connection">
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3.5s" repeatCount="indefinite"/>
                  </line>
                  <line x1="450" y1="300" x2="500" y2="400" stroke="#14b8a6" strokeWidth="2" opacity="0.5" className="sub-connection">
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3.3s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Energy a sus sub-nodos */}
                  <line x1="300" y1="450" x2="200" y2="500" stroke="#06b6d4" strokeWidth="2" opacity="0.5" className="sub-connection">
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2.8s" repeatCount="indefinite"/>
                  </line>
                  <line x1="300" y1="450" x2="400" y2="500" stroke="#06b6d4" strokeWidth="2" opacity="0.5" className="sub-connection">
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3.1s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Infrastructure a sus sub-nodos */}
                  <line x1="150" y1="300" x2="100" y2="200" stroke="#8b5cf6" strokeWidth="2" opacity="0.5" className="sub-connection">
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3.4s" repeatCount="indefinite"/>
                  </line>
                  <line x1="150" y1="300" x2="100" y2="400" stroke="#8b5cf6" strokeWidth="2" opacity="0.5" className="sub-connection">
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="3.6s" repeatCount="indefinite"/>
                  </line>
                </g>
                
                {/* Conexiones terciarias - De sub-nodos a micro-nodos */}
                <g className="micro-connections">
                  {/* Real Estate sub-nodos a micro-nodos */}
                  <line x1="200" y1="100" x2="250" y2="80" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" className="micro-connection">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite"/>
                  </line>
                  <line x1="400" y1="100" x2="350" y2="80" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" className="micro-connection">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.2s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Mining sub-nodos a micro-nodos */}
                  <line x1="500" y1="200" x2="550" y2="250" stroke="#14b8a6" strokeWidth="1" opacity="0.3" className="micro-connection">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.5s" repeatCount="indefinite"/>
                  </line>
                  <line x1="500" y1="400" x2="550" y2="350" stroke="#14b8a6" strokeWidth="1" opacity="0.3" className="micro-connection">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.3s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Energy sub-nodos a micro-nodos */}
                  <line x1="200" y1="500" x2="250" y2="520" stroke="#06b6d4" strokeWidth="1" opacity="0.3" className="micro-connection">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.8s" repeatCount="indefinite"/>
                  </line>
                  <line x1="400" y1="500" x2="350" y2="520" stroke="#06b6d4" strokeWidth="1" opacity="0.3" className="micro-connection">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.1s" repeatCount="indefinite"/>
                  </line>
                  
                  {/* Infrastructure sub-nodos a micro-nodos */}
                  <line x1="100" y1="200" x2="50" y2="250" stroke="#8b5cf6" strokeWidth="1" opacity="0.3" className="micro-connection">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.4s" repeatCount="indefinite"/>
                  </line>
                  <line x1="100" y1="400" x2="50" y2="350" stroke="#8b5cf6" strokeWidth="1" opacity="0.3" className="micro-connection">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4.6s" repeatCount="indefinite"/>
                  </line>
                </g>
                
                {/* Partículas de tokenización - Flujo desde micro-nodos hacia el centro */}
                <g className="tokenization-particles">
                  {/* Partículas desde micro-nodos de Real Estate */}
                  <circle cx="250" cy="90" r="1" fill="#0ea5e9" opacity="0.6" className="particle">
                    <animate attributeName="cy" values="90;300;90" dur="4s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="350" cy="90" r="1" fill="#0ea5e9" opacity="0.6" className="particle">
                    <animate attributeName="cy" values="90;300;90" dur="4.2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="4.2s" repeatCount="indefinite"/>
                  </circle>
                  
                  {/* Partículas desde micro-nodos de Mining */}
                  <circle cx="550" cy="250" r="1" fill="#14b8a6" opacity="0.6" className="particle">
                    <animate attributeName="cx" values="550;300;550" dur="4.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="4.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="550" cy="350" r="1" fill="#14b8a6" opacity="0.6" className="particle">
                    <animate attributeName="cx" values="550;300;550" dur="4.3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="4.3s" repeatCount="indefinite"/>
                  </circle>
                  
                  {/* Partículas desde micro-nodos de Energy */}
                  <circle cx="250" cy="520" r="1" fill="#06b6d4" opacity="0.6" className="particle">
                    <animate attributeName="cy" values="520;300;520" dur="3.8s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="3.8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="350" cy="520" r="1" fill="#06b6d4" opacity="0.6" className="particle">
                    <animate attributeName="cy" values="520;300;520" dur="4.1s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="4.1s" repeatCount="indefinite"/>
                  </circle>
                  
                  {/* Partículas desde micro-nodos de Infrastructure */}
                  <circle cx="50" cy="250" r="1" fill="#8b5cf6" opacity="0.6" className="particle">
                    <animate attributeName="cx" values="50;300;50" dur="4.4s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="4.4s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="50" cy="350" r="1" fill="#8b5cf6" opacity="0.6" className="particle">
                    <animate attributeName="cx" values="50;300;50" dur="4.6s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="4.6s" repeatCount="indefinite"/>
                  </circle>
                </g>
              </svg>
          </div>
          </motion.div>
          </div>
        </div>

      {/* PARTNERS CAROUSEL */}
      <PartnersCarousel />

      

      {/* HOW IT WORKS */}
      <motion.section className="home-how-it-works" {...scrollFadeIn}>
        <motion.h2 className="home-section-title" {...scrollFadeIn}>
          The Future of Mining Assets
        </motion.h2>
        <motion.p className="home-section-sub" {...scrollFadeIn}>
          A simple process to tokenize and trade real-world assets on the blockchain.
        </motion.p>
        <div className="home-how-cards">
          <motion.div 
            className={`home-how-card ${activeCard === 0 ? 'active' : ''}`}
            {...scrollFadeIn}
            transition={{ delay: 0.1 }}
            onMouseEnter={() => setActiveCard(0)}
            onMouseLeave={() => setActiveCard(1)}
          >
            <div className="home-how-card-header">
              <div className="home-how-card-badge">Validate what matters</div>
              <div className="home-how-card-status">
                <span className="home-how-status-icon">✓</span>
                <span className="home-how-status-text">Performance verified by AtomLink</span>
              </div>
            </div>
            <div className="home-how-card-content">
              <div className="home-how-card-title">Connect Your Wallet</div>
              <div className="home-how-card-desc">Connect your wallet and verify your identity to access the platform and start your tokenization journey.</div>
              <div className="home-how-card-metrics">
                <div className="home-how-metric">
                  <div className="home-how-metric-label">Security Level</div>
                  <div className="home-how-metric-value">100%</div>
                </div>
                <div className="home-how-metric">
                  <div className="home-how-metric-label">Verification Time</div>
                  <div className="home-how-metric-value">2 min</div>
                </div>
              </div>
              <button className="home-how-card-btn">Connect Wallet</button>
            </div>
          </motion.div>

          <motion.div 
            className={`home-how-card ${activeCard === 1 ? 'active' : ''}`}
            {...scrollFadeIn}
            transition={{ delay: 0.2 }}
            onMouseEnter={() => setActiveCard(1)}
            onMouseLeave={() => setActiveCard(1)}
          >
            <div className="home-how-card-header">
              <div className="home-how-card-badge">Fund what's real</div>
              <div className="home-how-card-status">
                <span className="home-how-status-icon">✓</span>
                <span className="home-how-status-text">Performance verified by AtomLink</span>
              </div>
            </div>
            <div className="home-how-card-content">
              <div className="home-how-card-title">Tokenize Your Assets</div>
              <div className="home-how-card-desc">Submit your asset details and documentation for verification and tokenization on the blockchain.</div>
              <div className="home-how-card-metrics">
                <div className="home-how-metric">
                  <div className="home-how-metric-label">Success Rate</div>
                  <div className="home-how-metric-value">98%</div>
                </div>
                <div className="home-how-metric">
                  <div className="home-how-metric-label">Processing Time</div>
                  <div className="home-how-metric-value">24h</div>
                </div>
              </div>
              <button className="home-how-card-btn">Start Tokenization</button>
            </div>
          </motion.div>

          <motion.div 
            className={`home-how-card ${activeCard === 2 ? 'active' : ''}`}
            {...scrollFadeIn}
            transition={{ delay: 0.3 }}
            onMouseEnter={() => setActiveCard(2)}
            onMouseLeave={() => setActiveCard(1)}
          >
            <div className="home-how-card-header">
              <div className="home-how-card-badge">Trackable revenue</div>
              <div className="home-how-card-status">
                <span className="home-how-status-icon">✓</span>
                <span className="home-how-status-text">Performance verified by AtomLink</span>
              </div>
            </div>
            <div className="home-how-card-content">
              <div className="home-how-card-title">Trade & Manage</div>
              <div className="home-how-card-desc">Buy, sell, or hold tokenized assets in your portfolio with full transparency and real-time tracking.</div>
              <div className="home-how-card-metrics">
                <div className="home-how-metric">
                  <div className="home-how-metric-label">Trading Volume</div>
                  <div className="home-how-metric-value">$10M+</div>
                </div>
                <div className="home-how-metric">
                  <div className="home-how-metric-label">Active Users</div>
                  <div className="home-how-metric-value">500+</div>
          </div>
          </div>
              <button className="home-how-card-btn">Explore Marketplace</button>
          </div>
          </motion.div>
        </div>
      </motion.section>

{/* ASSET TYPES SECTION - ORBITAL TIMELINE */}
<motion.section className="home-asset-types-orbital" {...scrollFadeIn}>
       <motion.h2 className="home-asset-types-title" {...scrollFadeIn}>
         Asset Types
       </motion.h2>
       <motion.p className="home-asset-types-subtitle" {...scrollFadeIn}>
         Discover the diverse range of real-world assets you can tokenize or invest on our platform.
       </motion.p>
       <div className="home-asset-types-timeline">
         <RadialOrbitalTimeline timelineData={assetTypesData} />
       </div>
     </motion.section>

      {/* CALL TO INVESTORS SECTION */}
      <motion.section className="home-call-to-investors" {...scrollFadeIn}>
        <div className="home-call-container">
          <motion.div className="home-call-content" {...scrollFadeIn}>
            <motion.h2 className="home-call-title" {...scrollFadeIn}>
              Ready to Invest in Mining Assets?
            </motion.h2>
            <motion.p className="home-call-subtitle" {...scrollFadeIn}>
              Join the future of mining investment through blockchain technology. 
              Tokenize your mining operations and access global capital markets.
            </motion.p>
            <motion.div className="home-call-features" {...scrollFadeIn}>
              <div className="home-call-feature">
                <div className="home-call-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Global Access</h3>
                <p>Reach international investors and mining companies worldwide</p>
              </div>
              <div className="home-call-feature">
                <div className="home-call-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Verified Assets</h3>
                <p>All mining assets are verified and backed by real-world operations</p>
              </div>
              <div className="home-call-feature">
                <div className="home-call-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Transparent Process</h3>
                <p>Full transparency in asset valuation and investment tracking</p>
              </div>
            </motion.div>
            <motion.div className="home-call-actions" {...scrollFadeIn}>
              <button className="home-call-btn home-call-btn-primary">
                Start Tokenizing
              </button>
              <button className="home-call-btn home-call-btn-secondary">
                Learn More
              </button>
            </motion.div>
          </motion.div>
          <motion.div className="home-call-visual" {...scrollFadeIn}>
            <div className="home-call-mining-visual">
              <div className="home-call-mining-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
        </div>
              <div className="home-call-mining-text">
                <h3>Mining Operations</h3>
                <p>Tokenize your mining assets and operations</p>
        </div>
        </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FOUNDING TEAM SECTION */}
      <TeamSection />

      {/* CTA FINAL */}
      <motion.section className="home-cta" {...scrollFadeIn}>
        <motion.h2 className="home-cta-title" {...scrollFadeIn}>
          Ready to Get Started?
        </motion.h2>
        <motion.p className="home-cta-sub" {...scrollFadeIn}>
          Join Atom today and transform how you invest in real-world assets.
        </motion.p>
        <motion.div 
          className="home-cta-btns"
          {...scrollFadeIn}
          transition={{ delay: 0.2 }}
        >
          <Link to="/terrenos" className="home-btn home-btn-blue">Explore Marketplace</Link>
          <Link to="/tokenize" className="home-btn home-btn-orange">Tokenize Your Assets</Link>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Home; 