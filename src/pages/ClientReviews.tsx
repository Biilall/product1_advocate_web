import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const reviews = [
  {
    name: "Ahmed Raza",
    text: "Mr. Tahir handled my property dispute with remarkable precision. His command of the law and courtroom presence secured a favorable verdict within months. From the very first consultation, he laid out a clear strategy and kept me informed at every stage. What impressed me most was his ability to simplify complex legal matters and make me feel confident about the outcome.",
    type: "Civil Litigation",
    rating: 5,
    year: "2023",
  },
  {
    name: "Fatima Malik",
    text: "During the most difficult period of my life, Salman Sahab provided not just legal expertise but genuine reassurance. His dedication to my case was extraordinary. He was available at every hour, answered every question patiently, and fought relentlessly in court. I am deeply grateful for his support and would recommend him to anyone in need of a compassionate yet effective lawyer.",
    type: "Criminal Defense",
    rating: 5,
    year: "2024",
  },
  {
    name: "Hassan Enterprises",
    text: "We have retained Mr. Tahir for all corporate legal matters since 2019. His strategic thinking and thorough preparation have been invaluable to our business. He has handled contract disputes, regulatory compliance, and banking matters for us with consistent professionalism. His understanding of both legal and business perspectives sets him apart from other lawyers we have worked with.",
    type: "Corporate & Banking Law",
    rating: 5,
    year: "2019–Present",
  },
  {
    name: "Nadia Hussain",
    text: "Highly professional and deeply knowledgeable. He achieved what two previous lawyers could not. I went through a difficult khula process, and Mr. Tahir handled everything — from filing the petition to the final decree — with efficiency and sensitivity. I cannot recommend him highly enough to anyone going through family law issues.",
    type: "Family Law",
    rating: 4,
    year: "2024",
  },
  {
    name: "Muhammad Irfan",
    text: "I was arrested in a false FIR and my family was in panic. Mr. Tahir filed for bail within hours and got me released from custody the next day. His knowledge of criminal procedure and his courtroom skills are outstanding. He later got the case quashed entirely. I owe him my freedom.",
    type: "Criminal Defense",
    rating: 5,
    year: "2023",
  },
  {
    name: "Ayesha Siddiqui",
    text: "Mr. Tahir helped me register my trademark with IPO Pakistan and handled an infringement dispute against a competitor. His attention to detail in preparing the documentation and his aggressive approach in enforcing my rights gave me complete peace of mind. A truly reliable IP lawyer.",
    type: "Intellectual Property",
    rating: 5,
    year: "2025",
  },
];

const ClientReviews = () => {
  useEffect(() => {
    document.title = "Client Reviews — M Salman Tahir | Advocate, High Court of Pakistan";
  }, []);

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif mb-4">Client Reviews</h1>
        <p className="font-sans text-lg text-foreground/70 mb-6">
          What our clients say about working with M Salman Tahir.
        </p>

        <div className="flex items-center gap-4 mb-12 pb-8 border-b border-border">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= Math.round(Number(averageRating)) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}
              />
            ))}
          </div>
          <span className="font-serif text-2xl">{averageRating}</span>
          <span className="font-sans text-sm text-muted-foreground">
            based on {reviews.length} reviews
          </span>
        </div>

        <div className="space-y-10">
          {reviews.map((review) => (
            <div key={review.name} className="border-l-2 border-border pl-6">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              <p className="font-sans text-base leading-relaxed text-foreground/80 italic">
                "{review.text}"
              </p>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-serif text-lg">{review.name}</span>
                <span className="font-sans text-sm text-muted-foreground">— {review.type}</span>
                <span className="font-sans text-xs text-muted-foreground/60">{review.year}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-8 text-center">
          <h2 className="text-xl font-serif mb-3">Need Legal Assistance?</h2>
          <p className="font-sans text-sm text-foreground/70 mb-6">
            Join our growing list of satisfied clients. Contact M Salman Tahir for a consultation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="tel:+923006829799"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-primary-foreground font-sans text-sm tracking-wider uppercase hover:opacity-90 transition-opacity rounded"
            >
              Call Now
            </a>
            <Link
              to="/fees"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border font-sans text-sm tracking-wider uppercase hover:bg-foreground/5 transition-colors rounded"
            >
              View Fees
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
};

export default ClientReviews;
