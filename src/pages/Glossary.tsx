import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface GlossaryListItem {
  slug: string;
  term: string;
  shortDefinition: string;
  category: string;
}

const Glossary = () => {
  const [terms, setTerms] = useState<GlossaryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title =
      "Pakistani Legal Glossary — Common Law Terms Explained | M Salman Tahir, Advocate";
  }, []);

  useEffect(() => {
    fetch("/api/glossary")
      .then((r) => r.json())
      .then((data) => setTerms(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(terms.map((t) => t.category)));

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={28} className="text-muted-foreground" />
          <h1 className="text-3xl md:text-4xl font-serif">Legal Glossary</h1>
        </div>
        <p className="font-sans text-lg text-foreground/70 mb-10">
          Plain-English definitions of common Pakistani legal terms — explained by
          Advocate M Salman Tahir, High Court of Pakistan.
        </p>

        {loading ? (
          <p className="font-sans text-sm text-muted-foreground">Loading terms…</p>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => (
              <section key={category}>
                <h2 className="text-xl font-serif text-foreground mb-4">{category}</h2>
                <div className="space-y-4">
                  {terms
                    .filter((t) => t.category === category)
                    .map((t) => (
                      <Link
                        key={t.slug}
                        to={`/glossary/${t.slug}`}
                        className="block border-l border-border pl-4 hover:border-foreground transition-colors group"
                      >
                        <h3 className="font-serif text-base mb-1 group-hover:text-foreground">
                          {t.term}
                        </h3>
                        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">
                          {t.shortDefinition}
                        </p>
                      </Link>
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
};

export default Glossary;
