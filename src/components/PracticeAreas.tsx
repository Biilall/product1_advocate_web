const criminalCases = [
  "Murder & Homicide Defense",
  "Anti-Terrorism Cases",
  "Narcotics & Drug Offenses",
  "Fraud & White-Collar Crime",
  "Bail Applications",
  "Cybercrime Offenses",
];

const civilCases = [
  "Property & Land Disputes",
  "Family Law & Divorce",
  "Contract Disputes",
  "Constitutional Petitions",
  "Banking & Financial Litigation",
  "Intellectual Property",
];

const PracticeAreas = () => {
  return (
    <section id="practice" className="max-w-3xl mx-auto px-4 sm:px-6">
      <p className="font-sans text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Areas of Practice
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 mt-8 sm:mt-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif mb-8">Criminal</h2>
          <ul className="space-y-4">
            {criminalCases.map((item) => (
              <li
                key={item}
                className="font-sans text-base text-foreground/80 pl-4 border-l border-border"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-serif mb-8">Civil</h2>
          <ul className="space-y-4">
            {civilCases.map((item) => (
              <li
                key={item}
                className="font-sans text-base text-foreground/80 pl-4 border-l border-border"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PracticeAreas;
