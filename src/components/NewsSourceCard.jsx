import React from "react";
import { ExternalLink, Calendar, Globe } from "lucide-react";

const NewsSourceCard = ({ source }) => {
  if (!source) return null;

  const handleClick = () => {
    if (source.url) {
      window.open(source.url, "_blank", "noopener,noreferrer");
    }
  };

  // Format score if available
  const formatScore = (score) => {
    if (typeof score === "number") {
      return `${Math.round(score * 100)}%`;
    }
    return null;
  };

  return (
    <div className="source-card" onClick={handleClick}>
      <div className="flex items-start gap-3">
        {/* Source Icon */}
        <div className="flex-shrink-0 w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
          <Globe className="w-3 h-3 text-gray-300" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1 line-clamp-2">
            {source.title || "News Article"}
          </h4>

          {source.description && (
            <p className="text-xs mb-2 line-clamp-2 leading-relaxed">
              {source.description}
            </p>
          )}

          <div className="source-meta flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Publication Date */}
              {(source.published_at || source.publishedAt) && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(
                      source.published_at || source.publishedAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* Source Name */}
              {source.source && (
                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                  {source.source}
                </span>
              )}
            </div>

            {/* Relevance Score */}
            {source.score && (
              <div className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
                {formatScore(source.score)}
              </div>
            )}
          </div>
        </div>

        {/* External Link Icon */}
        <div className="flex-shrink-0 text-gray-500">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default NewsSourceCard;
