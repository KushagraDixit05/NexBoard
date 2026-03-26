import Link from 'next/link';
import { FolderKanban } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary">
          <FolderKanban className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
