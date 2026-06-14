import { Link } from "react-router-dom";
import { Scale, Award, BookOpen, ArrowRight } from "lucide-react";

const AboutSummary = () => {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6">
      <p className="font-sans text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        About the Advocate
      </p>
      <h2 className="text-3xl md:text-4xl font-serif mb-8">
        Welcome to Our Legal Practice
      </h2>

      <div className="space-y-6 font-sans text-foreground/80 leading-relaxed">
        <p className="text-base">
          M Salman Tahir is a seasoned Advocate enrolled with the{" "}
          <strong>Lahore High Court of Pakistan</strong>, with a distinguished
          practice spanning over a decade since 2016. He provides comprehensive
          legal representation before the District Courts, Sessions Courts, and the
          Lahore High Court across Punjab province.
        </p>
        <p className="text-base">
          Our commitment is to provide{" "}
          <strong>honest and accurate legal advice</strong> that makes a real
          difference. Every case is unique, and every client deserves a
          personalised approach backed by thorough research and legal expertise.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
        <div className="border border-border rounded-lg p-5 text-center">
          <Scale size={28} className="mx-auto text-muted-foreground mb-3" />
          <div className="text-2xl font-serif mb-1">10+</div>
          <p className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
            Years of Practice
          </p>
        </div>
        <div className="border border-border rounded-lg p-5 text-center">
          <Award size={28} className="mx-auto text-muted-foreground mb-3" />
          <div className="text-2xl font-serif mb-1">87%</div>
          <p className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
            Favorable Outcomes
          </p>
        </div>
        <div className="border border-border rounded-lg p-5 text-center">
          <BookOpen size={28} className="mx-auto text-muted-foreground mb-3" />
          <div className="text-2xl font-serif mb-1">300+</div>
          <p className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
            Cases Handled
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 font-sans text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground border-b border-muted-foreground/30 hover:border-foreground transition-colors pb-1"
        >
          Learn More About Us <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default AboutSummary;
