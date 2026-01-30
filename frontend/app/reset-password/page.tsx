"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPassword() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");

  async function handleReset(e: any) {
    e.preventDefault();

    const form = new FormData();
    form.append("token", token!);
    form.append("new_password", password);

    await fetch("http://localhost:8000/reset-password", {
      method: "POST",
      body: form
    });

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleReset} className="card-premium p-8 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Create New Password</h2>

        <input
          required
          type="password"
          placeholder="New password"
          className="w-full p-3 rounded-lg border"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="mt-4 w-full bg-primary p-3 rounded-lg">
          Reset Password
        </button>
      </form>
    </div>
  );
}
