import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatBox from "@/components/ChatBox";

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  publishedAt: string;
}

const BlogList = () => {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    document.title = "Blog — M Salman Tahir | Legal Insights & Articles";
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory]);

  useEffect(() => {
    fetch("/api/blog/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "9" });
      if (selectedCategory) params.set("category", selectedCategory);
      const res = await fetch(`/api/blog/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero Banner */}
      <section className="bg-foreground text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Legal Insights & Articles
          </h1>
          <p className="text-lg opacity-90">
            Expert analysis on Pakistani law, legal updates, and practical guidance
            by Advocate M Salman Tahir
          </p>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => { setSelectedCategory(""); setPage(1); }}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedCategory(cat); setPage(1); }}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="bg-gray-200 h-4 rounded w-1/4" />
                  <div className="bg-gray-200 h-6 rounded w-3/4" />
                  <div className="bg-gray-200 h-4 rounded w-full" />
                  <div className="bg-gray-200 h-4 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No blog posts yet.</p>
            <p className="mt-2">Check back soon for legal insights and articles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
              >
                {post.featuredImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                  </div>
                  <h2 className="text-lg font-serif font-bold text-gray-900 group-hover:text-[#1e3a5f] transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-400 flex items-center gap-0.5"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </section>

      <SiteFooter />
      <ChatBox />
    </main>
  );
};

export default BlogList;
