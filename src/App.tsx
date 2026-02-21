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
import StartProject from "@/pages/StartProject";
import BookConsultation from "@/pages/BookConsultation";
import Auth from "@/pages/Auth";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Careers from "@/pages/Careers";
import CareerDetail from "@/pages/CareerDetail";
import Insights from "@/pages/Insights";
import InsightDetail from "@/pages/InsightDetail";
import PortalLayout from "@/components/portal/PortalLayout";
import Dashboard from "@/pages/portal/Dashboard";
import Projects from "@/pages/portal/Projects";
import ProjectDetail from "@/pages/portal/ProjectDetail";
import Files from "@/pages/portal/Files";
import Messages from "@/pages/portal/Messages";
import Invoices from "@/pages/portal/Invoices";
import PortalSettings from "@/pages/portal/PortalSettings";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Leads from "@/pages/admin/Leads";
import Consultations from "@/pages/admin/Consultations";
import AdminProjects from "@/pages/admin/AdminProjects";
import AdminMilestones from "@/pages/admin/AdminMilestones";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminInvoices from "@/pages/admin/AdminInvoices";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminCareers from "@/pages/admin/AdminCareers";
import Waitlist from "@/pages/admin/Waitlist";
import AuditLogs from "@/pages/admin/AuditLogs";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminPlaceholder from "@/pages/admin/AdminPlaceholder";
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
          {/* Public pages */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:slug" element={<CareerDetail />} />
            <Route path="/industries" element={<PlaceholderPage label="Industries" title="Industries We Serve" />} />
            <Route path="/industries/:slug" element={<PlaceholderPage label="Industry" title="Industry Details" />} />
            <Route path="/portfolio" element={<PlaceholderPage label="Portfolio" title="Our Work" />} />
            <Route path="/portfolio/:slug" element={<PlaceholderPage label="Case Study" title="Case Study" />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<InsightDetail />} />
            <Route path="/teevexa-trace" element={<PlaceholderPage label="Product" title="Teevexa Trace" description="Blockchain-powered traceability for supply chains." />} />
            <Route path="/start-project" element={<StartProject />} />
            <Route path="/book-consultation" element={<BookConsultation />} />
            <Route path="/legal/privacy-policy" element={<PlaceholderPage label="Legal" title="Privacy Policy" />} />
            <Route path="/legal/terms-of-service" element={<PlaceholderPage label="Legal" title="Terms of Service" />} />
          </Route>

          {/* Auth */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Client Portal */}
          <Route path="/client-portal" element={<PortalLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="files" element={<Files />} />
            <Route path="messages" element={<Messages />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="settings" element={<PortalSettings />} />
          </Route>

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="milestones" element={<AdminMilestones />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="portfolio" element={<AdminPlaceholder title="Portfolio Management" />} />
            <Route path="careers" element={<AdminCareers />} />
            <Route path="waitlist" element={<Waitlist />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
