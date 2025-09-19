"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/mock/utils";
import "./FeaturedPostCard.css";

interface FeaturedPostCardProps {
  post?: BlogPost;
  loading?: boolean;
}

export const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({ post, loading }) => {
  if (loading || !post) {
    return (
      <article className="featured-post-card loading">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          <div className="skeleton-line w-24" />
          <div className="skeleton-line w-3-4 h-lg" />
          <div className="skeleton-line w-full" />
          <div className="skeleton-line w-5-6" />
          <div className="skeleton-author">
            <div className="skeleton-avatar" />
            <div className="skeleton-author-info">
              <div className="skeleton-line w-24 h-3" />
              <div className="skeleton-line w-16 h-2" />
            </div>
          </div>
        </div>
      </article>
    ); 
  }

  // Fix for image URL error - ensure URL starts with a leading slash or is absolute
  const getValidImageUrl = (url: string) => {
    if (!url) return "";
    
    // Check if URL is already absolute
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Check if URL already starts with a slash
    if (url.startsWith('/')) {
      return url;
    }
    
    // Add leading slash to relative URLs
    return `/${url}`;
  };

  return (
    <article className="featured-post-card">
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`}>
          <div className="featured-image-wrapper">
            <Image
              src={getValidImageUrl(post.featuredImage)}
              alt={post.title}
              fill
              className="featured-image"
              priority
            />
          </div>
        </Link>
      )}

      <div className="featured-content">
        {post.category?.name && (
          <Link href={`/categories/${post.category.slug}`} className="featured-category">
            {post.category.name}
          </Link>
        )}

        <h3 className="featured-title">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="featured-excerpt">{post.excerpt}</p>

        <div className="featured-author">
          {post.author?.avatarUrl && (
            <Image
              src={getValidImageUrl(post.author.avatarUrl)}
              alt={post.author?.name || "Author"}
              width={40}
              height={40}
              className="author-avatar"
            />
          )}
          <div>
            <p className="author-name">{post.author?.name}</p>
            <p className="author-date">
              {new Date(post.publishedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default FeaturedPostCard;