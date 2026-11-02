"use client";

import { useState, useMemo, FormEvent } from "react";
import Link from "next/link";
import {
  Phone,
  PhoneCall,
  MapPin,
  Search,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  HelpCircle,
  ShoppingBag,
  Home,
  Store,
  CreditCard,
  User,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  SUPPORT_CONFIG,
  SUPPORT_CATEGORIES,
  FAQ_ITEMS,
} from "@/lib/support";
import { createWhatsAppUrl, createCallUrl, formatDisplayPhone } from "@/lib/whatsapp";

export default function HelpCenterView() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Inquiry form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCategory, setFormCategory] = useState("Buying & Delivery Inquiries");
  const [formMessage, setFormMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // WhatsApp & Call URLs
  const defaultWhatsAppMsg = `Hello VarsMart Support Team, I need assistance on the platform.`;
  const supportWaUrl = createWhatsAppUrl(SUPPORT_CONFIG.supportWhatsApp, defaultWhatsAppMsg);
  const supportCallUrl = createCallUrl(SUPPORT_CONFIG.supportPhone);
  const displayPhone = formatDisplayPhone(SUPPORT_CONFIG.supportPhone);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formMessage.trim()) return;

    const formattedMessage = `*VarsMart Help Desk Inquiry*\n\n*Name:* ${
      formName.trim() || "Campus Student"
    }\n*Phone:* ${formPhone.trim() || "Not provided"}\n*Email:* ${
      formEmail.trim() || "Not provided"
    }\n*Category:* ${formCategory}\n\n*Message:* ${formMessage.trim()}`;

    const waLink = createWhatsAppUrl(SUPPORT_CONFIG.supportWhatsApp, formattedMessage);
    if (waLink) {
      window.open(waLink, "_blank", "noopener,noreferrer");
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormMessage("");
      setFormName("");
      setFormPhone("");
      setFormEmail("");
    }, 4000);
  }

  function getCategoryIcon(catId: string) {
    switch (catId) {
      case "buying":
        return ShoppingBag;
      case "hostels":
        return Home;
      case "selling":
        return Store;
      case "payments":
        return CreditCard;
      case "safety":
        return ShieldCheck;
      case "account":
        return User;
      default:
        return HelpCircle;
    }
  }

  return (
    <div className="py-6 sm:py-12">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* 1. Hero Header & Live Search Bar */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 p-6 sm:p-12 text-white shadow-xl">
          {/* Subtle Ambient Background Circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-2xl" />

          <div className="relative mx-auto max-w-3xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-blue-100 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Campus Customer Support &bull; Ho, Volta Region</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              How can we help you today?
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
              Find instant answers for student buying, hostel vacancies, seller store setups, Mobile Money payments, and safety in Ho.
            </p>

            {/* Live Search Input */}
            <div className="pt-2 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions e.g. 'delivery meetup', 'hostel room rent', 'upload photos', 'momo payment'..."
                  className="w-full rounded-2xl sm:rounded-3xl border-0 bg-white py-3.5 sm:py-4 pl-12 pr-10 text-xs sm:text-sm font-semibold text-gray-900 placeholder:text-gray-400 shadow-xl focus:ring-4 focus:ring-blue-300/40 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-3.5 rounded-full p-1 text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Clear search</span>
                    &times;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Instant Contact Channels Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: WhatsApp Support */}
          <div className="rounded-3xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                <Phone className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300">
                Fastest Response
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                WhatsApp Live Help
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                Chat directly with our student support team for order queries or seller help.
              </p>
            </div>
            {supportWaUrl && (
              <a
                href={supportWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <span>Chat on WhatsApp</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Card 2: Direct Helpline Call */}
          <div className="rounded-3xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/50 dark:bg-blue-950/20 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <PhoneCall className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/60 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-800 dark:text-blue-300">
                Direct Call
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Normal Phone Helpline
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                No internet data? Ring our direct cellular line for urgent inquiries.
              </p>
            </div>
            {supportCallUrl && (
              <a
                href={supportCallUrl}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all"
              >
                <span>Call {displayPhone}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Card 3: Campus Reps & Location */}
          <div className="rounded-3xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/50 dark:bg-purple-950/20 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-sm">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 text-[10px] font-black uppercase text-purple-800 dark:text-purple-300">
                Campus Base
              </span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                Ho Campus Coverage
              </h3>
              <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                Active in Sokode, Trafalgar, Dave, Bankoe, HTU, and all student residential halls.
              </p>
            </div>
            <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white/70 dark:bg-slate-900/60 py-2.5 px-4 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Clock className="h-3.5 w-3.5 text-purple-600" />
              <span>Mon - Sun Support</span>
            </div>
          </div>
        </div>

        {/* 3. Category Filter Tabs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Browse Help by Topic
            </h2>
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
              {filteredFaqs.length} answers available
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
            {SUPPORT_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.id);
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Frequently Asked Questions (Accordion) */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600" />
              <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">
                No articles matching &quot;{searchQuery}&quot;
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                Try different keywords or submit an inquiry directly to our help desk below.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const Icon = getCategoryIcon(faq.category);

              return (
                <div
                  key={faq.id}
                  className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <div className="flex items-center gap-3 pr-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{faq.question}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed border-t border-gray-100 dark:border-slate-800 animate-in fade-in duration-200">
                      <p>{faq.answer}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-gray-50 dark:border-slate-800/60">
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 5. Direct Help Inquiry Submission Form */}
        <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Still need help? Submit a Support Request
                </h3>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                Can&apos;t find an answer to your question? Send us your inquiry and a campus support rep will assist you right away.
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300">
              Avg. response: &lt; 15 mins
            </span>
          </div>

          {formSubmitted ? (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 p-6 text-center space-y-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Request Forwarded to Support Team!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                We have prepared your inquiry. If WhatsApp did not open automatically, you can tap &quot;Chat on WhatsApp&quot; above to message our help desk immediately.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ama Osei"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-1.5">
                    WhatsApp or Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 0241234567"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. student@st.uhas.edu.gh"
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-1.5">
                    What Kind of Help do you Need?
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="Buying & Delivery Inquiries">Buying, Orders &amp; Delivery</option>
                    <option value="Hostel & Room Booking">Hostel Search &amp; Room Booking</option>
                    <option value="Seller Account & Uploading Products">Seller Registration &amp; Store Setup</option>
                    <option value="Mobile Money & Paystack Payment">Mobile Money &amp; Subscription Payment</option>
                    <option value="Report Scam or Suspicious User">Report Suspicious Item or Scammer</option>
                    <option value="Account Login & Password Reset">Account Login &amp; Password</option>
                    <option value="General Inquiry">Other Campus Marketplace Question</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 mb-1.5">
                  Explain your Question or Issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Please describe what happened, the item or hostel in question, or what assistance you need..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-4 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                <Send className="h-4 w-4" />
                <span>Submit to VarsMart Support</span>
              </button>
            </form>
          )}
        </div>

        {/* 6. Safety & Security Guarantee Notice */}
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold">VarsMart Campus Safety Guarantee</h4>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                We are committed to building the safest student marketplace in Ghana. Never pay before product or room inspection. Report any fraud immediately.
              </p>
            </div>
          </div>
          <Link
            href="/marketplace"
            className="shrink-0 rounded-2xl bg-white/10 hover:bg-white/20 px-5 py-3 text-xs font-bold text-white transition-all active:scale-95"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
