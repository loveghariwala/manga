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
  
  // Premium Reader Settings
  const [showSettings, setShowSettings] = useState(false);
  const [readingDirection, setReadingDirection] = useState<"rtl" | "ltr">("ltr");
  const [imageFit, setImageFit] = useState<"contain" | "width" | "height">("contain");

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
      if (e.key === "ArrowRight" || e.key === "d") {
        readingMode === "pagination" && readingDirection === "rtl" ? prevPage() : nextPage();
      }
      if (e.key === "ArrowLeft" || e.key === "a") {
        readingMode === "pagination" && readingDirection === "rtl" ? nextPage() : prevPage();
      }
      if (e.key === "f") toggleFullscreen();
      if (e.key === "Escape") setShowSettings(false);
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
            onClick={() => setShowSettings(!showSettings)}
            className={cn("rounded-full hover:bg-white/10", showSettings ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
            title="Reader Settings"
          >
            <Settings size={20} />
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

      {/* Settings Panel */}
      <div 
        className={cn(
          "fixed top-[72px] right-4 md:right-8 z-50 w-64 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-5 transition-all duration-300 origin-top-right",
          showSettings ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Reader Settings</h3>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Reading Mode</label>
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button onClick={() => setReadingMode("vertical")} className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-colors", readingMode === "vertical" ? "bg-primary text-white" : "text-muted-foreground hover:text-white")}>Vertical</button>
              <button onClick={() => setReadingMode("pagination")} className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-colors", readingMode === "pagination" ? "bg-primary text-white" : "text-muted-foreground hover:text-white")}>Paged</button>
            </div>
          </div>

          {readingMode === "pagination" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Direction (Manga/Manhwa)</label>
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                <button onClick={() => setReadingDirection("ltr")} className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-colors", readingDirection === "ltr" ? "bg-white/20 text-white" : "text-muted-foreground hover:text-white")}>LTR ➡️</button>
                <button onClick={() => setReadingDirection("rtl")} className={cn("flex-1 text-xs font-bold py-2 rounded-lg transition-colors", readingDirection === "rtl" ? "bg-white/20 text-white" : "text-muted-foreground hover:text-white")}>⬅️ RTL</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Image Fit</label>
            <div className="flex flex-col gap-1">
              {(["contain", "width", "height"] as const).map(fit => (
                <button 
                  key={fit} 
                  onClick={() => setImageFit(fit)}
                  className={cn("text-left text-xs font-bold py-2 px-3 rounded-lg transition-colors capitalize", imageFit === fit ? "bg-white/10 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white")}
                >
                  Fit {fit}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div 
        className={cn(
          "mx-auto flex flex-col items-center pt-[72px] pb-[72px]",
          readingMode === "vertical" ? (imageFit === "width" ? "w-full" : "max-w-4xl") : "h-screen justify-center overflow-hidden pt-0 pb-0"
        )}
        onClick={() => {
          setShowControls(!showControls);
          setShowSettings(false);
        }}
      >
        {readingMode === "vertical" ? (
          <div className="w-full space-y-0">
            {pages.map((page, idx) => (
              <div key={idx} className={cn("relative w-full", imageFit === "width" ? "h-auto" : "aspect-[2/3] md:aspect-[3/4]")}>
                <Image
                  src={page.url}
                  alt={`Page ${page.pageNumber}`}
                  fill={imageFit !== "width"}
                  width={imageFit === "width" ? 1200 : undefined}
                  height={imageFit === "width" ? 1800 : undefined}
                  className={cn(
                    imageFit === "width" ? "w-full h-auto object-cover" : "object-contain",
                    readingMode === "vertical" && imageFit !== "width" && "md:object-cover"
                  )}
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
            <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); readingDirection === 'rtl' ? nextPage() : prevPage(); }} />
            <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); readingDirection === 'rtl' ? prevPage() : nextPage(); }} />
            
            <div className={cn("relative w-full h-full flex items-center justify-center", imageFit === "width" ? "w-full" : "max-w-5xl")}>
              <Image
                src={pages[currentPage].url}
                alt={`Page ${pages[currentPage].pageNumber}`}
                fill
                className={cn("transition-all duration-300", imageFit === "contain" ? "object-contain" : imageFit === "width" ? "object-cover object-top" : "object-cover")}
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
