import { mangadex } from "@/lib/mangadex";
import { Reader } from "@/components/reader/Reader";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ChapterItem } from "@/types";

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  
  // Fetch chapter details to get mangaId and other info
  const response = await fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`);
  const chapterData = await response.json();
  const mangaId = chapterData.data.relationships.find((r: any) => r.type === "manga")?.id;
  
  // Fetch chapters for navigation
  let chapters: ChapterItem[] = [];
  try {
    const chaptersResponse = await mangadex.getMangaChapters(mangaId, 0, 500);
    chapters = chaptersResponse.data;
  } catch (e) {
    console.error("Failed to load chapters for reader nav", e);
  }
  
  const pages = await mangadex.getChapterPages(chapterId);
  
  // Fetch initial progress
  let initialPage = 1;
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const userId = (session.user as any).id;
    const db = await getDb();
    const progress = await db.collection("progress").findOne({ userId, mangaId });
    if (progress && progress.chapterId === chapterId) {
      initialPage = progress.pageNumber;
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <Reader 
        pages={pages} 
        mangaId={mangaId}
        chapterId={chapterId}
        chapters={chapters}
        initialPage={initialPage - 1} // 0-indexed in component
        chapterTitle={`Chapter ${chapterData.data.attributes.chapter || chapterId}`}
      />
    </div>
  );
}
