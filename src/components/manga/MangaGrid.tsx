import { MangaCard as MangaCardType } from "@/types";
import { MangaCard } from "./MangaCard";

interface Props {
  mangaList: MangaCardType[];
}

export function MangaGrid({ mangaList }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {mangaList.map((manga, index) => (
        <MangaCard key={manga.id} manga={manga} index={index} />
      ))}
    </div>
  );
}
