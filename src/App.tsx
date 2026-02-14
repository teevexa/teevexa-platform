import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Contact from "@/pages/Contact";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/industries" element={<PlaceholderPage label="Industries" title="Industries We Serve" />} />
            <Route path="/industries/:slug" element={<PlaceholderPage label="Industry" title="Industry Details" />} />
            <Route path="/portfolio" element={<PlaceholderPage label="Portfolio" title="Our Work" />} />
            <Route path="/portfolio/:slug" element={<PlaceholderPage label="Case Study" title="Case Study" />} />
            <Route path="/insights" element={<PlaceholderPage label="Insights" title="Blog & Insights" />} />
            <Route path="/insights/:slug" element={<PlaceholderPage label="Article" title="Article" />} />
            <Route path="/teevexa-trace" element={<PlaceholderPage label="Product" title="Teevexa Trace" description="Blockchain-powered traceability for supply chains." />} />
            <Route path="/start-project" element={<PlaceholderPage label="Get Started" title="Start a Project" description="Multi-step project inquiry form — coming next." />} />
            <Route path="/book-consultation" element={<PlaceholderPage label="Book" title="Book a Consultation" description="Calendar booking — coming next." />} />
            <Route path="/legal/privacy-policy" element={<PlaceholderPage label="Legal" title="Privacy Policy" />} />
            <Route path="/legal/terms-of-service" element={<PlaceholderPage label="Legal" title="Terms of Service" />} />
            <Route path="/client-portal/*" element={<PlaceholderPage label="Portal" title="Client Portal" description="Dashboard mockup — coming soon." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
