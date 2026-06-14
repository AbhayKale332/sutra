import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { BackendStatusProvider, useBackendStatus } from "@/context/BackendStatusContext";
import BackendStatusBanner from "@/components/BackendStatusBanner";
import RenderSplashScreen from "@/components/RenderSplashScreen";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RedirectHandler from "./pages/RedirectHandler";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Main pages wrapped in the splash-screen gate */
const SplashGatedRoutes = () => {
  const { status } = useBackendStatus();

  return (
    <RenderSplashScreen status={status}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BackendStatusBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </RenderSplashScreen>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BackendStatusProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect route — NO splash screen, fires immediately */}
            <Route path="/s/:shortUrl" element={<RedirectHandler />} />

            {/* All other routes — gated behind the splash screen */}
            <Route path="/*" element={<SplashGatedRoutes />} />
          </Routes>
        </BrowserRouter>
      </BackendStatusProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

