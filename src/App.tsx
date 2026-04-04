import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TopNav } from "@/components/TopNav";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import CVBuilderPage from "./pages/CVBuilderPage";
import CoverLetterPage from "./pages/CoverLetterPage";
import JobMatchingPage from "./pages/JobMatchingPage";
import BookCreatorPage from "./pages/BookCreatorPage";
import TranslationPage from "./pages/TranslationPage";
import TemplatesPage from "./pages/TemplatesPage";
import LibraryPage from "./pages/LibraryPage";
import ExportCenterPage from "./pages/ExportCenterPage";
import ProfilePage from "./pages/ProfilePage";
import RepurposePage from "./pages/RepurposePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <TopNav />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/cv" element={<ProtectedRoute><CVBuilderPage /></ProtectedRoute>} />
              <Route path="/cover-letter" element={<ProtectedRoute><CoverLetterPage /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><JobMatchingPage /></ProtectedRoute>} />
              <Route path="/books" element={<ProtectedRoute><BookCreatorPage /></ProtectedRoute>} />
              <Route path="/translate" element={<ProtectedRoute><TranslationPage /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
              <Route path="/exports" element={<ProtectedRoute><ExportCenterPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
