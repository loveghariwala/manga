"use client";

import Image from "next/image";
import Link from "next/link";
import { MangaCard as MangaCardType } from "@/types";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Props {
  manga: MangaCardType;
  index?: number;
}

export function MangaCard({ manga, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/manga/${manga.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/5 bg-muted transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
          <Image
            src={manga.coverUrl}
            alt={manga.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Chapter Badge */}
          {manga.lastChapter && manga.lastChapter.length < 10 && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-primary/90 px-2.5 py-1 rounded-xl shadow-lg shadow-primary/20 backdrop-blur-xl border border-white/10 flex flex-col items-center min-w-[40px] max-w-[80px]">
                <span className="text-[7px] font-black tracking-widest text-white/60 uppercase leading-none mb-0.5">CH.</span>
                <span className="text-xs font-black text-white leading-none truncate w-full text-center">{manga.lastChapter}</span>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            {manga.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] bg-white/10 text-white border-none backdrop-blur-md px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-4 space-y-1.5">
          <h3 className="font-bold text-sm leading-snug line-clamp-2 transition-colors group-hover:text-primary">
            {manga.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              manga.status.toLowerCase() === 'ongoing' 
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse' 
                : manga.status.toLowerCase() === 'completed'
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                : 'bg-primary shadow-[0_0_8px_var(--primary)] animate-pulse'
            }`} />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
              {manga.status}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
