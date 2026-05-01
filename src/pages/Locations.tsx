import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "@/components/Footer";
import { Building, Phone, Clock, MapPin, MessageCircle, Map as MapIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE_LOCATIONS } from "@/constants/store";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay },
});

export default function Locations() {
  const [selectedLocation, setSelectedLocation] = useState(STORE_LOCATIONS[0] as any);

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Modern Dark Hero ── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-brand-950">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10 text-center">
          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-brand-500/10 text-brand-400 font-medium text-sm mb-6 border border-brand-500/20">
              <MapIcon className="w-4 h-4" />
              <span>فروعنا ونقاط البيع</span>
            </div>
          </motion.div>
          
          <motion.h1 {...fadeUp(0.1)} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            نحن دائماً <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-300">بالقرب منك</span>
          </motion.h1>
          
          <motion.p {...fadeUp(0.2)} className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            نسعد بزيارتكم في فروعنا للتعرف على تشكيلتنا الواسعة من الأجهزة وتجربتها بأنفسكم قبل الشراء لضمان أفضل تجربة.
          </motion.p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-12 md:py-20 flex-1 bg-slate-50 relative">
        <div className="container max-w-7xl mx-auto">
          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col lg:flex-row min-h-[650px]">
            
            {/* Left/Right Sidebar: Locations List */}
            <div className="w-full lg:w-[400px] xl:w-[450px] border-b lg:border-b-0 lg:border-l border-slate-100 bg-slate-50/50 flex flex-col">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-white">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-6 h-6 text-brand-600" />
                  الفروع المتاحة
                </h2>
                <p className="text-slate-500 text-sm mt-2">اختر الفرع لعرض تفاصيل الموقع والتواصل</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {STORE_LOCATIONS.map((location) => {
                  const isSelected = selectedLocation.id === location.id;
                  return (
                    <div
                      key={location.id}
                      onClick={() => setSelectedLocation(location)}
                      className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 border-2 
                        ${isSelected 
                          ? "bg-white border-brand-500 shadow-md shadow-brand-500/10" 
                          : "bg-white border-transparent hover:border-brand-200 hover:shadow-sm"}`}
                    >
                      {isSelected && (
                         <div className="absolute top-4 left-4">
                           <CheckCircle2 className="w-6 h-6 text-brand-600 drop-shadow-sm" />
                         </div>
                      )}
                      
                      <h3 className={`text-lg font-bold mb-1 pr-2 ${isSelected ? "text-brand-700" : "text-slate-800"}`}>
                        {location.name}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed pr-2 line-clamp-2">
                        {location.address}
                      </p>

                      {/* Mobile Expandable Details */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden lg:hidden"
                          >
                            <div className="pt-5 mt-4 border-t border-slate-100 space-y-3">
                               <div className="flex items-center gap-3">
                                 <Phone className="w-4 h-4 text-slate-400" />
                                 <a href={`tel:${location.phone}`} className="text-slate-700 font-medium text-sm hover:text-brand-600 transition-colors" dir="ltr">{location.phone}</a>
                               </div>
                               <div className="flex items-center gap-3">
                                 <Clock className="w-4 h-4 text-slate-400" />
                                 <span className="text-slate-700 font-medium text-sm">مفتوح يومياً 11 ص - 9 م (عدا الجمعة)</span>
                               </div>

                               <div className="h-[200px] w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 relative mt-4">
                                 <div className="absolute inset-0 bg-slate-100 flex items-center justify-center -z-10 animate-pulse">
                                   <MapPin className="h-6 w-6 text-slate-300" />
                                 </div>
                                 <iframe
                                   src={location.googleMapsUrl}
                                   title={`موقع ${location.name}`}
                                   className="w-full h-full"
                                   style={{ border: 0 }}
                                   allowFullScreen
                                   loading="lazy"
                                   referrerPolicy="no-referrer-when-downgrade"
                                 />
                               </div>
                               
                               <div className="flex gap-2 pt-2">
                                 <Button size="sm" className="flex-1 bg-brand-600 hover:bg-brand-500 text-white gap-2 rounded-xl" onClick={() => window.open(`tel:${location.phone}`, "_self")}>
                                    <Phone className="w-4 h-4" /> اتصال
                                 </Button>
                                 <Button size="sm" variant="outline" className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-700 gap-2 rounded-xl" onClick={() => window.open(`https://wa.me/${location.phone}?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن المنتجات المتاحة")}`, "_blank")}>
                                    <MessageCircle className="w-4 h-4 text-[#25D366]" /> واتساب
                                 </Button>
                               </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Area: Map & Details (Desktop Focus) */}
            <div className="flex-1 flex flex-col bg-white hidden lg:flex relative">
              {/* Map View */}
              <div className="flex-1 relative bg-slate-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center gap-3">
                    <MapPin className="h-10 w-10 text-slate-300" />
                    <span className="text-slate-400 font-medium text-sm">جاري تحميل الخريطة...</span>
                  </div>
                </div>
                <iframe
                  key={selectedLocation.id}
                  src={selectedLocation.googleMapsUrl}
                  title={`موقع ${selectedLocation.name}`}
                  className="w-full h-full relative z-10"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Details Banner */}
              <div className="bg-white border-t border-slate-100 p-8 shadow-[0_-10px_30px_rgb(0,0,0,0.03)] relative z-20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedLocation.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 text-brand-600" />
                      <span>{selectedLocation.address}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-6 h-12 rounded-xl gap-2 transition-transform hover:-translate-y-1"
                      onClick={() => window.open(`https://wa.me/${selectedLocation.phone}?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن المنتجات المتاحة")}`, "_blank")}
                    >
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                      واتساب
                    </Button>
                    <Button
                      size="lg"
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 h-12 rounded-xl shadow-lg shadow-brand-600/20 gap-2 transition-transform hover:-translate-y-1"
                      onClick={() => window.open(`tel:${selectedLocation.phone}`, "_self")}
                    >
                      <Phone className="w-5 h-5" />
                      <span dir="ltr">{selectedLocation.phone}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
