import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ThemeService } from "@/lib/themeService";
import { OfflineService } from "@/lib/offlineService";
import React, { Suspense, lazy, useState } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivacyBanner from "@/components/PrivacyBanner";
import { PrivacyConsent } from "@/components/PrivacyConsent";

// Lazy loading para componentes pesados
const CreateRoom = lazy(() => import("./pages/CreateRoom"));
const JoinRoom = lazy(() => import("./pages/JoinRoom"));
const Profile = lazy(() => import("./pages/Profile"));
const Room = lazy(() => import("./pages/Room"));
const Game = lazy(() => import("./pages/Game"));
const EmailConfirmation = lazy(() => import("./pages/EmailConfirmation"));
const PublicRooms = lazy(() => import("./pages/PublicRooms"));
const Premium = lazy(() => import("./pages/Premium"));
const Friends = lazy(() => import("./pages/Friends"));
const Leaderboards = lazy(() => import("./pages/Leaderboards"));

const queryClient = new QueryClient();

const App = () => {
  const [privacyConsent, setPrivacyConsent] = useState<PrivacyConsent | null>(null);

  // Inicializar servicios al cargar la app
  React.useEffect(() => {
    // Inicializar tema
    ThemeService.initializeTheme();
    
    // Configurar listeners de conectividad
    OfflineService.setupConnectivityListeners();
    
    // Sincronizar datos offline si hay conexión
    if (!OfflineService.isOffline() && OfflineService.hasPendingSync()) {
      OfflineService.syncOfflineData();
    }
  }, []);

  const handlePrivacyConsent = (consent: PrivacyConsent) => {
    setPrivacyConsent(consent);
    // Aquí puedes configurar analytics basado en el consentimiento
    if (consent.analytics) {
      // Habilitar analytics
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GoogleAnalytics />
          <BrowserRouter>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/create-room" element={<CreateRoom />} />
                <Route path="/join-room" element={<JoinRoom />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/room/:roomId" element={<Room />} />
                <Route path="/game/:gameId" element={<Game />} />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                <Route path="/public-rooms" element={<PublicRooms />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/leaderboards" element={<Leaderboards />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <PrivacyBanner onConsentComplete={handlePrivacyConsent} />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
