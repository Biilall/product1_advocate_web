import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface RelatedTerm {
  slug: string;
  term: string;
}

interface GlossaryTermData {
  slug: string;
  term: string;
  shortDefinition: string;
  body: string[];
  relatedService?: { label: string; path: string };
  relatedTerms?: string[];
  category: string;
}

const GlossaryTerm = () => {
  const { slug } = useParams<{ slug: string }>();
  const [term, setTerm] = useState<GlossaryTermData | null>(null);
  const [related, setRelated] = useState<RelatedTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/glossary/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: GlossaryTermData) => {
        setTerm(data);
        document.title = `What is ${data.term}? Meaning & Legal Explanation | M Salman Tahir, Advocate`;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Resolve related term labels from the full list
  useEffect(() => {
    if (!term?.relatedTerms?.length) {
      setRelated([]);
      return;
    }
    fetch("/api/glossary")
      .then((r) => r.json())
      .then((all: RelatedTerm[]) => {
        const map = new Map(all.map((t) => [t.slug, t.term]));
        setRelated(
          (term.relatedTerms ?? [])
            .filter((s) => map.has(s))
            .map((s) => ({ slug: s, term: map.get(s) as string }))
        );
      })
      .catch(() => {});
  }, [term]);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link
          to="/glossary"
          className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft size={16} /> Back to Glossary
        </Link>

        {loading && (
          <p className="font-sans text-sm text-muted-foreground">Loading…</p>
        )}

        {notFound && !loading && (
          <div>
            <h1 className="text-3xl font-serif mb-4">Term not found</h1>
            <p className="font-sans text-foreground/70">
              We couldn't find that legal term.{" "}
              <Link to="/glossary" className="underline">
                Browse the full glossary
              </Link>
              .
            </p>
          </div>
        )}

        {term && !loading && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={28} className="text-muted-foreground" />
              <h1 className="text-3xl md:text-4xl font-serif">
                What is {term.term}?
              </h1>
            </div>

            <p className="font-sans text-lg text-foreground/80 leading-relaxed border-l-2 border-foreground/30 pl-4 mb-10">
              {term.shortDefinition}
            </p>

            <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-5">
              {term.body.map((para, i) => (
                <p key={i} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {term.relatedService && (
              <section className="border-t border-border mt-10 pt-8">
                <h2 className="text-xl font-serif text-foreground mb-3">
                  Need legal help?
                </h2>
                <p className="font-sans text-foreground/70 mb-3">
                  For matters related to {term.term}, see our{" "}
                  <Link
                    to={term.relatedService.path}
                    className="underline hover:text-foreground"
                  >
                    {term.relatedService.label}
                  </Link>{" "}
                  services, or contact Advocate M Salman Tahir for a consultation.
                </p>
                <Link
                  to="/#contact"
                  className="inline-block text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors"
                >
                  Request a Consultation
                </Link>
              </section>
            )}

            {related.length > 0 && (
              <section className="border-t border-border mt-10 pt-8">
                <h2 className="text-xl font-serif text-foreground mb-3">
                  Related terms
                </h2>
                <div className="flex flex-wrap gap-3">
                  {related.map((rt) => (
                    <Link
                      key={rt.slug}
                      to={`/glossary/${rt.slug}`}
                      className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors"
                    >
                      {rt.term}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
      <SiteFooter />
    </main>
  );
};

export default GlossaryTerm;
