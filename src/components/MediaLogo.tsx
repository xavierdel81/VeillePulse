import React, { useState } from 'react';
import { getMediaBrand, getMediaLogoUrls } from '../utils/mediaLogos';

interface MediaLogoProps {
  sourceName: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MediaLogo: React.FC<MediaLogoProps> = ({
  sourceName,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const brand = getMediaBrand(sourceName);
  const logoUrls = getMediaLogoUrls(brand.domain, brand.customLogoUrl);
  
  const [urlIndex, setUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (urlIndex < logoUrls.length - 1) {
      setUrlIndex((prev) => prev + 1);
    } else {
      setHasError(true);
    }
  };

  // Generous, clearly visible sizing for media brand marks
  const sizeStyles = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 sm:w-9 sm:h-9 text-sm',
    lg: 'w-10 h-10 sm:w-12 sm:h-12 text-base',
  };

  const imgSize = sizeStyles[size];

  return (
    <div className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <div
        className={`${imgSize} rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 bg-white shadow-xs shrink-0 select-none transition`}
        style={{
          backgroundColor: hasError ? brand.brandColor : '#ffffff',
          color: brand.textColor,
        }}
        title={`Logo média : ${sourceName}`}
      >
        {!hasError ? (
          <img
            src={logoUrls[urlIndex]}
            alt={`Logo ${sourceName}`}
            onError={handleError}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <span className="font-black uppercase tracking-tighter leading-none text-xs">
            {brand.shortName.slice(0, 2)}
          </span>
        )}
      </div>

      {showLabel && (
        <span className="font-bold text-slate-900 truncate text-sm">
          {sourceName}
        </span>
      )}
    </div>
  );
};
