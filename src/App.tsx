import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/context";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Import existing pages
import Dashboard from "./pages/Dashboard";
import Channel from "./pages/Channel";
import Campaigns from "./pages/Campaigns";
import CampaignForm from "./pages/CampaignForm";
import CampaignDetail from "./pages/CampaignDetail";
import CampaignSchedule from "./pages/CampaignSchedule";
import Templates from "./pages/Templates";
import WordPress from "./pages/WordPress";
import WordPressConnect from "./pages/WordPressConnect";
import WordPressGenerate from "./pages/WordPressGenerate";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

// Import auth pages
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Profile from "./pages/auth/Profile";
import OAuthCallback from "./pages/auth/OAuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/auth/v1/callback" element={<OAuthCallback />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/channel/:channelId" element={
              <ProtectedRoute>
                <Channel />
              </ProtectedRoute>
            } />
            
            {/* Campaign Routes */}
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <Campaigns />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/new" element={
              <ProtectedRoute>
                <CampaignForm />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/:id" element={
              <ProtectedRoute>
                <CampaignDetail />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/:id/edit" element={
              <ProtectedRoute>
                <CampaignForm />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/:id/schedule" element={
              <ProtectedRoute>
                <CampaignSchedule />
              </ProtectedRoute>
            } />
            
            {/* Template Routes */}
            <Route path="/templates" element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            } />
            
            {/* WordPress Routes */}
            <Route path="/wordpress" element={
              <ProtectedRoute>
                <WordPress />
              </ProtectedRoute>
            } />
            <Route path="/wordpress/connect" element={
              <ProtectedRoute>
                <WordPressConnect />
              </ProtectedRoute>
            } />
            <Route path="/wordpress/generate" element={
              <ProtectedRoute>
                <WordPressGenerate />
              </ProtectedRoute>
            } />
            
            {/* Profile Route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
