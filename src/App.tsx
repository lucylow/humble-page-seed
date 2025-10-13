import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import InvoiceManager from "./pages/InvoiceManager";
import Help from "./pages/Help";
import ApiDemo from "./pages/ApiDemo";
import Demo from "./pages/Demo";
// Advanced DeFi Feature Pages
import NFTMarketplace from "./pages/NFTMarketplace";
import Analytics from "./pages/Analytics";
import YieldOptimizerPage from "./pages/YieldOptimizerPage";
import CrossChainSwapPage from "./pages/CrossChainSwapPage";
import Treasury from "./pages/Treasury";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<InvoiceManager />} />
          <Route path="/create" element={<CreateInvoice />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/invoice/:id" element={<InvoiceDetails />} />
          <Route path="/help" element={<Help />} />
          <Route path="/api-demo" element={<ApiDemo />} />
          {/* Advanced DeFi Feature Routes */}
          <Route path="/nft-marketplace" element={<NFTMarketplace />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/yield-optimizer" element={<YieldOptimizerPage />} />
          <Route path="/cross-chain-swap" element={<CrossChainSwapPage />} />
          <Route path="/treasury" element={<Treasury />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
