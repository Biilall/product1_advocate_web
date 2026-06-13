import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Edit, Trash2, Eye, RefreshCw, ArrowLeft, FileText, Send,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogPostFull extends BlogPost {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

const BlogManagement = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostFull | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [ogImage, setOgImage] = useState("");

  const getAuthHeader = () => "Basic " + btoa("admin:" + password);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/dashboard/blog/posts", {
        headers: { Authorization: "Basic " + btoa("admin:" + password) },
      });
      if (!res.ok) {
        setAuthError("Invalid password");
        return;
      }
      setIsAuthenticated(true);
      const data = await res.json();
      setPosts(data);
    } catch {
      setAuthError("Connection error");
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/blog/posts", {
        headers: { Authorization: getAuthHeader() },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setExcerpt("");
    setFeaturedImage("");
    setCategory("");
    setTagsInput("");
    setStatus("draft");
    setMetaTitle("");
    setMetaDescription("");
    setOgImage("");
    setEditingPost(null);
  };

  const openNewPost = () => {
    resetForm();
    setEditorOpen(true);
  };

  const openEditPost = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/blog/posts/${id}`, {
        headers: { Authorization: getAuthHeader() },
      });
      if (!res.ok) throw new Error("Failed to load post");
      const post: BlogPostFull = await res.json();
      setEditingPost(post);
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content);
      setExcerpt(post.excerpt);
      setFeaturedImage(post.featuredImage || "");
      setCategory(post.category);
      setTagsInput(post.tags.join(", "));
      setStatus(post.status);
      setMetaTitle(post.metaTitle || "");
      setMetaDescription(post.metaDescription || "");
      setOgImage(post.ogImage || "");
      setEditorOpen(true);
    } catch (err) {
      console.error("Failed to load post:", err);
    }
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }

    setSaving(true);
    const finalStatus = publishNow ? "published" : status;
    const body = {
      title,
      slug: slug || generateSlug(title),
      content,
      excerpt,
      featuredImage,
      category: category || "General",
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: finalStatus,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      ogImage: ogImage || featuredImage,
    };

    try {
      const url = editingPost
        ? `/api/dashboard/blog/posts/${editingPost.id}`
        : "/api/dashboard/blog/posts";
      const method = editingPost ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Save failed");
        return;
      }

      setEditorOpen(false);
      resetForm();
      loadPosts();
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await fetch(`/api/dashboard/blog/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: getAuthHeader() },
      });
      loadPosts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Blog Management Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              {authError && <p className="text-sm text-red-600">{authError}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600">
              Create and manage blog posts for SEO
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={openNewPost}>
              <Plus className="w-4 h-4 mr-2" /> New Post
            </Button>
            <Button onClick={loadPosts} variant="outline" disabled={loading}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Link to="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Send className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {posts.filter((p) => p.status === "published").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Edit className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {posts.filter((p) => p.status === "draft").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No blog posts yet. Create your first post!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {post.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            post.status === "published" ? "default" : "secondary"
                          }
                        >
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(
                          post.publishedAt || post.createdAt
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {post.status === "published" && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditPost(post.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Post Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[75vh] pr-4">
            <div className="space-y-6 pb-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingPost) setSlug(generateSlug(e.target.value));
                  }}
                  placeholder="Post title"
                />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug">
                  URL Slug{" "}
                  <span className="text-xs text-gray-400">
                    (auto-generated from title)
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">/blog/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="url-slug"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Content (HTML) */}
              <div>
                <Label htmlFor="content">
                  Content (HTML) *
                  <span className="text-xs text-gray-400 ml-2">
                    Supports full HTML — headings, paragraphs, images, lists, links, etc.
                  </span>
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="<h2>Introduction</h2><p>Your article content...</p>"
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">
                  Excerpt / Summary
                  <span className="text-xs text-gray-400 ml-2">
                    Used in listings and as default meta description
                  </span>
                </Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of the post..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Criminal Law, Civil Law, Family Law"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">
                    Tags{" "}
                    <span className="text-xs text-gray-400">
                      (comma-separated)
                    </span>
                  </Label>
                  <Input
                    id="tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="bail, high court, appeal"
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://..."
                />
                {featuredImage && (
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="mt-2 max-h-40 rounded border"
                  />
                )}
              </div>

              {/* SEO Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="metaTitle">
                      Meta Title{" "}
                      <span className="text-xs text-gray-400">
                        ({(metaTitle || title).length}/60)
                      </span>
                    </Label>
                    <Input
                      id="metaTitle"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title || "SEO title (defaults to post title)"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">
                      Meta Description{" "}
                      <span className="text-xs text-gray-400">
                        ({(metaDescription || excerpt).length}/160)
                      </span>
                    </Label>
                    <Textarea
                      id="metaDescription"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder={
                        excerpt || "SEO description (defaults to excerpt)"
                      }
                      className="min-h-[60px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ogImage">OG Image URL</Label>
                    <Input
                      id="ogImage"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="Social share image (defaults to featured image)"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  Google Preview
                </h4>
                <div className="text-blue-800 text-lg font-medium truncate">
                  {metaTitle || title || "Post Title"} — M Salman Tahir
                </div>
                <div className="text-green-700 text-sm">
                  msalmantahir.com/blog/{slug || "url-slug"}
                </div>
                <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {metaDescription || excerpt || "Post description..."}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditorOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save as Draft"}
                </Button>
                <Button onClick={() => handleSave(true)} disabled={saving}>
                  {saving ? "Publishing..." : editingPost?.status === "published" ? "Update" : "Publish"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default BlogManagement;
