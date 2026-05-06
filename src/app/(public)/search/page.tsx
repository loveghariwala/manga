"use client";

import { useState, useEffect } from "react";
import { MangaGrid } from "@/components/manga/MangaGrid";
import { Input } from "@/components/ui/input";
import { MangaCard } from "@/types";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import axios from "axios";
import { useDebounce } from "@/hooks/use-debounce";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 800);
  const [results, setResults] = useState<MangaCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchManga = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`/api/manga/search?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(response.data.data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    searchManga();
  }, [debouncedQuery]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8 mb-16">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-black tracking-tighter sm:text-5xl">Find your next obsession</h1>
          <p className="text-muted-foreground">Search through thousands of titles across MangaDex</p>
        </div>
        
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for manga, manhwa, or manhua..."
            className="pl-12 h-14 bg-secondary/50 border-white/5 focus-visible:ring-primary/50 text-lg rounded-2xl"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="animate-spin text-primary" size={20} />
            </div>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-muted-foreground">
              Search Results
            </h2>
            <span className="text-sm text-muted-foreground">{results.length} titles found</span>
          </div>
          <MangaGrid mangaList={results} />
        </div>
      ) : !loading && debouncedQuery ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
            <SearchIcon size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No results found</h3>
          <p className="text-muted-foreground">Try searching for something else or check your spelling</p>
        </div>
      ) : !loading && !debouncedQuery ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground/50 italic">
            Try searching for "Solo Leveling" or "One Piece"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] rounded-xl bg-secondary/50 animate-pulse" />
              <div className="h-4 w-3/4 bg-secondary/50 animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-secondary/50 animate-pulse rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

