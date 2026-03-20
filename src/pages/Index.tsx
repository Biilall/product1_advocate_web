import HeroSection from "@/components/HeroSection";
import PracticeAreas from "@/components/PracticeAreas";
import SuccessSection from "@/components/SuccessSection";
import ReviewsSection from "@/components/ReviewsSection";
import ContactSection from "@/components/ContactSection";
import ChatBox from "@/components/ChatBox";

const Index = () => {
  return (
    <main className="bg-background">
      <HeroSection />
      <div className="section-divider" />
      <PracticeAreas />
      <div className="section-divider" />
      <SuccessSection />
      <div className="section-divider" />
      <ReviewsSection />
      <div className="section-divider" />
      <ContactSection />
      <ChatBox />
    </main>
  );
};

export default Index;
