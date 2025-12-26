"use client";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Mail, MapPin, Github, Linkedin, Copy, Check, Loader2, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: new Date(),
      });
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("tharusha.k.dev@gmail.com"); 
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[90dvh] w-full flex flex-col justify-center items-center px-4 relative">
      
      {/* ADDED: Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="max-w-5xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-2xl shadow-black/5"
        >
          
          <div className="bg-black text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Let's build something <span className="text-gray-400">future-proof.</span>
              </h1>
              <p className="text-gray-400 text-base leading-relaxed">
                Whether you have a project idea, a question, or just want to say hi, I'm always open to discussing new opportunities.
              </p>
            </div>

            <div className="space-y-6 mt-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Email Me</p>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-medium">tharusha.k.dev@gmail.com</span>
                    <button 
                      onClick={handleCopyEmail}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy Email"
                    >
                      {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Location</p>
                  <p className="text-base font-medium">Sri Lanka (Available Remote)</p>
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <a href="https://github.com/EdirithanthiriTharushaKawshalya" target="_blank" className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                  <Github size={20} />
                </a>
                <a href="https://www.linkedin.com/in/tharusha-kawshalya-747359356/" target="_blank" className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 bg-white/50 relative">
            
            {status === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col justify-center items-center text-center"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
                <p className="text-sm text-gray-500">I'll get back to you as soon as possible.</p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="mt-6 text-sm font-bold underline hover:text-black"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Your Name</label>
                  <input
                    required
                    type="text"
                    className="w-full bg-white p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-base"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full bg-white p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-base"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full bg-white p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none text-base"
                    placeholder="Tell me about your project..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <button
                  disabled={status === "sending"}
                  type="submit"
                  className="bg-black text-white py-3 rounded-xl font-bold text-base hover:bg-gray-800 transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed group shadow-xl shadow-black/10"
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Message 
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}