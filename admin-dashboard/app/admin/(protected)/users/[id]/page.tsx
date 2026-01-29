"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { adminApi } from "@/lib/admin-api";
import type { AdminUserDetailsResponse } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function yn(v: boolean) {
  return v ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>;
}

function mmss(seconds: number) {
  const s = Math.max(0, seconds || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [data, setData] = useState<AdminUserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res: any = await adminApi.userDetails(id);
      // supports {status:"success", data:{...}} or direct {user,stats,...}
      const payload = res?.data ? (res.data?.user ? res.data : res.data?.data ? res.data.data : res.data) : res;
      const normalized = (res?.data?.user ? res.data : res?.data?.data ? res.data.data : res) as AdminUserDetailsResponse;
      setData(normalized ?? payload);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
        Loading user...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
        User not found.
      </div>
    );
  }

  const u = data.user;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{u.username}</h1>
          <p className="text-sm text-muted-foreground">{u.email}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/users">Back to users</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Admin</span>
              <span>{yn(u.isAdmin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Premium</span>
              <span>{yn(u.isPremium)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified</span>
              <span>{yn(u.isVerified)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banned</span>
              <span>{u.isBanned ? <Badge variant="destructive">Yes</Badge> : <Badge variant="secondary">No</Badge>}</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">Last active</span>
              <span>{u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(u.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Playlists</span>
              <span className="tabular-nums">{data.stats.playlistCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Listens</span>
              <span className="tabular-nums">{data.stats.listenCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* You can wire ban/unban here later with your global confirm dialog */}
            <div className="text-sm text-muted-foreground">
              Ban/unban actions can be placed here too.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b">
            <div className="text-sm font-medium">Recent listen history</div>
            <div className="text-xs text-muted-foreground">Latest plays by this user</div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium">Track</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Played at</th>
                </tr>
              </thead>
              <tbody>
                {data.listenHistory?.length ? (
                  data.listenHistory.map((h) => (
                    <tr key={h.id} className="border-t">
                      <td className="px-5 py-3">
                        <div className="font-medium max-w-[360px] truncate" title={`${h.track.title} — ${h.track.artist}`}>
                          {h.track.title} <span className="text-muted-foreground">— {h.track.artist}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 tabular-nums">{mmss(h.track.duration)}</td>
                      <td className="px-5 py-3">{new Date(h.playedAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-muted-foreground">
                      No listen history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b">
            <div className="text-sm font-medium">Recent playlists</div>
            <div className="text-xs text-muted-foreground">Latest created playlists</div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Tracks</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.playlists?.length ? (
                  data.playlists.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-5 py-3 font-medium max-w-[320px] truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="px-5 py-3 tabular-nums">{p.trackCount}</td>
                      <td className="px-5 py-3">{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-muted-foreground">
                      No playlists.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
