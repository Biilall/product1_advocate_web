const services = [
  {
    title: "Criminal Defense",
    description:
      "Murder & homicide defense, anti-terrorism cases, narcotics & drug offenses, fraud & white-collar crime, cybercrime offenses, and bail applications.",
  },
  {
    title: "Civil Litigation",
    description:
      "Property & land disputes, contract disputes, constitutional petitions, and declaratory suits before civil and high courts.",
  },
  {
    title: "Family Law",
    description:
      "Divorce, khula, custody & guardianship, maintenance claims, dower recovery, and domestic violence protection.",
  },
  {
    title: "Corporate & Banking Law",
    description:
      "Banking & financial litigation, commercial contract disputes, company formation, and regulatory compliance matters.",
  },
  {
    title: "Intellectual Property",
    description:
      "Trademark registration & enforcement, copyright protection, patent matters, and IP infringement disputes.",
  },
  {
    title: "Legal Consultation",
    description:
      "In-person and telephonic legal advice sessions, case merit assessments, and strategic counsel for individuals and businesses.",
  },
  {
    title: "Document Drafting",
    description:
      "Legal notices, contracts & agreements, affidavits, power of attorney, wills, and court filings prepared with precision.",
  },
  {
    title: "Court Representation",
    description:
      "Appearances and advocacy before District Courts, Sessions Courts, and the Lahore High Court across Punjab.",
  },
];

const PracticeAreas = () => {
  return (
    <section id="practice" className="max-w-3xl mx-auto px-4 sm:px-6">
      <p className="font-sans text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Areas of Practice
      </p>
      <h2 className="text-3xl md:text-4xl font-serif mb-10">Our Services</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
        {services.map((service) => (
          <div key={service.title} className="pl-4 border-l border-border">
            <h3 className="font-serif text-xl mb-2">{service.title}</h3>
            <p className="font-sans text-sm text-foreground/70 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PracticeAreas;
