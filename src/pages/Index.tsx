import { useState, useEffect } from "react";
import { ProductModal } from "@/components/ProductModal";
import { useStore } from "@/store/useStore";
import { Product } from "@/types/product";
import { useTranslation } from "react-i18next";
import { SEOHelmet } from "@/components/SEOHelmet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/ProductCarousel";
import { BrandsCarousel } from "@/components/BrandsCarousel";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Star, Shield, Truck, ChevronRight } from "lucide-react";
import { STORE_HERO_CAROUSEL } from "@/constants/store";
import { motion } from "framer-motion";

const TRUST_BADGES = [
  { icon: Shield, label: "ضمان 6 أشهر", color: "text-brand-700", bg: "bg-brand-50" },
  { icon: Truck, label: " شحن جميع المحافظات", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Star, label: "اجهزة اوريجينال ", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Zap, label: "أفضل الأسعار", color: "text-purple-600", bg: "bg-purple-50" },
];

const FEATURED_CATEGORIES = [
  {
    title: "اللابتوب (Laptop)",
    slug: "laptop",
    image: "/lap.png",
    color: "from-brand-700/80 to-brand-900/90",
  },

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
  const navigate = useNavigate();

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

  return (
    <>
      <div className="min-h-screen bg-gray-50/50">
        <SEOHelmet />

        <main>
          {/* ── Hero Section ── */}
          <section className="relative bg-transparent pt-4 md:pt-6 px-4 md:px-0">
            <div
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
              className="relative max-w-[1280px] mx-auto rounded-3xl overflow-hidden shadow-sm"
            >
              <Carousel className="w-full group/carousel" setApi={setHeroApi}>
                <CarouselContent>
                  {STORE_HERO_CAROUSEL.map((slide, i) => (
                    <CarouselItem key={slide.id}>
                      <Link
                        to={slide.buttonLink}
                        className="block relative w-full group overflow-hidden focus:outline-none rounded-3xl"
                      >
                        <img
                          src={slide.image}
                          alt={slide.title || "Banner"}
                          className="w-full h-auto md:max-h-[550px] object-cover transition-transform duration-1000 group-hover:scale-[1.02] rounded-3xl"
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          {...(i === 0 ? { fetchpriority: "high" } as any : {})}
                        />
                        {/* Subtle gradient at bottom for dots visibility */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none rounded-b-3xl" />
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
          {/* <section className="py-6 bg-white border-y border-gray-100">
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
          </section> */}

          <div className="container py-8 md:py-12 space-y-16">

            {/* ── Shop by Category ── */}
            {/* <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-1 bg-gradient-to-b from-brand-700 to-brand-700 rounded-full" />
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
                  <div className="h-9 w-1 bg-gradient-to-b from-brand-700 to-brand-500 rounded-full" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                      {t("products.featured")}
                    </h2>
                    <div className="w-12 h-1 bg-gradient-to-r from-brand-700 to-brand-500 rounded-full mt-1.5" />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/products")}
                  className="group flex items-center gap-1.5 border-brand-200 text-brand-700 hover:bg-brand-700 hover:text-white hover:border-brand-600 rounded-full transition-all duration-300"
                >
                  عرض الكل
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                </Button>
              </div>

              {loading && products.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
                </div>
              ) : (
                <ProductCarousel products={featuredProducts} />
              )}
            </section>

            {/* ── Wholesale & Bulk Section ── */}
            {/* <section>
              <Link
                to="/wholesale"
                className="group flex flex-col md:flex-row items-center justify-between overflow-hidden rounded-2xl shadow-sm hover:shadow-md border border-gray-200/60 bg-white transition-all duration-300 min-h-[120px]"
              >
                <div className="flex-1 p-5 md:p-8 text-right flex flex-col justify-center h-full">
                  <div className="flex items-center gap-3 mb-2 md:mb-3">

                    <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                      قسم التوريدات والجملة
                    </h2>
                  </div>

                  <p className="text-sm text-gray-500 mb-0 md:mb-4 max-w-xl">
                    أسعار خاصة للشركات والموزعين — أجهزة أصلية بكميات كبيرة مع ضمان معتمد وعقود صيانة.
                  </p>

                  <div className="flex md:flex items-center gap-2 text-brand-800 font-semibold text-sm group-hover:text-indigo-700 transition-colors">
                    تصفح عروض الشركات
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 duration-300" />
                  </div>
                </div>

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
            </section> */}

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
