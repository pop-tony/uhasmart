import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SellerDashboard from "@/components/SellerDashboard";

export const metadata: Metadata = {
  title: "Sell on VarsMart | Student Business Seller Portal",
  description:
    "Register your student business or hostel listing on VarsMart. Upload up to 20 product pictures at once, post promotional flyers, and reach thousands of student buyers in Ho.",
  alternates: {
    canonical: "https://varsmartgh.com/seller",
  },
  openGraph: {
    title: "Sell on VarsMart | Campus Seller Portal",
    description:
      "Start selling on campus with a 30-day free trial. Reach thousands of university and polytechnic students in Ho.",
    url: "https://varsmartgh.com/seller",
  },
};

export default function SellerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex flex-1 justify-center px-4 py-10 sm:px-6">
        <SellerDashboard />
      </main>
      <Footer />
    </div>
  );
}
