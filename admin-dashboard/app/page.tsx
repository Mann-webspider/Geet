import { redirect } from 'next/navigation';


export default function HomePage() {
  return (
    <main>
      <a href="/admin/login">Go to admin</a>
    </main>
  );
}
