import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ImpersonationProvider } from "@/hooks/useImpersonation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import InvestorPortal from "./pages/InvestorPortal";
import CustomerPortal from "./pages/CustomerPortal";
import AdminPortal from "./pages/AdminPortal";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ImpersonationProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/inversionistas/*" element={<ProtectedRoute allow={["investor", "admin"]}><InvestorPortal /></ProtectedRoute>} />
              <Route path="/clientes/*" element={<ProtectedRoute allow={["customer", "admin"]}><CustomerPortal /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute allow={["admin"]}><AdminPortal /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ImpersonationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
