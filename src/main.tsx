import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { applyDeviceTier } from "./lib/device-tier"
import "./styles/fonts.css"
import "./styles/tokens.css"
import "./styles/global.css"
import "./styles/sections.css"
import "./styles/reveal.css"

// Reload phải bắt đầu ở phong bì; nếu trình duyệt phục hồi vị trí giữa trang thì main còn inert và bị khóa cuộn.
if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual"
window.scrollTo(0, 0)

applyDeviceTier()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
