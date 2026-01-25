'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/api';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.access_token);
      router.push('/'); // Redirect to Home
    } catch (err) {
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center text-slate-800">Welcome Back</h1>
        <input 
          type="email" placeholder="Email" 
          className="w-full p-3 border rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full p-3 border rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
          Login
        </button>
        <p className="text-center text-sm">
          Don't have an account? <Link href="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </form>
    </div>
  );
}