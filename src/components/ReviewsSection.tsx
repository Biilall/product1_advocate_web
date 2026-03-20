const reviews = [
  {
    name: "Ahmed Raza",
    text: "Mr. Tahir handled my property dispute with remarkable precision. His command of the law and courtroom presence secured a favorable verdict within months.",
    type: "Civil Litigation",
  },
  {
    name: "Fatima Malik",
    text: "During the most difficult period of my life, Salman Sahab provided not just legal expertise but genuine reassurance. His dedication to my case was extraordinary.",
    type: "Criminal Defense",
  },
  {
    name: "Hassan Enterprises",
    text: "We have retained Mr. Tahir for all corporate legal matters since 2019. His strategic thinking and thorough preparation have been invaluable to our business.",
    type: "Corporate Law",
  },
  {
    name: "Nadia Hussain",
    text: "Highly professional and deeply knowledgeable. He achieved what two previous lawyers could not. I cannot recommend him highly enough.",
    type: "Family Law",
  },
];

const ReviewsSection = () => {
  return (
    <section id="reviews" className="max-w-3xl mx-auto px-4 sm:px-6">
      <p className="font-sans text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Client Testimonials
      </p>
      <h2 className="text-3xl md:text-4xl font-serif mb-12">
        Words from Those We've Served
      </h2>

      <div className="space-y-12">
        {reviews.map((review) => (
          <div key={review.name} className="border-l border-border pl-6">
            <p className="font-sans text-base leading-relaxed text-foreground/80 italic">
              "{review.text}"
            </p>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-lg">{review.name}</span>
              <span className="font-sans text-sm text-muted-foreground">
                — {review.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;
