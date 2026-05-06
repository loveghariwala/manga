import { Button } from "@/components/ui/button";
import { Library as LibraryIcon, Lock } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { mangadex } from "@/lib/mangadex";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const db = await getDb();
    const userId = (session.user as any).id;
    const libraryEntries = await db.collection("library").find({ userId }).toArray();

    // Enrich library entries with manga details from cache or API
    const enrichedEntries = await Promise.all(
      libraryEntries.map(async (entry) => {
        try {
          const manga = await mangadex.getMangaDetail(entry.mangaId);
          return { ...entry, manga };
        } catch (error) {
          return { ...entry, manga: null };
        }
      })
    );

    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <LibraryIcon size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Your Library</h1>
        </div>

        {enrichedEntries.length === 0 ? (
          <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-white/10">
            <p className="text-muted-foreground">Your library is empty. Start adding some manga!</p>
            <Link href="/">
              <Button variant="outline" className="mt-4 rounded-xl">Browse Manga</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {enrichedEntries.map((entry) => (
              <Link key={entry.mangaId} href={`/manga/${entry.mangaId}`} className="group space-y-3">
                <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 bg-muted">
                  <img 
                    src={entry.manga?.coverUrl || "/placeholder-cover.jpg"} 
                    alt={entry.manga?.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {entry.manga?.title || "Unknown Title"}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary mt-1">
                    {entry.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // If not signed in, show the CTA
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <div className="max-w-md mx-auto space-y-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/10 text-primary">
          <LibraryIcon size={48} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter">Your Personal Library</h1>
          <p className="text-muted-foreground text-lg">
            Track your progress, save your favorites, and never miss a new chapter.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-muted/30 border border-white/5 space-y-6">
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <Lock size={16} />
            Members Only
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to access your synchronized library across all your devices.
          </p>
          <Link href="/api/auth/signin">
            <Button size="lg" className="w-full rounded-2xl font-bold py-6">
              Sign In to Continue
            </Button>
          </Link>
          <div className="text-xs text-muted-foreground mt-4">
            Don't have an account? <Link href="/signup" className="text-primary hover:underline">Create one for free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
