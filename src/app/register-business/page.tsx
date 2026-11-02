import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterBusinessView from "@/components/RegisterBusinessView";

export const metadata: Metadata = {
  title: "Register Student Business & Hostels | VarsMart Ghana",
  description:
    "Register your campus business, hostel, food joint, salon, or service on VarsMart. Free 30-day seller trial for UHAS, HTU, and Ho students.",
  alternates: {
    canonical: "https://varsmartgh.com/register-business",
  },
  openGraph: {
    title: "Register Student Business | VarsMart Ghana",
    description: "Launch your campus store and reach students across Ho, Volta Region.",
    url: "https://varsmartgh.com/register-business",
  },
};

export default function RegisterBusinessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <RegisterBusinessView />
      </main>
      <Footer />
    </div>
  );
}
