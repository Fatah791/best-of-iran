/**
 * Sample content until the real CMS (Keystatic or similar) is wired in.
 * Keep the shape stable so swapping the source later is a one-file change.
 */

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  city: string;
  date: string; // Persian date label for now
}

export const latestArticles: Article[] = [
  {
    slug: 'best-car-wash-isfahan',
    title: 'بهترین کارواش‌های اصفهان: رتبه‌بندی تخصصی ۱۴۰۵',
    excerpt:
      'بررسی میدانی بیش از ۵۰ مرکز، تحلیل نظرات کاربران و مقایسه قیمت‌ها برای یافتن بهترین کارواش اصفهان.',
    category: 'کارواش',
    city: 'اصفهان',
    date: '۲۵ شهریور ۱۴۰۵',
  },
  {
    slug: 'best-italian-restaurants-tehran',
    title: 'بهترین رستوران‌های ایتالیایی تهران: بررسی تخصصی ۵ گزینه برتر',
    excerpt:
      'در این مقاله به بررسی دقیق کیفیت غذا، فضای داخلی و خدمات بهترین رستوران‌های ایتالیایی پایتخت پرداخته‌ایم.',
    category: 'رستوران',
    city: 'تهران',
    date: '۲۴ مهر ۱۴۰۲',
  },
  {
    slug: 'isfahan-stay-guide',
    title: 'راهنمای اقامت در اصفهان: هتل‌های سنتی یا مدرن؟',
    excerpt:
      'مقایسه جامع بین اقامتگاه‌های بوم‌گردی سنتی و هتل‌های پنج ستاره مدرن در نصف جهان.',
    category: 'هتل',
    city: 'اصفهان',
    date: '۲۰ مهر ۱۴۰۲',
  },
  {
    slug: 'shiraz-beauty-clinics',
    title: 'معرفی برترین کلینیک‌های زیبایی شیراز بر اساس رضایت مراجعین',
    excerpt:
      'لیستی از معتبرترین مراکز زیبایی و پوست در شیراز با بررسی تجهیزات و تخصص پزشکان.',
    category: 'خدمات',
    city: 'شیراز',
    date: '۱۵ مهر ۱۴۰۲',
  },
];

export interface Business {
  rank: number;
  name: string;
  verified: boolean;
  typeIcon: string;
  typeLabel: string;
  location: string;
  rating: string;
  reviews: string;
  action: 'call' | 'view';
}

export const trendingThisWeek: Business[] = [
  {
    rank: 1,
    name: 'رستوران شاندیز گالریا',
    verified: true,
    typeIcon: 'restaurant',
    typeLabel: 'رستوران ایرانی',
    location: 'تهران، ولنجک',
    rating: '۴.۸',
    reviews: '۳۴۲',
    action: 'call',
  },
  {
    rank: 2,
    name: 'هتل عباسی',
    verified: true,
    typeIcon: 'hotel',
    typeLabel: 'هتل ۵ ستاره',
    location: 'اصفهان، چهارباغ عباسی',
    rating: '۴.۹',
    reviews: '۸۹۰',
    action: 'view',
  },
  {
    rank: 3,
    name: 'کلینیک دندانپزشکی مهرگان',
    verified: false,
    typeIcon: 'dentistry',
    typeLabel: 'خدمات پزشکی',
    location: 'شیراز، قصردشت',
    rating: '۴.۷',
    reviews: '۱۵۶',
    action: 'call',
  },
];
