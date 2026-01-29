import { useParams } from 'next/navigation';
export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
}

export interface LoginResponse {
  status: string;
  data: {
    id: string;
    email: string;
    username: string;
    token: string;
    isAdmin: boolean;
    isPremium: boolean;
  };
}



export interface IngestionJob {
  id: string;
  sourceType: 'youtube' | 'torrent' | 'manual';
  sourceInput: string;
  status: 'pending' | 'downloading' | 'transcoding' | 'completed' | 'failed';
  extractedTitle?: string;
  extractedArtist?: string;
  extractedDuration?: number;
  extractedThumbnail?: string;
  trackId?: string;
  errorMessage?: string;
  retryCount: number;
  requestedByAdminId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
export type PaginatedResponse<T> = {
  status: string;
  data: T[];
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  genre: string | null;
  fileUrl: string;
  coverArtUrl: string | null;
  releaseYear: number | null;
  isExplicit: boolean;
  playCount: number;
  createdAt: string;
  updatedAt: string;
};

export type IngestionJobStatus =
  | "pending"
  | "downloading"
  | "transcoding"
  | "completed"
  | "failed";

export type IngestionJobListItem = {
  admin: any;
  job: IngestionJobDetails;
  track: any
};

export type IngestionJobDetails = {
  id: string;
  sourceType: "youtube" | "torrent" | "manual";
  sourceInput: string;
  status: IngestionJobStatus;
  extractedTitle: string | null;
  extractedArtist: string | null;
  extractedDuration: number | null;
  extractedThumbnail: string | null;
  trackId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  debugLog: string | null;
  retryCount: number;
  requestedByAdminId: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  track?: { id: string; title: string; artist: string } | null;
};

export type DashboardStats = {
  users: { totalUsers: number; totalAdmins: number; totalBanned: number; totalPremium: number };
  tracks: { totalTracks: number; totalDuration: number };
  playlists: { totalPlaylists: number };
  listens: { totalListens: number };
};

export type AdminUserListItem = {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isBanned: boolean;
  isPremium: boolean;
  isVerified: boolean;
  lastActiveAt: string | null;
  createdAt: string;
};
export type AdminUserDetailsResponse = {
  user: AdminUserListItem;
  stats: {
    playlistCount: number;
    listenCount: number;
  };
  listenHistory: Array<{
    id: string;
    playedAt: string;
    track: { id: string; title: string; artist: string; duration: number };
  }>;
  playlists: Array<{
    id: string;
    name: string;
    trackCount: number;
    createdAt: string;
  }>;
};
