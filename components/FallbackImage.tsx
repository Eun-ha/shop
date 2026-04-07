"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK_SRC = "/placeholder-product.svg";

export default function FallbackImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  alt,
  ...props
}: FallbackImageProps) {
  const normalizedSrc = src && src.trim().length > 0 ? src : fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  useEffect(() => {
    setCurrentSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
