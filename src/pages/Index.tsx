import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import AboutSummary from "@/components/AboutSummary";
import PracticeAreas from "@/components/PracticeAreas";
import SuccessSection from "@/components/SuccessSection";
import CTABanner from "@/components/CTABanner";
import ReviewsSection from "@/components/ReviewsSection";
import LatestBlogPosts from "@/components/LatestBlogPosts";
import ContactSection from "@/components/ContactSection";
import ChatBox from "@/components/ChatBox";

const Index = () => {
  return (
    <main className="bg-background">
      {/* <div className="mx-auto flex max-w-7xl items-center justify-end p-4 md:p-6 gap-3">
        <Link
          to="/bank-transfer-qr"
          className="rounded-full border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
        >
          Bank transfer QR
        </Link>
        <Link
          to="/fees"
          className="rounded-full border border-green-500 bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
        >
          Fee structure
        </Link>
      </div> */}
      <HeroSection />
      <div id="about-section" className="section-divider" />
      <AboutSummary />
      <div className="section-divider" />
      <PracticeAreas />
      <div className="section-divider" />
      <SuccessSection />
      <CTABanner />
      <div className="section-divider" />
      <ReviewsSection />
      <div className="section-divider" />
      <LatestBlogPosts />
      <div className="section-divider" />
      <ContactSection />
      <ChatBox />
    </main>
  );
};

export default Index;
