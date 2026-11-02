"use client";

import { useState, useMemo, FormEvent } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  X,
  Phone,
  PhoneCall,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Send,
} from "lucide-react";
import { SUPPORT_CONFIG, FAQ_ITEMS } from "@/lib/support";
import { createWhatsAppUrl, createCallUrl, formatDisplayPhone } from "@/lib/whatsapp";

export default function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Quick inquiry state
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [inquiryCategory, setInquiryCategory] = useState("General Question");
  const [inquiryText, setInquiryText] = useState("");
  const [submittedNotice, setSubmittedNotice] = useState(false);

  // Filter FAQs based on quick search
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FAQ_ITEMS.slice(0, 5); // Show top 5 by default
    return FAQ_ITEMS.filter((item) => {
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }).slice(0, 6);
  }, [searchQuery]);

  const whatsappMessage = `Hello VarsMart Support Desk, I need help regarding my campus shopping / selling on the site.`;
  const supportWaUrl = createWhatsAppUrl(SUPPORT_CONFIG.supportWhatsApp, whatsappMessage);
  const supportCallUrl = createCallUrl(SUPPORT_CONFIG.supportPhone);
  const displayPhone = formatDisplayPhone(SUPPORT_CONFIG.supportPhone);

  function handleSendQuickInquiry(e: FormEvent) {
    e.preventDefault();
    if (!inquiryText.trim()) return;

    // Build custom WhatsApp support URL with inquiry details
    const directMessage = `*New Help Request on VarsMart*\n\n*Name:* ${
      senderName.trim() || "Student / Visitor"
    }\n*Phone:* ${senderPhone.trim() || "Not provided"}\n*Category:* ${inquiryCategory}\n*Message:* ${inquiryText.trim()}`;

    const waLink = createWhatsAppUrl(SUPPORT_CONFIG.supportWhatsApp, directMessage);
    if (waLink) {
      window.open(waLink, "_blank", "noopener,noreferrer");
    }

    setSubmittedNotice(true);
    setTimeout(() => {
      setSubmittedNotice(false);
      setShowInquiryForm(false);
      setInquiryText("");
      setSenderName("");
      setSenderPhone("");
    }, 2500);
  }

  return (
    <>
      {/* Floating Help Trigger Button */}
      {/* Positioned above mobile dock (bottom-20) on mobile, and bottom-6 on desktop */}
      <aside aria-label="Customer Support Desk">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 rounded-full px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-2xl transition-all duration-300 active:scale-95 border backdrop-blur-md ${
            isOpen
              ? "bg-slate-900 text-white border-slate-700 dark:bg-white dark:text-slate-900"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-blue-400/30 shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-105"
          }`}
          title="Need Help? Chat or Call Support"
          aria-label={isOpen ? "Close Help Assistant" : "Open Help Assistant"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-5 w-5 sm:h-5 sm:w-5" />
          ) : (
            <LifeBuoy className="h-5 w-5 sm:h-5 sm:w-5 animate-spin-slow" />
          )}

          <span className="text-xs sm:text-sm font-black tracking-wide">
            {isOpen ? "Close Help" : "Help Desk"}
          </span>

          {!isOpen && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
          )}
        </button>
      </aside>

      {/* Quick Help Sheet / Popover Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 border border-gray-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iOS Pull Handle on Mobile */}
            <div className="pt-3 pb-1 flex justify-center sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-gray-300 dark:bg-slate-700" />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 px-5 py-4 bg-slate-50/80 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                      VarsMart Help &amp; Support
                    </h3>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Campus support desk for students, buyers &amp; sellers in Ho
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-colors"
                aria-label="Close Help Desk"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Instant One-Tap Contact Action Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {supportWaUrl && (
                  <a
                    href={supportWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-center"
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                      <Phone className="h-4 w-4" />
                      <span>WhatsApp Support</span>
                    </div>
                    <span className="text-[10px] text-emerald-100 font-medium">
                      Instant student chat
                    </span>
                  </a>
                )}

                {supportCallUrl && (
                  <a
                    href={supportCallUrl}
                    className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-3.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all text-center"
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                      <PhoneCall className="h-4 w-4" />
                      <span>Call Normal Phone</span>
                    </div>
                    <span className="text-[10px] text-blue-100 font-medium truncate max-w-[150px]">
                      {displayPhone || "Direct Voice Call"}
                    </span>
                  </a>
                )}
              </div>

              {/* Campus Safety Guarantee Banner */}
              <div className="flex items-start gap-2.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-slate-800/60 p-3 border border-blue-100 dark:border-blue-900/40 text-xs">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-[11px] sm:text-xs">
                    Campus Trade Safety First
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-gray-600 dark:text-slate-300 mt-0.5 leading-snug">
                    Always meet in open daylight spots (SRC, Cafeteria, Library) and inspect products or rooms before payment.
                  </p>
                </div>
              </div>

              {/* Fast Search Box */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1.5">
                  Search Quick Answers
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search e.g. delivery, hostel inspection, sell, momo, scam..."
                    className="w-full rounded-2xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pl-10 pr-4 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 rounded-full p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Frequently Asked Questions ({filteredFaqs.length})
                  </span>
                  <Link
                    href="/help"
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {filteredFaqs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 p-6 text-center">
                    <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
                      No exact matches found for &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                      Tap below to chat with our campus help team directly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowInquiryForm(true)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Ask a Support Question</span>
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span className="pr-2">{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-blue-600 shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-3.5 pb-3.5 pt-1 text-xs text-gray-600 dark:text-slate-300 leading-relaxed border-t border-gray-100/80 dark:border-slate-800/80 animate-in fade-in duration-200">
                            <p>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Inquiry / Support Form Toggle */}
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      Cannot find what you need?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(!showInquiryForm)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showInquiryForm ? "Hide form" : "Send inquiry message"}
                  </button>
                </div>

                {showInquiryForm && (
                  <form onSubmit={handleSendQuickInquiry} className="space-y-3 pt-2">
                    {submittedNotice ? (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 p-3 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Opening WhatsApp Support with your details...</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Your Name (Optional)"
                            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
                          />
                          <input
                            type="tel"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            placeholder="Your Phone / WhatsApp"
                            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <select
                          value={inquiryCategory}
                          onChange={(e) => setInquiryCategory(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
                        >
                          <option value="Buying & Delivery">Help with Buying &amp; Delivery</option>
                          <option value="Hostel & Room Inquiries">Help with Hostel Vacancies</option>
                          <option value="Seller Account & Listings">Help with Selling &amp; Uploads</option>
                          <option value="Payment & MoMo Renewals">Help with Payment &amp; MoMo</option>
                          <option value="Report Scam or Suspicious Item">Report Suspicious Item / Seller</option>
                          <option value="General Question">Other / General Question</option>
                        </select>

                        <textarea
                          required
                          rows={2}
                          value={inquiryText}
                          onChange={(e) => setInquiryText(e.target.value)}
                          placeholder="Describe the issue you're facing or what you need help with..."
                          className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-blue-600"
                        />

                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Forward to Campus Support Team</span>
                        </button>
                      </>
                    )}
                  </form>
                )}
              </div>
            </div>

            {/* Modal Bottom Banner Link to Full Help Center */}
            <div className="border-t border-gray-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                Want a full breakdown?
              </span>
              <Link
                href="/help"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 shadow-sm transition-all"
              >
                <span>Visit Full Help Center</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
