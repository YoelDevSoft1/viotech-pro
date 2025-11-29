// Tipos para el sistema de blog

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string; // Solo presente en detalle
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  featuredImage: string | null;
  publishedAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  readingTime: number | null;
  views: number;
  seo?: {
    metaDescription: string | null;
    metaKeywords: string[];
    ogImage: string | null;
  };
  createdAt?: string; // ISO date string
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BlogResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogPostsResponse {
  success: boolean;
  data: BlogResponse;
}

export interface BlogPostResponse {
  success: boolean;
  data: BlogPost;
}

export interface BlogCategoriesResponse {
  success: boolean;
  data: BlogCategory[];
}

export interface BlogTagsResponse {
  success: boolean;
  data: BlogTag[];
}

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    isActive: boolean;
    subscribedAt: string;
    source?: string | null;
  };
}

export interface NewsletterUnsubscribeResponse {
  success: boolean;
  message: string;
}

// Editor de Contenido (Admin)
export interface CreatePostData {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tagIds?: string[];
  featuredImage?: string;
  isPublished?: boolean;
  publishedAt?: string;
  seo?: {
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };
}

export interface UpdatePostData extends Partial<CreatePostData> {}

// Sistema de Comentarios
export interface BlogComment {
  id: string;
  postId: string;
  userId: string | null;
  parentId: string | null;
  authorName: string;
  authorEmail: string | null;
  content: string;
  isApproved: boolean;
  likes: number;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  replies?: BlogComment[];
}

export interface CreateCommentData {
  content: string;
  parentId?: string | null;
  authorName?: string; // Requerido si no está autenticado
  authorEmail?: string; // Opcional
}

export interface CommentLikeResponse {
  likes: number;
  liked: boolean;
}

export interface BlogCommentsResponse {
  success: boolean;
  data: BlogComment[];
}

