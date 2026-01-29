import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IngestionJobsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Ingestion Jobs</h2>
        <p className="text-slate-600">Monitor and manage content ingestion</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Job Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Jobs list, details, retry, and delete functionality coming in Task 3...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
