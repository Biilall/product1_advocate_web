import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
}

const LatestBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch("/api/blog/posts")
      .then((r) => r.json())
      .then((data) => setPosts((data.posts || []).slice(0, 10)))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  const activePost = posts[activeIndex];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6">
      <p className="font-sans text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Legal Insights
      </p>
      <h2 className="text-3xl md:text-4xl font-serif mb-8">Latest Articles</h2>

      <div className="flex flex-col md:flex-row gap-0 border border-border rounded-lg overflow-hidden">
        {/* Left: Scrollable article list (playlist style) */}
        <div className="md:w-[340px] lg:w-[380px] shrink-0 bg-muted/30">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <span className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
              {posts.length} Articles
            </span>
            <Link
              to="/blog"
              className="font-sans text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {posts.map((post, index) => (
              <button
                key={post.id}
                onClick={() => setActiveIndex(index)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 transition-colors ${
                  index === activeIndex
                    ? "bg-foreground/5 border-l-2 border-l-foreground"
                    : "hover:bg-muted/50 border-l-2 border-l-transparent"
                }`}
              >
                <span className={`font-sans text-xs mt-1 shrink-0 w-5 text-center ${
                  index === activeIndex ? "text-foreground font-medium" : "text-muted-foreground"
                }`}>
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className={`font-serif text-sm leading-snug line-clamp-2 ${
                    index === activeIndex ? "text-foreground" : "text-foreground/80"
                  }`}>
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-sans text-[10px] tracking-wider uppercase text-muted-foreground">
                      {post.category}
                    </span>
                    {post.publishedAt && (
                      <>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="font-sans text-[10px] text-muted-foreground">
                          {new Date(post.publishedAt).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Featured article preview */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-xs tracking-wider uppercase text-muted-foreground px-2 py-0.5 bg-muted rounded">
                {activePost.category}
              </span>
              {activePost.publishedAt && (
                <span className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(activePost.publishedAt).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl mb-4 leading-snug">
              {activePost.title}
            </h3>
            <p className="font-sans text-sm text-foreground/70 leading-relaxed">
              {activePost.excerpt}
            </p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/blog/${activePost.slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-foreground text-primary-foreground font-sans text-xs tracking-wider uppercase rounded hover:bg-foreground/90 transition-colors"
            >
              <BookOpen size={14} />
              Read Article
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-border font-sans text-xs tracking-wider uppercase rounded hover:bg-muted transition-colors"
            >
              All Articles <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestBlogPosts;
