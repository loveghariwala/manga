import { mangadex } from "@/lib/mangadex";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { BookmarkButton } from "@/components/manga/BookmarkButton";
import { ChevronRight, Play, Info, Calendar, User, Palette, List } from "lucide-react";
import { Metadata } from "next";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const manga = await mangadex.getMangaDetail(id);
  return {
    title: `${manga.title} | MANGA.IO`,
    description: manga.description.slice(0, 160),
    openGraph: {
      images: [manga.coverUrl],
    },
  };
}

export default async function MangaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { cpage } = await searchParams;
  
  const currentChapterPage = parseInt((cpage as string) || "1");
  const chapterLimit = 300; // Increased limit to see more chapters per page
  const chapterOffset = (currentChapterPage - 1) * chapterLimit;

  const manga = await mangadex.getMangaDetail(id);
  const { data: chapters, total: totalChapters } = await mangadex.getMangaChapters(id, chapterOffset, chapterLimit);

  const totalPages = Math.ceil(totalChapters / chapterLimit);

  return (
    <div className="min-h-screen pb-20">
      {/* ... Dynamic Banner Background ... */}
      <div className="absolute top-0 left-0 w-full h-[60vh] overflow-hidden pointer-events-none">
        <Image
          src={manga.coverUrl.replace(".256.jpg", "")}
          alt=""
          fill
          className="object-cover blur-3xl opacity-20 scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      </div>

      <div className="container mx-auto px-4 pt-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar: Cover Art & Actions */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
                <Image
                  src={manga.coverUrl.replace(".256.jpg", "")}
                  alt={manga.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="flex flex-col gap-3">
                <Link href={`/reader/${chapters[0]?.id || id}`} className="w-full">
                  <Button className="w-full rounded-2xl h-14 text-lg font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2">
                    <Play size={20} fill="currentColor" /> START READING
                  </Button>
                </Link>
                <BookmarkButton mangaId={id} />
              </div>

              {/* Quick Stats Panel */}
              <div className="glass-panel rounded-3xl p-6 space-y-4 border border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Year</span>
                  <span className="font-bold">{manga.year || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><User size={14} /> Author</span>
                  <span className="font-bold truncate max-w-[120px]">{manga.author}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Palette size={14} /> Artist</span>
                  <span className="font-bold truncate max-w-[120px]">{manga.artist}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Info & Tabs */}
          <div className="flex-1 space-y-10 min-w-0">
            {/* Header Section */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className={cn(
                  "px-4 py-1.5 rounded-full border-none font-black text-[10px] tracking-widest uppercase",
                  manga.status.toLowerCase() === 'ongoing' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {manga.status}
                </Badge>
                {manga.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="px-4 py-1.5 rounded-full bg-white/5 border-white/10 text-muted-foreground font-bold text-[10px] tracking-widest uppercase hover:bg-white/10 transition-colors cursor-default">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[0.9] text-white">
                {manga.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-none max-w-3xl font-medium">
                {manga.description || "Explore this amazing journey. No description provided by the source, but the story speaks for itself."}
              </p>

              <div className="flex flex-wrap gap-3">
                {manga.tags.slice(3).map(tag => (
                  <span key={tag} className="text-xs font-bold text-muted-foreground/60 px-3 py-1 rounded-lg border border-white/5 bg-white/[0.02]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="chapters" className="w-full">
              <TabsList className="bg-white/5 backdrop-blur-xl p-1.5 rounded-[22px] border border-white/10 h-auto gap-1">
                <TabsTrigger 
                  value="chapters" 
                  className="rounded-[18px] px-8 py-3 text-sm font-black tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <List size={18} /> CHAPTERS
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="rounded-[18px] px-8 py-3 text-sm font-black tracking-tight data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                >
                  <Info size={18} /> DETAILS
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chapters" className="mt-8">
                <div className="grid gap-3">
                  {chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/reader/${chapter.id}`}
                      className="group flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-primary/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                          {chapter.chapterNumber || "?"}
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-white group-hover:text-primary transition-colors">
                            {chapter.title || `Chapter ${chapter.chapterNumber}`}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
                            <span className="flex items-center gap-1"><User size={12} /> {chapter.scanlationGroup || "Default"}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>{new Date(chapter.publishAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                        <ChevronRight size={18} className="text-muted-foreground group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Chapter Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <Link
                      href={`/manga/${id}?cpage=${currentChapterPage - 1}`}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "rounded-xl px-6 font-bold bg-white/5 border-white/10 hover:bg-white/10",
                        currentChapterPage <= 1 && "pointer-events-none opacity-20"
                      )}
                    >
                      Previous
                    </Link>
                    <div className="text-sm font-bold bg-primary/10 px-4 py-2 rounded-xl text-primary">
                      {currentChapterPage} / {totalPages}
                    </div>
                    <Link
                      href={`/manga/${id}?cpage=${currentChapterPage + 1}`}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "rounded-xl px-6 font-bold bg-white/5 border-white/10 hover:bg-white/10",
                        currentChapterPage >= totalPages && "pointer-events-none opacity-20"
                      )}
                    >
                      Next
                    </Link>
                  </div>
                )}

                {chapters.length === 0 && (
                  <div className="text-center py-20 glass-panel rounded-3xl border border-white/5">
                    <p className="text-muted-foreground italic">No chapters available yet. Stay tuned!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-8">
                {/* ... Details Content ... */}
                <div className="glass-panel rounded-3xl p-8 border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                      <Info size={20} /> Synopsis
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                      {manga.description || "No detailed information available."}
                    </p>
                  </div>
                  
                  {manga.altTitles && manga.altTitles.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-3">Alternative Titles</h3>
                      <div className="flex flex-wrap gap-2">
                        {manga.altTitles.map(title => (
                          <span key={title} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
