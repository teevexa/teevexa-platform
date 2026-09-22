import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/analytics";

// The prerendered <head> (title, meta, JSON-LD) exists for crawlers and link previews. React (react-helmet)
// re-renders the authoritative version, so drop the prerendered copies to avoid duplicates.
document.head.querySelectorAll("[data-prerender]").forEach((n) => n.remove());

createRoot(document.getElementById("root")!).render(<App />);
