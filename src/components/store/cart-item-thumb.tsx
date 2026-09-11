"use client";

import { ProductArt } from "@/components/store/product-art";

export function CartItemThumb({
  name,
  image,
  className,
}: {
  name: string;
  image?: string;
  className: string;
}) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className={`${className} object-cover`} />;
  }
  return <ProductArt name={name} className={className} />;
}