"use client";

import { useState } from "react";
import { SafeImage } from "./SafeImage";

type Props = {
  images: string[];
  alt: string;
  aspectClassName?: string;
};

export function ThumbGallery({ images, alt, aspectClassName = "aspect-[4/3]" }: Props) {
  const [active, setActive] = useState(0);
  const safeIndex = Math.min(active, Math.max(0, images.length - 1));
  const current = images[safeIndex];

  if (images.length === 0) {
    return <div className={`relative bg-stone-100 ${aspectClassName}`} />;
  }

  return (
    <div>
      <div className={`relative bg-stone-100 ${aspectClassName}`}>
        <SafeImage src={current} alt={alt} fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-12 w-12 overflow-hidden rounded border ${
                i === safeIndex ? "border-gold" : "border-stone-300"
              }`}
            >
              <SafeImage src={src} alt={`${alt} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
