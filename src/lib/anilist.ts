import axios from "axios";

const ANILIST_API = "https://graphql.anilist.co";

const ANILIST_QUERY = `
  query ($id: Int, $search: String) {
    Media (id: $id, search: $search, type: MANGA) {
      id
      title {
        romaji
        english
      }
      description(asHtml: false)
      bannerImage
      coverImage {
        extraLarge
      }
      averageScore
      popularity
      status
    }
  }
`;

export interface AniListMetadata {
  id: number;
  bannerImage?: string;
  averageScore?: number;
  popularity?: number;
  description?: string;
  coverImage?: string;
}

export const anilist = {
  /**
   * Fetch rich metadata from AniList by ID or exact Title search.
   * Prefer ID if available from MangaDex links.
   */
  async getMetadata(params: { id?: string | number, title?: string }): Promise<AniListMetadata | null> {
    try {
      const variables: any = {};
      
      if (params.id) {
        variables.id = typeof params.id === 'string' ? parseInt(params.id) : params.id;
      } else if (params.title) {
        variables.search = params.title;
      } else {
        return null;
      }

      const response = await axios.post(
        ANILIST_API,
        {
          query: ANILIST_QUERY,
          variables
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          }
        }
      );

      const media = response.data?.data?.Media;
      
      if (!media) return null;

      return {
        id: media.id,
        bannerImage: media.bannerImage,
        averageScore: media.averageScore,
        popularity: media.popularity,
        description: media.description,
        coverImage: media.coverImage?.extraLarge,
      };
    } catch (error) {
      console.warn("AniList metadata fetch failed:", error);
      return null;
    }
  }
};
