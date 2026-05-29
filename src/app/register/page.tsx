"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { findUserByPhone, registerUser } from "@/lib/auth";
import { User } from "@/lib/types";
import { sendVerificationEmail } from "@/lib/emailService";
import { generateVerificationCode, storeVerificationCode, verifyCode } from "@/lib/verification";
import toast from "react-hot-toast";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/";

  const [step, setStep] = useState<"register" | "verify">("register");
  
  // Registration Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Verification States
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSentCode, setVerificationSentCode] = useState("");
  
  // Operational States
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push("Minimum 8 characters");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("At least one uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("At least one lowercase letter");
    }
    if (!/\d/.test(pwd)) {
      errors.push("At least one number");
    }
    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password strength
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) {
      setError(`Password must have: ${pwdCheck.errors.join(", ")}`);
      return;
    }

    // Confirm passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Check if account already exists
    if (findUserByPhone(phone)) {
      setError("An account already exists for this phone number.");
      return;
    }

    setIsLoading(true);

    try {
      // Generate and store verification code
      const code = generateVerificationCode();
      setVerificationSentCode(code);
      storeVerificationCode(email, code);

      // Simulate sending mock verification email
      const emailSent = await sendVerificationEmail(email, code);
      if (emailSent) {
        toast.success(`Verification code sent to ${email}`);
        setStep("verify");
      } else {
        setError("Failed to send verification email. Please try again.");
      }
    } catch (err) {
      console.error("Register trigger error:", err);
      setError("Failed to process registration request.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (verificationCode.length !== 6) {
      setError("Verification code must be exactly 6 digits.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const codeMatches = verifyCode(email, verificationCode);

      if (!codeMatches) {
        setError("Invalid or expired verification code.");
        setIsLoading(false);
        return;
      }

      // Create new verified user
      const mockUser: User = {
        id: `usr-${crypto.randomUUID()}`,
        firstName,
        lastName,
        phone,
        email,
        emailVerified: true,
        password, // Hashed in registerUser() inside src/lib/auth.ts
        addresses: []
      };

      try {
        registerUser(mockUser);
        toast.success("Account verified & created successfully!");
        
        // Use robust window.location.href to fully refresh and synchronize state
        window.location.href = redirect;
      } catch (err) {
        console.error("User registration storage error:", err);
        setError("Failed to save user account. Please try again.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-mint-900/5 border border-mint-200 max-w-md w-full">
      {step === "register" ? (
        <>
          <h1 className="text-2xl font-bold text-mint-900 mb-2 text-center">Create an Account</h1>
          <p className="text-mint-700 text-center mb-8 text-sm">Join GreenMart today</p>
          
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-mint-850 mb-1">First Name</label>
                <input 
                  type="text" 
                  required 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  disabled={isLoading}
                  className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-55" 
                  placeholder="Jane" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-mint-850 mb-1">Last Name</label>
                <input 
                  type="text" 
                  required 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  disabled={isLoading}
                  className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-55" 
                  placeholder="Doe" 
                />
              </div>
            </div>
            
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
              <label className="block text-sm font-medium text-mint-850 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full border border-mint-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-55" 
                placeholder="jane.doe@example.com" 
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
              <p className="text-xs text-mint-600 mt-1">Min 8 characters (uppercase, lowercase, and digit)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mint-850 mb-1">Confirm Password</label>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
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
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-mint-700 hover:bg-mint-800 text-white font-bold py-3.5 rounded-xl transition-colors mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center h-12 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-mint-900 mb-2 text-center">Verify Your Email</h1>
          <p className="text-mint-700 text-center mb-6 text-sm">We have sent a 6-digit verification code to <span className="font-bold text-mint-950">{email}</span>. Please enter it below.</p>
          
          <form onSubmit={handleVerifySubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-mint-850 mb-2 text-center">Verification Code</label>
              <input 
                type="text" 
                maxLength={6}
                required 
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                disabled={isLoading}
                className="w-full border border-mint-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-mint-500 disabled:opacity-55" 
                placeholder="000000" 
              />
              <p className="text-xs text-mint-600 mt-2 text-center">Check your browser console for the logged code!</p>
            </div>
            
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 text-center">
                {error}
              </p>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-mint-700 hover:bg-mint-800 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center h-12 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Verify & Register"
              )}
            </button>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => {
                  setStep("register");
                  setError("");
                }}
                className="text-sm font-bold text-mint-700 hover:text-mint-900 hover:underline cursor-pointer"
              >
                ← Edit Registration Info
              </button>
            </div>
          </form>
        </>
      )}
      
      {step === "register" && (
        <p className="text-center text-sm text-mint-700 mt-6">
          Already have an account? <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-mint-700 hover:text-mint-900 hover:underline">Sign In</Link>
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-mint-50/30">
        <Suspense fallback={
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-mint-900/5 border border-mint-200 max-w-md w-full flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-mint-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-mint-700 mt-4 font-medium">Loading form...</span>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
