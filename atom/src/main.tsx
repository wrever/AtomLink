import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./polyfills/global";
import { StellarProvider } from "./contexts/StellarContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StellarProvider>
      <App />
    </StellarProvider>
  </React.StrictMode>
);
