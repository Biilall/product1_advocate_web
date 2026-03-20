import { MapPin, Phone, Mail } from "lucide-react";

const offices = [
  {
    city: "Islamabad",
    address: "Suite 401, Kohsar Block, F-6 Markaz, Islamabad",
    phone: "+92 51 2876543",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3318.9936854396437!2d73.02580577636266!3d33.72952493468726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbfc5fba0bfed%3A0x3d0e5c8e8a8e5e0!2sF-6%20Markaz%2C%20Islamabad!5e0!3m2!1sen!2spk!4v1710000000000",
  },
  {
    city: "Lahore",
    address: "Chamber No. 12, Lahore High Court Bar, The Mall, Lahore",
    phone: "+92 42 3567890",
    mapSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3400.0!2d74.3141!3d31.5560!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190476d5e5e5e5%3A0x1234567890abcdef!2sLahore%20High%20Court!5e0!3m2!1sen!2spk!4v1710000000000",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="max-w-3xl mx-auto px-4 sm:px-6">
      <p className="font-sans text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Get in Touch
      </p>
      <h2 className="text-3xl md:text-4xl font-serif mb-12">Contact</h2>

      <div className="grid md:grid-cols-2 gap-12">
        {offices.map((office) => (
          <div key={office.city}>
            <h3 className="font-serif text-2xl mb-4">{office.city}</h3>
            <div className="space-y-3 font-sans text-sm text-foreground/80">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-muted-foreground shrink-0" />
                <span>{office.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-muted-foreground shrink-0" />
                <span>{office.phone}</span>
              </div>
            </div>
            <div className="mt-4 w-full aspect-[4/3] border border-border">
              <iframe
                src={office.mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${office.city} Office Location`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-3 font-sans text-sm text-foreground/80">
        <Mail size={16} className="text-muted-foreground shrink-0" />
        <a href="mailto:salman.tahir@law.pk" className="border-b border-border hover:border-foreground transition-colors">
          salman.tahir@law.pk
        </a>
      </div>

      <footer className="mt-24 mb-12 pt-12 border-t border-border text-center">
        <p className="font-serif text-lg">M Salman Tahir</p>
        <p className="font-sans text-xs text-muted-foreground mt-2 tracking-wider uppercase">
          Advocate — Supreme Court of Pakistan
        </p>
      </footer>
    </section>
  );
};

export default ContactSection;
