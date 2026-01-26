"use client";

import Link from "next/link";

export interface ArticleLink {
  id: string;
  title: string;
  abbrlink: string;
  isDoc?: boolean;
  docSeriesId?: string;
}

interface PostPaginationProps {
  prevArticle?: ArticleLink | null;
  nextArticle?: ArticleLink | null;
}

/**
 * 文章上一篇/下一篇导航组件
 */
export default function PostPagination({ prevArticle, nextArticle }: PostPaginationProps) {
  if (!prevArticle && !nextArticle) {
    return null;
  }

  const getArticleUrl = (article: ArticleLink) => {
    if (article.isDoc || article.docSeriesId) {
      return `/doc/${article.id}`;
    }
    return `/posts/${article.abbrlink || article.id}`;
  };

  return (
    <nav className="pagination-post">
      {prevArticle && (
        <Link href={getArticleUrl(prevArticle)} className="pagination-item left">
          <div className="pagination-info">
            <div className="label">上一篇</div>
            <div className="info-title">{prevArticle.title}</div>
          </div>
        </Link>
      )}

      {nextArticle && (
        <Link href={getArticleUrl(nextArticle)} className="pagination-item right">
          <div className="pagination-info">
            <div className="label">下一篇</div>
            <div className="info-title">{nextArticle.title}</div>
          </div>
        </Link>
      )}
    </nav>
  );
}
