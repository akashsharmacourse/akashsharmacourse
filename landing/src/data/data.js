// ─── NAVBAR ───────────────────────────────────────────
export const navData = {
  logo: "AskAkashSharma",
  links: [
    { label: "Home", href: "/" },
    { label: "1on1", href: "/1on1" },
    { label: "Course", href: "/#courses" },
    { label: "Results", href: "/#results" },
  ],
  cta: "Enroll Now",
};

// ─── HERO ─────────────────────────────────────────────
export const heroData = {
  badge: "10+ Years of Profitable Trading",
  headlineTop: "Master the Stock Market.",
  headlineBottom: "Trade With Precision.",
  subheadline: "Learn the exact strategy used to identify precise entry and exit points — taught in plain language anyone can understand.",
  ctaPrimary: "Enroll Now",
  ctaSecondary: "Results",
  stats: [
    { value: 1000, suffix: "+", label: "Happy Students" },
    { value: 167, suffix: "", label: "Seminars Done" },
    { value: 600, suffix: "+", label: "Five-Star Reviews" },
    { value: 10, suffix: "+", label: "Years Experience" },
  ],
  videoPlaceholder: true,
};

// ─── TRUST STRIP ──────────────────────────────────────
export const trustStripData = {
  items: [
    "1,000+ Students Enrolled",
    "10+ Years Experience",
    "Lifetime Support",
    "One Proven Strategy",
    "Simplified Approach",
    "Personalised Sessions",
    "Verified PnL",
    "600+ Five-Star Reviews",
    "100% Satisfaction Guarantee",
    "Intraday · Swing · Long Term",
  ],
};

// ─── COURSES — SINGLE OFFER ───────────────────────────
export const courseData = {
  badge: "The Complete Offer",
  heading: "One Course. Three Strategies. Complete Mastery.",
  subheading: "Everything you need to trade profitably — in a single, focused programme.",
  offer: {
    title: "Stock Market Mastery Programme",
    included: [
      {
        icon: "ChartLine",
        title: "Long Term Investing",
        desc: "Dot-on-Dot strategy — precise entry and exit with full capital protection.",
      },
      {
        icon: "Zap",
        title: "Mastering Intraday Trading",
        desc: "Anticipate entry points one day in advance with complete confidence.",
      },
      {
        icon: "TrendingUp",
        title: "Mastering Swing Trading",
        desc: "Minimum 1:5 risk-reward ratio on every swing trade setup.",
      },
    ],
    benefits: [
      "Lifetime access to all course content",
      "Personalised one-on-one online sessions",
      "Lifetime WhatsApp support from Akash Sir",
      "Private student community access",
      "Live session recordings",
      "PDF study materials included",
      "Free updates — forever",
      "7-day money-back guarantee",
    ],
    originalPrice: "₹15,999",
    currentPrice: "₹9,999",
    discount: "38% OFF",
    cta: "Enroll Now",
    note: "One-time payment. No subscription. No hidden fees.",
  },
};

// ─── ABOUT ────────────────────────────────────────────
export const aboutData = {
  badge: "Your Mentor",
  name: "Akash Sharma",
  title: "Professional Stock Market Trader & Coach",
  bio: "A results-driven professional with over a decade of hands-on experience in equities, intraday, and swing trading. I teach one proven strategy in plain language — so anyone can trade with clarity and confidence.",
  image: "/src/assets/AkashSharma.png",
  imageAlt: "Akash Sharma — Stock Market Coach",
  imagePlaceholder: false,
  stats: [
    { value: "₹500Cr+", label: "Total Volume Traded" },
    { value: "10+", label: "Years Experience" },
    { value: "1,000+", label: "Students Mentored" },
    { value: "167", label: "Seminars Conducted" },
  ],
};

// ─── PNL PROOF ────────────────────────────────────────
export const pnlProofData = {
  badge: "Verified Performance",
  heading: "Real Trades. Real Profits.",
  subheading: "Live market results — verified and transparent.",
  disclaimer: "Past performance is not indicative of future results. Trading involves risk.",
  proof: {
    id: 1,
    image: "/src/assets/pnl.png",
    imageAlt: "Verified PnL Screenshot — Akash Sharma",
    placeholder: false,
  },
  livePnlBtn: "Check Live PnL",
  livePnlLink: "https://console.zerodha.com/verified/f13b09a3?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQPOTM2NjE5NzQzMzkyNDU5AAGnulbIcgTvP12B3GiXgUVCT0gRJIZQcq0Slz4nKVICEx5jwoKXfxYy7b9qKPc_aem_NTJKqiKpotjcI4oTuprkFA",
};

// ─── STUDENT RESULTS ──────────────────────────────────
export const studentResultsData = {
  badge: "Student Results",
  heading: "Students Who Transformed Their Trading",
  subheading: "Real results. Real students. Shared with permission.",
  results: [
    { id: 1, placeholder: true, label: "Student Result 1" },
    { id: 2, placeholder: true, label: "Student Result 2" },
    { id: 3, placeholder: true, label: "Student Result 3" },
    { id: 4, placeholder: true, label: "Student Result 4" },
    { id: 5, placeholder: true, label: "Student Result 5" },
    { id: 6, placeholder: true, label: "Student Result 6" },
  ],
  note: "Results vary based on individual effort and market conditions.",
};

// ─── TESTIMONIALS ─────────────────────────────────────
export const testimonialsData = {
  badge: "Testimonials",
  heading: "What Students Say",
  testimonials: [
    {
      id: 1,
      name: "Zainul Hasan",
      role: "Job Professional",
      videoPlaceholder: true,
    },
    {
      id: 2,
      name: "Alok Bhargava",
      role: "Entrepreneur",
      videoPlaceholder: true,
    },
    {
      id: 3,
      name: "Priya Mehta",
      role: "Homemaker",
      videoPlaceholder: true,
    },
    {
      id: 4,
      name: "Rahul Verma",
      role: "Software Engineer",
      videoPlaceholder: true,
    },
    {
      id: 5,
      name: "Suresh Nair",
      role: "Business Owner",
      videoPlaceholder: true,
    },
  ],
};

// ─── PRICING ──────────────────────────────────────────
export const pricingData = {
  badge: "Pricing",
  heading: "One Price. Lifetime Access.",
  subheading: "No hidden fees. No subscriptions. Pay once, learn forever.",
  originalPrice: "₹15,999",
  currentPrice: "₹9,999",
  discount: "38% OFF — Limited Time",
  features: [
    "All 3 Course Modules — Long Term, Intraday, Swing",
    "Lifetime Access to Course Content",
    "Personalised One-on-One Online Sessions",
    "Lifetime Support via WhatsApp",
    "Private Student Community Access",
    "Live Session Recordings",
    "PDF Study Materials",
    "Free Updates Forever",
  ],
  cta: "Enroll Now",
  guarantee: "7-day money-back guarantee — no questions asked.",
  paymentNote: "Secure payment via Razorpay",
  paymentMethods: ["UPI", "Visa", "Mastercard", "Razorpay"],
};

// ─── FAQ ──────────────────────────────────────────────
export const faqData = {
  badge: "FAQ",
  heading: "Frequently Asked Questions",
  faqs: [
    {
      q: "Who is this course for?",
      a: "Anyone who wants to learn stock market trading — from absolute beginners to intermediate traders. No prior knowledge required.",
    },
    {
      q: "Is this course in Hindi or English?",
      a: "Taught in simple Hindi and English — making it accessible for everyone across India.",
    },
    {
      q: "What do I get after enrolling?",
      a: "Immediate access to all 3 modules, PDF materials, private WhatsApp community, and lifetime one-on-one support from Akash Sir.",
    },
    {
      q: "Do I need a Demat account before joining?",
      a: "No. You can begin learning before opening a Demat account. We will guide you on the best platforms when you are ready.",
    },
    {
      q: "How long does it take to complete?",
      a: "Most students complete the core content within 2 to 4 weeks. Lifetime access means you revisit any lesson anytime.",
    },
    {
      q: "Is there a refund policy?",
      a: "Yes. Full 100% refund within 7 days of enrollment — no questions asked.",
    },
    {
      q: "Will I get support after completing the course?",
      a: "Absolutely. Lifetime support. Reach out with any question — even years later — and Akash Sir will personally respond.",
    },
    {
      q: "How is this different from free YouTube content?",
      a: "YouTube gives scattered information. This gives you one complete tested strategy, personal mentorship, community, and accountability.",
    },
  ],
};

// ─── CTA ──────────────────────────────────────────────
export const ctaData = {
  heading: "Ready to Trade Profitably?",
  subheading: "Join 1,000+ students who have already transformed their financial future.",
  urgency: "Limited seats available at this price",
  cta: "Enroll Now",
};

// ─── FOOTER ───────────────────────────────────────────
export const footerData = {
  logo: "AskAkashSharma",
  tagline: "Empowering Indian traders since 2014.",
  links: [
    { label: "Home", href: "#hero" },
    { label: "Course", href: "#courses" },
    { label: "Results", href: "#results" },
    { label: "About", href: "#about" },
    { label: "FAQ", href: "#faq" },
  ],
  social: [
    { label: "WhatsApp", href: "https://wa.me/919650213917" },
    { label: "Mail", href: "mailto:contact@askakashsharma.com" },
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
  disclaimer: "Trading in financial markets involves risk. Past performance is not indicative of future results. Please trade responsibly.",
  copyright: "© 2026 AskAkashSharma. All Rights Reserved.",
};

export const oneOnOneData = {
  // HERO
  hero: {
    badge: "Exclusive Mentorship",
    headlineTop: "Trade With a Pro.",
    headlineBottom: "By Your Side.",
    subheadline: "Get personalised, one-on-one coaching directly from Akash Sharma — tailored to your trading goals, your portfolio, and your schedule.",
    ctaPrimary: "Book Your Session",
    ctaSecondary: "View Results",
    image: "/src/assets/AkashSharma.png",
    imageAlt: "Akash Sharma — Personal Trading Coach",
  },

  // WHAT YOU GET
  benefits: {
    badge: "What You Get",
    heading: "Everything in One Session",
    items: [
      {
        icon: "Target",
        title: "Personalised Strategy",
        desc: "A trading plan built specifically around your risk appetite, capital, and goals.",
      },
      {
        icon: "LineChart",
        title: "Live Chart Analysis",
        desc: "Akash Sir analyses your watchlist live — entry, exit, stop loss defined on the spot.",
      },
      {
        icon: "ShieldCheck",
        title: "Risk Management",
        desc: "Learn exactly how much to risk per trade — never blow your account again.",
      },
      {
        icon: "MessageCircle",
        title: "Direct WhatsApp Access",
        desc: "Post-session WhatsApp support for 7 days — ask anything, anytime.",
      },
      {
        icon: "Clock",
        title: "60 Minute Deep Dive",
        desc: "Focused, distraction-free session — no generic advice, only what you need.",
      },
      {
        icon: "RefreshCw",
        title: "Session Recording",
        desc: "Full recording of your session sent to you — revisit anytime.",
      },
    ],
  },

  // PRICING
  pricing: {
    badge: "Investment",
    heading: "One Session. Life-Changing Clarity.",
    originalPrice: "₹49,999",
    currentPrice: "₹24,999",
    discount: "50% OFF",
    features: [
      "60-minute one-on-one live session with Akash Sir",
      "Personalised trading plan for your portfolio",
      "Live chart analysis on your watchlist",
      "Risk management framework tailored to you",
      "7-day WhatsApp follow-up support",
      "Full session recording delivered to you",
      "Actionable entry and exit levels",
      "7-day money-back guarantee",
    ],
    cta: "Book Your Session",
    note: "One-time payment. Session scheduled within 48 hours.",
    guarantee: "7-day money-back guarantee — no questions asked.",
    paymentMethods: ["UPI", "Visa", "Mastercard", "Razorpay"],
  },

  // CALL IMAGES
  callProof: {
    badge: "Session Previews",
    heading: "What a Session Looks Like",
    subheading: "Real sessions. Real students. Real results.",
    images: [
      { id: 1, placeholder: true, label: "Session Screenshot 1" },
      { id: 2, placeholder: true, label: "Session Screenshot 2" },
      { id: 3, placeholder: true, label: "Session Screenshot 3" },
    ],
  },

  // FAQ
  faq: {
    badge: "FAQ",
    heading: "Questions About 1-on-1",
    faqs: [
      {
        q: "How long is each session?",
        a: "Each session is 60 minutes — focused, structured, and tailored entirely to you.",
      },
      {
        q: "How do I book after payment?",
        a: "After payment you will receive a WhatsApp message from Akash Sir within 24 hours to schedule your session at a mutually convenient time.",
      },
      {
        q: "What platform is the session on?",
        a: "Sessions are conducted on Google Meet or Zoom — whichever you prefer.",
      },
      {
        q: "Do I need any prior trading knowledge?",
        a: "No. Whether you are a complete beginner or an experienced trader looking to refine your edge — the session is customised for your level.",
      },
      {
        q: "Will I get the session recording?",
        a: "Yes. The full recording is sent to you via WhatsApp within 24 hours of the session.",
      },
      {
        q: "Is there a refund policy?",
        a: "Yes. Full 100% refund within 7 days if you are not satisfied — no questions asked.",
      },
    ],
  },

  // CTA
  cta: {
    heading: "Ready for Personalised Coaching?",
    subheading: "Limited slots available each month. Book before they fill up.",
    urgency: "Only a few slots remaining this month",
    cta: "Book Your Session Now",
  },
};

export const formData = {
  heading: "Enroll Now",
  subheading: "Fill in your details to proceed to payment",
  fields: {
    name: { label: "Full Name", placeholder: "Enter your full name" },
    email: { label: "Email Address", placeholder: "Enter your email" },
    phone: { label: "Phone Number", placeholder: "Enter your 10-digit number" },
  },
  cta: "Proceed to Payment",
  note: "Your details are safe and secure.",
  course: {
    heading: "Enroll in Stock Market Mastery",
    price: "₹9,999",
    originalPrice: "₹15,999",
  },
  oneOnOne: {
    heading: "Book Your 1-on-1 Session",
    price: "₹24,999",
    originalPrice: "₹49,999",
  },
};

export const courseSuccessData = {
  badge: "Payment Successful",
  heading: "You're In!",
  subheading: "Welcome to Stock Market Mastery. Check your email for login credentials.",
  steps: [
    {
      icon: "Mail",
      title: "Check Your Email",
      desc: "Login ID and password sent to your registered email address.",
    },
    {
      icon: "Users",
      title: "Join WhatsApp Group",
      desc: "Connect with fellow students and get live session updates.",
    },
    {
      icon: "BookOpen",
      title: "Start Learning",
      desc: "Login to your dashboard and begin your first lesson today.",
    },
  ],
  whatsappLink: "#",
  whatsappCta: "Join WhatsApp Group",
  loginCta: "Login to Dashboard",
  loginLink: "/login",
  note: "Did not receive email? Check spam folder or contact us.",
};

export const oneOnOneSuccessData = {
  badge: "Payment Successful",
  heading: "Session Confirmed!",
  subheading: "Your 1-on-1 session with Akash Sir is booked. Click below to choose your slot.",
  steps: [
    {
      icon: "Calendar",
      title: "Book Your Slot",
      desc: "Click the button below to choose a time that works for you.",
    },
    {
      icon: "Mail",
      title: "Check Your Email",
      desc: "Confirmation and session details sent to your registered email.",
    },
    {
      icon: "MessageCircle",
      title: "Join WhatsApp Group",
      desc: "Get session reminders and connect with Akash Sir directly.",
    },
  ],
  calendlyCta: "Book Your Session Slot",
  calendlyLink: "#",
  whatsappCta: "Join WhatsApp Group",
  whatsappLink: "#",
  note: "Session will be scheduled within 48 hours of booking.",
};


