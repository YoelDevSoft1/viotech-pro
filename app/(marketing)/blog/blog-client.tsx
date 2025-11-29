"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, Search, Tag, FolderOpen, ArrowRight } from "lucide-react";
import { useBlogPosts, useBlogCategories, useBlogTags } from "@/lib/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsletterSubscription } from "@/components/blog/NewsletterSubscription";
import type { BlogFilters } from "@/lib/types/blog";

export function BlogPageClient() {
  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 12,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: postsData, isLoading: postsLoading } = useBlogPosts(filters);
  const { data: categories, isLoading: categoriesLoading } = useBlogCategories();
  const { data: tags, isLoading: tagsLoading } = useBlogTags();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: searchQuery || undefined,
      page: 1,
    }));
  };

  const handleCategoryFilter = (categorySlug: string | null) => {
    setFilters((prev) => ({
      ...prev,
      category: categorySlug || undefined,
      page: 1,
    }));
  };

  const handleTagFilter = (tagSlug: string | null) => {
    setFilters((prev) => ({
      ...prev,
      tag: tagSlug || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setSearchQuery("");
  };

  const posts = postsData?.posts || [];
  const hasActiveFilters = filters.category || filters.tag || filters.search;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Volver al inicio
            </Link>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Blog VioTech
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Artículos sobre consultoría TI, transformación digital y mejores prácticas tecnológicas
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar artículos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Categorías
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categoriesLoading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <>
                    <button
                      onClick={() => handleCategoryFilter(null)}
                      className={`w-full text-left text-sm p-2 rounded-md transition-colors ${
                        !filters.category
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      Todas
                    </button>
                    {categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryFilter(category.slug)}
                        className={`w-full text-left text-sm p-2 rounded-md transition-colors flex items-center justify-between ${
                          filters.category === category.slug
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span>{category.name}</span>
                        {category.postCount !== undefined && (
                          <Badge variant="secondary" className="ml-2">
                            {category.postCount}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tagsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags?.slice(0, 10).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={filters.tag === tag.slug ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          handleTagFilter(filters.tag === tag.slug ? null : tag.slug)
                        }
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpiar Filtros
              </Button>
            )}

            {/* Newsletter */}
            <NewsletterSubscription />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {postsLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No se encontraron artículos. Intenta con otros filtros.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {post.featuredImage && (
                        <Link href={`/blog/${post.slug}`}>
                          <div className="relative h-48 w-full">
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Link>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="secondary">{post.category.name}</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.publishedAt).toLocaleDateString("es-CO", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <CardTitle className="text-xl">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {post.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {post.author.name}
                            </span>
                            {post.readingTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {post.readingTime} min
                              </span>
                            )}
                          </div>
                        </div>
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {postsData && postsData.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={postsData.page === 1}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
                      }
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Página {postsData.page} de {postsData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={postsData.page >= postsData.totalPages}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                      }
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

