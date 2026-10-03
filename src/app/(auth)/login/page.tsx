"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, Loader2, Eye, EyeOff } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message === "Invalid login credentials" ? "Неверный email или пароль" : signInError.message);
      setLoading(false);
      return;
    }

    // Sync DB user + update lastLogin
    await fetch("/api/auth/sync", { method: "POST" });
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#00D4FF] opacity-[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[#7C3AED] opacity-[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#00D4FF] flex items-center justify-center">
            <Target className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-lg text-white">AI Targetologist</span>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Добро пожаловать</h1>
          <p className="text-sm text-muted-foreground mb-6">Войдите в ваш аккаунт</p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Пароль</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <a href="#" className="text-xs text-[#00D4FF] hover:text-white transition-colors">
                Забыли пароль?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-neon flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-[#00D4FF] hover:text-white transition-colors">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
