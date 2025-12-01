"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreatePost } from "@/lib/hooks/useBlogAdmin";
import { useBlogCategoriesAdmin, useBlogTagsAdmin } from "@/lib/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

const postSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(500, "Máximo 500 caracteres"),
  excerpt: z.string().min(50, "Mínimo 50 caracteres").max(300, "Máximo 300 caracteres"),
  content: z.string().min(500, "Mínimo 500 caracteres"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  tagIds: z.array(z.string()).optional(),
  featuredImage: z.string().url("URL inválida").optional().or(z.literal("")),
  isPublished: z.boolean(),
  publishedAt: z.string().optional(),
  seo: z.object({
    metaDescription: z.string().max(160, "Máximo 160 caracteres").optional(),
    metaKeywords: z.array(z.string()).optional(),
    ogImage: z.string().url("URL inválida").optional().or(z.literal("")),
  }).optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function NewBlogPostPage() {
  const router = useRouter();
  const createPost = useCreatePost();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useBlogCategoriesAdmin();
  const { data: tags, isLoading: tagsLoading, error: tagsError } = useBlogTagsAdmin();
  const tBlog = useTranslationsSafe("blog");

  // Debug: Ver qué datos tenemos
  console.log("🔍 Categories:", categories);
  console.log("🔍 Categories Loading:", categoriesLoading);
  console.log("🔍 Categories Error:", categoriesError);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      categoryId: "",
      tagIds: [],
      featuredImage: "",
      isPublished: false,
      seo: {
        metaDescription: "",
        metaKeywords: [],
        ogImage: "",
      },
    },
  });

  const onSubmit = async (data: PostFormValues) => {
    try {
      const response = await createPost.mutateAsync({
        ...data,
        publishedAt: data.isPublished ? new Date().toISOString() : undefined,
        tagIds: data.tagIds?.filter(Boolean),
        featuredImage: data.featuredImage || undefined,
        seo: data.seo?.metaDescription || data.seo?.ogImage || data.seo?.metaKeywords?.length
          ? {
              metaDescription: data.seo.metaDescription || undefined,
              metaKeywords: data.seo.metaKeywords?.filter(Boolean),
              ogImage: data.seo.ogImage || undefined,
            }
          : undefined,
      });

      if (response.data?.id) {
        router.push(`/admin/blog/${response.data.id}/edit`);
      } else {
        router.push("/admin/blog");
      }
    } catch (error) {
      // Error manejado en el hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tBlog("newArticle")}</h1>
          <p className="text-muted-foreground">{tBlog("newArticleDescription")}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{tBlog("form.content")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tBlog("form.title")} *</FormLabel>
                        <FormControl>
                          <Input placeholder={tBlog("form.titlePlaceholder")} {...field} />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500 {tBlog("form.characters")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tBlog("form.excerpt")} *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={tBlog("form.excerptPlaceholder")}
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/300 {tBlog("form.characters")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tBlog("form.content")} *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={tBlog("form.contentPlaceholder")}
                            rows={20}
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0} {tBlog("form.characters")} ({tBlog("form.minimum")} 500)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish */}
              <Card>
                <CardHeader>
                  <CardTitle>{tBlog("form.publication")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{tBlog("form.publishImmediately")}</FormLabel>
                          <FormDescription>
                            {tBlog("form.publishImmediatelyDescription")}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle>{tBlog("form.category")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tBlog("form.category")} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={tBlog("form.selectCategory")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[100]">
                            {categoriesLoading ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                {tBlog("form.loadingCategories")}
                              </div>
                            ) : categories && categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                {tBlog("form.noCategoriesAvailable")}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {categoriesError ? (
                            <span className="text-destructive">
                              {tBlog("form.error")}: {categoriesError instanceof Error ? categoriesError.message : tBlog("form.errorLoadingCategories")}
                            </span>
                          ) : categoriesLoading ? (
                            tBlog("form.loading")
                          ) : categories && categories.length > 0 ? (
                            `${categories.length} ${tBlog("form.categoriesAvailable")}`
                          ) : (
                            tBlog("form.noCategoriesAvailable")
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>{tBlog("form.tags")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="tagIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">{tBlog("form.tags")}</FormLabel>
                          <FormDescription>
                            {tBlog("form.selectRelatedTags")}
                          </FormDescription>
                        </div>
                        {tags?.map((tag) => (
                          <FormField
                            key={tag.id}
                            control={form.control}
                            name="tagIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tag.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tag.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), tag.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== tag.id)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{tag.name}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle>{tBlog("form.featuredImage")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tBlog("form.imageUrl")}</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/blog">{tBlog("cancel")}</Link>
            </Button>
            <Button type="submit" disabled={createPost.isPending}>
              {createPost.isPending ? (
                <>{tBlog("form.saving")}</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {tBlog("form.saveArticle")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

