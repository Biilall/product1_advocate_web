import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/blog/posts")
      .then((r) => r.json())
      .then((data) => setPosts((data.posts || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6">
      <p className="font-sans text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
        Legal Insights
      </p>
      <h2 className="text-3xl md:text-4xl font-serif mb-10">Latest Articles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group block border-l border-border pl-5 hover:border-foreground transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-sans text-xs tracking-wider uppercase text-muted-foreground">
                {post.category}
              </span>
              {post.publishedAt && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="font-sans text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(post.publishedAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
            <h3 className="font-serif text-lg mb-2 group-hover:text-foreground/80 transition-colors">
              {post.title}
            </h3>
            <p className="font-sans text-sm text-foreground/60 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-sans text-sm tracking-wider uppercase text-muted-foreground hover:text-foreground border-b border-muted-foreground/30 hover:border-foreground transition-colors pb-1"
        >
          View All Articles <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default LatestBlogPosts;
