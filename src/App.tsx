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
import React from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import Profile from "./pages/Profile";
import Room from "./pages/Room";
import Game from "./pages/Game";
import EmailConfirmation from "./pages/EmailConfirmation";
import NotFound from "./pages/NotFound";
import PublicRooms from "./pages/PublicRooms";
import Premium from "./pages/Premium";
import Friends from "./pages/Friends";
import Leaderboards from "./pages/Leaderboards";

const queryClient = new QueryClient();

const App = () => {
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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GoogleAnalytics />
          <BrowserRouter>
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
