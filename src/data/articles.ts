/**
 * Article content model.
 *
 * Each article is one typed record; the page renderer walks `blocks`
 * in order. Adding a new article = one new record + one line in
 * getAllArticles(). Content stays completely out of markup.
 */

export interface BusinessRank {
  rank: number;
  name: string;
  tagline: string;
  rating: string;
  reviews: string;
  badges: { label: string; tone?: 'default' | 'error' }[];
  address: string;
  hours: string;
  priceTier: string;
  image?: string;
  editorPick?: boolean;
  phone?: string;
  whatsapp?: string;
  review?: { author: string; when: string; text: string };
}

export interface ComparisonRow {
  name: string;
  score: string;
  price: string;
  nano: boolean;
  lounge: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FeatureItem {
  title: string;
  body: string;
}

export interface WeightedCriterion {
  label: string;
  percent: number;
  note: string;
}

export type ArticleBlock =
  | { type: 'quickAnswer'; items: { rank: number; name: string; note: string }[] }
  | {
      type: 'educational';
      title: string;
      features: FeatureItem[];
      criteria: { panelTitle: string; items: WeightedCriterion[] };
    }
  | { type: 'tip'; title: string; bodyHtml: string }
  | { type: 'cards'; title: string; items: FeatureItem[] }
  | { type: 'prose'; html: string }
  | { type: 'ranked'; title: string; items: BusinessRank[] }
  | { type: 'comparison'; title: string; columns: string[]; rows: ComparisonRow[] }
  | { type: 'methodologyNote'; title: string; body: string }
  | { type: 'faq'; title: string; items: FaqItem[] };

export interface FullArticle {
  slug: string;
  title: string;
  h1: string;
  description: string;
  updated: string;
  isoDate: string; // YYYY-MM-DD for JSON-LD
  author: string;
  readTime: string;
  breadcrumb: { label: string; href: string }[];
  toc: { id: string; label: string }[];
  blocks: ArticleBlock[];
  related: { label: string; href: string }[];
}

export const carwashIsfahan: FullArticle = {
  slug: 'best-car-wash-isfahan',
  title: 'بهترین کارواش‌های اصفهان | بررسی و رتبه‌بندی ۱۴۰۵',
  h1: 'بهترین کارواش‌های اصفهان | بررسی ۱۴۰۵',
  description:
    'بررسی میدانی و رتبه‌بندی بهترین کارواش‌های اصفهان بر اساس کیفیت شستشو، مواد نانو، قیمت و رضایت مشتریان.',
  updated: 'شهریور ۱۴۰۵',
  isoDate: '2026-09-12',
  author: 'تیم تحریریه Best-of Iran',
  readTime: '۸ دقیقه',
  breadcrumb: [
    { label: 'خانه', href: '/' },
    { label: 'اصفهان', href: '#' },
    { label: 'کارواش', href: '#' },
  ],
  toc: [
    { id: 'quick-answer', label: 'پاسخ سریع' },
    { id: 'educational', label: 'ویژگی‌های کارواش خوب' },
    { id: 'ranked-list', label: 'رتبه‌بندی ۱۴۰۵' },
    { id: 'comparison', label: 'مقایسه کارواش‌ها' },
    { id: 'methodology', label: 'متدولوژی رتبه‌بندی' },
    { id: 'faq', label: 'سوالات متداول' },
  ],
  blocks: [
    {
      type: 'quickAnswer',
      items: [
        { rank: 1, name: 'کارواش لوکس زاینده‌رود', note: 'بهترین برای کیفیت فوق‌العاده و خدمات VIP.' },
        { rank: 2, name: 'نانو کارواش اصفهان', note: 'بهترین گزینه اقتصادی با تکنولوژی نانو.' },
        { rank: 3, name: 'کارواش مرکزی جی', note: 'مناسب برای شستشوی سریع و در دسترس.' },
      ],
    },
    {
      type: 'educational',
      title: 'ویژگی‌های یک کارواش خوب',
      features: [
        {
          title: 'کیفیت مواد نانو و شوینده‌ها',
          body: 'استفاده از شامپوهای با PH خنثی و واکس‌های نانو آلمانی ضروری است. مواد غیراستاندارد و اسیدی به مرور زمان باعث کدر شدن کیلر رنگ و از بین رفتن شفافیت بدنه می‌شوند.',
        },
        {
          title: 'سرعت عمل و دقت پرسنل',
          body: 'یک کارواش حرفه‌ای باید تعادلی بین سرعت و دقت برقرار کند. توجه به نقاط کور مانند لای درب‌ها، رینگ‌ها و زیر گلگیرها نشان‌دهنده سطح کیفی خدمات و آموزش پرسنل است.',
        },
        {
          title: 'قیمت منصفانه و شفاف',
          body: 'ارائه فاکتور دقیق بر اساس کلاس خودرو (سواری، شاسی، لوکس) و شفافیت در هزینه‌های جانبی مانند موتورشویی یا صفرشویی، از حقوق اولیه مشتری در مراکز معتبر است.',
        },
        {
          title: 'برخورد محترمانه و سیستم نوبت‌دهی',
          body: 'مدیریت زمان مشتری از طریق سیستم‌های رزرو آنلاین یا تلفنی و برخورد حرفه‌ای تیم پذیرش، تجربه کاربری را از یک اجبار به یک لذت تبدیل می‌کند.',
        },
        {
          title: 'سالن انتظار و امکانات رفاهی',
          body: 'فضای انتظار مجهز به تهویه، وای‌فای و امکان مشاهده مستقیم فرآیند شستشو، نشان‌دهنده احترام مرکز به زمان و اعتماد مشتری است.',
        },
      ],
      criteria: {
        panelTitle: 'معیارهای دقیق امتیازدهی ما',
        items: [
          { label: 'کیفیت شستشو و متریال', percent: 40, note: 'بررسی عدم وجود لکه، براقیت نهایی و کیفیت واکس مصرفی.' },
          { label: 'ارزش در برابر قیمت', percent: 20, note: 'تناسب خدمات ارائه شده با تعرفه مصوب اتحادیه.' },
          { label: 'تجهیزات و تکنولوژی', percent: 20, note: 'استفاده از دستگاه‌های پیشرفته و سیستم تصفیه آب.' },
          { label: 'رضایت مشتریان', percent: 20, note: 'میانگین نظرات در پلتفرم‌های نقشه و شبکه‌های اجتماعی.' },
        ],
      },
    },
    {
      type: 'tip',
      title: 'نکته کارشناسی: کارواش یا دیتیلینگ؟',
      bodyHtml:
        'اگر به دنبال نظافت دوره‌ای و سریع هستید، <strong>کارواش‌های نانو</strong> بهترین گزینه هستند. اما اگر رنگ خودروی شما کدر شده یا دارای خط و خش‌های سطحی است، پیشنهاد می‌کنیم هر ۶ ماه یکبار از خدمات <strong>دیتیلینگ حرفه‌ای</strong> (پولیش و سرامیک) استفاده کنید تا ارزش سرمایه شما حفظ شود.',
    },
    {
      type: 'cards',
      title: 'توصیه‌های تخصصی برای نگهداری از بدنه خودرو',
      items: [
        {
          title: 'پرهیز از شستشو زیر آفتاب',
          body: 'تبخیر سریع آب و مواد شوینده روی بدنه داغ باعث ایجاد لکه‌های رسوبی پایدار می‌شود.',
        },
        {
          title: 'استفاده از دستمال میکروفایبر',
          body: 'هرگز از دستمال‌های نخی معمولی برای خشک کردن استفاده نکنید؛ تنها میکروفایبر مانع ایجاد خط و خش می‌شود.',
        },
        {
          title: 'رفع سریع فضولات پرندگان',
          body: 'اسید موجود در فضولات پرندگان می‌تواند در کمتر از ۲۴ ساعت به لایه‌های عمقی رنگ آسیب بزند.',
        },
      ],
    },
    {
      type: 'prose',
      html: 'انتخاب یک کارواش استاندارد در کلان‌شهری مانند اصفهان، فراتر از یک نظافت ساده است؛ این موضوع مستقیماً با حفظ ارزش سرمایه شما و طول عمر رنگ بدنه خودرو در ارتباط است. با توجه به اقلیم خشک و وجود ریزگردها در منطقه، استفاده از متدهای ناصحیح شستشو می‌تواند باعث ایجاد خط و خش‌های دوار (Swirl Marks) جبران‌ناپذیر شود. تیم کارشناسی ما با بررسی میدانی بیش از ۵۰ مرکز فعال و تحلیل داده‌محور نظرات کاربران، این راهنمای جامع را تدوین کرده است تا شما را در انتخاب هوشمندانه‌ترین گزینه یاری دهد.',
    },
    {
      type: 'ranked',
      title: 'رتبه‌بندی بهترین‌ها',
      items: [
        {
          rank: 1,
          name: 'کارواش لوکس زاینده‌رود',
          tagline: 'شستشوی VIP با بهترین مواد نانو آلمانی',
          rating: '۵.۰',
          reviews: '۱۲۰',
          badges: [
            { label: 'مواد نانو' },
            { label: 'سالن VIP' },
            { label: 'قیمت بالا', tone: 'error' },
          ],
          address: 'خیابان بزرگمهر، بعد از چهارراه هشت بهشت',
          hours: '۸ صبح تا ۱۰ شب',
          priceTier: '﷼﷼﷼',
          image: '/images/carwash-zayandehrood.jpg',
          editorPick: true,
          phone: '03131234567',
          review: {
            author: 'علی محمدی',
            when: '۲ روز پیش',
            text: 'کیفیت شستشو عالی بود، فقط کمی معطلی داشت.',
          },
        },
      ],
    },
    {
      type: 'comparison',
      title: 'مقایسه سریع کارواش‌ها',
      columns: ['نام کارواش', 'امتیاز', 'قیمت', 'مواد نانو', 'کافه/سالن انتظار'],
      rows: [
        { name: 'لوکس زاینده‌رود', score: '۵.۰', price: '﷼﷼﷼', nano: true, lounge: true },
        { name: 'نانو کارواش اصفهان', score: '۴.۸', price: '﷼﷼', nano: true, lounge: false },
      ],
    },
    {
      type: 'methodologyNote',
      title: 'شفافیت متدولوژی ما',
      body: 'رتبه‌بندی‌های Best-of Iran بر اساس بازدیدهای میدانی ناشناس، تحلیل بیش از ۱۰۰۰ نظر کاربران در شبکه‌های اجتماعی و گوگل مپ، و مصاحبه با متخصصین دیتیلینگ خودرو در اصفهان انجام شده است. ما هیچ هزینه‌ای برای قرار دادن کسب‌وکارها در این لیست دریافت نمی‌کنیم.',
    },
    {
      type: 'faq',
      title: 'سوالات متداول',
      items: [
        {
          q: 'هزینه کارواش در اصفهان (سال ۱۴۰۵) چقدر است؟',
          a: 'بسته به نوع شستشو (معمولی، نانو، VIP) و نوع خودرو، قیمت‌ها بین ۱۵۰,۰۰۰ تا ۵۰۰,۰۰۰ تومان متغیر است.',
        },
        {
          q: 'آیا شستشو با مواد نانو به رنگ خودرو آسیب می‌زند؟',
          a: 'خیر، اگر از مواد نانو استاندارد استفاده شود، نه تنها آسیبی نمی‌رساند بلکه باعث براقیت و محافظت از رنگ خودرو نیز می‌شود.',
        },
      ],
    },
  ],
  related: [
    { label: 'بهترین رستوران‌های اصفهان', href: '/articles' },
    { label: 'بهترین هتل‌های اصفهان', href: '/articles' },
  ],
};

export const articlesBySlug: Record<string, FullArticle> = {
  [carwashIsfahan.slug]: carwashIsfahan,
};

export function getAllArticles(): FullArticle[] {
  return Object.values(articlesBySlug);
}
