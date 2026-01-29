import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Download, XCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { DashboardStats } from '@/types';

// This would call your real API endpoints
async function getDashboardStats(): Promise<DashboardStats> {
  // TODO: Replace with real API calls when ready
  // Example:
  // const stats = await fetch('http://localhost:8080/v1/admin/stats', {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  
  // For now, return placeholder data
  return {
    totalTracks: 0,
    totalJobs: 0,
    failedJobs: 0,
    pendingJobs: 0,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: 'Total Tracks',
      value: stats.totalTracks,
      icon: Music,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Download,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Failed Jobs',
      value: stats.failedJobs,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Pending Jobs',
      value: stats.pendingJobs,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-600">Overview of your music streaming platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Navigate using the sidebar to manage tracks and ingestion jobs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
