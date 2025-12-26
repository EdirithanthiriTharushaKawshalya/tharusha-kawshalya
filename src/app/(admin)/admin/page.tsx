"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowLeft, Loader2, AlertCircle, KeyRound } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success: animate out or redirect
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError("Access Denied: Invalid credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor (Subtle Grid) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Back Button - UPDATED: tighter spacing on mobile */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
      >
        <ArrowLeft size={16} /> Back to Portfolio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md mt-12 md:mt-0" // Added mt-12 to clear the back button on very small screens
      >
        {/* UPDATED: p-6 on mobile, p-10 on desktop */}
        <div className="glass-panel p-6 md:p-10 rounded-2xl shadow-2xl border border-white/50 backdrop-blur-xl">
          
          {/* Header Icon */}
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
              <Lock size={28} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-black">Admin Access</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your credentials to manage the studio.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-black transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="admin@syntaxerreur.com"
                // UPDATED: Added 'text-base' to prevent iOS auto-zoom
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all placeholder:text-gray-400 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-black transition-colors">
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                placeholder="••••••••••••"
                // UPDATED: Added 'text-base'
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all placeholder:text-gray-400 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-black/20"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying...
                </>
              ) : (
                "Enter Dashboard"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Secured by Firebase Authentication
        </p>
      </motion.div>
    </div>
  );
}