import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import BankTransferQR from "./pages/BankTransferQR.tsx";
import Fees from "./pages/Fees.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import RefundPolicy from "./pages/RefundPolicy.tsx";
import ServicePolicy from "./pages/ServicePolicy.tsx";
import TermsConditions from "./pages/TermsConditions.tsx";
import PaymentSuccess from "./pages/PaymentSuccess.tsx";
import PaymentCancel from "./pages/PaymentCancel.tsx";
import PaymentHistory from "./pages/PaymentHistory.tsx";
import BlogList from "./pages/BlogList.tsx";
import BlogPostPage from "./pages/BlogPostPage.tsx";
import BlogManagement from "./pages/BlogManagement.tsx";
import About from "./pages/About.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
