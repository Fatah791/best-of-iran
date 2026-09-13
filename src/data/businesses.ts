/**
 * Business directory data.
 *
 * Sample records seeded from the homepage/article content. Add real
 * businesses here (or later, from a CMS) — every directory page
 * (cities, categories, trending, search, profiles) renders from this file.
 */

export interface Business {
  slug: string;
  name: string;
  category: string; // category slug
  city: string; // city slug
  tagline: string;
  description: string;
  address: string;
  neighborhood?: string;
  phone?: string; // 0xx format, digits only
  whatsapp?: string; // international format, digits only
  website?: string;
  rating: number; // 0..5
  reviews: number;
  priceTier: '﷼' | '﷼﷼' | '﷼﷼﷼';
  verified: boolean;
  hours?: string;
  tags: string[];
  image?: string;
  weeklyCalls?: number;
  review?: { author: string; when: string; text: string };
}

export const businesses: Business[] = [
  {
    slug: 'car-wash-lux-zayandehrud',
    name: 'کارواش لوکس زاینده‌رود',
    category: 'car-wash',
    city: 'isfahan',
    tagline: 'شستشوی VIP با بهترین مواد نانو آلمانی',
    description:
      'مرکز دیتیلینگ و کارواش لوکس با استفاده از مواد نانو آلمانی، سالن انتظار VIP و سیستم نوبت‌دهی آنلاین. مناسب خودروهای لوکس و کلاسیک.',
    address: 'خیابان بزرگمهر، بعد از چهارراه هشت بهشت',
    neighborhood: 'بزرگمهر',
    phone: '03131234567',
    rating: 5.0,
    reviews: 120,
    priceTier: '﷼﷼﷼',
    verified: true,
    hours: '۸ صبح تا ۱۰ شب',
    tags: ['مواد نانو', 'سالن VIP', 'دیتیلینگ'],
    image: '/images/carwash-zayandehrood.jpg',
    weeklyCalls: 184,
    review: {
      author: 'علی محمدی',
      when: '۲ روز پیش',
      text: 'کیفیت شستشو عالی بود، فقط کمی معطلی داشت.',
    },
  },
  {
    slug: 'nano-car-wash-isfahan',
    name: 'نانو کارواش اصفهان',
    category: 'car-wash',
    city: 'isfahan',
    tagline: 'بهترین گزینه اقتصادی با تکنولوژی نانو',
    description:
      'شستشوی نانو با تعرفه مصوب، کیفیت پایدار و زمان تحویل کوتاه. مناسب استفاده دوره‌ای.',
    address: 'میدان آزادی، خیابان جی، نبش کوچه ۱۲',
    neighborhood: 'جی',
    rating: 4.8,
    reviews: 96,
    priceTier: '﷼﷼',
    verified: true,
    hours: '۹ صبح تا ۹ شب',
    tags: ['اقتصادی', 'نانو'],
    weeklyCalls: 142,
  },
  {
    slug: 'car-wash-central-j',
    name: 'کارواش مرکزی جی',
    category: 'car-wash',
    city: 'isfahan',
    tagline: 'شستشوی سریع و در دسترس',
    description: 'کارواش اتوماتیک با دسترسی آسان در محور جی و بدون نوبت‌دهی.',
    address: 'خیابان جی، روبه‌روی پارک آبی',
    neighborhood: 'جی',
    rating: 4.3,
    reviews: 210,
    priceTier: '﷼',
    verified: false,
    hours: '۷ صبح تا ۱۱ شب',
    tags: ['سریع', 'اتوماتیک'],
    weeklyCalls: 118,
  },
  {
    slug: 'shandyz-gallery',
    name: 'رستوران شاندیز گالریا',
    category: 'restaurants',
    city: 'tehran',
    tagline: 'رستوران ایرانی با فضای لوکس در ولنجک',
    description:
      'دیزی و کباب‌های سنتی در فضایی مدرن؛ از پر بازديدترین رستوران‌های شمال تهران.',
    address: 'ولنجک، خیابان بیست و یکم',
    neighborhood: 'ولنجک',
    phone: '02122900000',
    rating: 4.8,
    reviews: 342,
    priceTier: '﷼﷼﷼',
    verified: true,
    hours: '۱۲ ظهر تا ۱۲ شب',
    tags: ['ایرانی', 'دیزی', 'فضای لوکس'],
    weeklyCalls: 320,
  },
  {
    slug: 'hotel-abbasi',
    name: 'هتل عباسی',
    category: 'hotels',
    city: 'isfahan',
    tagline: 'هتل ۵ ستاره تاریخی در قلب اصفهان',
    description:
      'هتلی سه‌صدساله که به شکلی مدرن بازسازی شده؛ چایخانه سنتی، استخر و معماری قاجاری.',
    address: 'چهارباغ عباسی',
    neighborhood: 'چهارباغ',
    rating: 4.9,
    reviews: 890,
    priceTier: '﷼﷼﷼',
    verified: true,
    hours: '۲۴ ساعته',
    tags: ['تاریخی', '۵ ستاره', 'چایخانه'],
    weeklyCalls: 274,
  },
  {
    slug: 'mehregan-dental-clinic',
    name: 'کلینیک دندانپزشکی مهرگان',
    category: 'dental',
    city: 'shiraz',
    tagline: 'خدمات تخصصی دندانپزشکی در قصردشت',
    description:
      'امپلانت، ارتودنسی و زیبایی دندان با تیم متخصص و تجهیزات دیجیتال.',
    address: 'قصردشت، خیابان پزشکان',
    neighborhood: 'قصردشت',
    rating: 4.7,
    reviews: 156,
    priceTier: '﷼﷼',
    verified: false,
    hours: '۹ صبح تا ۹ شب',
    tags: ['امپلانت', 'ارتودنسی'],
    weeklyCalls: 145,
  },
  {
    slug: 'cafe-rakht',
    name: 'کافه راخ',
    category: 'cafes',
    city: 'tehran',
    tagline: 'اسپشیالیتی قهوه در انقلاب',
    description: 'برون‌آکاست‌های رست و متدهای دم‌آوری، با فضای دنج برای کار.',
    address: 'خیابان انقلاب، کوچه وردی',
    neighborhood: 'انقلاب',
    rating: 4.6,
    reviews: 203,
    priceTier: '﷼﷼',
    verified: true,
    hours: '۸ صبح تا ۱۱ شب',
    tags: ['اسپشیالیتی', 'دنج'],
    weeklyCalls: 98,
  },
  {
    slug: 'enghelab-barber',
    name: 'آرایشگاه مردانه انقلاب',
    category: 'barbers',
    city: 'mashhad',
    tagline: 'پیرایش کلاسیک با نوبت‌دهی آنلاین',
    description: 'آرایشگاه مردانه با خدمات تکمیل، سرجری و رنگ؛ تیم آموزش‌دیده.',
    address: 'بلوارخراسان رضوی، مصلای',
    neighborhood: 'مصلی',
    rating: 4.5,
    reviews: 88,
    priceTier: '﷼',
    verified: false,
    hours: '۱۰ صبح تا ۱۰ شب',
    tags: ['نوبت‌دهی', 'کلاسیک'],
    weeklyCalls: 76,
  },
  {
    slug: 'olympia-gym',
    name: 'باشگاه المپیا',
    category: 'gyms',
    city: 'tehran',
    tagline: 'باشگاه تخصصی بدنسازی در سعادت‌آباد',
    description:
      'سالن ۱۲۰۰ متری با تجهیزات مدرن، مربیان دارای کارت مربیگری و استخر اختصاصی.',
    address: 'سعادت‌آباد، میدان کاج',
    neighborhood: 'سعادت‌آباد',
    phone: '02144400000',
    rating: 4.4,
    reviews: 167,
    priceTier: '﷼﷼',
    verified: true,
    hours: '۶ صبح تا ۱۱ شب',
    tags: ['بدنسازی', 'استخر'],
    weeklyCalls: 121,
  },
  {
    slug: 'setareh-hotel',
    name: 'هتل استاره‌های کبیر',
    category: 'hotels',
    city: 'shiraz',
    tagline: 'مجتمع اقامتی نزدیک آرامستان',
    description: 'اتاق‌های مدرن، رستوران بین‌المللی و دسترسی آسان به حرم احمد بن موسی.',
    address: 'بلوار چمران',
    neighborhood: 'چمران',
    rating: 4.2,
    reviews: 95,
    priceTier: '﷼﷼',
    verified: true,
    hours: '۲۴ ساعته',
    tags: ['اقامتی', 'رستوران'],
    weeklyCalls: 67,
  },
  {
    slug: 'pardis-restaurant-tabriz',
    name: 'رستوران پردیس',
    category: 'restaurants',
    city: 'tabriz',
    tagline: 'کباب تبریزی اصل، پنجاه سال سابقه',
    description: 'کباب کوبیده و برگ با ذغال طبیعی؛ سالاد بار معروف و فضای خانوادگی.',
    address: 'پارک ائل‌گولی',
    neighborhood: 'ائل‌گولی',
    rating: 4.7,
    reviews: 412,
    priceTier: '﷼﷼',
    verified: true,
    hours: '۱۲ ظهر تا ۱۲ شب',
    tags: ['کباب', 'خانوادگی'],
    weeklyCalls: 205,
  },
  {
    slug: 'simorgh-car-wash-karaj',
    name: 'کارواش سیمرغ',
    category: 'car-wash',
    city: 'karaj',
    tagline: 'صفرشویی و سرامیک در عظیمیه',
    description: 'خدمات کامل صفرشویی، سرامیک و پولیش با ضمانت کتبی.',
    address: 'عظیمیه، بلوار گلستان',
    neighborhood: 'عظیمیه',
    rating: 4.1,
    reviews: 64,
    priceTier: '﷼﷼',
    verified: false,
    hours: '۹ صبح تا ۸ شب',
    tags: ['صفرشویی', 'سرامیک'],
    weeklyCalls: 52,
  },
  {
    slug: 'medical-center-ahvaz',
    name: 'کلینیک تخصصی کارون',
    category: 'medical',
    city: 'ahvaz',
    tagline: 'چکاپ تخصصی با تجهیزات جدید',
    description: 'کلینیک چندتخصصه با پذیرش آنلاین و پاسخ‌دهی سریع.',
    address: 'کیانپارس، بلوار ۱۵',
    neighborhood: 'کیانپارس',
    rating: 4.4,
    reviews: 77,
    priceTier: '﷼﷼',
    verified: true,
    hours: '۸ صبح تا ۸ شب',
    tags: ['چکاپ', 'پذیرش آنلاین'],
    weeklyCalls: 61,
  },
];

export function getBusiness(slug: string): Business | undefined {
  return businesses.find((b) => b.slug === slug);
}

export function byCity(citySlug: string): Business[] {
  return businesses
    .filter((b) => b.city === citySlug)
    .sort((a, b) => b.rating - a.rating);
}

export function byCategory(catSlug: string): Business[] {
  return businesses
    .filter((b) => b.category === catSlug)
    .sort((a, b) => b.rating - a.rating);
}

export function topTrending(limit = 10): Business[] {
  return [...businesses]
    .sort((a, b) => (b.weeklyCalls ?? 0) - (a.weeklyCalls ?? 0))
    .slice(0, limit);
}

/** Persian digits for display. */
export function fa(n: number | string): string {
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
}

/** e.g. "۴.۸" */
export function faRating(rating: number): string {
  return fa(rating.toFixed(1)).replace('.', '٫');
}
