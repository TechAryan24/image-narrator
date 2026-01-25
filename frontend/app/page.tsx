"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import router for logout redirect
import { analyzeImage, downloadBundle, saveToHistory } from "@/services/api";
import { ProcessingStatus } from "@/types";
import {
  Sparkles,
  Upload,
  Play,
  Pause,
  CheckCircle2,
  Loader2,
  Circle,
  Image as ImageIcon,
  Tag,
  Layers,
  Zap,
  Download,
  LogOut, // Import LogOut icon
  History // Import History icon
} from "lucide-react";

export default function Home() {
  // --- State Management ---
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  
  // --- Auth State (NEW) ---
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
    { label: "🇺🇸 English (US)", lang: "en", voice: "en-US-AriaNeural" },
    { label: "🇬🇧 English (UK)", lang: "en", voice: "en-GB-SoniaNeural" },
    { label: "🇮🇳 English (India)", lang: "en", voice: "en-IN-PrabhatNeural" },
    { label: "🇮🇳 Hindi", lang: "hi", voice: "hi-IN-SwaraNeural" },
    { label: "🇮🇳 Marathi", lang: "mr", voice: "mr-IN-AarohiNeural" },
    { label: "🇫🇷 French", lang: "fr", voice: "fr-FR-DeniseNeural" },
    { label: "🇪🇸 Spanish", lang: "es", voice: "es-ES-ElviraNeural" },
  ];

  const [selectedOption, setSelectedOption] = useState(VOICE_OPTIONS[0]);

  // --- 1. Check Login Status on Load ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // !! converts string to boolean (true if token exists)
  }, []);

  // --- 2. Logout Handler ---
  const handleLogout = () => {
    localStorage.removeItem("token"); // Delete the key
    setIsLoggedIn(false); // Update UI
    router.refresh(); // Optional: Refresh page to clear any old state
  };

  const handleDownload = async () => {
    if (!file) return;
    try {
      await downloadBundle(
        file,
        transcript,
        objects,
        selectedOption.lang,
        selectedOption.voice
      );
    } catch (e) {
      console.error("Download failed", e);
      alert("Download failed. Please try again.");
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
      }, 40);
      return () => clearInterval(timer);
    }
  }, [status, transcript]);

  // --- Handle Image Selection ---
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

  // --- Main Processing Function ---
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
          mode
        );

        setTranscript(description);

       const token = localStorage.getItem("token");
        if (token && file) { // Check for file
          // CHANGE: Passing 'file' object, not 'file.name'
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
        alert("Failed to process image. Ensure backend is running.");
      }
    }, 1500);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
  };

  return (
    <div className="min-h-screen p-8 md:p-12 font-sans selection:bg-blue-100 text-slate-900">
      
      {/* --- Navbar --- */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Sparkles size={20} fill="currentColor" />
          </div>
          VisionVoice <span className="text-blue-600">AI</span>
        </div>

        {/* --- DYNAMIC NAVBAR BUTTONS --- */}
        <div className="flex gap-4 items-center">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 px-4 py-2 transition-colors"
              >
                <History size={18} /> History
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold border border-red-100 hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* --- Main Content Grid --- */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Column: Hero & Upload Area */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
              Hear What Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Images Say.
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-md">
              Upload any image. AI analyzes the visual content and narrates a detailed story instantly.
            </p>
          </div>

          {/* Upload Card */}
          <div className="group relative bg-white p-2 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 transition-all hover:shadow-2xl">
            <div className={`relative h-80 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
              ${preview ? "border-transparent bg-slate-900" : "border-slate-200 bg-slate-50 group-hover:bg-blue-50/30 group-hover:border-blue-300"}`}
            >
              <input
                type="file"
                onChange={handleFileSelect}
                className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                accept="image/*"
              />

              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="text-center space-y-4 p-6">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-blue-500">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-700">Drag & Drop your image</p>
                    <p className="text-sm text-slate-400">or click to browse</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- SETTINGS AREA --- */}
          {preview && status === "idle" && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
              {/* Voice Selector */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <span className="font-bold text-slate-600 pl-2">Select Voice:</span>
                <select
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none font-medium"
                  onChange={(e) => {
                    const selected = VOICE_OPTIONS.find((opt) => opt.voice === e.target.value);
                    if (selected) setSelectedOption(selected);
                  }}
                  value={selectedOption.voice}
                >
                  {VOICE_OPTIONS.map((opt) => (
                    <option key={opt.voice} value={opt.voice}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 relative">
                <button
                  onClick={() => setMode("scene")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative z-10 
                  ${mode === "scene" ? "bg-white text-blue-600 shadow-md shadow-slate-200/50" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Zap size={16} className={mode === "scene" ? "fill-blue-600" : ""} />
                  Quick Scene
                </button>
                <button
                  onClick={() => setMode("detail")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative z-10 
                  ${mode === "detail" ? "bg-white text-blue-600 shadow-md shadow-slate-200/50" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <Layers size={16} />
                  Full Detail
                </button>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {preview && (status === "idle" || status === "error") && (
            <button
              onClick={handleProcess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Sparkles size={20} /> Analyze & Speak
            </button>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="relative min-h-[500px]">
          {(status === "uploading" || status === "analyzing") && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 space-y-6 animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing</span>
              </div>
              <StepItem status={status === "uploading" ? "current" : "done"} label="Uploading Image" />
              <StepItem status={status === "uploading" ? "waiting" : "current"} label="Analyzing Visual Content" />
              <StepItem status="waiting" label="Generating Description" />
              <StepItem status="waiting" label="Synthesizing Audio" />
            </div>
          )}

          {status === "playing" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <button onClick={toggleAudio} className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
                      {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                    </button>
                    <div>
                      <div className="text-sm font-bold text-slate-900">AI Narration</div>
                      <div className="text-xs text-slate-400 font-medium">Auto-Play</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-sm font-bold transition-all border border-slate-200 hover:border-blue-200" title="Download Results (Zip)">
                      <Download size={18} />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    <div className="flex gap-1 items-end h-8">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${isPlaying ? "animate-wave" : "h-1"}`} style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="notebook-lines min-h-[150px] text-lg text-slate-600 leading-10">
                  {displayedText}
                  <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
                </div>
              </div>
              {objects && objects.length > 0 && (
                <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Tag size={14} /> Detected Objects
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {objects.map((obj, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full border border-blue-100 shadow-sm transition-transform hover:scale-105 cursor-default">
                        <Sparkles size={12} className="text-blue-400" />
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "idle" && (
            <div className="hidden lg:flex items-center justify-center h-[500px] bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
              <div className="text-center text-slate-400">
                <ImageIcon size={64} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">Result will appear here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Helper Component ---
const StepItem = ({ status, label }: { status: "waiting" | "current" | "done"; label: string }) => {
  const isDone = status === "done";
  const isCurrent = status === "current";
  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isCurrent ? "bg-blue-50 border border-blue-100" : "opacity-60"}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDone ? "bg-green-500 text-white" : isCurrent ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-400"}`}>
        {isDone ? <CheckCircle2 size={16} /> : isCurrent ? <Loader2 size={16} className="animate-spin" /> : <Circle size={16} />}
      </div>
      <span className={`font-bold ${isCurrent ? "text-blue-900" : "text-slate-500"}`}>{label}</span>
    </div>
  );
};