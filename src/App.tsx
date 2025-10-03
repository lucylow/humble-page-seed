import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Analytics from "./pages/Analytics";
import FractionalOwnership from "./pages/FractionalOwnership";
import Help from "./pages/Help";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import DomainLandingPage from "./components/DomainLandingPage";
import DomainNegotiationPage from "./pages/DomainNegotiationPage";
import { Web3Provider } from "./contexts/Web3Context";
import { DomaProvider } from "./contexts/DomaContext";
import { MetricsProvider } from "./contexts/MetricsContext";
import { XMTPProvider } from "./contexts/XMTPContext";
import { NotificationProvider } from "./components/EnhancedNotificationSystem";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <Web3Provider>
        <DomaProvider>
          <MetricsProvider>
            <XMTPProvider>
              <NotificationProvider>
                <QueryClientProvider client={queryClient}>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                    <div className="min-h-screen bg-background text-foreground">
                      <Navigation />
                      <main className="pt-20">
                        <Routes>
                          <Route path="/" element={<Landing />} />
                          <Route path="/dashboard" element={<Index />} />
                          <Route path="/marketplace" element={<Marketplace />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/fractional" element={<FractionalOwnership />} />
                          <Route path="/help" element={<Help />} />
                          <Route path="/chat" element={<Chat />} />
                          <Route path="/welcome" element={<Landing />} />
                          <Route path="/domain/:domain" element={<DomainLandingPage />} />
                          <Route path="/negotiate/:domainId" element={<DomainNegotiationPage />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                    </BrowserRouter>
                  </TooltipProvider>
                </QueryClientProvider>
              </NotificationProvider>
            </XMTPProvider>
          </MetricsProvider>
        </DomaProvider>
      </Web3Provider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
