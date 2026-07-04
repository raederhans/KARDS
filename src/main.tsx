import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/libre-franklin/latin-800.css";
import "@fontsource/libre-franklin/latin-900.css";
import "@fontsource/yantramanav/latin-700.css";
import "@fontsource/yantramanav/latin-900.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
