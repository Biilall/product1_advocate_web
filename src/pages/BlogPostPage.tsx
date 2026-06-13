import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Tag, ArrowLeft, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBox from "@/components/ChatBox";

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  publishedAt: string;
  updatedAt: string;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/blog/posts/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setPost(data);
        // Update document title for client-side navigation
        document.title = `${data.metaTitle || data.title} — M Salman Tahir`;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <main className="bg-background min-h-screen flex flex-col">
        <SiteHeader />
        <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 rounded w-3/4" />
          <div className="bg-gray-200 h-4 rounded w-1/4" />
          <div className="bg-gray-200 h-64 rounded" />
          <div className="space-y-2">
            <div className="bg-gray-200 h-4 rounded" />
            <div className="bg-gray-200 h-4 rounded w-5/6" />
            <div className="bg-gray-200 h-4 rounded w-2/3" />
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className="bg-background min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Button>
          </Link>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />

      {/* Article */}
      <article className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.publishedAt)}
          </span>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b">
          <div className="w-10 h-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-sm">
            MS
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">M Salman Tahir</p>
            <p className="text-xs text-gray-500">Advocate, High Court of Pakistan</p>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content - rendered as HTML */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-serif prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-[#1e3a5f] prose-a:underline
            prose-img:rounded-lg
            prose-blockquote:border-l-[#1e3a5f] prose-blockquote:text-gray-600
            prose-strong:text-gray-900
            prose-ul:text-gray-700 prose-ol:text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 p-6 bg-foreground text-primary-foreground rounded-lg text-center">
          <h3 className="text-xl font-serif font-bold mb-2">Need Legal Assistance?</h3>
          <p className="text-sm opacity-90 mb-4">
            Contact M Salman Tahir for expert legal consultation on criminal and civil matters.
          </p>
          <Link to="/#contact">
            <Button variant="secondary">Contact Now</Button>
          </Link>
        </div>
      </article>

      <SiteFooter />
      <ChatBox />
    </main>
  );
};

export default BlogPostPage;
