import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { applyDeviceTier } from "./lib/device-tier"
import "./styles/fonts.css"
import "./styles/tokens.css"
import "./styles/global.css"
import "./styles/sections.css"
import "./styles/reveal.css"

applyDeviceTier()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
