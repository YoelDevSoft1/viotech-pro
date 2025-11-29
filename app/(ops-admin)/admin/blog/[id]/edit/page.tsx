"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdatePost } from "@/lib/hooks/useBlogAdmin";
import { useBlogPostById, useBlogCategoriesAdmin, useBlogTagsAdmin } from "@/lib/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const postSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(500, "Máximo 500 caracteres"),
  excerpt: z.string().min(50, "Mínimo 50 caracteres").max(300, "Máximo 300 caracteres"),
  content: z.string().min(500, "Mínimo 500 caracteres"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  tagIds: z.array(z.string()).optional(),
  featuredImage: z.union([
    z.string().url("URL inválida"),
    z.literal(""),
  ]).optional(),
  isPublished: z.boolean(),
  publishedAt: z.union([
    z.string(),
    z.literal(""),
    z.null(),
    z.undefined(),
  ]).optional().nullable(),
  seo: z.object({
    metaDescription: z.string().max(160, "Máximo 160 caracteres").optional().or(z.literal("")),
    metaKeywords: z.array(z.string()).optional(),
    ogImage: z.union([
      z.string().url("URL inválida"),
      z.literal(""),
    ]).optional(),
  }).optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const { data: post, isLoading: postLoading } = useBlogPostById(postId);
  const updatePost = useUpdatePost();
  const { data: categories, isLoading: categoriesLoading } = useBlogCategoriesAdmin();
  const { data: tags, isLoading: tagsLoading } = useBlogTagsAdmin();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    mode: "onChange", // Validar mientras el usuario escribe
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

  // Cargar datos del post cuando esté disponible
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content || "",
        categoryId: post.category.id,
        tagIds: post.tags.map((t: { id: string; name: string; slug: string }) => t.id),
        featuredImage: post.featuredImage || "",
        isPublished: !!post.publishedAt,
        publishedAt: post.publishedAt || undefined, // Convertir null a undefined
        seo: {
          metaDescription: post.seo?.metaDescription || "",
          metaKeywords: post.seo?.metaKeywords || [],
          ogImage: post.seo?.ogImage || "",
        },
      });
    }
  }, [post, form]);

  const onSubmit = async (data: PostFormValues) => {
    console.log("📝 onSubmit llamado con datos:", data);
    console.log("📝 postId:", postId);
    console.log("📝 post:", post);
    console.log("📝 updatePost.isPending:", updatePost.isPending);
    console.log("📝 form.formState.isValid:", form.formState.isValid);
    console.log("📝 form.formState.errors:", form.formState.errors);
    
    if (!post) {
      toast.error("El artículo no se ha cargado completamente. Por favor espera un momento.");
      return;
    }
    
    if (!postId) {
      toast.error("ID del artículo no válido");
      return;
    }
    
    try {
      const payload = {
        id: postId,
        data: {
          ...data,
          publishedAt: data.isPublished 
            ? (data.publishedAt || post?.publishedAt || new Date().toISOString()) 
            : undefined,
          tagIds: data.tagIds?.filter(Boolean),
          featuredImage: data.featuredImage || undefined,
          seo: data.seo?.metaDescription || data.seo?.ogImage || data.seo?.metaKeywords?.length
            ? {
                metaDescription: data.seo.metaDescription || undefined,
                metaKeywords: data.seo.metaKeywords?.filter(Boolean),
                ogImage: data.seo.ogImage || undefined,
              }
            : undefined,
        },
      };
      
      console.log("📤 Enviando payload:", payload);
      
      const response = await updatePost.mutateAsync(payload);
      
      console.log("✅ Respuesta recibida:", response);
      router.push("/admin/blog");
    } catch (error: any) {
      console.error("❌ Error en onSubmit:", error);
      console.error("❌ Error details:", error?.response?.data);
      // Error manejado en el hook, pero también lo mostramos aquí para debug
      toast.error(error?.response?.data?.error || error?.message || "Error al actualizar artículo");
    }
  };

  if (postLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artículo no encontrado</h1>
          <p className="text-muted-foreground">El artículo que buscas no existe.</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog">Volver al blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Artículo</h1>
          <p className="text-muted-foreground">Edita el artículo: {post.title}</p>
        </div>
      </div>

      <Form {...form}>
        <form 
          onSubmit={(e) => {
            console.log("🔵 Form submit event disparado");
            e.preventDefault();
            form.handleSubmit(
              onSubmit,
              (errors) => {
                console.error("❌ Errores de validación:", errors);
                console.error("❌ Estado del formulario:", form.formState);
                console.error("❌ Valores del formulario:", form.getValues());
                
                // Mostrar errores específicos
                const errorMessages = Object.entries(errors).map(([field, error]: [string, any]) => {
                  return `${field}: ${error?.message || "Error desconocido"}`;
                });
                
                if (errorMessages.length > 0) {
                  toast.error(`Errores de validación: ${errorMessages.join(", ")}`);
                } else {
                  console.warn("⚠️ Errores de validación vacíos pero handler llamado");
                  toast.error("Por favor corrige los errores en el formulario");
                }
              }
            )(e);
          }} 
          className="space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contenido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input placeholder="Título del artículo" {...field} />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500 caracteres
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
                        <FormLabel>Resumen *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Resumen corto del artículo (150-200 caracteres)"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/300 caracteres
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
                        <FormLabel>Contenido *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Contenido completo del artículo en HTML"
                            rows={20}
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0} caracteres (mínimo 500)
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
                  <CardTitle>Publicación</CardTitle>
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
                          <FormLabel>Publicar</FormLabel>
                          <FormDescription>
                            El artículo será visible públicamente
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
                  <CardTitle>Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriesLoading ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Cargando categorías...
                              </div>
                            ) : categories && categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                No hay categorías disponibles
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="tagIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Tags</FormLabel>
                          <FormDescription>
                            Selecciona los tags relacionados
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
                  <CardTitle>Imagen Destacada</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de Imagen</FormLabel>
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
              <Link href="/admin/blog">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={updatePost.isPending}>
              {updatePost.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

