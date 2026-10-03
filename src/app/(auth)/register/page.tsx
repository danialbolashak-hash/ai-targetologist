"use client";

import { useState } from "react";
import Link from "next/link";
import { Target, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const supabase = createClientComponentClient();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is ON, there is no session yet
    if (!data.session) {
      setInfo("Аккаунт создан! Подтвердите email по ссылке в письме, затем войдите.");
      setLoading(false);
      return;
    }

    // Session active → create DB user and go to onboarding
    await fetch("/api/auth/sync", { method: "POST" });
    window.location.href = "/onboarding";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#7C3AED] opacity-[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-[#00D4FF] opacity-[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#00D4FF] flex items-center justify-center">
            <Target className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-lg text-white">AI Targetologist</span>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Начать бесплатно</h1>
          <p className="text-sm text-muted-foreground mb-2">14 дней без ограничений, без карты</p>

          <div className="flex items-center gap-4 mb-6">
            {["Без карты", "14 дней free", "Отмена 1 клик"].map((f, i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-[#00FF88]">
                <CheckCircle className="w-3 h-3" />
                {f}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-xs text-red-400">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-xs text-[#10B981]">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Имя</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ваше имя"
                required
                className="w-full bg-white/[0.04] border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
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
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Минимум 8 символов"
                  required
                  minLength={8}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-neon flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Создание аккаунта..." : "Создать аккаунт бесплатно"}
            </button>
          </form>

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Регистрируясь, вы соглашаетесь с{" "}
            <a href="#" className="text-[#00D4FF] hover:text-white transition-colors">Условиями</a> и{" "}
            <a href="#" className="text-[#00D4FF] hover:text-white transition-colors">Политикой конфиденциальности</a>
          </p>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-[#00D4FF] hover:text-white transition-colors">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
