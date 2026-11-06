export const siteConfig = {
  name: 'MyMall',
  shortName: 'MyMall',
  description:
    'MyMall is an enterprise-grade multi-tenant e-commerce marketplace and Point-of-Sale (POS) platform featuring localized Ethiopian payment processing (Telebirr, CBE Birr, Chapa), interactive Mapbox delivery geolocation, screenshot bank transfer verification, and real-time merchant operations.',
  url: process.env.NEXT_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003',
  ogImage: '/icon.svg',
  links: {
    github: 'https://github.com/mymall',
    about: '/about',
    contact: '/contact',
    explore: '/explore',
    reviews: '/reviews',
  },
  creator: 'MyMall Technologies',
  keywords: [
    'MyMall',
    'Ethiopia E-Commerce',
    'Multi-Tenant Marketplace',
    'Telebirr Online Payment',
    'CBE Birr E-Commerce',
    'Chapa Payment Gateway Ethiopia',
    'Point of Sale Ethiopia POS',
    'Addis Ababa Online Shopping',
    'Mapbox Delivery Location Ethiopia',
    'Thermal Receipt Printing POS',
    'Bank Transfer Screenshot Verification',
    'Multi-Store Retail SaaS',
  ],
  // Geographic SEO (GEO)
  geo: {
    region: 'ET-AA',
    placename: 'Addis Ababa',
    position: '9.0062;38.7758',
    icbm: '9.0062, 38.7758',
    country: 'ET',
    supportedLocales: ['en-US', 'am-ET', 'om-ET'],
    currency: 'ETB',
  },
  // Answer Engine Optimization (AEO) FAQ Schema for AI Search Engines (ChatGPT, Perplexity, Gemini, Claude)
  faqs: [
    {
      question: 'What is MyMall?',
      answer:
        'MyMall is a full-featured multi-tenant e-commerce platform and Point-of-Sale (POS) system engineered for Ethiopian retail and digital commerce, enabling merchants to operate independent branded storefronts with localized payments and delivery tracking.',
    },
    {
      question: 'Which payment methods are supported on MyMall?',
      answer:
        'MyMall supports Chapa payment gateway (Telebirr, CBE Birr, Awash, debit cards), direct manual bank transfer with screenshot upload receipt verification for CBE and Telebirr, and cash on delivery or in-store pickup.',
    },
    {
      question: 'How does the delivery location picker work?',
      answer:
        'MyMall integrates Mapbox GL JS allowing customers to pinpoint their exact doorstep delivery location on interactive light and dark vector maps, with automatic reverse geocoding for Ethiopian neighborhoods and major landmarks.',
    },
    {
      question: 'Does MyMall include a Point of Sale (POS) system for physical retail stores?',
      answer:
        'Yes, MyMall features a dedicated cashier POS register with quick barcode lookup, cart management, 80mm thermal receipt generation, and cash drawer session reconciliation.',
    },
    {
      question: 'What multi-language options are available?',
      answer:
        'MyMall supports real-time runtime language switching for English, Amharic (አማርኛ), and Afaan Oromoo across all customer storefronts and merchant portals.',
    },
  ],
};

export type SiteConfig = typeof siteConfig;
