import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TrialCountdown } from "@/components/TrialCountdown";
import { SuspendedAccountModal } from "@/components/SuspendedAccountModal";
import { useTrialInfo } from "@/hooks/useTrialInfo";
import { useUpgradeToast } from "@/hooks/useUpgradeToast";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Embed from "./pages/Embed";
import PageBuilder from "./pages/PageBuilder";
import DynamicPage from "./pages/DynamicPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthProvider";
import Header from "@/components/Header";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import AuthCallback from "@/pages/AuthCallback";
import Campaigns from "@/pages/Campaigns";
import EditCampaign from "@/pages/EditCampaign";
import Leads from "@/pages/Leads";
import LandingLeads from "@/pages/LandingLeads";
import TestEmail from "@/pages/TestEmail";
import { RequireAuth, RequireRole } from "@/routes/guards";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const { data: trialInfo } = useTrialInfo();
  useUpgradeToast(); // Handle upgrade success notifications
  const isEmbedRoute = location.pathname === '/embed';
  const hideHeader = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isSuspended = trialInfo?.role === 'SUSPENDED';
  const isDynamicPage = location.pathname !== '/' && 
                        location.pathname !== '/embed' && 
                        location.pathname !== '/app' &&
                        !location.pathname.startsWith('/login') &&
                        !location.pathname.startsWith('/register') &&
                        !location.pathname.startsWith('/forgot-password') &&
                        !location.pathname.startsWith('/reset-password') &&
                        !location.pathname.startsWith('/campaigns') &&
                        !location.pathname.startsWith('/account') &&
                        !location.pathname.startsWith('/admin') &&
                        !location.pathname.startsWith('/auth/callback') &&
                        !location.pathname.startsWith('/page-builder') &&
                        !location.pathname.startsWith('/leads') &&
                        !location.pathname.startsWith('/landing-leads') &&
                        !location.pathname.startsWith('/test-email') &&
                        !location.pathname.startsWith('/404');

  return (
    <div className="min-h-screen bg-background">
      {!hideHeader && !isEmbedRoute && <TrialCountdown />}
      {!isEmbedRoute && !isDynamicPage && <Header />}
      <SuspendedAccountModal isOpen={isSuspended} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Index />} />
        <Route path="/embed" element={<Embed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/campaigns" element={<RequireAuth><Campaigns /></RequireAuth>} />
        <Route path="/campaigns/new" element={<RequireAuth><EditCampaign /></RequireAuth>} />
        <Route path="/campaigns/:id/edit" element={<RequireAuth><EditCampaign /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="/admin" element={<RequireRole allow={["admin"]}><Admin /></RequireRole>} />
        <Route path="/page-builder" element={<RequireAuth><PageBuilder /></RequireAuth>} />
        <Route path="/leads" element={<RequireAuth><Leads /></RequireAuth>} />
        <Route path="/landing-leads" element={<RequireRole allow={["admin"]}><LandingLeads /></RequireRole>} />
        <Route path="/test-email" element={<TestEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/404" element={<NotFound />} />
        {/* Dynamic pages route - this must be second to last */}
        <Route path="/:slug" element={<DynamicPage />} />
        {/* Catch-all route - this must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
              <Toaster />
              <Sonner />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;