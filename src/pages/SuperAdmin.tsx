import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { BulkPriceUpdateTool } from "@/components/BulkPriceUpdateTool";
import { SlugMigrationTool } from "@/components/SlugMigrationTool";
import { ExportProductsTool } from "@/components/ExportProductsTool";
import { ImportProductsTool } from "@/components/ImportProductsTool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  AlertTriangle,
  Zap,
  Settings,
  Database,
} from "lucide-react";

// The super admin password - hardcoded and never exposed in UI
const SUPER_ADMIN_PASSWORD = "45086932";
const SA_SESSION_KEY = "sa_session";
const SA_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

function setSASession() {
  const expires = new Date(Date.now() + SA_SESSION_DURATION).toISOString();
  sessionStorage.setItem(SA_SESSION_KEY, expires);
}

function checkSASession(): boolean {
  try {
    const expires = sessionStorage.getItem(SA_SESSION_KEY);
    if (!expires) return false;
    return new Date() < new Date(expires);
  } catch {
    return false;
  }
}

function clearSASession() {
  sessionStorage.removeItem(SA_SESSION_KEY);
}

// ── Layer 2: Super Admin Login ────────────────────────────────────────────────
function SuperAdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);

  useEffect(() => {
    if (!blocked) return;
    const interval = setInterval(() => {
      setBlockTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setBlocked(false);
          setAttempts(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [blocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked || loading) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    if (password === SUPER_ADMIN_PASSWORD) {
      setSASession();
      toast.success("تم التحقق بنجاح");
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword("");
      if (newAttempts >= 3) {
        setBlocked(true);
        setBlockTimer(60);
        toast.error("تم حظرك مؤقتاً لمدة 60 ثانية");
      } else {
        toast.error(`كلمة المرور غير صحيحة (${newAttempts}/3)`);
      }
    }
    setLoading(false);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden"
    >
      {/* Subtle background circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-violet-100/60 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg shadow-gray-200/80">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-700 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <Lock className="w-2.5 h-2.5 text-indigo-500" />
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-center text-gray-900 mb-1">
            التحقق من الهوية
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6">
            أدخل كلمة مرور المستوى الثاني للمتابعة
          </p>

          {blocked ? (
            <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-red-50 border border-red-200 text-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
              <p className="text-red-700 font-semibold text-sm">تم تعليق الوصول</p>
              <p className="text-red-500 text-sm">
                حاول مرة أخرى بعد{" "}
                <span className="font-mono font-bold text-red-600">{blockTimer}</span>{" "}
                ثانية
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  id="sa-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور السرية"
                  className="border-gray-300 text-gray-900 placeholder:text-gray-400 pr-4 pl-10 h-11 rounded-xl focus:border-indigo-500 focus:ring-indigo-500/20 text-center tracking-[0.3em] font-mono"
                  autoComplete="off"
                  autoFocus
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {attempts > 0 && !blocked && (
                <p className="text-xs text-amber-600 text-center">
                  {3 - attempts} محاولة متبقية قبل الحظر المؤقت
                </p>
              )}

              <Button
                type="submit"
                disabled={loading || !password}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-md shadow-indigo-200 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التحقق...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    تأكيد الهوية
                  </div>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Layer 1: Needs Admin Auth first ──────────────────────────────────────────
function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">وصول مرفوض</h2>
          <p className="text-gray-500 text-sm">
            يجب تسجيل الدخول كمسؤول أولاً قبل الوصول إلى هذه الصفحة.
          </p>
          <Button
            onClick={() => (window.location.href = "/admin")}
            variant="outline"
            className="mt-5 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            الذهاب للوحة التحكم
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Super Admin Dashboard ─────────────────────────────────────────────────────
function SuperAdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-700 to-violet-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-gray-900 font-bold text-sm">Super Admin</span>
              <span className="text-indigo-500 text-[10px] font-mono tracking-widest">LEVEL 2</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              مفعّل
            </div>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">لوحة التحكم المتقدمة</h1>
          <p className="text-gray-500 text-sm">أدوات حساسة للتحكم في المنتجات والبيانات</p>
        </div>

        {/* Section: Bulk Price */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
            <Settings className="w-3.5 h-3.5" />
            تحديث الأسعار المجمع
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mb-8">
          <BulkPriceUpdateTool />
        </div>

        {/* Section: Slug Migration */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
            <Zap className="w-3.5 h-3.5" />
            أداة ترحيل Filter Slugs
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mb-8">
          <SlugMigrationTool />
        </div>

        {/* Section: Import/Export */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs shrink-0">
            <Database className="w-3.5 h-3.5" />
            استيراد وتصدير المنتجات
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <ExportProductsTool />
          <ImportProductsTool />
        </div>

        {/* Footer warning */}
        <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-amber-700 text-xs leading-relaxed">
            جميع العمليات في هذه الصفحة تؤثر مباشرةً على قاعدة البيانات الرئيسية.
            تأكد من صحة البيانات قبل التنفيذ. العمليات لا يمكن التراجع عنها.
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function SuperAdmin() {
  const [saAuthenticated, setSaAuthenticated] = useState(() => checkSASession());

  const handleSALogin = () => {
    setSASession();
    setSaAuthenticated(true);
  };

  const handleSALogout = () => {
    clearSASession();
    setSaAuthenticated(false);
  };

  return (
    <>
      <Helmet>
        <title>لوحة التحكم</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="description" content="لوحة التحكم" />
      </Helmet>

      <AdminAuthGate>
        {saAuthenticated ? (
          <SuperAdminDashboard onLogout={handleSALogout} />
        ) : (
          <SuperAdminLogin onSuccess={handleSALogin} />
        )}
      </AdminAuthGate>
    </>
  );
}
