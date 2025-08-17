import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Embed from "./pages/Embed";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthProvider";
import Header from "@/components/Header";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import AuthCallback from "@/pages/AuthCallback";
import Campaigns from "@/pages/Campaigns";
import { RequireAuth, RequireRole } from "@/routes/guards";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const isEmbedRoute = location.pathname === '/embed';

  return (
    <>
      {!isEmbedRoute && <Header />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/embed" element={<Embed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/campaigns" element={<RequireAuth><Campaigns /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="/admin" element={<RequireRole allow={["admin"]}><Admin /></RequireRole>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <TooltipProvider>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </TooltipProvider>
);

export default App;
