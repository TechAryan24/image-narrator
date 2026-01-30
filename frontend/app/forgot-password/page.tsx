"use client";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        throw new Error("Failed to send reset link");
      }

      setSent(true);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 via-white to-slate-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black px-4">

    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-700 p-8 rounded-2xl shadow-xl transition"
    >

      <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">
        Reset Password 🔐
      </h2>

      {sent ? (
        <p className="text-green-600 dark:text-green-400 text-center font-medium">
          Reset link sent to your email 📩
        </p>
      ) : (
        <>
          <input
            required
            type="email"
            placeholder="Enter registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="mt-5 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white p-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </>
      )}

    </form>
  </div>
);

}
