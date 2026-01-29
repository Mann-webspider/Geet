"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { StatCard } from "@/components/admin/stat-card";
import { RecentJobs } from "@/components/admin/recent-jobs";
import { RecentTracks } from "@/components/admin/recent-tracks";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Shield,
  UserX,
  Crown,
  Music2,
  ListMusic,
  Headphones,
} from "lucide-react";

import type { Track, IngestionJobListItem } from "@/types";

type StatsPayload = any; // we normalize below

function unwrap<T>(payload: any): T {
  // supports either {status:"success", data: ...} or direct object
  return (payload?.data ?? payload) as T;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any | null>(null);
  const [recentJobs, setRecentJobs] = useState<IngestionJobListItem[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, jobsRes, tracksRes] = await Promise.all([
        adminApi.dashboardStats(),
        adminApi.recentJobs(5),
        adminApi.recentTracks(5),
      ]);

      const s = unwrap<any>(statsRes);
      const j = unwrap<{ data: IngestionJobListItem[] } | IngestionJobListItem[]>(jobsRes);
      const t = unwrap<{ data: Track[] } | Track[]>(tracksRes);

      setStats(s);

      // support either {data:[...]} or [...]
      setRecentJobs(Array.isArray(j) ? j : j.data ?? []);
      setRecentTracks(Array.isArray(t) ? t : t.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const users = stats?.users;
  const tracks = stats?.tracks;
  const playlists = stats?.playlists;
  const listens = stats?.listens;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of platform health and activity.</p>
      </div>

      {error ? (
        <div className="rounded-lg border bg-white p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-[86px] rounded-lg" />
            <Skeleton className="h-[86px] rounded-lg" />
            <Skeleton className="h-[86px] rounded-lg" />
            <Skeleton className="h-[86px] rounded-lg" />
            <Skeleton className="h-[86px] rounded-lg" />
            <Skeleton className="h-[86px] rounded-lg" />
            <Skeleton className="h-[86px] rounded-lg" />
            <Skeleton className="h-[86px] rounded-lg" />
          </>
        ) : (
          <>
            <StatCard title="Total users" value={users?.totalUsers ?? 0} icon={<Users className="h-4 w-4" />} />
            <StatCard title="Admins" value={users?.totalAdmins ?? 0} icon={<Shield className="h-4 w-4" />} />
            <StatCard title="Banned" value={users?.totalBanned ?? 0} icon={<UserX className="h-4 w-4" />} />
            <StatCard title="Premium" value={users?.totalPremium ?? 0} icon={<Crown className="h-4 w-4" />} />

            <StatCard title="Tracks" value={tracks?.totalTracks ?? 0} icon={<Music2 className="h-4 w-4" />} />
            <StatCard title="Playlists" value={playlists?.totalPlaylists ?? 0} icon={<ListMusic className="h-4 w-4" />} />
            <StatCard title="Listens" value={listens?.totalListens ?? 0} icon={<Headphones className="h-4 w-4" />} />
            <StatCard title="Total duration" value={`${Math.floor((tracks?.totalDuration ?? 0) / 60)} min`} />
          </>
        )}
      </div>

      {/* Recent widgets */}
      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <div className="rounded-lg border bg-white p-5">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
            <div className="rounded-lg border bg-white p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
          </>
        ) : (
          <>
            <RecentJobs jobs={recentJobs} />
            <RecentTracks tracks={recentTracks} />
          </>
        )}
      </div>
    </div>
  );
}
