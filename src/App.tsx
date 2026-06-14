import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy-loaded pages (code-split)
const BankTransferQR = lazy(() => import("./pages/BankTransferQR.tsx"));
const Fees = lazy(() => import("./pages/Fees.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy.tsx"));
const ServicePolicy = lazy(() => import("./pages/ServicePolicy.tsx"));
const TermsConditions = lazy(() => import("./pages/TermsConditions.tsx"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.tsx"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel.tsx"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory.tsx"));
const BlogList = lazy(() => import("./pages/BlogList.tsx"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage.tsx"));
const BlogManagement = lazy(() => import("./pages/BlogManagement.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const ClientReviews = lazy(() => import("./pages/ClientReviews.tsx"));
const CriminalDefense = lazy(() => import("./pages/services/CriminalDefense.tsx"));
const CivilLitigation = lazy(() => import("./pages/services/CivilLitigation.tsx"));
const FamilyLaw = lazy(() => import("./pages/services/FamilyLaw.tsx"));
const CorporateLaw = lazy(() => import("./pages/services/CorporateLaw.tsx"));
const IntellectualProperty = lazy(() => import("./pages/services/IntellectualProperty.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bank-transfer-qr" element={<BankTransferQR />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/blog" element={<BlogManagement />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/service-policy" element={<ServicePolicy />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<ClientReviews />} />
          <Route path="/services/criminal-defense" element={<CriminalDefense />} />
          <Route path="/services/civil-litigation" element={<CivilLitigation />} />
          <Route path="/services/family-law" element={<FamilyLaw />} />
          <Route path="/services/corporate-law" element={<CorporateLaw />} />
          <Route path="/services/intellectual-property" element={<IntellectualProperty />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
