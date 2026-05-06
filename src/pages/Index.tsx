import { useState, useEffect } from "react";
import { ProductModal } from "@/components/ProductModal";
import { useStore } from "@/store/useStore";
import { Product } from "@/types/product";
import { useTranslation } from "react-i18next";
import { SEOHelmet } from "@/components/SEOHelmet";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCarousel } from "@/components/ProductCarousel";
import { BrandsCarousel } from "@/components/BrandsCarousel";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Star, Shield, Truck, ChevronRight, Search } from "lucide-react";
import { STORE_HERO_CAROUSEL } from "@/constants/store";
import { motion } from "framer-motion";

const TRUST_BADGES = [
  { icon: Shield, label: "ضمان 6 أشهر", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Truck, label: " شحن جميع المحافظات", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Star, label: "اجهزة اوريجينال ", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Zap, label: "أفضل الأسعار", color: "text-purple-600", bg: "bg-purple-50" },
];

const FEATURED_CATEGORIES = [
  {
    title: "اللابتوب (Laptop)",
    slug: "laptop",
    image: "/lap.png",
    color: "from-blue-600/80 to-blue-900/90",
  },
  {
    title: "شاشات و All in one",
    slug: "monitor&category=All+In+One",
    image: "/monitor.png",
    color: "from-emerald-600/80 to-emerald-900/90",
  },
  {
    title: "كيسات استيراد (Desktop)",
    slug: "desktop",
    image: "/pc.png",
    color: "from-purple-600/80 to-purple-900/90",
  },
  {
    title: "إكسسوارات (Accessories)",
    slug: "accessories",
    image: "/access.png",
    color: "from-amber-600/80 to-amber-900/90",
  }
];

const MotionLink = motion(Link);

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const products = useStore((state) => state.products) || [];
  const loadProducts = useStore((state) => state.loadProducts);
  const loading = useStore((state) => state.loading);
  const { t } = useTranslation();
  const [heroApi, setHeroApi] = useState<any>(null);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { settings } = useSiteSettings();

  // Signal to the GlobalSplash that the main page is ready and mounted
  useEffect(() => {
    window.dispatchEvent(new Event('app-ready'));
    return () => {
      // optional cleanup if we navigate away immediately, not really needed for splash
    };
  }, []);

  useEffect(() => {
    if (products.length === 0 && !loading) loadProducts();
  }, [products.length, loading, loadProducts]);

  useEffect(() => {
    if (!heroApi || isHeroHovered) return;
    const interval = setInterval(() => {
      if (heroApi.canScrollNext()) {
        heroApi.scrollNext();
        setCurrentSlide((p) => p + 1);
      } else {
        heroApi.scrollTo(0);
        setCurrentSlide(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [heroApi, isHeroHovered]);

  const specialOffersProducts = products.filter(
    (p) => p && p.id && !p.isArchived && p.specialOffer && p.offerEndsAt && new Date(p.offerEndsAt as string) > new Date()
  );

  const featuredProducts = products
    .filter((p) => p && p.id && !p.isArchived && (!p.specialOffer || !p.offerEndsAt || new Date(p.offerEndsAt as string) <= new Date()))
    .slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50/50">
        <SEOHelmet />

        <main>
          {/* ── Search Bar Section ── */}
          {settings.showHomeSearch !== false && (() => {
            const theme = settings.homeSearchTheme || 'elegant';
            const radius = settings.borderRadius || '9999px';

            // Render logic based on theme
            if (theme === 'minimal') {
              return (
                <div className="bg-white py-10 relative z-10">
                  <div className="container max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-light text-gray-800 mb-6 tracking-wide">عن ماذا تبحث؟</h2>
                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="اكتب اسم الموديل أو الفئة هنا..."
                        className="w-full bg-transparent border-0 border-b-2 border-gray-200 focus-visible:border-primary focus-visible:ring-0 rounded-none px-2 py-4 text-xl md:text-2xl text-center shadow-none transition-colors placeholder:text-gray-300"
                        dir="auto"
                      />
                      <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                        <Search className="w-7 h-7" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            }

            if (theme === 'glass') {
              return (
                <div className="absolute top-4 md:top-8 left-0 right-0 z-20 px-4 pointer-events-none">
                  <div className="container max-w-3xl mx-auto">
                    <div
                      className="backdrop-blur-md bg-white/40 border border-white/60 p-2.5 md:p-3 shadow-2xl pointer-events-auto"
                      style={{ borderRadius: radius }}
                    >
                      <form onSubmit={handleSearch} className="flex gap-2 w-full">
                        <div className="relative flex-1">
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-600" />
                          </div>
                          <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن..."
                            className="w-full pr-12 pl-4 py-6 md:py-7 bg-white/80 border-white/50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/50 text-base md:text-lg shadow-inner transition-all"
                            style={{ borderRadius: radius === '9999px' ? '9999px' : `calc(${radius} * 0.8)` }}
                            dir="auto"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="px-6 md:px-8 bg-gray-900 text-white hover:bg-black font-bold h-auto text-base md:text-lg shadow-lg border border-gray-800"
                          style={{ borderRadius: radius === '9999px' ? '9999px' : `calc(${radius} * 0.8)` }}
                        >
                          بحث
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            }

            if (theme === 'bold') {
              return (
                <div className="bg-slate-900 py-10 md:py-14 relative z-10 shadow-2xl overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
                  <div className="container max-w-5xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="flex-1 text-center md:text-right">
                      <h2 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3">لا تضيع وقتك</h2>
                      <p className="text-slate-400 text-sm md:text-lg">ابحث فوراً في مستودعاتنا عن جهاز أحلامك.</p>
                    </div>
                    <form onSubmit={handleSearch} className="w-full md:w-1/2 flex flex-col sm:flex-row gap-3">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="الماركة أو الموديل..."
                        className="flex-1 bg-slate-800 border-slate-700 text-white placeholder-slate-500 py-6 md:py-7 px-6 text-base md:text-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-inner"
                        style={{ borderRadius: radius }}
                        dir="auto"
                      />
                      <Button
                        type="submit"
                        className="py-6 md:py-7 px-8 md:px-10 bg-primary text-white hover:bg-primary/90 font-black text-base md:text-lg tracking-widest shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1"
                        style={{ borderRadius: radius }}
                      >
                        بحث سريع
                      </Button>
                    </form>
                  </div>
                </div>
              );
            }

            if (theme === 'bordered') {
              return (
                <div className="bg-white py-6 md:py-8 border-b border-gray-100 relative z-10">
                  <div className="container max-w-4xl mx-auto px-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center p-2 border-2 md:border-4 border-primary/20 hover:border-primary/40 focus-within:border-primary transition-colors bg-gray-50/50" style={{ borderRadius: radius }}>
                      <div className="flex items-center justify-center gap-3 px-4 w-full md:w-auto py-2 md:py-0 border-b md:border-b-0 md:border-l border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Search className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-gray-700 whitespace-nowrap text-sm md:text-base">البحث الذكي:</span>
                      </div>
                      <div className="flex-1 w-full flex mt-3 md:mt-0 px-2 md:px-4">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="ما الذي تبحث عنه اليوم؟"
                          className="w-full bg-transparent border-0 focus-visible:ring-0 text-base md:text-lg shadow-none px-2"
                          dir="auto"
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          className="px-4 md:px-6 text-primary hover:bg-primary/10 hover:text-primary font-bold text-base md:text-lg h-auto py-2"
                          style={{ borderRadius: radius === '9999px' ? '9999px' : `calc(${radius} * 0.8)` }}
                        >
                          اذهب
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              );
            }

            // elegant (default)
            return (
              <div className="bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-100 py-6 md:py-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10">
                <div className="container max-w-3xl mx-auto px-4">
                  <div className="text-center mb-4 md:mb-5">
                    <h2 className={`text-xl md:text-2xl font-bold mb-1 text-gray-800`}>ابحث عن جهازك المفضل</h2>
                    <p className={`text-sm text-gray-500`}>اكتب اسم الموديل أو الماركة للوصول السريع للمنتجات</p>
                  </div>
                  <form onSubmit={handleSearch} className="relative group flex items-center w-full">
                    {/* Search Icon */}
                    <div className="absolute right-4 flex items-center justify-center pointer-events-none">
                      <Search className={`h-5 w-5 transition-colors text-gray-400 group-focus-within:text-primary`} />
                    </div>

                    {/* Input Field */}
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="مثال: Dell Latitude, HP EliteBook..."
                      className={`w-full pr-12 pl-[90px] md:pl-[120px] py-7 md:py-8 text-base md:text-lg transition-all bg-white border-2 border-primary/10 focus-visible:ring-0 focus-visible:border-primary/50 hover:border-primary/30 shadow-sm`}
                      style={{ borderRadius: radius }}
                      dir="auto"
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className={`absolute left-2 md:left-3 top-2 md:top-2.5 bottom-2 md:bottom-2.5 px-5 md:px-8 font-bold transition-all h-auto text-sm md:text-base bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-95 shadow-md hover:shadow-lg hover:-translate-y-0.5`}
                      style={{ borderRadius: radius === '9999px' ? '9999px' : `calc(${radius} * 0.8)` }}
                    >
                      بحث
                    </Button>
                  </form>
                </div>
              </div>
            );
          })()}

          {/* ── Hero Section ── */}
          <section className="relative">
            <div
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
              className="relative"
            >
              <Carousel className="w-full group/carousel" setApi={setHeroApi}>
                <CarouselContent>
                  {STORE_HERO_CAROUSEL.map((slide, i) => (
                    <CarouselItem key={slide.id}>
                      <Link
                        to={slide.buttonLink}
                        className="block relative w-full bg-gray-900 group overflow-hidden focus:outline-none"
                      >
                        <img
                          src={slide.image}
                          alt={slide.title || "Banner"}
                          className="w-full h-auto md:max-h-[550px] object-contain transition-transform duration-1000 group-hover:scale-[1.02]"
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          {...(i === 0 ? { fetchpriority: "high" } as any : {})}
                        />
                        {/* Subtle gradient at bottom for dots visibility */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none" />
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="hidden sm:block absolute inset-y-0 left-0 right-0 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500">
                  <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-auto border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-black/40 hover:text-white shadow-lg rounded-full w-12 h-12 transition-all" />
                  <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-auto border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-black/40 hover:text-white shadow-lg rounded-full w-12 h-12 transition-all" />
                </div>

                {/* Slide dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30 pointer-events-auto">
                  {STORE_HERO_CAROUSEL.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        heroApi?.scrollTo(i);
                        setCurrentSlide(i);
                      }}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${currentSlide % STORE_HERO_CAROUSEL.length === i ? "w-8 h-2 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]" : "w-2 h-2 bg-white/50 hover:bg-white/90"}`}
                    />
                  ))}
                </div>
              </Carousel>
            </div>
          </section>

          {/* ── Trust Badges ── */}
          <section className="py-6 bg-white border-y border-gray-100">
            <div className="container">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TRUST_BADGES.map((badge, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-2xl ${badge.bg} transition-all duration-300 hover:scale-[1.03]`}
                  >
                    <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                      <badge.icon className={`h-5 w-5 ${badge.color}`} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="container py-8 md:py-12 space-y-16">

            {/* ── Shop by Category ── */}
            {/* <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                      تصفح حسب القسم
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      اختر القسم الذي تبحث عنه للوصول السريع
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {FEATURED_CATEGORIES.map((category, index) => (
                  <Link
                    key={index}
                    to={`/products?category=${category.slug}`}
                    className="group relative flex flex-col justify-end aspect-square w-full rounded-2xl md:rounded-3xl bg-gray-900 border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
                  >
                    <img
                      src={category.image}
                      alt={category.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                      decoding="async"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/10 to-transparent transition-opacity duration-500 group-hover:opacity-80" />

                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />

                    <div className="relative z-10 p-3 md:p-5 w-full text-center transform md:translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-sm md:text-xl font-bold text-white mb-0.5 md:mb-1 drop-shadow-md truncate">
                        {category.title.split(' (')[0]}
                      </h3>
                      <div className="hidden md:flex justify-center items-center gap-1.5 text-[12px] font-medium text-white/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                        عرض المنتجات
                        <ArrowLeft className="h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section> */}

            {/* ── Special Offers ── */}
            {specialOffersProducts.length > 0 && (
              <section>
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-red-50 border border-red-100 p-5 sm:p-7">
                  {/* Decorative blur blob */}
                  <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-red-200/30 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-orange-200/30 blur-3xl pointer-events-none" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-1 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
                          <div className="absolute inset-0 h-10 w-1 bg-gradient-to-b from-red-400 to-red-500 rounded-full animate-pulse" />
                        </div>
                        <div>
                          <h2 className="text-2xl md:text-3xl font-extrabold gradient-text-warm">
                            {t("specialOffers.title")}
                          </h2>
                          <p className="text-sm text-gray-500 mt-0.5">{t("specialOffers.subtitle")}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/products")}
                        className="group flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-full transition-all duration-300"
                      >
                        عرض الكل
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                      </Button>
                    </div>

                    {loading && products.length === 0 ? (
                      <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
                      </div>
                    ) : (
                      <ProductCarousel products={specialOffersProducts} />
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ── Featured Products ── */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                      {t("products.featured")}
                    </h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-1.5" />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/products")}
                  className="group flex items-center gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 rounded-full transition-all duration-300"
                >
                  عرض الكل
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                </Button>
              </div>

              {loading && products.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : (
                <ProductCarousel products={featuredProducts} />
              )}
            </section>

            {/* ── Wholesale & Bulk Section ── */}
            {settings.isImporter !== false && (
              <section>
                <Link
                  to="/wholesale"
                  className="group flex flex-col md:flex-row items-center justify-between overflow-hidden rounded-2xl shadow-sm hover:shadow-md border border-gray-200/60 bg-white transition-all duration-300 min-h-[120px]"
                >
                  {/* Content Panel (Right for RTL) */}
                  <div className="flex-1 p-5 md:p-8 text-right flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3 mb-2 md:mb-3">

                      <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                        قسم التوريدات والجملة
                      </h2>
                    </div>

                    <p className="text-sm text-gray-500 mb-0 md:mb-4 max-w-xl">
                      أسعار خاصة للشركات والموزعين — أجهزة أصلية بكميات كبيرة مع ضمان معتمد وعقود صيانة.
                    </p>

                    {/* Desktop Link text */}
                    <div className="flex md:flex items-center gap-2 text-blue-800 font-semibold text-sm group-hover:text-indigo-700 transition-colors">
                      تصفح عروض الشركات
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 duration-300" />
                    </div>
                  </div>

                  {/* Image Panel (Left) */}
                  <div className="w-full md:w-[40%] h-32 md:h-full relative overflow-hidden bg-gray-50">
                    <div className="absolute inset-0  z-10" />
                    <img
                      src="/bg2.jpeg"
                      alt="التوريدات والجملة"
                      className="w-full h-full object-cover md:object-right transition-transform duration-700 group-hover:scale-105 opacity-90"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </Link>
              </section>
            )}

            {/* ── Brands ── */}
            <section className="pb-4">
              <BrandsCarousel title={t("brands.title")} />
            </section>
          </div>
        </main>

        <Footer />

        <ProductModal product={selectedProduct} open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    </>
  );
};

export default Index;
