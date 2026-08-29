"use client";

import React from "react";

/**
 * Base Shimmer Skeleton Element
 */
export function Skeleton({ className = "", rounded = "rounded-lg", style = {} }) {
  return (
    <div
      style={style}
      className={`relative overflow-hidden bg-[#F2EFE9] ${rounded} ${className} before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent`}
    />
  );
}

/**
 * Product Card Skeleton (Exact dimensions and proportions of ProductCard.jsx)
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-transparent font-sans select-none animate-pulse">
      {/* Image container 3/4.2 aspect ratio */}
      <div className="relative aspect-[3/4.2] w-full bg-[#EFECE6] border border-[#ECECEC] rounded-2xl overflow-hidden shadow-xs">
        <Skeleton className="w-full h-full" rounded="rounded-none" />
        {/* Top-right bookmark button skeleton */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 border border-white/60" />
      </div>

      {/* Product metadata */}
      <div className="pt-4 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
      </div>
    </div>
  );
}

/**
 * Product Grid Skeleton (Configurable count, responsive layout)
 */
export function ProductGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

/**
 * Recommendation Carousel Skeleton (Horizontal scrolling row)
 */
export function RecommendationCarouselSkeleton() {
  return (
    <div className="w-full py-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 rounded-full bg-[#EFECE6]" />
          <div className="w-9 h-9 rounded-full bg-[#EFECE6]" />
        </div>
      </div>

      {/* Horizontal Cards */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="w-48 sm:w-56 md:w-64 shrink-0">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hero Bento Grid Skeleton (Matches FamilyStudioHome.jsx Hero)
 */
export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full animate-pulse">
      {/* Left Column: Big Banner + 2 bottom cards */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <Skeleton className="min-h-[380px] sm:min-h-[440px] w-full" rounded="rounded-[32px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Skeleton className="h-44 w-full" rounded="rounded-[28px]" />
          <Skeleton className="h-44 w-full" rounded="rounded-[28px]" />
        </div>
      </div>

      {/* Right Column: Tall Card */}
      <div className="lg:col-span-4">
        <Skeleton className="h-full min-h-[450px] w-full" rounded="rounded-[32px]" />
      </div>
    </div>
  );
}

/**
 * Full Homepage Skeleton (Renders while hydrating or loading)
 */
export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-white max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 pt-6 pb-24 space-y-16">
      <HeroSkeleton />
      <RecommendationCarouselSkeleton />
      <div className="space-y-6 pt-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

/**
 * Product Detail Page Skeleton (Matches ProductDetailPage.jsx)
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-28 space-y-8 animate-pulse">
      {/* Breadcrumb back skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left image gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
          <div className="hidden md:flex flex-col gap-3 w-20">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="aspect-3/4 w-full" rounded="rounded-xl" />
            ))}
          </div>
          <Skeleton className="aspect-[3/4.2] flex-1 w-full" rounded="rounded-3xl" />
        </div>

        {/* Right product details */}
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-32" />
          <div className="h-px bg-[#ECECEC] my-4" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="w-12 h-10" rounded="rounded-xl" />
              ))}
            </div>
          </div>
          <Skeleton className="h-14 w-full" rounded="rounded-full" />
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full" rounded="rounded-2xl" />
            <Skeleton className="h-12 w-full" rounded="rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
