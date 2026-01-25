"use client";
import { useEffect, useState } from "react";
import { fetchHistory } from "@/services/api";
import { useRouter } from "next/navigation";
import { Calendar, ExternalLink, ImageIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

interface HistoryItem {
  id: number;
  image_name: string;
  description: string;
  timestamp: string;
  image_data?: string; // Field containing the Base64 image
}

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchHistory(token)
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      
      {/* --- Header --- */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-400 text-xs font-medium">Welcome back, User</p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
             Back to Scanner <ArrowRight size={14} className="rotate-180" />
          </Link>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Section Title */}
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 w-1.5 h-6 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-800">Recent Analysis</h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-200 rounded-[2rem]"></div>
            ))}
          </div>
        ) : history.length === 0 ? (
          // Empty State
          <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
               <ImageIcon size={32} />
            </div>
            <h3 className="text-slate-800 font-bold text-lg">No history yet</h3>
            <p className="text-slate-400 text-sm mb-6">Your scanned images will appear here.</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              Start Scanning
            </Link>
          </div>
        ) : (
          // History Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {history.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- Card Component ---
const HistoryCard = ({ item }: { item: HistoryItem }) => {
  // Format Date (e.g., "25/01/2026")
  const dateObj = new Date(item.timestamp);
  const date = dateObj.toLocaleDateString("en-GB"); 

  // Truncate title for clean look
  const cleanTitle = item.image_name.length > 25 
    ? item.image_name.substring(0, 22) + "..." 
    : item.image_name;

  return (
    <div className="group bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-stretch gap-5 h-full">
      
      {/* 1. Image Area (Left Side) */}
      <div className="w-32 h-32 md:w-40 md:h-full min-h-[140px] flex-shrink-0 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 relative overflow-hidden border border-slate-100">
         {item.image_data ? (
           // If image data exists, show the photo
           <img 
             src={`data:image/jpeg;base64,${item.image_data}`} 
             alt={item.image_name}
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
           />
         ) : (
           // Fallback placeholder
           <ImageIcon size={40} />
         )}
      </div>

      {/* 2. Content Area (Right Side) */}
      <div className="flex-1 flex flex-col justify-between py-1 pr-2">
        <div>
          {/* Date */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
            <Calendar size={12} />
            {date}
          </div>

          {/* Title */}
          <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
            {cleanTitle}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Buttons / Footer */}
        <div className="flex items-center justify-between mt-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-md shadow-blue-100">
            View Details
          </button>
          
          <button className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
            Full Details <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};