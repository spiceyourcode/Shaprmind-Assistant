import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { connectSocket, disconnectSocket, joinBusinessRoom } from "@/services/socketService";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CallHistory from "./pages/CallHistory";
import Analytics from "./pages/Analytics";
import LiveMonitoring from "./pages/LiveMonitoring";
import KnowledgeBase from "./pages/KnowledgeBase";
import EscalationRules from "./pages/EscalationRules";
import UsersPage from "./pages/UsersPage";
import Customers from "./pages/Customers";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const theme = useAuthStore((s) => s.theme);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => {
    if (token) {
      connectSocket(token);
      if (user?.business_id) {
        joinBusinessRoom(user.business_id);
      }
    } else {
      disconnectSocket();
    }
  }, [token, user?.business_id]);
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeInitializer>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calls" element={<CallHistory />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/live" element={<LiveMonitoring />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/escalation-rules" element={<EscalationRules />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeInitializer>
  </QueryClientProvider>
);

export default App;
