"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { loginUser, verifyUserCredentials } from "@/lib/auth";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Simulate minor network delay for feedback
    setTimeout(() => {
      try {
        const user = verifyUserCredentials(phone, password);

        if (!user) {
          setError("Invalid phone number or password.");
          setIsLoading(false);
          return;
        }
        
        loginUser(user);
        toast.success("Welcome back! Login successful.");
        
        // Use a robust full page load to completely synchronize auth states across all layouts
        window.location.href = redirect;
      } catch (err) {
        console.error("Login submission error:", err);
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-mint-900/5 border border-mint-200 max-w-md w-full">
      <h1 className="text-2xl font-bold text-mint-900 mb-2 text-center">Welcome Back</h1>
      <p className="text-mint-700 text-center mb-8 text-sm">Log in to your GreenMart account</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-mint-850 mb-1">Phone Number</label>
          <input 
            type="tel" 
            required 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            disabled={isLoading}
            className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-55" 
            placeholder="+1 (555) 000-0000" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-mint-850 mb-1">Password</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-55" 
            placeholder="••••••••" 
          />
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        
        <div className="flex items-center justify-between py-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="accent-mint-600" disabled={isLoading} />
            <span className="text-sm text-mint-700">Remember me</span>
          </label>
          <Link href="/support" className="text-sm font-bold text-mint-700 hover:text-mint-900 hover:underline">Forgot Password?</Link>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-mint-700 hover:bg-mint-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center h-12 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      
      <p className="text-center text-sm text-mint-700 mt-6">
        Don&apos;t have an account? <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-mint-700 hover:text-mint-900 hover:underline">Sign Up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-mint-50/30">
        <Suspense fallback={
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-mint-900/5 border border-mint-200 max-w-md w-full flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-mint-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-mint-700 mt-4 font-medium">Loading form...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
