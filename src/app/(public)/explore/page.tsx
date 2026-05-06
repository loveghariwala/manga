import { mangadex } from "@/lib/mangadex";
import { MangaGrid } from "@/components/manga/MangaGrid";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const revalidate = 0; // No cache, always fresh data

interface Props {
  searchParams: Promise<{
    tab?: string;
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const currentTab = params.tab || "trending";
  const currentPage = parseInt(params.page || "1");
  const limit = 24;
  const offset = (currentPage - 1) * limit;

  let mangaList: any[] = [];
  let title = "Explore";
  let description = "Discover your next favorite story";

  // Fetch data based on tab
  if (currentTab === "trending") {
    mangaList = await mangadex.getTrendingManga(limit, offset);
    title = "Trending Now";
    description = "The stories everyone is talking about right now";
  } else if (currentTab === "latest") {
    mangaList = await mangadex.getLatestUpdates(limit, offset);
    title = "Latest Updates";
    description = "Freshly translated chapters from the last few hours";
  } else if (currentTab === "new") {
    mangaList = await mangadex.getNewAdditions(limit, offset);
    title = "New Additions";
    description = "Recently added titles to the MangaDex database";
  }

  const tabs = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "latest", label: "Latest", icon: Clock },
    { id: "new", label: "Newest", icon: Sparkles },
  ];

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] text-white uppercase italic">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl">
            {description}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/explore?tab=${tab.id}`}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black tracking-tight transition-all",
                currentTab === tab.id 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon size={16} />
              {tab.label.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mb-20">
        <MangaGrid mangaList={mangaList} />
        {mangaList.length === 0 && (
          <div className="text-center py-40 glass-panel rounded-[40px] border border-white/5">
            <p className="text-muted-foreground italic text-lg">Searching the multiverse for manga... None found here.</p>
          </div>
        )}
      </div>

      {/* Modern Pagination */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-3xl border border-white/10">
          <Link
            href={`/explore?tab=${currentTab}&page=${Math.max(1, currentPage - 1)}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-2xl w-14 h-14 hover:bg-white/10",
              currentPage <= 1 && "pointer-events-none opacity-20"
            )}
          >
            <ChevronLeft size={24} />
          </Link>

          <div className="px-8 py-3 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col items-center">
            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase leading-none mb-1">Page</span>
            <span className="text-2xl font-black text-white leading-none">{currentPage}</span>
          </div>

          <Link
            href={`/explore?tab=${currentTab}&page=${currentPage + 1}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-2xl w-14 h-14 hover:bg-white/10",
              mangaList.length < limit && "pointer-events-none opacity-20"
            )}
          >
            <ChevronRight size={24} />
          </Link>
        </div>
        
        <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
          Browsing {currentTab} category
        </p>
      </div>
    </div>
  );
}
