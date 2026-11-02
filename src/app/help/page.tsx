import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HelpCenterView from "@/components/HelpCenterView";

export const metadata: Metadata = {
  title: "Help & Support Center | VarsMart",
  description:
    "Get help with student buying, hostel accommodations in Ho, seller store registration, Mobile Money payments, and safety on VarsMart.",
};

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar />

      <main className="flex-1">
        <HelpCenterView />
      </main>

      <Footer />
    </div>
  );
}
