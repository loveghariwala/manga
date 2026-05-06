"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ReaderPage, ChapterItem } from "@/types";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Settings, List, ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Props {
  pages: ReaderPage[];
  mangaId: string;
  chapterId: string;
  chapters?: ChapterItem[];
  initialPage?: number;
  chapterTitle?: string;
}

export function Reader({ pages, mangaId, chapterId, chapters = [], initialPage = 0, chapterTitle }: Props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [readingMode, setReadingMode] = useState<"vertical" | "pagination">("vertical");

  // Chapter Navigation Logic
  const currentChapterIndex = chapters.findIndex(c => c.id === chapterId);
  // Chapters are sorted desc, so index - 1 is the next chapter, index + 1 is the previous chapter
  const nextChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
  const prevChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

  const handleNavigateChapter = (targetChapterId: string) => {
    if (targetChapterId) {
      router.push(`/reader/${targetChapterId}`);
    }
  };

  // Sync progress to DB
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await axios.post("/api/progress", {
          mangaId,
          chapterId,
          pageNumber: currentPage + 1,
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    };

    const timer = setTimeout(saveProgress, 2000); // Debounce save
    return () => clearTimeout(timer);
  }, [currentPage, mangaId, chapterId]);

  // Sync initialPage when chapter changes
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage, chapterId]);

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((p) => p + 1);
    } else if (nextChapter) {
      handleNavigateChapter(nextChapter.id);
    }
  }, [currentPage, pages.length, nextChapter]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    } else if (prevChapter) {
      handleNavigateChapter(prevChapter.id);
    }
  }, [currentPage, prevChapter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d") nextPage();
      if (e.key === "ArrowLeft" || e.key === "a") prevPage();
      if (e.key === "f") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Preloading next pages
  useEffect(() => {
    if (readingMode === "pagination") {
      const nextIdx = currentPage + 1;
      const nextNextIdx = currentPage + 2;
      
      if (pages[nextIdx]) {
        const img = new window.Image();
        img.src = pages[nextIdx].url;
      }
      if (pages[nextNextIdx]) {
        const img = new window.Image();
        img.src = pages[nextNextIdx].url;
      }
    }
  }, [currentPage, pages, readingMode]);

  return (
    <div className={cn("relative min-h-screen bg-[#0a0a0c] text-white selection:bg-primary/20 transition-colors duration-500", isFullscreen && "z-[100]")}>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-white/5">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_rgba(139,92,246,0.8)]" 
          style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
        />
      </div>

      {/* Modern Controls Overlay */}
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-[72px] bg-black/60 backdrop-blur-2xl px-4 md:px-8 flex items-center justify-between transition-all duration-500 border-b border-white/10 shadow-2xl",
          !showControls && "-translate-y-full opacity-0"
        )}
      >
        {/* Left Side: Back & Title */}
        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push(`/manga/${mangaId}`)}
            className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-white shrink-0"
            title="Back to Manga"
          >
            <ArrowLeft size={22} />
          </Button>
          <div className="min-w-0 flex flex-col">
            <h1 className="font-bold text-sm md:text-base line-clamp-1 truncate text-white">{chapterTitle}</h1>
            <p className="text-[10px] md:text-xs text-primary uppercase tracking-widest font-black">
              Page {currentPage + 1} of {pages.length}
            </p>
          </div>
        </div>

        {/* Center: Chapter Navigation */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => prevChapter && handleNavigateChapter(prevChapter.id)}
            disabled={!prevChapter}
            className="rounded-full px-4 h-8 text-xs font-bold hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={16} className="mr-1" /> Prev
          </Button>
          
          <select 
            className="bg-transparent text-sm font-bold border-none outline-none focus:ring-0 cursor-pointer hover:text-primary transition-colors appearance-none text-center w-32 px-2"
            value={chapterId}
            onChange={(e) => handleNavigateChapter(e.target.value)}
          >
            {chapters.map(c => (
              <option key={c.id} value={c.id} className="bg-background text-foreground">
                Chapter {c.chapterNumber}
              </option>
            ))}
          </select>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => nextChapter && handleNavigateChapter(nextChapter.id)}
            disabled={!nextChapter}
            className="rounded-full px-4 h-8 text-xs font-bold hover:bg-white/10 disabled:opacity-30"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>

        {/* Right Side: Tools */}
        <div className="flex items-center gap-2 justify-end flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setReadingMode(readingMode === "vertical" ? "pagination" : "vertical")}
            className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
            title={readingMode === "vertical" ? "Switch to Paged Mode" : "Switch to Scroll Mode"}
          >
            <List size={20} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
            className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-white hidden sm:flex"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-white md:hidden"
          >
            <Menu size={20} />
          </Button>
        </div>
      </div>

      {/* Reader Content */}
      <div 
        className={cn(
          "mx-auto flex flex-col items-center pt-[72px] pb-[72px]",
          readingMode === "vertical" ? "max-w-4xl" : "h-screen justify-center overflow-hidden pt-0 pb-0"
        )}
        onClick={() => setShowControls(!showControls)}
      >
        {readingMode === "vertical" ? (
          <div className="w-full space-y-0">
            {pages.map((page, idx) => (
              <div key={idx} className="relative w-full aspect-[2/3] md:aspect-[3/4]">
                <Image
                  src={page.url}
                  alt={`Page ${page.pageNumber}`}
                  fill
                  className="object-contain md:object-cover"
                  loading={idx < 5 ? "eager" : "lazy"}
                  quality={90}
                />
              </div>
            ))}
            {/* End of chapter actions */}
            <div className="py-24 flex flex-col items-center justify-center space-y-6">
              <h3 className="text-2xl font-black text-muted-foreground">End of Chapter</h3>
              <div className="flex gap-4">
                {prevChapter && (
                  <Button variant="outline" size="lg" onClick={() => handleNavigateChapter(prevChapter.id)} className="rounded-2xl font-bold bg-white/5 border-white/10 hover:bg-white/10">
                    <ChevronLeft className="mr-2" /> Previous Chapter
                  </Button>
                )}
                {nextChapter && (
                  <Button size="lg" onClick={() => handleNavigateChapter(nextChapter.id)} className="rounded-2xl font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    Next Chapter <ChevronRight className="ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center group">
            {/* Click zones */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); prevPage(); }} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); nextPage(); }} />
            
            <div className="relative w-full h-full max-w-5xl">
              <Image
                src={pages[currentPage].url}
                alt={`Page ${pages[currentPage].pageNumber}`}
                fill
                className="object-contain"
                priority
                quality={100}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer for Pagination */}
      {readingMode === "pagination" && showControls && (
        <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-black/80 backdrop-blur-2xl px-6 flex items-center justify-center gap-4 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <Button variant="outline" size="icon" onClick={prevPage} disabled={currentPage === 0 && !prevChapter} className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
            <ChevronLeft size={20} />
          </Button>
          <div className="text-sm font-bold tracking-widest text-primary bg-primary/10 px-6 py-2 rounded-full">
            {currentPage + 1} / {pages.length}
          </div>
          <Button variant="outline" size="icon" onClick={nextPage} disabled={currentPage === pages.length - 1 && !nextChapter} className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
            <ChevronRight size={20} />
          </Button>
        </div>
      )}
      
      {/* Mobile Chapter Nav (Bottom Bar when vertical mode) */}
      {readingMode === "vertical" && showControls && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-black/80 backdrop-blur-2xl px-4 flex items-center justify-between border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => prevChapter && handleNavigateChapter(prevChapter.id)}
            disabled={!prevChapter}
            className="rounded-full"
          >
            <ChevronLeft size={20} /> Prev
          </Button>
          
          <select 
            className="bg-transparent text-sm font-bold border-none outline-none focus:ring-0 appearance-none text-center"
            value={chapterId}
            onChange={(e) => handleNavigateChapter(e.target.value)}
          >
            {chapters.map(c => (
              <option key={c.id} value={c.id} className="bg-background text-foreground">
                Ch. {c.chapterNumber}
              </option>
            ))}
          </select>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => nextChapter && handleNavigateChapter(nextChapter.id)}
            disabled={!nextChapter}
            className="rounded-full"
          >
            Next <ChevronRight size={20} />
          </Button>
        </div>
      )}
    </div>
  );
}
