import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { CONTACT_PHONES } from "@/constants/supplier";
import { STORE_LOCATIONS } from "@/constants/store";

export default function Footer() {
  const { t } = useTranslation();
  const products = useStore((state) => state.products);

  const categories = [...new Set(products?.map((p) => p.category) || [])];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white">
      {/* Top wave-like separator */}
      <div className="h-1 bg-gradient-to-r from-brand-700 via-brand-400 to-brand-700" />

      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* About */}
          <div>
            <img src="/logo2.png" alt="كومبيو سيف" className="h-14 w-auto mb-4 opacity-90" />
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              {t("footer.aboutDescription")}
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/8 hover:bg-brand-700 text-slate-400 hover:text-white transition-all duration-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="" target="_blank" rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/8 hover:bg-pink-600 text-slate-400 hover:text-white transition-all duration-300">
                <Instagram className="h-4 w-4" />
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: t("footer.home") },
                { to: "/products", label: t("footer.products") },
                // { to: "/wholesale", label: t("footer.wholesale") },
                { to: "/about", label: t("footer.about") },
                { to: "/locations", label: t("footer.locations") },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-700 group-hover:w-2 transition-all duration-200" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
              {t("footer.categories")}
            </h3>
            <ul className="space-y-2.5">
              {(categories.length > 0 ? categories.slice(0, 5) : ["لابتوبات", "أجهزة", "ملحقات", "عروض"]).map(
                (cat, i) => (
                  <li key={i}>
                    <Link
                      to={`/products?category=${cat}`}
                      className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-cyan-500 group-hover:w-2 transition-all duration-200" />
                      {cat}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact & Branches */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
              فروعنا
            </h3>
            <div className="space-y-4">
              {STORE_LOCATIONS.map((loc) => (
                <div key={loc.id} className="flex flex-col gap-1.5 pb-4 mb-2 border-b border-white/5 last:border-0 last:pb-0 last:mb-0">
                  <h4 className="text-white text-sm font-bold line-clamp-1 group-hover:text-brand-500 transition-colors">
                    {loc.name.replace('شركة الحشومي', '').trim() || 'فرع'}
                  </h4>
                  <div className="flex items-start gap-2 text-slate-400 text-xs">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{loc.address.replace(/^ - /, '').trim() || 'عنوان الفرع غير متوفر'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mt-0.5">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                    <a href={`tel:${loc.phone}`} dir="ltr" className="hover:text-white font-medium transition-colors">
                      {loc.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/8 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()}  الحشومي للابات الاستيراد
          </p>
          {/* <p className="flex items-center gap-1.5">
            صُنع بـ
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            من
            <a
              href="https://wa.me/201061246012"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 hover:text-white hover:underline transition-colors"
            >
              Ibrahim Moamen
            </a>
          </p> */}
          <p className="flex items-center gap-1.5">
            صنع بواسطة : إبراهيم مؤمن
          </p>
        </div>
      </div>
    </footer>
  );
}
