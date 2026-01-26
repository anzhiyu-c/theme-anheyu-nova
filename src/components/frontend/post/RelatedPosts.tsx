"use client";

import Link from "next/link";
import { ThumbsUp, Shuffle } from "lucide-react";

// 默认封面图
const DEFAULT_COVER = "/static/img/default_cover.jpg";

export interface RelatedArticle {
  id: string;
  title: string;
  abbrlink: string;
  coverUrl?: string;
  isDoc?: boolean;
  docSeriesId?: string;
}

interface RelatedPostsProps {
  posts?: RelatedArticle[] | null;
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const getArticleUrl = (article: RelatedArticle) => {
    if (article.isDoc || article.docSeriesId) {
      return `/doc/${article.id}`;
    }
    return `/posts/${article.abbrlink || article.id}`;
  };

  return (
    <div className="related-posts">
      <div className="related-posts-headline">
        <ThumbsUp size={20} />
        <span>猜你喜欢</span>
        <Link href="/random" className="related-posts-random">
          <Shuffle size={14} />
          随便逛逛
        </Link>
      </div>
      <div className="related-posts-list">
        {posts.map(post => (
          <div key={post.id} className="related-posts-item">
            <Link href={getArticleUrl(post)} title={post.title}>
              <img
                className="related-posts-cover"
                alt={post.title}
                src={post.coverUrl || DEFAULT_COVER}
                loading="lazy"
              />
              <div className="related-posts-content">
                <div className="related-posts-title">{post.title}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
