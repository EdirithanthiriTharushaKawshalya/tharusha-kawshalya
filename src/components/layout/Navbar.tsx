"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Experience", path: "/experience" },
  { name: "Projects", path: "/projects" },
  { name: "Skills", path: "/skills" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4">
      <nav className="glass-panel rounded-full px-6 py-3 flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "text-sm font-medium transition-colors hover:text-black",
              pathname === item.path ? "text-black font-bold" : "text-gray-500"
            )}
          >
            {item.name}
            {pathname === item.path && (
              <motion.div
                layoutId="underline"
                className="h-[2px] bg-black w-full mt-1 rounded-full"
              />
            )}
          </Link>
        ))}
      </nav>
    </header>
  );
}