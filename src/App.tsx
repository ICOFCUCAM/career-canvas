import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNav } from "@/components/TopNav";
import LandingPage from "./pages/LandingPage";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <TopNav />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cv" element={<CVBuilderPage />} />
            <Route path="/cover-letter" element={<CoverLetterPage />} />
            <Route path="/jobs" element={<JobMatchingPage />} />
            <Route path="/books" element={<BookCreatorPage />} />
            <Route path="/translate" element={<TranslationPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/exports" element={<ExportCenterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
