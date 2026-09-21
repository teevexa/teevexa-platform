import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import CookiePolicy from "@/pages/CookiePolicy";
import { CookieBanner } from "@/components/CookieBanner";
import NotFound from "@/pages/NotFound";
import TeevexaTrace from "@/pages/TeevexaTrace";
import TeeDesk from "@/pages/TeeDesk";
import OpenSource from "@/pages/OpenSource";
import CyberGuardAI from "@/pages/CyberGuardAI";
import Accessibility from "@/pages/Accessibility";
import Portfolio from "@/pages/Portfolio";
import PortfolioDetail from "@/pages/PortfolioDetail";
import PrototypeToProduction from "@/pages/PrototypeToProduction";
import TeevexaField from "@/pages/TeevexaField";
import AccountDeletion from "@/pages/AccountDeletion";
import TraceBatch from "@/pages/TraceBatch";
import VerifyBatch from "@/pages/VerifyBatch";
import Pricing from "@/pages/Pricing";
import ApiDocs from "@/pages/ApiDocs";
import ScrollToTop from "@/components/ScrollToTop";

// Portal and admin are only needed after sign-in: load them on demand to keep the public bundle small.
const PortalLayout = lazy(() => import("@/components/portal/PortalLayout"));
const Dashboard = lazy(() => import("@/pages/portal/Dashboard"));
const Projects = lazy(() => import("@/pages/portal/Projects"));
const ProjectDetail = lazy(() => import("@/pages/portal/ProjectDetail"));
const Files = lazy(() => import("@/pages/portal/Files"));
const Messages = lazy(() => import("@/pages/portal/Messages"));
const Invoices = lazy(() => import("@/pages/portal/Invoices"));
const PortalSettings = lazy(() => import("@/pages/portal/PortalSettings"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const Leads = lazy(() => import("@/pages/admin/Leads"));
const Consultations = lazy(() => import("@/pages/admin/Consultations"));
const AdminProjects = lazy(() => import("@/pages/admin/AdminProjects"));
const AdminProjectDetail = lazy(() => import("@/pages/admin/AdminProjectDetail"));
const AdminTasks = lazy(() => import("@/pages/admin/AdminTasks"));
const AdminMilestones = lazy(() => import("@/pages/admin/AdminMilestones"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminInvoices = lazy(() => import("@/pages/admin/AdminInvoices"));
const AdminBlog = lazy(() => import("@/pages/admin/AdminBlog"));
const AdminCareers = lazy(() => import("@/pages/admin/AdminCareers"));
const AdminContacts = lazy(() => import("@/pages/admin/AdminContacts"));
const AdminProposals = lazy(() => import("@/pages/admin/AdminProposals"));
const AdminMeetingNotes = lazy(() => import("@/pages/admin/AdminMeetingNotes"));
const Proposals = lazy(() => import("@/pages/portal/Proposals"));
const MeetingNotes = lazy(() => import("@/pages/portal/MeetingNotes"));
const AuditLogs = lazy(() => import("@/pages/admin/AuditLogs"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminMessages = lazy(() => import("@/pages/admin/AdminMessages"));
const AdminKanban = lazy(() => import("@/pages/admin/AdminKanban"));
const ActivityFeed = lazy(() => import("@/pages/portal/ActivityFeed"));
const ProjectTimeline = lazy(() => import("@/pages/portal/ProjectTimeline"));
const Deliverables = lazy(() => import("@/pages/portal/Deliverables"));
const SupportTickets = lazy(() => import("@/pages/portal/SupportTickets"));
const AdminDeliverables = lazy(() => import("@/pages/admin/AdminDeliverables"));
const AdminSupportTickets = lazy(() => import("@/pages/admin/AdminSupportTickets"));
const AdminTimeTracking = lazy(() => import("@/pages/admin/AdminTimeTracking"));
const AdminRoleActivity = lazy(() => import("@/pages/admin/AdminRoleActivity"));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports"));
const ApiKeys = lazy(() => import("@/pages/portal/ApiKeys"));
const AdminPortfolio = lazy(() => import("@/pages/admin/AdminPortfolio"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse-glow text-primary text-lg">Loading...</div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CookieBanner />
        <Suspense fallback={<RouteFallback />}>
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

            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<InsightDetail />} />
            <Route path="/teevexa-trace" element={<TeevexaTrace />} />
            <Route path="/teedesk" element={<TeeDesk />} />
            <Route path="/open-source" element={<OpenSource />} />
            <Route path="/cyberguard-ai" element={<CyberGuardAI />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
            <Route path="/prototype-to-production" element={<PrototypeToProduction />} />
            {/* Retired product URLs: keep old inbound links working */}
            <Route path="/teevexa-desk" element={<Navigate to="/teedesk" replace />} />
            <Route path="/teevexa-base" element={<Navigate to="/" replace />} />
            <Route path="/teevexa-field" element={<TeevexaField />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/start-project" element={<StartProject />} />
            <Route path="/book-consultation" element={<BookConsultation />} />
            <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms-of-service" element={<TermsOfService />} />
            <Route path="/legal/cookies" element={<CookiePolicy />} />
            <Route path="/account/delete" element={<AccountDeletion />} />
          <Route path="/verify" element={<VerifyBatch />} />
          <Route path="/trace/:batchId" element={<TraceBatch />} />
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
            <Route path="timeline" element={<ProjectTimeline />} />
            <Route path="activity" element={<ActivityFeed />} />
            <Route path="deliverables" element={<Deliverables />} />
            <Route path="support" element={<SupportTickets />} />
            <Route path="files" element={<Files />} />
            <Route path="messages" element={<Messages />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="proposals" element={<Proposals />} />
            <Route path="meeting-notes" element={<MeetingNotes />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="settings" element={<PortalSettings />} />
          </Route>

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="consultations" element={<Consultations />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="proposals" element={<AdminProposals />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/:id" element={<AdminProjectDetail />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="kanban" element={<AdminKanban />} />
            <Route path="milestones" element={<AdminMilestones />} />
            <Route path="deliverables" element={<AdminDeliverables />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="support-tickets" element={<AdminSupportTickets />} />
            <Route path="time-tracking" element={<AdminTimeTracking />} />
            <Route path="role-activity" element={<AdminRoleActivity />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="meeting-notes" element={<AdminMeetingNotes />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="careers" element={<AdminCareers />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
