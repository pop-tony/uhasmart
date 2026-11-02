/**
 * Centralized Help & Support Configuration and Knowledge Base for VarsMart.
 * Covers inquiries for buyers, sellers, hostel searchers, payments, safety, and accounts.
 */

export interface FaqItem {
  id: string;
  category: "buying" | "hostels" | "selling" | "payments" | "safety" | "account";
  question: string;
  answer: string;
  tags: string[];
}

export interface SupportCategory {
  id: "all" | "buying" | "hostels" | "selling" | "payments" | "safety" | "account";
  name: string;
  description: string;
  iconName: string;
}

export const SUPPORT_CONFIG = {
  appName: "VarsMart",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "0530895601",
  supportWhatsApp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "0530895601",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@varsmart.com",
  campusLocation: "Ho, Volta Region &bull; Serving UHAS, HTU & Campus Communities",
  workingHours: "Available Mon - Sun &bull; 8:00 AM - 10:00 PM (Emergency 24/7)",
};

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    id: "all",
    name: "All Topics",
    description: "Browse all questions and answers",
    iconName: "HelpCircle",
  },
  {
    id: "buying",
    name: "Buying & Orders",
    description: "Finding items, contacting sellers, and campus meetups",
    iconName: "ShoppingBag",
  },
  {
    id: "hostels",
    name: "Hostels & Rooms",
    description: "Hostel search, room inspections, and vacancies in Ho",
    iconName: "Home",
  },
  {
    id: "selling",
    name: "Selling & Dashboard",
    description: "Registering business, posting products, and uploading flyers",
    iconName: "Store",
  },
  {
    id: "payments",
    name: "Payments & MoMo",
    description: "Mobile Money, Paystack renewals, and receipts",
    iconName: "CreditCard",
  },
  {
    id: "safety",
    name: "Safety & Security",
    description: "Scam prevention, meeting safely, and reporting items",
    iconName: "ShieldCheck",
  },
  {
    id: "account",
    name: "Account & Profile",
    description: "Passwords, phone numbers, and profile details",
    iconName: "User",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  // Buying
  {
    id: "buy-contact-seller",
    category: "buying",
    question: "How do I contact a seller or vendor about a product?",
    answer:
      "When viewing any product card or clicking for details, tap the green 'WhatsApp' button to chat directly with the seller. If you don't have internet data or they don't answer WhatsApp, tap the blue 'Call' button to dial their normal SIM phone line immediately. You can also send an in-app message directly through the site.",
    tags: ["contact", "call", "whatsapp", "seller", "order", "phone"],
  },
  {
    id: "buy-delivery-meetup",
    category: "buying",
    question: "How does delivery and meeting the seller work?",
    answer:
      "Most sellers are fellow campus students or local vendors in Ho (Sokode, Trafalgar, Dave, Bankoe, etc.). You can agree on a convenient campus landmark to meet (such as the Central Cafeteria, Library, or SRC Secretariat) to inspect the item before handing over money.",
    tags: ["delivery", "meetup", "inspection", "location", "campus", "pickup"],
  },
  {
    id: "buy-payment-safety",
    category: "buying",
    question: "Should I pay for an item before receiving it?",
    answer:
      "No! We strongly advise: NEVER send money in advance to any seller before physically inspecting the product in person. Always inspect the item first to ensure it meets your expectations, then pay cash or Mobile Money on the spot.",
    tags: ["payment", "safety", "scam", "cash", "advance", "inspection"],
  },
  {
    id: "buy-saved-wishlist",
    category: "buying",
    question: "How do I save products or hostels to view later?",
    answer:
      "Tap the heart icon on any product or hostel card to add it to your Saved Wishlist. You can access all your saved items anytime from the 'Saved' tab in the navigation bar or mobile dock.",
    tags: ["saved", "wishlist", "heart", "favorite", "bookmark"],
  },

  // Hostels
  {
    id: "hostel-how-to-find",
    category: "hostels",
    question: "How do I find vacant student hostels and rooms in Ho?",
    answer:
      "Select 'Hostels & Accommodations' from the category bar on the Marketplace, or tap the 'Find Hostels & Rooms' button. You can browse listings by location (Sokode, Dave, Trafalgar, Adaklu, etc.), view pictures and amenities, and contact the hostel manager directly via WhatsApp or Phone Call.",
    tags: ["hostel", "room", "accommodation", "rent", "vacancies", "sokode", "dave"],
  },
  {
    id: "hostel-inspection-advice",
    category: "hostels",
    question: "What should I do before paying hostel deposit or rent?",
    answer:
      "Always arrange an in-person physical room inspection with the caretaker or manager. Check water availability, electricity/prepaid meters, security, and cleanliness. Never send advance booking fees or rent to anyone without seeing the actual room and signing or receiving a tenancy receipt.",
    tags: ["hostel", "deposit", "rent", "meter", "inspection", "receipt"],
  },

  // Selling
  {
    id: "sell-how-to-start",
    category: "selling",
    question: "How do I start selling products or services on VarsMart?",
    answer:
      "Tap 'Sell on VarsMart' or 'Register Business'. Enter your brand name, phone numbers (WhatsApp and normal voice line), and campus suburb. Every new seller receives an automatic 30-day free trial to post products and reach student buyers!",
    tags: ["sell", "register", "student business", "onboarding", "vendor", "store"],
  },
  {
    id: "sell-upload-multiple-photos",
    category: "selling",
    question: "How many product pictures can I upload at once?",
    answer:
      "You can select and upload up to 20 pictures at once! You can choose to publish them as separate marketplace cards or combine them into a single swipeable product gallery with multiple photos.",
    tags: ["photos", "pictures", "upload", "gallery", "20 photos", "images"],
  },
  {
    id: "sell-promotional-flyers",
    category: "selling",
    question: "What is a 'Promotional Flyer' and how do I post one?",
    answer:
      "If you provide a service (such as hair braiding, laundry, photography, graphic design, tutoring, or hostel vacancies), switch to the 'Post a Flyer' tab in your Seller Portal. Upload your graphic poster and contact details so campus students can see your advert prominently.",
    tags: ["flyer", "promotions", "services", "poster", "advertising"],
  },
  {
    id: "sell-approval-process",
    category: "selling",
    question: "Why does my listing say 'Pending Review'?",
    answer:
      "To protect students from fraud and inappropriate content, all newly posted items and flyers are reviewed by campus moderators. Review usually takes less than 30 minutes, after which your listing goes live to all buyers.",
    tags: ["pending", "approval", "review", "moderation", "active"],
  },

  // Payments
  {
    id: "pay-seller-subscription",
    category: "payments",
    question: "How do I pay or renew my seller subscription after the free trial?",
    answer:
      "Go to your Seller Dashboard or Account Hub and click 'Renew Subscription'. We support instant, secure Mobile Money payments (MTN MoMo, Telecel Cash, and AT Money) powered by Paystack. Your listings reactivate immediately upon payment confirmation.",
    tags: ["payment", "momo", "mtn", "telecel", "paystack", "subscription", "renew"],
  },
  {
    id: "pay-momo-troubleshooting",
    category: "payments",
    question: "I made a MoMo payment but my account hasn't updated yet. What do I do?",
    answer:
      "Go to your Seller Dashboard and tap 'Sync Payment Status' to instantly check Paystack's transaction log for your email. If you still experience a delay, tap our WhatsApp Help button with your MoMo transaction ID, and our support team will activate your subscription manually within minutes.",
    tags: ["momo", "sync", "troubleshooting", "paystack", "delayed", "receipt"],
  },

  // Safety
  {
    id: "safety-report-listing",
    category: "safety",
    question: "How do I report a suspicious listing or scammer?",
    answer:
      "If you notice an unrealistic price, an unverified seller asking for money upfront, or prohibited items, contact our Help Desk immediately via WhatsApp or the 'Send Help Message' form below. Include the item name or seller details, and our security team will investigate and ban fraudulent accounts.",
    tags: ["report", "scam", "suspicious", "fraud", "safety", "ban"],
  },
  {
    id: "safety-meetup-locations",
    category: "safety",
    question: "Where are the safest places to meet for campus trades in Ho?",
    answer:
      "We recommend meeting during daylight hours in populated areas: UHAS Main Campus Central Library, Central Cafeteria, SRC Building, HTU Campus Quadrangle, Trafalgar Hospital Main Gate, or Ho Central Market stalls.",
    tags: ["safe", "meetup", "locations", "library", "cafeteria", "daylight"],
  },

  // Account
  {
    id: "account-reset-password",
    category: "account",
    question: "How do I reset my account password?",
    answer:
      "On the login page, click 'Forgot password?'. Enter your registered student email address, and we'll send you a secure password reset link. Follow the instructions to create a strong new password.",
    tags: ["password", "reset", "forgot", "login", "account", "email"],
  },
  {
    id: "account-update-phone",
    category: "account",
    question: "How do I change my WhatsApp or phone calling number?",
    answer:
      "Log into your account, visit 'My Account' -> 'Edit Profile', and update both your WhatsApp Line and your Normal Phone Call Line. Save your changes, and all your future product inquiries will reach your new numbers.",
    tags: ["phone", "change", "profile", "update", "whatsapp", "account"],
  },
];
