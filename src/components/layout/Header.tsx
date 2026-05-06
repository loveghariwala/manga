"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Library, Compass, User as UserIcon, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/me")
        .then(res => res.json())
        .then(data => setUserProfile(data))
        .catch(err => console.error("Header profile fetch error:", err));
    }
  }, [session]);

  // Hide global header on the reader page (Must be after all hooks)
  if (pathname?.startsWith("/reader/")) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-gradient">
          MANGA.IO
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/explore" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Compass size={18} />
            Explore
          </Link>
          <Link href="/search" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Search size={18} />
            Search
          </Link>
          <Link href="/library" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <Library size={18} />
            Library
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground hidden lg:block">
                {userProfile?.name || session.user?.name}
              </span>
              <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden bg-muted hover:ring-2 hover:ring-primary/50 transition-all flex items-center justify-center">
                {userProfile?.image ? (
                  <img src={userProfile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={20} className="text-muted-foreground" />
                )}
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut size={18} className="text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <Link href="/signin">
              <Button className="rounded-full px-6 font-bold h-9">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
