"use client";

import { useEffect, useState } from "react";
import {
  fetchHistory,
  fetchUserProfile,
  deleteHistory,
} from "../../services/api";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Trash2,
  ImageIcon,
  ArrowRight,
  User as UserIcon,
  LogOut,
  Clock,
  Sparkles,
  ChevronRight,
  Search,
  X,
  Download,
  FileText,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../../components/ThemeToggle";
import Logo from "../../components/Logo";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryItem {
  id: number;
  image_name: string;
  description: string;
  timestamp: string;
  image_data?: string;
}

export default function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userName, setUserName] = useState("Member");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchUserProfile(token)
      .then((res: any) => setUserName(res.data.name || "Member"))
      .catch(console.error);

    fetchHistory(token)
      .then((res: any) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!confirm("Are you sure you want to delete this Insight?")) return;

    try {
      await deleteHistory(token, id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredHistory = history.filter(
    (item) =>
      item.image_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="ambient-gradient" />

      {/* --- Minimalist Dashboard Nav --- */}
      <nav className="fixed top-0 left-0 right-0 h-16 glass z-[100]">
        <div className="max-w-6xl mx-auto h-full flex justify-between items-center px-6">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <Logo className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded-full border border-border/50">
              <div className="w-5 h-5 bg-background rounded-full border border-border flex items-center justify-center">
                <UserIcon size={10} className="text-muted-foreground" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                {userName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold bg-red-500 text-white px-4 py-1.5 rounded-full hover:bg-red-600 transition-all uppercase tracking-widest shadow-sm shadow-red-500/20"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-32 pb-24">
        {/* --- Header & Search --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-reveal">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Library</h2>
            <p className="text-sm text-muted-foreground">
              Manage and review your neural inference records.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40"
                size={14}
              />
              <input
                type="text"
                placeholder="Search library..."
                className="w-full h-8 !pl-10 pr-4 h-10 border-border/60 text-xs font-medium bg-background/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link
              href="/"
              className="btn-primary h-10 whitespace-nowrap rounded-lg px-6 font-bold uppercase tracking-widest text-[10px]"
            >
              New Scans
            </Link>
          </div>
        </div>

        {/* --- Content --- */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 card-premium animate-pulse bg-muted/10 border-dashed"
              />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-border rounded-[2.5rem] bg-muted/5 opacity-60">
            <div className="p-5 w-16 h-16 mx-auto bg-background rounded-2xl border border-border/50 shadow-soft mb-6 flex items-center justify-center text-muted-foreground">
              <FileText size={24} strokeWidth={1} />
            </div>
            <p className="text-sm font-medium">No results found.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try refining your search or create a new scan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredHistory.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  onView={() => setSelectedItem(item)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* --- Refined Detail Modal --- */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 md:px-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-lg"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-[2rem] 
                   border border-border/50 bg-card/70 backdrop-blur-xl shadow-premium 
                   flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full 
                     bg-background/40 hover:bg-background/90 backdrop-blur 
                     border border-border/40 flex items-center justify-center 
                     transition hover:scale-105"
              >
                <X size={18} />
              </button>

              {/* Image Section */}
              <div className="flex-1 min-h-[240px] bg-muted/30 relative overflow-hidden">
                {selectedItem.image_data ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedItem.image_data}`}
                    alt={selectedItem.image_name}
                    className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground/30">
                    <ImageIcon size={52} />
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Content Section */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col bg-background/50">
                {/* Header */}
                <div className="mb-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-800 mb-3">
                    Neural Synthesis Record
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-3">
                    {selectedItem.image_name}
                  </h2>

                  <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground">
                    {new Date(selectedItem.timestamp).toLocaleDateString(
                      undefined,
                      {
                        dateStyle: "long",
                      },
                    )}
                  </p>
                </div>

                {/* Description */}
                <div className="flex-1">
                  <p className="text-base md:text-lg leading-relaxed italic text-foreground/85 max-w-prose">
                    "{selectedItem.description}"
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-12 pt-8 border-t border-border flex gap-3">
                  <button
                    className="flex-1 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black 
                               text-[11px] font-black uppercase tracking-[0.3em] 
                               hover:scale-[1.02] transition shadow-soft"
                  >
                    Download Bundle
                  </button>

                  <button
                    onClick={(e) => handleDelete(e as any, selectedItem.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl 
                         bg-muted/50 hover:bg-destructive hover:text-destructive-foreground 
                         transition border border-border"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const HistoryCard = ({
  item,
  onDelete,
  onView,
}: {
  item: HistoryItem;
  onDelete: (e: React.MouseEvent, id: number) => void;
  onView: () => void;
}) => {
  const date = new Date(item.timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={onView}
      className="group relative overflow-hidden rounded-[1.8rem] border border-border/50 
             bg-card/60 backdrop-blur-xl shadow-soft hover:shadow-premium 
             transition-all duration-300 flex flex-col h-[340px] cursor-pointer"
    >
      {/* Image Section */}
      <div className="h-44 w-full relative overflow-hidden bg-muted/30">
        {item.image_data ? (
          <img
            src={`data:image/jpeg;base64,${item.image_data}`}
            alt={item.image_name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground/30">
            <ImageIcon size={34} />
          </div>
        )}

        {/* Soft overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 pointer-events-none" />

        {/* Date Tag */}
        <div
          className="absolute top-4 left-4 px-3 py-1 bg-background/70 backdrop-blur-md 
                    rounded-lg text-[9px] font-black uppercase tracking-widest border border-border/40 shadow-soft"
        >
          {date}
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => onDelete(e, item.id)}
          className="absolute top-4 right-4 p-2 rounded-lg bg-background/60 backdrop-blur-md 
                 hover:bg-destructive hover:text-destructive-foreground transition-all 
                 opacity-0 group-hover:opacity-100 shadow-soft"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-sm font-extrabold tracking-tight mb-2 line-clamp-1 text-foreground">
          {item.image_name}
        </h3>

        {/* Description */}
        <p
          className="text-xs text-muted-foreground leading-relaxed italic line-clamp-3 
                  opacity-70 group-hover:opacity-100 transition-opacity flex-1"
        >
          "{item.description}"
        </p>

        {/* Footer */}
        <div
          className="pt-4 mt-auto border-t border-border/40 flex items-center justify-between 
                    text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          <span className="group-hover:text-foreground transition-colors">
            Explore Analysis
          </span>

          <ArrowRight
            size={14}
            className="group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </motion.div>
  );
};
