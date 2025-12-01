"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowRight, Share2, Facebook, Twitter, Linkedin, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useRelatedPosts } from "@/lib/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { NewsletterSubscription } from "@/components/blog/NewsletterSubscription";
import { BlogComments } from "@/components/blog/BlogComments";
import type { BlogPost } from "@/lib/types/blog";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

interface BlogPostPageClientProps {
  post: BlogPost;
  slug: string;
}

export function BlogPostPageClient({ post, slug }: BlogPostPageClientProps) {
  const [copied, setCopied] = useState(false);
  const { data: relatedPosts } = useRelatedPosts(slug, 3);
  const t = useTranslationsSafe("marketing.blog.post");
  const { formatDate } = useI18n();

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = post.title;

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareText);

    let shareLink = "";
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t("linkCopyError"));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <article className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> {t("backToBlog")}
            </Link>

            {/* Category & Date */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <Badge variant="secondary">{post.category.name}</Badge>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(new Date(post.publishedAt), "PP")}
              </span>
              {post.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readingTime} {t("readingTime")}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>

            {/* Author Info */}
            <div className="flex items-center gap-4 mb-8">
              {post.author.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-semibold">{post.author.name}</p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-sm text-muted-foreground">{t("share")}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("facebook")}
                className="gap-2"
              >
                <Facebook className="w-4 h-4" />
                {t("facebook")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("twitter")}
                className="gap-2"
              >
                <Twitter className="w-4 h-4" />
                {t("twitter")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare("linkedin")}
                className="gap-2"
              >
                <Linkedin className="w-4 h-4" />
                {t("linkedin")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t("copy")}
                  </>
                )}
              </Button>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            {post.content && (
              <div
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-semibold">{t("tags")}</span>
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight mb-8">
                {t("relatedArticles")}
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedPost.featuredImage && (
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <div className="relative h-48 w-full">
                          <Image
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>
                    )}
                    <CardHeader>
                      <Badge variant="secondary" className="w-fit mb-2">
                        {relatedPost.category.name}
                      </Badge>
                      <CardTitle className="text-lg">
                        <Link
                          href={`/blog/${relatedPost.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {relatedPost.excerpt}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <BlogComments postSlug={slug} />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <NewsletterSubscription />
          </div>
        </div>
      </section>
    </div>
  );
}

