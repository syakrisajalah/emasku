import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // Renamed from Index
import AddTransaction from "./pages/AddTransaction";
import PriceTracker from "./pages/PriceTracker";
import NotFound from "./pages/NotFound";
import { InvestmentProvider } from "./context/InvestmentContext";
import Header from "./components/Header";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <InvestmentProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-transaction" element={<AddTransaction />} />
            <Route path="/price-tracker" element={<PriceTracker />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </InvestmentProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;