"use client";

export default function ProductSkeletonCard() {
  return (
    <div className="flex flex-col select-none">
      {/* Photo Placeholder */}
      <div className="aspect-square w-full rounded-2xl skeleton-shimmer mb-3" />

      {/* Category Placeholder */}
      <div className="h-3 w-16 rounded skeleton-shimmer mb-1.5" />

      {/* Title Placeholder */}
      <div className="h-4 w-3/4 rounded skeleton-shimmer mb-1.5" />

      {/* Location Placeholder */}
      <div className="h-3 w-24 rounded skeleton-shimmer mb-2" />

      {/* Price & Action Placeholder */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 rounded skeleton-shimmer" />
        <div className="h-6 w-16 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}
