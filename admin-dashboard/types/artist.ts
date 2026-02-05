export type Artist = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  imageUrl: string | null;
  bgImageUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ArtistWithTracks = {
  artist: Artist;
  tracks: Array<{
    id: string;
    title: string;
    album: string | null;
    duration: number;
    playCount: number;
    fileUrl: string;
    coverArtUrl: string | null;
    createdAt: string;
  }>;
};

export type CreateArtistPayload = {
  name: string;
  slug?: string;
  bio?: string;
  imageUrl?: string;
  bgImageUrl?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
};

export type UpdateArtistPayload = Partial<
  CreateArtistPayload & { isVerified: boolean }
>;
