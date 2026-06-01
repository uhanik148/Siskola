'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Eye, EyeOff, Loader2, KeyRound, UserCircle2, ArrowRight, BookOpen, Calculator, Pencil, GraduationCap, Globe, Heart } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Username atau password tidak valid');
        return;
      }

      // Direct navigation — faster than router.push + refresh (avoids double navigation)
      window.location.href = '/dashboard';
    } catch {
      setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-slate-50 selection:bg-indigo-100">
      {/* 1. Geometric Dot Grid Pattern (Modern & Visible) */}
      <div
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#4f46e5 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 2. Soft Gradient Blobs for Depth */}
      <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-purple-200/40 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-indigo-200/40 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000" />

      {/* 2. Floating Educational Icons (Elemen Dekoratif) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Kiri Atas - Buku */}
        <div className="absolute top-10 left-10 animate-float-slow opacity-20 transform -rotate-12">
          <BookOpen className="w-32 h-32 text-indigo-500" strokeWidth={1.5} />
        </div>

        {/* Kanan Bawah - Kalkulator */}
        <div className="absolute bottom-10 right-10 animate-float-slower opacity-20 transform rotate-12">
          <Calculator className="w-40 h-40 text-purple-500" strokeWidth={1} />
        </div>

        {/* Kanan Atas - Globe */}
        <div className="absolute top-20 right-20 animate-float opacity-10 transform -rotate-6">
          <Globe className="w-24 h-24 text-teal-500" strokeWidth={1.5} />
        </div>

        {/* Kiri Bawah - Pensil */}
        <div className="absolute bottom-32 left-20 animate-float-reverse opacity-10 transform rotate-45">
          <Pencil className="w-28 h-28 text-orange-500" strokeWidth={1.5} />
        </div>

        {/* Tengah Atas - Topi Wisuda */}
        <div className="absolute top-10 left-1/2 -ml-16 animate-pulse-slow opacity-10">
          <GraduationCap className="w-16 h-16 text-slate-500" strokeWidth={1.5} />
        </div>

        {/* Tambahan: Shape Absrak Blur */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      {/* Main Container */}
      <div className="w-full flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex min-h-[600px] border border-white/50 ring-1 ring-white/50">
          {/* Left Side - Visual & Info (SIMPLIFIED) */}
          <div className="hidden lg:flex flex-col justify-end w-1/2 relative overflow-hidden bg-[#0f172a] group">
            {/* Background Image */}
            <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
              <img src="/images/imagess.jpg" alt="Siswa SD Belajar" className="w-full h-full object-cover opacity-90" />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/30 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/60 to-transparent"></div>
            </div>

            {/* Simple Content: Title & Description Only */}
            <div className="relative z-10 p-12 pb-16">
              {/* Decorative Accent */}
              <div className="w-12 h-1.5 bg-indigo-500 rounded-full mb-8 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>

              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-xl">
                {APP_CONFIG.name}
                <span className="text-indigo-400 animate-pulse">.</span>
              </h1>

              <p className="text-slate-200 text-lg font-light leading-relaxed max-w-sm drop-shadow-md">{APP_CONFIG.description}</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 xl:p-16 flex flex-col justify-center bg-white relative">
            {/* Decorative Top Right */}
            <div className="absolute top-0 right-0 p-6 pointer-events-none">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
            </div>

            <div className="max-w-md mx-auto w-full space-y-8 relative z-10">
              <div className="text-center lg:text-left space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-600/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang</h2>
                <p className="text-slate-500">Silakan masuk untuk mengakses dashboard guru & staf.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-fade-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mb-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Username / NIP</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <UserCircle2 className="w-5 h-5" />
                    </div>
                    <input
                      {...register('username')}
                      type="text"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                      placeholder="Masukkan ID Pengguna"
                    />
                  </div>
                  {errors.username && <p className="text-xs font-medium text-red-500 ml-1">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                    <button
                      type="button"
                      onClick={() => toast.info('Reset Password', { description: 'Silakan hubungi Administrator Sekolah atau Bagian IT untuk melakukan reset password anda.' })}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none"
                    >
                      Lupa password?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-700/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Masuk Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Developer Credit Footer */}
              <div className="text-center pt-8 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Developed by</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">TK Dharma Wanita Karangsono</p>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[280px] mx-auto">Sistem Informasi TK Dharma Wanita Karangsono yang dirancang untuk memudahkan 
pengelolaan administrasi, data akademik, dan layanan sekolah secara cepat, 
aman, dan terintegrasi.</p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <a
                    href="mailto:uhanik2@gmail.com"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all text-xs font-medium shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    Gmail
                  </a>
                  <a
                    href="https://wa.me/6285785491116"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all text-xs font-medium shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
                <p className="text-[10px] text-slate-300 pt-2">
                  &copy; {new Date().getFullYear()} {APP_CONFIG.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
