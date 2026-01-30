"use client";
import { useState, Suspense } from "react"; // 1. Import Suspense
import { useSearchParams, useRouter } from "next/navigation";

// 2. Move your form logic into a sub-component
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [password, setPassword] = useState("");

  async function handleReset(e: any) {
    e.preventDefault();

    const form = new FormData();
    form.append("token", token || ""); // Use fallback for null
    form.append("new_password", password);

    // Update this URL to use your Render backend link or env variable!
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    await fetch(`${backendUrl}/reset-password`, {
      method: "POST",
      body: form,
    });

    router.push("/login");
  }

  return (
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
  );
}

// 3. The main Page component wraps the form in Suspense
export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<p>Loading reset form...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}