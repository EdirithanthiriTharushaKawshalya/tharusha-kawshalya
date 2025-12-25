"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Make sure to import auth
import { addDoc, collection, getDocs } from "firebase/firestore";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // State for Project Form
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tech, setTech] = useState("");
  
  // State for Messages
  const [messages, setMessages] = useState<any[]>([]);

  // 1. Protect the Route
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/admin"); // Kick out if not logged in
      } else {
        setLoading(false); // Allow access
        fetchMessages(); // Load messages if logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchMessages = async () => {
    const querySnapshot = await getDocs(collection(db, "messages"));
    const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMessages(msgs);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "projects"), {
        title,
        description: desc,
        tech: tech.split(",").map((t) => t.trim()),
        createdAt: new Date(),
      });
      alert("Project Added!");
      setTitle(""); setDesc(""); setTech("");
    } catch (error) {
      console.error("Error adding project: ", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <div className="p-10 text-center">Verifying Access...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Studio</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Log Out</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ADD PROJECT SECTION */}
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Add Project</h2>
          <form onSubmit={handleAddProject} className="flex flex-col gap-3">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="p-2 rounded border bg-white/50" />
            <textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="p-2 rounded border bg-white/50 h-24" />
            <input type="text" placeholder="Tech (React, Next.js)" value={tech} onChange={(e) => setTech(e.target.value)} className="p-2 rounded border bg-white/50" />
            <button className="bg-black text-white py-2 rounded font-bold mt-2">Submit Project</button>
          </form>
        </div>

        {/* MESSAGES SECTION */}
        <div className="glass-panel p-6 rounded-xl overflow-y-auto max-h-[500px]">
          <h2 className="text-xl font-semibold mb-4">Inbox ({messages.length})</h2>
          {messages.length === 0 ? <p className="text-gray-500">No messages yet.</p> : (
            <div className="flex flex-col gap-4">
              {messages.map((msg: any) => (
                <div key={msg.id} className="bg-white/60 p-4 rounded-lg border shadow-sm">
                  <p className="font-bold text-sm">{msg.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{msg.email}</p>
                  <p className="text-sm text-gray-800">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}