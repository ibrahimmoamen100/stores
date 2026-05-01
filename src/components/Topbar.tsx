import { MapPin } from "lucide-react";
import { FaFacebookF, FaWhatsapp, FaInstagram, FaTiktok } from "react-icons/fa";
import { Link } from "react-router-dom";

export function Topbar() {
  return (
    <div
      className="text-white shadow-sm relative z-50"
      style={{ background: "linear-gradient(135deg, var(--brand-800) 0%, var(--brand-700) 60%, var(--brand-600) 100%)" }}
    >
      <div className="container flex h-12 items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="https://www.facebook.com/compusaaiff"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white/40 bg-white/10 hover:bg-white text-white hover:border-white hover:text-brand-700 transition-all duration-300 hover:scale-110 shadow-sm"
          >
            <FaFacebookF className="h-4 w-4" />
          </a>
          <a
            href="https://wa.me/201061246012"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white/40 bg-white/10 hover:bg-white text-white hover:border-white hover:text-green-600 transition-all duration-300 hover:scale-110 shadow-sm"
          >
            <FaWhatsapp className="h-4 w-4" />
          </a>
          <a
            href="https://instagram.com/compusaaiff"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white/40 bg-white/10 hover:bg-white text-white hover:border-white hover:text-pink-600 transition-all duration-300 hover:scale-110 shadow-sm"
          >
            <FaInstagram className="h-4 w-4" />
          </a>
          <a
            href="https://www.tiktok.com/@compu.saif_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-white/40 bg-white/10 hover:bg-white text-white hover:border-white hover:text-gray-900 transition-all duration-300 hover:scale-110 shadow-sm"
          >
            <FaTiktok className="h-4 w-4" />
          </a>
        </div>

        <Link
          to="/locations"
          className="flex items-center gap-2 text-sm font-bold border border-white/40 bg-white/10 text-white hover:bg-white hover:border-white hover:text-brand-700 px-4 py-1.5 rounded-full transition-all duration-300"
        >
          <MapPin className="h-4 w-4" />
          <span>العنوان</span>
        </Link>
      </div>
    </div>
  );
}
