"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { analyzeImage, downloadBundle, saveToHistory } from "../services/api";
import { ProcessingStatus } from "../types";
import {
  Sparkles,
  Upload,
  Play,
  Pause,
  CheckCircle2,
  Loader2,
  Download,
  LogOut,
  History,
  Image as ImageIcon,
  Volume2,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "../components/Logo";

export default function Home() {
  // --- State Management ---
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // --- Data State ---
  const [transcript, setTranscript] = useState<string>("");
  const [objects, setObjects] = useState<string[]>([]);
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mode, setMode] = useState<"scene" | "detail">("scene");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const VOICE_OPTIONS = [
    { label: "English (US)", lang: "en", voice: "en-US-AriaNeural" },
    { label: "English (UK)", lang: "en", voice: "en-GB-SoniaNeural" },
    { label: "Hindi", lang: "hi", voice: "hi-IN-SwaraNeural" },
    { label: "Marathi", lang: "mr", voice: "mr-IN-AarohiNeural" },
    { label: "Spanish", lang: "es", voice: "es-ES-ElviraNeural" },
    { label: "French", lang: "fr", voice: "fr-FR-DeniseNeural" },
  ];

  const [selectedOption, setSelectedOption] = useState(VOICE_OPTIONS[0]);

  // --- 1. Check Login Status on Load ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // --- 2. Logout Handler ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.refresh();
  };

  const handleDownload = async () => {
    if (!file) return;
    try {
      await downloadBundle(
        file,
        transcript,
        objects,
        selectedOption.lang,
        selectedOption.voice,
      );
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  // --- Typewriter Animation ---
  useEffect(() => {
    if (status === "playing" && transcript) {
      let i = 0;
      setDisplayedText("");
      const timer = setInterval(() => {
        setDisplayedText((prev) => prev + transcript.charAt(i));
        i++;
        if (i >= transcript.length) clearInterval(timer);
      }, 25);
      return () => clearInterval(timer);
    }
  }, [status, transcript]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setStatus("idle");
      setTranscript("");
      setObjects([]);
      setDisplayedText("");
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setStatus("uploading");

    setTimeout(async () => {
      setStatus("analyzing");
      try {
        const { audioBlob, description, detectedObjects } = await analyzeImage(
          file,
          selectedOption.lang,
          selectedOption.voice,
          mode,
        );

        setTranscript(description);

        const token = localStorage.getItem("token");
        if (token && file) {
          saveToHistory(token, description, file).catch(console.error);
        }

        const uniqueObjects = Array.from(new Set(detectedObjects || []));
        setObjects(uniqueObjects);

        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        audio.onended = () => setIsPlaying(false);

        setStatus("playing");
        audio.play();
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }, 1000);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col selection:bg-primary/10">
      <div className="ambient-gradient" />

      {/* --- Premium Navbar (Matches Screenshot) --- */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-b border-border/50 z-[100] transition-colors">
        <div className="max-w-7xl mx-auto h-full flex justify-between items-center px-6 md:px-12">
          {/* --- Logo Section --- */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <Logo className="w-7 h-7 transition-transform group-hover:rotate-12" />
            <span className="text-sm font-black tracking-[0.2em] uppercase text-foreground">
              VisionVoice
            </span>
          </div>

          {/* --- Navigation Actions --- */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-8">
                <Link
                  href="/dashboard"
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all"
                >
                  Library
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-[#ff3b30] text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#e0352b] transition-all shadow-lg shadow-red-500/20"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link
                  href="/login"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] 
               text-slate-500 hover:text-primary transition-colors duration-200"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-primary to-indigo-600 
               text-white px-6 py-2 rounded-full text-[11px] font-bold 
               uppercase tracking-[0.18em] shadow-md 
               hover:shadow-lg hover:scale-[1.03] transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-12 pt-40 pb-24">
        {/* --- Hero Section (Matches Screenshot) --- */}
        <section className="text-center mb-24 animate-reveal">
          <h1 className="text-6xl md:text-[92px] font-black mb-8 tracking-tighter leading-[0.9] text-foreground">
            Turn your visuals <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#27272a] via-[#3f3f46] to-[#71717a] dark:from-white dark:to-white/40">
              into intelligent voice.
            </span>
          </h1>

          {/* --- Refined Paragraph with Strategic Highlighting --- */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed tracking-tight opacity-70">
            A high-performance neural engine designed to bridge the gap between
            <span className="text-foreground font-bold"> static imagery </span>
            and{" "}
            <span className="text-indigo-500 font-bold">
              {" "}
              semantic audio narratives.{" "}
            </span>
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            {/* Analyze Image - Common Primary Color */}
            <button
              onClick={() =>
                document
                  .getElementById("workspace")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-2.5 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 hover:scale-[1.03] active:scale-95 bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/25 hover:bg-[#4338ca] hover:shadow-indigo-500/40"
            >
              <Sparkles size={14} className="animate-pulse" />
              Analyze Image
            </button>

            {/* Get Started - Common Secondary Color */}
            <Link
              href="/signup"
              className="flex items-center gap-2.5 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 border border-slate-400/30 bg-slate-500/10 text-[#6366f1] backdrop-blur-sm hover:bg-slate-500/20 hover:border-slate-400/50"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* --- Main Workspace --- */}
        <div
          id="workspace"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start scroll-mt-32"
        >
          {/* Left: Input */}
          <div
            className="space-y-8 animate-reveal"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="card-premium aspect-square relative overflow-hidden group shadow-soft rounded-[2.5rem] border border-border/60 hover:border-primary/40 transition-all duration-500">
              <input
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 z-20 opacity-0 cursor-pointer"
                accept="image/*"
              />

              {/* Glow Gradient Background */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-transparent blur-xl" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all bg-muted/5 group-hover:bg-muted/10">
                {preview ? (
                  <div className="relative w-full max-w-sm aspect-[16/9] overflow-hidden rounded-2xl border border-border/40 shadow-inner bg-[#18181b] animate-fade-in">
                    <img
                      src={preview}
                      alt="Upload"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Glass Shine Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/5 pointer-events-none" />
                  </div>
                ) : (
                  <div className="space-y-5 py-3">
                    {/* Floating Upload Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto shadow-sm text-muted-foreground 
                        transition-all duration-300 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/50 animate-float"
                    >
                      <Upload size={24} strokeWidth={1.4} />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold tracking-tight group-hover:text-primary transition">
                        Click to upload image
                      </p>

                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.22em] font-bold group-hover:text-indigo-400 transition">
                        Smart Image Input
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {preview && (
              <div className="space-y-6 animate-reveal">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
                      Synthesis Voice
                    </label>
                    <select
                      className="h-12 border-border/60 bg-muted/20 font-bold text-[10px] uppercase tracking-widest rounded-2xl"
                      onChange={(e) => {
                        const selected = VOICE_OPTIONS.find(
                          (opt) => opt.voice === e.target.value,
                        );
                        if (selected) setSelectedOption(selected);
                      }}
                      value={selectedOption.voice}
                    >
                      {VOICE_OPTIONS.map((opt) => (
                        <option key={opt.voice} value={opt.voice}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
                      Analysis Mode
                    </label>
                    <div className="flex bg-muted/20 p-1.5 rounded-2xl h-12 border border-border/60">
                      <button
                        onClick={() => setMode("scene")}
                        className={`flex-1 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${mode === "scene" ? "bg-[#4f46e5] text-white shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Scene
                      </button>
                      <button
                        onClick={() => setMode("detail")}
                        className={`flex-1 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${mode === "detail" ? "bg-[#4f46e5] text-white shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={status === "analyzing" || status === "uploading"}
                  className="relative overflow-hidden w-full h-16 rounded-[2rem] bg-[#18181b] text-white text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 group hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 border border-white/10"
                >
                  {/* Glossy overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Shimmer line */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                  <div className="relative flex items-center justify-center gap-3">
                    {status === "uploading" || status === "analyzing" ? (
                      <div className="flex items-center gap-3">
                        <Loader2
                          className="animate-spin text-indigo-400"
                          size={18}
                          strokeWidth={3}
                        />
                        <span className="animate-pulse tracking-[0.4em] opacity-80">
                          Syncing
                        </span>
                      </div>
                    ) : (
                      <>
                        <Sparkles
                          size={18}
                          className="transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 text-indigo-300"
                        />
                        <span className="tracking-[0.3em]">
                          Analyze & Speak
                        </span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Right: Output */}
          <div
            className="min-h-[500px] animate-reveal"
            style={{ animationDelay: "0.2s" }}
          >
            {status === "idle" && (
              <div className="h-full border border-dashed border-border flex flex-col items-center justify-center p-12 text-center space-y-8 rounded-[3rem] bg-muted/5">
                <div className="p-6 rounded-[2rem] bg-background border border-border shadow-soft text-muted-foreground/40">
                  <Sparkles size={40} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em]">
                    Inference Pipeline Idle
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                    Upload imagery to initiate the real-time AI processing
                    stream.
                  </p>
                </div>
              </div>
            )}

            {(status === "uploading" || status === "analyzing") && (
              <div className="h-full card-premium p-12 space-y-12 shadow-premium rounded-[3rem]">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    <Loader2
                      size={24}
                      className="animate-spin"
                      strokeWidth={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold tracking-tight">
                      Neural Computation
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.2em]">
                        Active Pipeline
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <StepIndicator
                    status={status === "uploading" ? "active" : "done"}
                    label="Imagery transmission"
                  />
                  <StepIndicator
                    status={status === "uploading" ? "pending" : "active"}
                    label="Semantic synthesis"
                  />
                  <StepIndicator status="pending" label="Audio generation" />
                </div>
              </div>
            )}

            {status === "playing" && (
              <div className="space-y-8 animate-fade-in">
                <div className="card-premium p-8 flex items-center justify-between shadow-soft border-primary/10 rounded-[2rem]">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={toggleAudio}
                      className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-primary-foreground shadow-premium hover:scale-105 active:scale-95 transition-all"
                    >
                      {isPlaying ? (
                        <Pause size={28} fill="currentColor" />
                      ) : (
                        <Play size={28} fill="currentColor" className="ml-1" />
                      )}
                    </button>
                    <div className="space-y-1">
                      <p className="text-sm font-bold tracking-tight">
                        Narration Engine
                      </p>
                      <div className="flex items-center gap-1.5 h-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`w-0.5 bg-primary rounded-full transition-all duration-300 ${isPlaying ? "animate-pulse h-full" : "h-1.5 opacity-30"}`}
                          ></div>
                        ))}
                        <span className="text-[10px] font-bold text-muted-foreground uppercase ml-3 tracking-[0.2em]">
                          {selectedOption.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                  >
                    <Download size={22} />
                  </button>
                </div>

                <div className="card-premium p-12 min-h-[340px] relative overflow-hidden shadow-premium rounded-[3rem] border-primary/5">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
                  <div className="relative space-y-10">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                      <Volume2 size={14} className="text-primary" /> Synthesized
                      Insight
                    </div>
                    <p className="text-2xl md:text-3xl font-medium leading-[1.4] text-foreground/90 tracking-tight">
                      {displayedText}
                      <span className="inline-block w-2 h-8 bg-primary ml-2.5 rounded-full animate-pulse align-middle" />
                    </p>

                    {objects.length > 0 && (
                      <div className="pt-10 border-t border-border mt-10 flex flex-wrap gap-2.5">
                        {objects.map((tag, i) => (
                          <span
                            key={i}
                            className="px-4 py-1.5 bg-secondary text-secondary-foreground text-[9px] font-bold uppercase tracking-[0.2em] rounded-full border border-border/50 shadow-soft"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-10 mt-20 grayscale opacity-50 contrast-125">
        <div className="flex items-center gap-3">
          <Logo className="w-5 h-5 opacity-40" />
          <span className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] uppercase">
            VisionVoice AI • 2026
          </span>
        </div>
        <div className="flex gap-10">
          {["Inference", "Security", "Library", "Neural"].map((item) => (
            <span
              key={item}
              className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
            >
              {item}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}

const StepIndicator = ({
  status,
  label,
}: {
  status: "pending" | "active" | "done";
  label: string;
}) => {
  return (
    <div
      className={`flex items-center gap-5 transition-all duration-500 ${status === "pending" ? "opacity-20 blur-[1px]" : "opacity-100"}`}
    >
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${status === "done" ? "bg-primary border-primary text-primary-foreground shadow-lg" : status === "active" ? "border-primary text-primary shadow-premium" : "border-border"}`}
      >
        {status === "done" ? (
          <CheckCircle2 size={18} strokeWidth={3} />
        ) : (
          <div
            className={`w-2.5 h-2.5 rounded-full ${status === "active" ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
          />
        )}
      </div>
      <p
        className={`text-sm font-bold tracking-tight ${status === "active" ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </p>
    </div>
  );
};
