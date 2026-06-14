import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import lahoreHighCourt from "@/assets/lahore-high-court.png";

const HeroSection = () => {
  const [phase, setPhase] = useState<"typing" | "fading" | "revealed">("typing");
  const [displayedText, setDisplayedText] = useState("");
  const fullName = "M SALMAN TAHIR";

  useEffect(() => {
    if (phase !== "typing") return;
    if (displayedText.length < fullName.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullName.slice(0, displayedText.length + 1));
      }, 120);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setPhase("fading"), 800);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, phase]);

  useEffect(() => {
    if (phase === "fading") {
      const timeout = setTimeout(() => setPhase("revealed"), 1000);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  if (phase === "typing" || phase === "fading") {
    return (
      <section className="min-h-screen flex items-center justify-center bg-foreground">
        <h2
          className={`text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-serif tracking-wider text-primary-foreground transition-opacity duration-1000 px-4 text-center ${
            phase === "fading" ? "opacity-0" : "opacity-100"
          }`}
        >
          {displayedText}
          <span className="animate-pulse">|</span>
        </h2>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-end animate-in fade-in duration-1000">
      <div className="absolute inset-0">
        <img
          src={lahoreHighCourt}
          alt="Lahore High Court, Pakistan"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20 pt-28 sm:pt-40">
        <p className="font-sans text-xs sm:text-sm tracking-[0.3em] uppercase text-primary-foreground/70 mb-3 sm:mb-4">
          Advocate — High Court of Pakistan
        </p>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif text-primary-foreground mb-4 sm:mb-6 tracking-wide">
          M Salman Tahir
        </h1>
        <p className="font-sans text-base sm:text-lg text-primary-foreground/80 leading-relaxed max-w-xl">
          Practising since 2016. Dedicated to delivering justice with integrity,
          precision, and an unwavering commitment to the rule of law.
        </p>
        <nav className="mt-8 sm:mt-10 flex flex-wrap gap-4 sm:gap-8 font-sans text-xs sm:text-sm tracking-[0.2em] uppercase text-primary-foreground/60">
          <a href="#practice" className="hover:text-primary-foreground transition-colors">Practice</a>
          <a href="#success" className="hover:text-primary-foreground transition-colors">Record</a>
          <Link to="/reviews" className="hover:text-primary-foreground transition-colors">Reviews</Link>
          <a href="#contact" className="hover:text-primary-foreground transition-colors">Contact</a>
          <Link to="/blog" className="hover:text-primary-foreground transition-colors">Blog</Link>
          <Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link>
        </nav>
      </div>
    </section>
  );
};

export default HeroSection;
