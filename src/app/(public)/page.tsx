import { mangadex } from "@/lib/mangadex";
import { MangaGrid } from "@/components/manga/MangaGrid";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export const revalidate = 60; // 1 minute for fresh data

export default async function HomePage() {
  // Fetch data for different sections
  const [latestUpdates, trendingManga, newAdditions] = await Promise.all([
    mangadex.getLatestUpdates(15),
    mangadex.getTrendingManga(15),
    mangadex.getNewAdditions(15),
  ]);

  const featured = trendingManga[0] || latestUpdates[0];

  return (
    <div className="pb-20">
      {/* Hero Section */}
      {featured && (
        <section className="relative h-[70vh] flex items-center overflow-hidden mb-12">
          <div className="absolute inset-0 z-0">
            <Image
              src={featured.coverUrl.replace(".256.jpg", "")} 
              alt={featured.title}
              fill
              className="object-cover opacity-40 blur-md scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Featured Story
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                  {featured.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-lg line-clamp-3 max-w-xl font-medium">
                {featured.description}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link 
                  href={`/manga/${featured.id}`}
                  className={cn(buttonVariants({ size: "lg" }), "rounded-2xl px-10 h-14 font-black shadow-xl shadow-primary/20")}
                >
                  START READING
                </Link>
                <Button variant="outline" size="lg" className="rounded-2xl px-10 h-14 font-black backdrop-blur-md border-white/10 hover:bg-white/5">
                  ADD TO LIBRARY
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">Trending Now</h2>
            <p className="text-muted-foreground font-medium">The most read titles this week</p>
          </div>
          <Link 
            href="/explore?sort=trending"
            className="group flex items-center gap-2 text-sm font-black tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            More <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all"><ChevronRight size={16} /></span>
          </Link>
        </div>
        <MangaGrid mangaList={trendingManga} />
      </section>

      {/* Latest Updates Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">Latest Updates</h2>
            <p className="text-muted-foreground font-medium">Freshly translated chapters</p>
          </div>
          <Link 
            href="/explore?sort=latest"
            className="group flex items-center gap-2 text-sm font-black tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            More <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all"><ChevronRight size={16} /></span>
          </Link>
        </div>
        <MangaGrid mangaList={latestUpdates} />
      </section>

      {/* New Additions Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">New Additions</h2>
            <p className="text-muted-foreground font-medium">Recently added to the platform</p>
          </div>
          <Link 
            href="/explore?sort=newest"
            className="group flex items-center gap-2 text-sm font-black tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
          >
            More <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all"><ChevronRight size={16} /></span>
          </Link>
        </div>
        <MangaGrid mangaList={newAdditions} />
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4">
        <div className="glass-panel rounded-[40px] p-8 md:p-20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-primary/20 transition-colors duration-700" />
          
          <div className="space-y-6 text-center md:text-left relative z-10 max-w-xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase italic">Build your own library</h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Create an account to track your reading progress, bookmark your favorites, and get notified about new releases across all your devices.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "rounded-2xl px-12 h-14 font-black shadow-xl shadow-primary/20")}>
                JOIN NOW
              </Link>
              <Link href="/signin" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-2xl px-12 h-14 font-black border-white/10 hover:bg-white/5")}>
                SIGN IN
              </Link>
            </div>
          </div>
          
          <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-700">
            <Image
              src={trendingManga[1]?.coverUrl.replace(".256.jpg", "") || "/placeholder.jpg"}
              alt="Community"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
