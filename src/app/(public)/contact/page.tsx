"use client";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

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
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 md:p-12 rounded-2xl w-full max-w-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-black rounded-full text-white">
            <Mail size={24} />
          </div>
          <h1 className="text-3xl font-bold">Get in Touch</h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Have a project in mind or want to discuss my work? Send me a message below.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              required
              type="text"
              className="p-3 rounded-lg border border-gray-200 bg-white/50 focus:ring-2 focus:ring-black outline-none transition"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              required
              type="email"
              className="p-3 rounded-lg border border-gray-200 bg-white/50 focus:ring-2 focus:ring-black outline-none transition"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Message</label>
            <textarea
              required
              rows={4}
              className="p-3 rounded-lg border border-gray-200 bg-white/50 focus:ring-2 focus:ring-black outline-none transition resize-none"
              placeholder="How can I help you?"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>

          <button
            disabled={status === "sending"}
            type="submit"
            className="mt-4 bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2"
          >
            {status === "sending" ? "Sending..." : (
              <>Send Message <Send size={18} /></>
            )}
          </button>

          {status === "success" && (
            <p className="text-green-600 text-center mt-2">Message sent successfully!</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}