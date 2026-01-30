"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../services/api";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import Logo from "../../components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center px-6 overflow-hidden">

      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.06),transparent_55%)]" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[40rem] h-[40rem] bg-indigo-500/10 blur-[160px] rounded-full" />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 px-10 py-6 flex justify-between z-50">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={16} />
          <span className="text-[11px] font-semibold tracking-wide">Back</span>
        </button>
        <ThemeToggle />
      </nav>

      {/* Main */}
      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-3xl bg-muted/40 border border-border/60 shadow-md hover:scale-105 transition">
              <Logo className="w-11 h-11" />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
            Welcome Back
          </h1>

          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Sign in to continue using VisionVoice
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[2.5rem] border border-border/60 bg-card/60 backdrop-blur-xl shadow-2xl p-10 relative overflow-hidden">

          <div className="absolute -top-32 right-[-8rem] w-72 h-72 bg-indigo-500/10 blur-[140px] rounded-full" />

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Email Address</label>
              <div className="relative mt-2">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />

                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-14 !pl-16 pr-4 rounded-2xl bg-muted/20 border border-border/60 
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition outline-none"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[11px] font-semibold text-muted-foreground">Password</label>

                <Link
                  href="/forgot-password"
                  className="text-[11px] text-muted-foreground hover:text-indigo-500 transition"
                >
                  Forgot?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />

                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-14 !pl-16 !pr-16 rounded-2xl bg-muted/20 border border-border/60 
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition outline-none"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-semibold tracking-wide 
                         transition hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <Sparkles size={16} className="text-indigo-400" />
                </>
              )}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-10 text-center text-sm text-muted-foreground">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-foreground hover:text-indigo-500 font-medium underline underline-offset-4">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Security */}
        <p className="text-center mt-10 text-[11px] tracking-wide uppercase text-muted-foreground/50">
          SSL Secured · Privacy Protected
        </p>
      </div>
    </div>
  );
}
