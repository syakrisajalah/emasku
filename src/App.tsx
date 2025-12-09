import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import PriceTracker from "./pages/PriceTracker";
import AddCash from "./pages/AddCash";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Import Login page
import { InvestmentProvider } from "./context/InvestmentContext";
import { SessionContextProvider } from "./context/SessionContext"; // Import SessionContextProvider
import Header from "./components/Header";
import { useSession } from "./context/SessionContext"; // Import useSession

const queryClient = new QueryClient();

// A wrapper component to conditionally render Header and routes based on authentication
const AuthenticatedRoutes = () => {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-600 dark:text-gray-400">Memuat sesi...</p>
      </div>
    );
  }

  if (!user) {
    // If not authenticated, Login page will handle redirect
    return null;
  }

  return (
    <InvestmentProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/price-tracker" element={<PriceTracker />} />
        <Route path="/add-cash" element={<AddCash />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </InvestmentProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AuthenticatedRoutes />} /> {/* Catch-all for authenticated routes */}
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;