"use client";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { 
  ArrowLeft, 
  User as UserIcon, 
  Save, 
  Camera, 
  Image as ImageIcon, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  KeyRound, 
  Smartphone, 
  Check, 
  Eye, 
  EyeOff
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { User } from "@/lib/types";
import { useDBValue } from "@/lib/db";
import { getRegisteredUsers, getCurrentUser } from "@/lib/auth";
import toast from "react-hot-toast";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&q=80"
];

export default function ProfilePage() {
  const currentUser = useDBValue<User | null>("greenmart_current_user");
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: ""
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [avatar, setAvatar] = useState("");

  // Preset selector toggle
  const [showPresets, setShowPresets] = useState(false);

  // OTP Change Password states
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const user = getCurrentUser();
      if (user === null) {
        window.location.href = "/login";
      } else {
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          email: user.email || ""
        });
        setEmailVerified(!!user.emailVerified);
        setAvatar(user.avatar || "");
      }
    }
  }, [mounted]);

  // Handle custom image uploads via Base64 FileReader
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        toast.error("Image file size should be less than 1.5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatar(base64);
        toast.success("Profile photo loaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated Email Verification
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const handleVerifyEmail = () => {
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    
    setVerifyingEmail(true);
    toast.loading("Sending verification link...", { id: "email-verify" });
    
    setTimeout(() => {
      setEmailVerified(true);
      toast.success("Identity verified! Email status: Verified", { id: "email-verify" });
      setVerifyingEmail(false);
    }, 1500);
  };

  // Simulated OTP Password Change
  const handleSendOtp = () => {
    setSendingOtp(true);
    toast.loading("Sending verification code to registered number...", { id: "otp-send" });
    
    setTimeout(() => {
      setOtpSent(true);
      setSendingOtp(false);
      toast.success("SMS Sent! Enter OTP code 482910 to modify password.", { 
        id: "otp-send",
        duration: 6000
      });
    }, 1200);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode !== "482910") {
      toast.error("Invalid verification code. Please enter 482910.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password matching failed. Try again.");
      return;
    }

    setUpdatingPassword(true);
    toast.loading("Updating secure password...", { id: "pass-update" });

    setTimeout(() => {
      if (currentUser) {
        const updatedUser = { ...currentUser, password: newPassword };
        
        // Save locally
        localStorage.setItem("greenmart_current_user", JSON.stringify(updatedUser));
        
        // Save in global database registry
        const users = getRegisteredUsers();
        const index = users.findIndex(u => u.phone === currentUser.phone);
        if (index >= 0) {
          users[index] = updatedUser;
          localStorage.setItem("greenmart_users", JSON.stringify(users));
        }

        toast.success("Security password updated successfully!", { id: "pass-update" });
        
        // Reset states
        setOtpSent(false);
        setOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordFormOpen(false);
      }
      setUpdatingPassword(false);
    }, 1500);
  };

  // Profile Save Changes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.loading("Saving changes to registry...", { id: "profile-save" });
    
    setTimeout(() => {
      if (currentUser) {
        const updatedUser = { 
          ...currentUser, 
          firstName: formData.firstName, 
          lastName: formData.lastName,
          email: formData.email,
          emailVerified: emailVerified,
          avatar: avatar
        };
        
        localStorage.setItem("greenmart_current_user", JSON.stringify(updatedUser));
        
        const users = getRegisteredUsers();
        const index = users.findIndex(u => u.phone === currentUser.phone);
        if (index >= 0) {
          users[index] = updatedUser;
          localStorage.setItem("greenmart_users", JSON.stringify(users));
        }
        
        toast.success("Profile records saved successfully!", { id: "profile-save" });
        
        setTimeout(() => {
          window.location.href = "/account";
        }, 600);
      }
      setIsSaving(false);
    }, 600);
  };

  if (!mounted || !currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-mint-50/20 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          
          <Link href="/account" className="inline-flex items-center gap-1.5 text-mint-800 hover:text-mint-900 mb-6 font-semibold transition-colors text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-white text-mint-800 rounded-2xl shadow-sm border border-mint-100">
              <UserIcon size={24} />
            </div>
            <h1 className="text-3xl font-extrabold text-mint-900">Edit Profile Details</h1>
          </div>
          
          <div className="space-y-6">
            
            {/* Primary Details Form */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-mint-100 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Photo Upload & Presets Wrapper */}
                <div className="flex flex-col items-center border-b border-mint-100 pb-6 mb-2">
                  <div className="relative group cursor-pointer mb-4">
                    {avatar ? (
                      <img 
                        src={avatar} 
                        alt="Avatar Preview" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-mint-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-mint-100 text-mint-800 flex items-center justify-center text-3xl font-extrabold border-4 border-mint-200 shadow-sm uppercase">
                        {formData.firstName?.[0] || ""}{formData.lastName?.[0] || ""}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-mint-900/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera size={20} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-mint-50 hover:bg-mint-100 text-mint-850 text-xs font-bold transition-all border border-mint-100/50"
                    >
                      <Camera size={14} /> Upload Custom Photo
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowPresets(!showPresets)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-mint-50 text-mint-850 text-xs font-bold transition-all border border-mint-150 shadow-xs"
                    >
                      <ImageIcon size={14} /> Choose Preset
                    </button>
                    
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => { setAvatar(""); toast.success("Photo removed."); }}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Preset avatar grid popover */}
                  {showPresets && (
                    <div className="w-full max-w-sm mt-4 p-4 bg-mint-50/50 rounded-2xl border border-mint-100 shadow-inner">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[11px] font-bold text-mint-700 uppercase tracking-wider">Premium Avatars</span>
                        <button 
                          type="button" 
                          onClick={() => setShowPresets(false)}
                          className="text-[10px] font-bold text-mint-500 hover:text-mint-800"
                        >
                          Hide Presets
                        </button>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {PRESET_AVATARS.map((url, i) => (
                          <div 
                            key={i} 
                            onClick={() => { setAvatar(url); setShowPresets(false); toast.success("Preset loaded!"); }}
                            className="aspect-square rounded-full overflow-hidden border border-mint-200 cursor-pointer hover:scale-110 hover:border-mint-600 transition-all shadow-xs"
                          >
                            <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handlePhotoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-mint-700 uppercase tracking-wider mb-2">First Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.firstName}
                      onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full bg-mint-50/30 border border-mint-200 rounded-2xl px-4 py-3 text-sm text-mint-900 focus:outline-none focus:border-mint-500 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mint-700 uppercase tracking-wider mb-2">Last Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.lastName}
                      onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full bg-mint-50/30 border border-mint-200 rounded-2xl px-4 py-3 text-sm text-mint-900 focus:outline-none focus:border-mint-500 transition-colors" 
                    />
                  </div>
                </div>
                
                {/* Email Address & Verification */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-mint-700 uppercase tracking-wider">Email Address</label>
                    
                    {formData.email && (
                      <div className="flex items-center gap-1.5">
                        {emailVerified ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            <CheckCircle size={10} /> Verified
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              <AlertCircle size={10} /> Not Verified
                            </span>
                            <button
                              type="button"
                              onClick={handleVerifyEmail}
                              disabled={verifyingEmail}
                              className="text-[10px] font-extrabold text-mint-700 hover:text-mint-900 underline transition-colors"
                            >
                              {verifyingEmail ? "Verifying..." : "Verify Now"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="e.g. user@domain.com"
                      value={formData.email}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, email: e.target.value }));
                        setEmailVerified(false); // reset verified on edit
                      }}
                      className="w-full bg-mint-50/30 border border-mint-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-mint-900 focus:outline-none focus:border-mint-500 transition-colors" 
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-mint-400" size={16} />
                  </div>
                </div>
                
                {/* Locked Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-mint-700 uppercase tracking-wider mb-2">Registered Phone Number</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      required 
                      value={formData.phone}
                      className="w-full bg-mint-100/35 border border-mint-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-mint-800 cursor-not-allowed font-medium select-none focus:outline-none" 
                      readOnly
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-mint-450" size={16} />
                  </div>
                  <p className="text-[11px] text-mint-700/80 font-medium mt-1.5 flex items-center gap-1 pl-1">
                    <InfoIcon size={12} /> Registered phone numbers cannot be changed.
                  </p>
                </div>

                <div className="pt-4 border-t border-mint-100 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-mint-850 hover:bg-mint-900 disabled:bg-slate-700/50 text-white font-bold py-3.5 px-8 rounded-2xl transition-colors flex items-center gap-2 text-sm shadow-sm"
                  >
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card Block (SMS OTP flow) */}
            <div className="bg-white rounded-3xl border border-mint-100 shadow-sm overflow-hidden">
              <button 
                onClick={() => setPasswordFormOpen(!passwordFormOpen)}
                className="w-full p-6 flex justify-between items-center text-left hover:bg-mint-50/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-mint-50 text-mint-800 rounded-xl">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-mint-900 text-sm">Security & Password</h3>
                    <p className="text-xs text-mint-700/80 mt-0.5">Modify your account access credentials.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-mint-700 uppercase tracking-wider">
                  {passwordFormOpen ? "Hide" : "Manage"}
                </span>
              </button>

              {passwordFormOpen && (
                <div className="p-6 md:p-8 border-t border-mint-100 bg-mint-50/10 space-y-6">
                  
                  {!otpSent ? (
                    <div className="text-center py-6 max-w-md mx-auto space-y-4">
                      <Smartphone size={36} className="mx-auto text-mint-600" />
                      <h4 className="font-bold text-mint-900 text-sm">Verify Identity with OTP</h4>
                      <p className="text-xs text-mint-700/90 leading-relaxed">
                        To set a new password, we must dispatch a secure, 6-digit confirmation code via text to your registered number: <strong className="text-mint-900">{formData.phone}</strong>.
                      </p>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="bg-mint-800 hover:bg-mint-900 disabled:bg-slate-700/50 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        {sendingOtp ? "Requesting Code..." : "Send Verification OTP"}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md mx-auto">
                      
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-medium leading-relaxed mb-4">
                        Code sent! Check your SMS alert overlay. <br />
                        For testing, type the simulated code: <strong className="font-bold">482910</strong>
                      </div>

                      {/* Verification OTP Code input */}
                      <div>
                        <label className="block text-xs font-bold text-mint-700 uppercase tracking-wider mb-2">6-Digit Verification Code</label>
                        <input 
                          type="text" 
                          required 
                          maxLength={6}
                          placeholder="e.g. 482910"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="w-full text-center tracking-widest font-mono font-bold bg-mint-50/50 border border-mint-200 rounded-2xl py-3 text-lg text-mint-900 focus:outline-none focus:border-mint-500" 
                        />
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-xs font-bold text-mint-700 uppercase tracking-wider mb-2">New Secure Password</label>
                        <div className="relative">
                          <input 
                            type={showNewPass ? "text" : "password"} 
                            required 
                            minLength={6}
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-mint-50/50 border border-mint-200 rounded-2xl pl-4 pr-11 py-3 text-sm text-mint-900 focus:outline-none focus:border-mint-500" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-mint-450 hover:text-mint-800"
                          >
                            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-xs font-bold text-mint-700 uppercase tracking-wider mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input 
                            type={showConfirmPass ? "text" : "password"} 
                            required 
                            placeholder="Repeat new password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-mint-50/50 border border-mint-200 rounded-2xl pl-4 pr-11 py-3 text-sm text-mint-900 focus:outline-none focus:border-mint-500" 
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-mint-450 hover:text-mint-800"
                          >
                            {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="flex-1 bg-white hover:bg-mint-50 text-mint-800 font-bold py-3 rounded-2xl text-xs uppercase border border-mint-200 transition-all text-center"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={updatingPassword}
                          className="flex-2 bg-mint-850 hover:bg-mint-900 disabled:bg-slate-700/50 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all"
                        >
                          {updatingPassword ? "Updating..." : "Update Password"}
                        </button>
                      </div>

                    </form>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      </main>
      
      <Footer />
      <MobileNav />
    </div>
  );
}

function InfoIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-mint-500 shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
