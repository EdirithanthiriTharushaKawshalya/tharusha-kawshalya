"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, MapPin, Github, Linkedin, Copy, Check, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    try {
      const { error } = await supabase
        .from("messages")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
          }
        ]);
      if (error) throw error;
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      showToast("Message Sent! Thank you for reaching out, I'll get back to you soon.", "success");
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      showToast("Failed to send message. Please try again or email directly.", "error");
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("tharusha.k.dev@gmail.com"); 
    setCopied(true);
    showToast("Email address copied to clipboard!", "info");
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

              <div className="flex flex-wrap gap-3 mt-2">
                <a 
                  href="https://github.com/EdirithanthiriTharushaKawshalya" 
                  target="_blank" 
                  rel="me noopener noreferrer"
                  aria-label="Tharusha Kawshalya GitHub Profile"
                  className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all"
                  title="GitHub"
                >
                  <Github size={20} />
                </a>
                <a 
                  href="https://www.linkedin.com/in/tharusha-kawshalya-747359356/" 
                  target="_blank" 
                  rel="me noopener noreferrer"
                  aria-label="Tharusha Kawshalya LinkedIn Profile"
                  className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all"
                  title="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a 
                  href="https://www.tiktok.com/@tkedirithanthiri?_r=1&_t=ZS-99XMs48xnm9" 
                  target="_blank" 
                  rel="me noopener noreferrer"
                  aria-label="Tharusha Kawshalya TikTok Profile"
                  className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all"
                  title="TikTok"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/share/18KDu9sEeb/" 
                  target="_blank" 
                  rel="me noopener noreferrer"
                  aria-label="Tharusha Kawshalya Facebook Profile"
                  className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all"
                  title="Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
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