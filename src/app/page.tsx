import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketplaceView from "@/components/MarketplaceView";
import ProductSkeletonCard from "@/components/ProductSkeletonCard";

export const metadata: Metadata = {
  title: "VarsMart | Campus Student Marketplace & Hostels in Ho, Ghana",
  description:
    "Buy and sell student gadgets, hostels, textbooks, food, and thrift fashion in Ho, Volta Region. Safe campus meetups with student-verified sellers.",
  alternates: {
    canonical: "https://varsmartgh.com",
  },
};

function MarketplaceLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="h-10 w-64 rounded-full skeleton-shimmer mb-6" />
      <div className="h-12 w-full max-w-md rounded-full skeleton-shimmer mb-10" />
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <ProductSkeletonCard key={n} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<MarketplaceLoading />}>
          <MarketplaceView />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
