'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupUser } from '@/services/api';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signupUser(email, password);
      alert('Account created! Please login.');
      router.push('/login');
    } catch (err) {
      alert('Signup failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-2xl shadow-xl w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center text-slate-800">Create Account</h1>
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
        <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-bold">
          Sign Up
        </button>
        <p className="text-center text-sm">
          Already have an account? <Link href="/login" className="text-blue-600">Login</Link>
        </p>
      </form>
    </div>
  );
}