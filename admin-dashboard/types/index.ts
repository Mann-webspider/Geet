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
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  genre: string | null;
  isExplicit: boolean;
  playCount: number;
  createdAt: string;
};

export type IngestionJobStatus =
  | "pending"
  | "downloading"
  | "transcoding"
  | "completed"
  | "failed";

export type IngestionJobListItem = {
  id: string;
  sourceType: "youtube" | "torrent" | "manual";
  sourceInput: string;
  status: IngestionJobStatus;
  retryCount: number;
  errorCode: string | null;
  requestedBy?: { id: string; email: string; username: string } | null;
  createdAt: string;
  track?: { id: string; title: string; artist: string } | null;
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
