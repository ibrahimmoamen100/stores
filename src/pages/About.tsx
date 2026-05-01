import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  BatteryCharging, 
  RefreshCcw, 
  MessageCircle, 
  Phone, 
  Award,
  ChevronLeft
} from "lucide-react";
import Footer from "@/components/Footer";
import { STORE_OWNER } from "@/constants/store";
import { Button } from "@/components/ui/button";
import brand from "@/config/brand.json";
import { Link } from "react-router-dom";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7, delay },
});

export default function About() {
  const { t } = useTranslation();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("مرحباً، أريد الاستفسار عن المنتجات المتاحة");
    window.open(`https://wa.me/${STORE_OWNER.whatsapp}?text=${message}`, "_blank");
  };

  const handlePhoneClick = () => {
    window.open(`tel:${STORE_OWNER.phone}`, "_self");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        
        {/* ── Modern Dark Hero ── */}
        <section className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden bg-brand-950">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div {...fadeUp(0)}>
                <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-brand-500/10 text-brand-400 font-medium text-sm mb-8 border border-brand-500/20">
                  <Award className="w-4 h-4" />
                  <span>{brand.slogan || "معانا انت دايماً في الأمان"}</span>
                </div>
              </motion.div>

              <motion.h1 {...fadeUp(0.1)} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
                نعيد صياغة مفهوم <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-300">التكنولوجيا المضمونة</span>
              </motion.h1>

              <motion.p {...fadeUp(0.2)} className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                متخصصون في تقديم أجهزة اللابتوب بحالة ممتازة وأداء قوي. نضمن لك الحصول على أفضل سعر في السوق لتلبية كافة احتياجاتك التقنية.
              </motion.p>

              <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={handleWhatsAppClick}
                  size="lg"
                  className="bg-white text-brand-900 hover:bg-brand-50 font-bold px-8 h-14 rounded-full transition-all duration-300 gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  تواصل عبر الواتساب
                </Button>
                <Link to="/products">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold px-8 h-14 rounded-full backdrop-blur-sm transition-all duration-300 gap-2"
                  >
                    تصفح منتجاتنا
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Bento Grid Stats & Values ── */}
        <section className="py-20 md:py-32 bg-slate-50 relative">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              
              {/* Main Box */}
              <motion.div {...fadeUp(0.1)} className="md:col-span-2 bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150" />
                <h3 className="text-2xl md:text-3xl font-bold text-brand-950 mb-4 relative z-10">أفضل الأسعار التنافسية</h3>
                <p className="text-slate-600 text-base md:text-lg mb-10 max-w-lg relative z-10 leading-relaxed">
                  لماذا تدفع أكثر؟ نحن نحرص على تقديم أفضل الأجهزة بأقل الأسعار الحقيقية في السوق مع ضمان الجودة العالية، لنوفر لك قيمة حقيقية مقابل ما تدفعه.
                </p>
                <div className="grid grid-cols-2 gap-4 relative z-10 border-t border-slate-100 pt-8 mt-auto">
                  <div>
                    <div className="text-3xl md:text-4xl font-extrabold text-brand-700 mb-1">1000+</div>
                    <div className="text-sm font-medium text-slate-500">جهاز مباع</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-extrabold text-brand-700 mb-1">100%</div>
                    <div className="text-sm font-medium text-slate-500">رضا العملاء</div>
                  </div>
                </div>
              </motion.div>

              {/* Quality Box */}
              <motion.div {...fadeUp(0.2)} className="bg-brand-900 rounded-[2rem] p-8 md:p-10 shadow-lg text-white flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150" />
                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                  <ShieldCheck className="text-brand-400 w-8 h-8" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">فحص فني دقيق</h3>
                  <p className="text-slate-400 text-base leading-relaxed">
                    تخضع جميع أجهزتنا لاختبارات وفحوصات فنية شاملة قبل عرضها للبيع، لنضمن لك أداءً مستقراً وموثوقاً ينجز مهامك بكفاءة تامة.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── Image Banner & Text Split ── */}
        <section className="py-10 bg-white">
          <div className="container max-w-6xl mx-auto">
            <motion.div {...fadeUp(0.1)} className="relative rounded-[2.5rem] overflow-hidden bg-brand-900 min-h-[400px] md:min-h-[500px] flex items-center shadow-2xl">
              <img 
                src="/sg.jpeg" 
                alt="تشكيلة لابتوبات" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay hover:scale-105 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-l from-brand-950 via-brand-900/80 to-transparent" />
              
              <div className="relative z-10 p-8 md:p-16 max-w-2xl text-right">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  تشكيلة واسعة تلبي <br/> <span className="text-brand-400">كل احتياجاتك</span>
                </h2>
                <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-lg">
                  سواء كنت تبحث عن لابتوب للألعاب، للعمل المكتبي الشاق، أو للدراسة، ستجد لدينا الجهاز الذي تبحث عنه بأفضل المواصفات.
                </p>
                <Link to="/products">
                  <Button className="bg-brand-600 hover:bg-brand-500 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-brand-600/20">
                    اكتشف الموديلات المتاحة
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Modern Warranty Section ── */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 {...fadeUp(0.1)} className="text-3xl md:text-4xl font-bold text-brand-950 mb-4">راحتك تهمنا</motion.h2>
              <motion.p {...fadeUp(0.2)} className="text-slate-500 text-lg">ضماناتنا مصممة لتوفر لك تجربة شراء خالية من القلق</motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div {...fadeUp(0.1)} className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-brand-900/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-950 mb-3">ضمان 3 شهور</h3>
                <p className="text-slate-600 leading-relaxed text-sm">تغطية شاملة على جميع المنتجات ضد عيوب الصناعة لضمان أفضل أداء لجهازك.</p>
              </motion.div>

              <motion.div {...fadeUp(0.2)} className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BatteryCharging className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-950 mb-3">ضمان بطاريات</h3>
                <p className="text-slate-600 leading-relaxed text-sm">ضمان لمدة شهر كامل على البطاريات والشواحن والهاردات لضمان كفاءة العمل.</p>
              </motion.div>

              <motion.div {...fadeUp(0.3)} className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <RefreshCcw className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-950 mb-3">أسبوع استبدال</h3>
                <p className="text-slate-600 leading-relaxed text-sm">نوفر لك إمكانية استبدال المنتج خلال أسبوع كامل بدون أي شروط معقدة.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Clean Contact CTA ── */}
        <section className="py-20 bg-slate-50">
          <div className="container max-w-4xl mx-auto">
            <motion.div {...fadeUp(0.1)} className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl shadow-slate-200/40 border border-slate-100 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-950 mb-4">نحن دائماً في خدمتك</h2>
                <p className="text-slate-500 mb-10 max-w-lg mx-auto text-lg">
                  فريق خدمة العملاء لدينا مستعد للإجابة على جميع استفساراتك ومساعدتك في اختيار الجهاز الأنسب لعملك.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={handleWhatsAppClick} 
                    size="lg" 
                    className="bg-[#25D366] hover:bg-[#1ebd5b] text-white rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-[#25D366]/20 transition-transform hover:-translate-y-1 gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    محادثة واتساب
                  </Button>
                  <Button 
                    onClick={handlePhoneClick} 
                    size="lg" 
                    variant="outline" 
                    className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full px-8 h-14 text-base font-bold transition-transform hover:-translate-y-1 gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    اتصال هاتفي
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
