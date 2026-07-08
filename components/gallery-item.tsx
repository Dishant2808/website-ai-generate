"use client";

import { useState } from "react";

type GalleryItemProps = {
  src: string;
  alt: string;
  featured?: boolean;
};

export function GalleryItem({ src, alt, featured = false }: GalleryItemProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <div
      className={`overflow-hidden rounded-3xl shadow-md ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`w-full object-cover ${featured ? "h-full min-h-[340px]" : "h-56"}`}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
