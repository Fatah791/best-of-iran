/**
 * Single source of truth for site-wide content.
 * Editing copy here keeps pages/components purely presentational.
 */

export const site = {
  name: 'Best-of Iran',
  nameFa: 'بست آف ایران',
  description:
    'مرجع تخصصی معرفی بهترین کسب‌وکارهای ایران با بررسی‌های دقیق و واقعی.',
  tagline: 'بهترین کسب‌وکارهای ایران',
  url: 'https://best-of-iran.vercel.app',
  year: '۱۴۰۴',
  telegramUrl: 'https://t.me/',
};

export const primaryNav = [
  { label: 'شهرها', href: '/cities' },
  { label: 'دسته‌بندی‌ها', href: '/categories' },
  { label: 'متدولوژی', href: '/methodology' },
  { label: 'ثبت کسب‌وکار', href: '/register' },
];

export const stats = [
  { value: '۱۵۰۰+', label: 'کسب‌وکار بررسی شده' },
  { value: '۳۱', label: 'استان پوشش داده شده' },
  { value: '۵۰۰+', label: 'مقاله منتشر شده' },
];

export const cities = [
  { slug: 'tehran', label: 'تهران' },
  { slug: 'isfahan', label: 'اصفهان' },
  { slug: 'shiraz', label: 'شیراز' },
  { slug: 'mashhad', label: 'مشهد' },
  { slug: 'tabriz', label: 'تبریز' },
  { slug: 'karaj', label: 'کرج' },
  { slug: 'ahvaz', label: 'اهواز' },
];

export const categories = [
  { slug: 'restaurants', label: 'رستوران‌ها', icon: 'restaurant' },
  { slug: 'cafes', label: 'کافه‌ها', icon: 'local_cafe' },
  { slug: 'car-wash', label: 'کارواش', icon: 'local_car_wash' },
  { slug: 'barbers', label: 'آرایشگاه‌ها', icon: 'content_cut' },
  { slug: 'gyms', label: 'باشگاه‌ها', icon: 'fitness_center' },
  { slug: 'dental', label: 'دندان‌پزشکی', icon: 'dentistry' },
  { slug: 'hotels', label: 'هتل‌ها', icon: 'hotel' },
];

/** Full set of directory categories (superset of the homepage grid). */
export const directoryCategories: typeof categories = [
  ...categories,
  { slug: 'medical', label: 'خدمات پزشکی', icon: 'medical_services' },
  { slug: 'lawyers', label: 'وکلای پایه یک', icon: 'gavel' },
];

/** Options for the hero search selects. */
export const searchCities = cities.slice(0, 3);
export const searchCategories = [
  { slug: 'restaurant', label: 'رستوران' },
  { slug: 'hotel', label: 'هتل' },
  { slug: 'medical', label: 'خدمات پزشکی' },
];

export const methodology = {
  title: 'ما چگونه بهترین‌ها را انتخاب می‌کنیم؟',
  intro:
    'در بست آف ایران، ما به تبلیغات و ادعاها بسنده نمی‌کنیم. تیم ارزیاب ما با حضور میدانی و بررسی دقیق ده‌ها معیار استاندارد، کیفیت واقعی خدمات را می‌سنجد.',
  points: [
    {
      icon: 'verified_user',
      title: 'بازدید میدانی ناشناس (مشتری پنهان)',
      body: 'ارزیابان ما مانند مشتریان عادی و بدون اطلاع قبلی از کسب‌وکارها بازدید می‌کنند.',
    },
    {
      icon: 'fact_check',
      title: 'بررسی بیش از ۵۰ شاخص کیفیت',
      body: 'از بهداشت و برخورد پرسنل گرفته تا کیفیت خدمات و تناسب قیمت.',
    },
    {
      icon: 'forum',
      title: 'تحلیل نظرات واقعی مشتریان',
      body: 'فیلتر کردن نظرات فیک و تمرکز بر بازخوردهای اثبات شده کاربران.',
    },
  ],
  criteria: [
    { icon: 'speed', label: 'سرعت در خدمات', tone: 'text-primary' },
    { icon: 'price_check', label: 'تناسب قیمت و کیفیت', tone: 'text-secondary-fixed' },
    { icon: 'clean_hands', label: 'بهداشت و محیط', tone: 'text-tertiary-fixed' },
    { icon: 'support_agent', label: 'برخورد پرسنل', tone: 'text-primary-fixed' },
  ],
};

export const ownerCta = {
  title: 'صاحب کسب‌وکار هستید؟',
  body: 'اگر فکر می‌کنید کیفیت خدمات شما در سطح بهترین‌های شهر است، برای حضور در لیست ما درخواست بررسی دهید.',
  benefits: ['افزایش اعتبار', 'جذب مشتریان هدفمند', 'گزارش تحلیلی رقبا'],
  button: 'درخواست ثبت کسب‌وکار',
};

export const newsletter = {
  title: 'از جدیدترین بررسی‌ها مطلع شوید',
  body: 'با عضویت در خبرنامه یا کانال تلگرام ما، هر هفته لیستی از بهترین کسب‌وکارهای تازه بررسی شده را دریافت کنید. بدون اسپم.',
  placeholder: 'ایمیل خود را وارد کنید...',
  submit: 'عضویت در خبرنامه',
};

export const footerLinks = [
  {
    title: 'شهرها',
    links: [
      { label: 'تهران', href: '/cities/tehran' },
      { label: 'اصفهان', href: '/cities/isfahan' },
      { label: 'شیراز', href: '/cities/shiraz' },
      { label: 'تبریز', href: '/cities/tabriz' },
      { label: 'مشهد', href: '/cities/mashhad' },
    ],
  },
  {
    title: 'دسته‌بندی‌ها',
    links: [
      { label: 'رستوران‌ها', href: '/categories/restaurants' },
      { label: 'هتل‌ها', href: '/categories/hotels' },
      { label: 'خدمات پزشکی', href: '/categories/medical' },
      { label: 'وکلای پایه یک', href: '/categories/lawyers' },
    ],
  },
  {
    title: 'اطلاعات',
    links: [
      { label: 'درباره ما', href: '/about' },
      { label: 'تماس با ما', href: '/contact' },
      { label: 'قوانین و مقررات', href: '/terms' },
    ],
  },
];

export const mobileDock = [
  { icon: 'search', label: 'جستجو', href: '/search' },
  { icon: 'add_business', label: 'ثبت کسب‌وکار', href: '/register' },
  { icon: 'public', label: 'متدولوژی', href: '/methodology' },
];

/* ------------------------------------------------------------------ *
 * Registration page (/register)
 * ------------------------------------------------------------------ */

export const registration = {
  title: 'ثبت رایگان کسب و کار در بست‌اف ایران',
  subtitle:
    'کسب و کار خود را در معتبرترین دایرکتوری مشاغل برتر ایران ثبت کنید و دیده شدن خود را به سطح جدیدی ارتقا دهید.',
  steps: [
    { id: 'basics', label: 'اطلاعات پایه' },
    { id: 'contact', label: 'تماس و شبکه‌ها' },
    { id: 'images', label: 'تصاویر' },
    { id: 'location', label: 'موقعیت' },
  ],
  basics: {
    title: 'اطلاعات پایه کسب و کار',
    descriptionHint: 'کسب و کار خود را به اختصار معرفی کنید...',
    descriptionMax: 200,
  },
  contact: {
    title: 'راه‌های ارتباطی',
    hint: 'حداقل شماره موبایل الزامی است؛ بقیه اختیاری.',
  },
  images: {
    title: 'تصاویر کسب و کار',
    hint: 'در پلن پایه تا ۳ تصویر پذیرفته می‌شود. فرمت‌های JPG/PNG/WebP.',
  },
  location: {
    title: 'موقعیت مکانی',
    hint: 'آدرس دقیق باعث می‌شود کسب‌وکار شما در جستجوهای محلی بهتر دیده شود.',
  },
  trust: {
    title: 'چرا با ما باشید؟',
    items: [
      {
        icon: 'trending_up',
        tone: 'text-tertiary',
        title: 'افزایش بازدید هدفمند',
        body: 'روزانه هزاران کاربر به دنبال بهترین‌ها در سایت ما جستجو می‌کنند.',
      },
      {
        icon: 'star',
        tone: 'text-primary-container',
        title: 'نمایه اختصاصی و حرفه‌ای',
        body: 'صفحه‌ای کامل با تصاویر، نظرات و اطلاعات تماس مستقیم.',
      },
      {
        icon: 'workspace_premium',
        tone: 'text-secondary',
        title: 'دریافت نشان اعتماد',
        body: 'کسب و کارهای تایید شده نشان ویژه دریافت می‌کنند.',
      },
    ],
  },
  plansTitle: 'پلن‌های عضویت',
  plans: [
    {
      name: 'پایه (رایگان)',
      badge: 'همیشه رایگان',
      featured: false,
      features: ['ثبت اطلاعات پایه', 'نمایش در جستجو', 'تا ۳ تصویر'],
    },
    {
      name: 'ویژه (Premium)',
      badge: null,
      featured: true,
      features: [
        'جایگاه بالاتر در لیست‌ها',
        'گالری تصاویر نامحدود',
        'لینک مستقیم به سایت',
        'حذف تبلیغات رقبا',
      ],
    },
  ],
};
