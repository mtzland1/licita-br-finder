
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { FiltersProvider } from "./contexts/FiltersContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Filters from "./pages/Filters";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <FavoritesProvider>
          <FiltersProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <Layout>
                      <Search />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/favorites" element={
                  <ProtectedRoute>
                    <Layout>
                      <Favorites />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/filters" element={
                  <ProtectedRoute>
                    <Layout>
                      <Filters />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </FiltersProvider>
        </FavoritesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
