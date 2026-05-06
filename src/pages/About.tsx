import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaWhatsapp,
  FaShieldAlt,
  FaBatteryFull,
  FaExchangeAlt,
  FaPhone,
  FaStore,
  FaAward,
  FaCheckCircle,
  FaStar,
  FaLaptop,
} from "react-icons/fa";
import Footer from "@/components/Footer";
import { STORE_OWNER } from "@/constants/store";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const warrantyFeatures = [
  {
    icon: FaShieldAlt,
    title: "ضمان 6 شهور",
    description: "على جميع المنتجات ضد عيوب الصناعة",
    gradient: "from-primary to-primary/80",
    bg: "bg-primary/10",
    border: "border-primary/20",
    iconColor: "text-primary",
  },
  {
    icon: FaBatteryFull,
    title: "ضمان شهر",
    description: "على البطاريات والشواحن والهاردات",
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: FaExchangeAlt,
    title: "أسبوع استبدال",
    description: "على جميع المنتجات بدون أي شروط",
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    iconColor: "text-purple-600",
  },
];

const whyUs = [
  { id: 'importer', icon: FaStar, label: "من المستورد المباشر", desc: "أسعار تنافسية لأننا المستوردون، مع توفر أسعار خاصة جداً للتجار." },
  { id: 'original', icon: FaCheckCircle, label: "أصلي 100%", desc: "جميع المنتجات والمكونات الداخلية أصلية بالكامل ولم يتم تعديلها." },
  { id: 'products', icon: FaLaptop, label: "منتجات متكاملة", desc: "لابتوبات، أجهزة ديسك توب، وشاشات لتلبية كافة احتياجاتكم التقنية." },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay },
});

export default function About() {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("مرحباً، أريد الاستفسار عن المنتجات المتاحة");
    window.open(`https://wa.me/${STORE_OWNER.whatsapp}?text=${message}`, "_blank");
  };

  const handlePhoneClick = () => {
    window.open(`tel:${STORE_OWNER.phone}`, "_self");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/40">
      <main className="flex-1">
        {/* ── Hero ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 md:py-28">
          {/* Decorative blobs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="container relative">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              {...fadeUp(0)}
            >
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-white/15 backdrop-blur-sm rounded-3xl border border-white/25 shadow-2xl">
                  <img
                    src={settings.logoUrl || "/logo2.png"}
                    alt={settings.storeName}
                    className="h-24 md:h-32 w-auto object-contain"
                    onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                  />
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                {settings.aboutPage.heroTitle}
              </h1>
              <h2 className="text-xl md:text-2xl font-bold text-white/90 mb-3 drop-shadow-md">
                {settings.aboutPage.heroSubtitle}
              </h2>
              <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
                {settings.aboutPage.heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleWhatsAppClick}
                  size="lg"
                  className="bg-white text-green-600 hover:bg-green-50 font-bold px-7 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 gap-2"
                >
                  <FaWhatsapp className="text-xl" />
                  تواصل عبر واتساب
                </Button>
                <Button
                  onClick={handlePhoneClick}
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white/15 font-bold px-7 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 gap-2"
                >
                  <FaPhone className="text-lg" />
                  {STORE_OWNER.phone}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="container py-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: settings.aboutPage?.stats?.experience || "5+", label: "سنوات خبرة" },
                { value: settings.aboutPage?.stats?.sold || "1000+", label: "لابتوب مباع" },
                { value: settings.aboutPage?.stats?.satisfaction || "100%", label: "رضا العملاء" },
              ].map((s, i) => (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.1)}>
                  <p className="text-2xl md:text-3xl font-extrabold gradient-text">{s.value}</p>
                  <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Image Banner ── */}
        <div className="container pt-14">
          <motion.div {...fadeUp(0.1)} className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative group">
            <img 
              src={settings.aboutPage.bannerImage || "/sg.jpeg"} 
              alt={settings.storeName} 
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Optional subtle overlay for better visual integration if needed, but since it's an ad banner, keeping it clean is usually best */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.div>
        </div>

        {/* ── About cards ── */}
        <div className="container py-14">
          <motion.div className={`grid md:grid-cols-${settings.isImporter !== false ? '2' : '1'} gap-6 max-w-${settings.isImporter !== false ? 'none' : '3xl'} mx-auto`} {...fadeUp(0.15)}>
            {settings.isImporter !== false && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 hover:shadow-md hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <FaStore className="text-2xl text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">من المستورد إليك مباشرةً</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      نحن لا نتعامل مع وسطاء! نضمن لك الحصول على جهازك من المستورد مباشرة بأقل سعر في السوق. ويتوفر لدينا <span className="text-primary font-bold">أسعار خاصة ومميزة جداً للتجار والموزعين</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 hover:shadow-md hover:border-emerald-100 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50">
                  <FaCheckCircle className="text-2xl text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">مكونات أصلية 100%</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    نتعهد بأن جميع الأجهزة (لابتوب - ديسك توب - شاشات) تأتي بحالتها الأصلية وبالمكونات الداخلية كما خرجت من المصنع (Original)، لتضمن أعلى أداء وعمر افتراضي طويل، مع ضماننا الشامل لراحتك.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Warranty Section ── */}
        <div className="bg-gradient-to-br from-slate-50 to-primary/5 py-16 border-y border-gray-100">
          <div className="container">
            <motion.div className="text-center mb-12" {...fadeUp(0.1)}>
              <div className="inline-flex items-center gap-3 mb-4">
                <FaAward className="text-3xl text-primary" />
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">ضماناتنا</h2>
              </div>
              <p className="text-gray-500 max-w-xl mx-auto text-base">
                نقدم ضمانات شاملة على جميع منتجاتنا لضمان رضاكم التام
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {warrantyFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  {...fadeUp(0.15 + index * 0.1)}
                  className={`bg-white rounded-2xl border ${feature.border} shadow-sm p-7 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300 group`}
                >
                  <div className={`inline-flex p-4 rounded-2xl ${feature.bg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`text-3xl ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Why Us ── */}
        <div className="container py-14">
          <motion.div className="text-center mb-10" {...fadeUp(0.1)}>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">
              لماذا تختارنا؟
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto" />
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5 justify-center">
            {whyUs
              .filter(item => settings.isImporter !== false || item.id !== 'importer')
              .map((item, i) => (
              <motion.div key={i} {...fadeUp(0.1 + i * 0.1)}
                className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
                  <item.icon className="text-2xl text-primary" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">{item.label}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Contact Section ── */}
        <div className="bg-gradient-to-br from-primary to-secondary py-16">
          <div className="container">
            <motion.div className="max-w-3xl mx-auto" {...fadeUp(0.1)}>
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">تواصل معنا</h2>
                <p className="text-white/80 text-base">نحن هنا لخدمتكم وتقديم أفضل المنتجات بأفضل الأسعار</p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-7 text-center hover:bg-white/15 transition-all duration-300">
                  <div className="inline-flex p-3 rounded-2xl bg-white/20 mb-4">
                    <FaWhatsapp className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">واتساب</h3>
                  <p className="text-white/80 text-sm mb-5">تواصل معنا عبر واتساب للحصول على استشارة مجانية</p>
                  <Button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-white text-green-600 hover:bg-green-50 font-bold rounded-full transition-all duration-300 hover:scale-105 gap-2"
                  >
                    <FaWhatsapp />
                    تواصل عبر واتساب
                  </Button>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-7 text-center hover:bg-white/15 transition-all duration-300">
                  <div className="inline-flex p-3 rounded-2xl bg-white/20 mb-4">
                    <FaPhone className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">اتصال مباشر</h3>
                  <p className="text-white/80 text-sm mb-5">اتصل بنا مباشرة للحصول على المساعدة الفورية</p>
                  <Button
                    onClick={handlePhoneClick}
                    variant="outline"
                    className="w-full border-2 border-white/50 text-white hover:bg-white/20 font-bold rounded-full transition-all duration-300 hover:scale-105 gap-2"
                  >
                    <FaPhone />
                    {STORE_OWNER.phone}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
