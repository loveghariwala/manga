"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Props {
  mangaId: string;
  initialStatus?: string;
}

export function BookmarkButton({ mangaId, initialStatus }: Props) {
  const { data: session } = useSession();
  const [status, setStatus] = useState(initialStatus || "none");
  const [loading, setLoading] = useState(false);

  const toggleBookmark = async () => {
    if (!session) {
      window.location.href = "/api/auth/signin";
      return;
    }

    setLoading(true);
    try {
      const newStatus = status === "reading" ? "none" : "reading";
      await axios.post("/api/library", { mangaId, status: newStatus });
      setStatus(newStatus);
    } catch (error) {
      console.error("Failed to bookmark:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={status === "reading" ? "default" : "outline"} 
      className={cn("w-full rounded-xl py-6 font-bold gap-2", status === "reading" && "bg-primary/20 text-primary hover:bg-primary/30 border-primary/30")}
      onClick={toggleBookmark}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : status === "reading" ? (
        <>
          <BookmarkCheck size={20} />
          In Library
        </>
      ) : (
        <>
          <Bookmark size={20} />
          Add to Library
        </>
      )}
    </Button>
  );
}
