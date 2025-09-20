import React from "react";
import { ExternalLink, Calendar } from "lucide-react";

const NewsSourceCard = ({ source }) => {
  if (!source) return null;

  const handleClick = () => {
    if (source.url) {
      window.open(source.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
            {source.title || "News Article"}
          </h4>

          {source.description && (
            <p className="text-gray-600 text-xs mb-2 line-clamp-2">
              {source.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {source.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(source.published_at).toLocaleDateString()}
                </span>
              </div>
            )}

            {source.source && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {source.source}
              </span>
            )}
          </div>
        </div>

        <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
      </div>
    </div>
  );
};

export default NewsSourceCard;
