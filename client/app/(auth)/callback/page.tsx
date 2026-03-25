'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const err = searchParams.get('error');

    if (err) {
      setError('OAuth authentication failed. Please try again.');
      setTimeout(() => router.push('/auth'), 3000);
      return;
    }

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Fetch user profile to populate auth state before redirecting
      useAuthStore.getState().fetchMe()
        .then(() => {
          router.push('/dashboard');
        })
        .catch(() => {
          setError('Failed to load user profile. Redirecting to login...');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setTimeout(() => router.push('/auth'), 2000);
        });
    } else {
      setError('Invalid tokens received. Redirecting to login...');
      setTimeout(() => router.push('/auth'), 2000);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 text-center max-w-sm w-full mx-4">
        {error ? (
          <>
            <div className="w-12 h-12 mx-auto bg-danger-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-danger-600 font-bold text-xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-sm text-gray-500">{error}</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto bg-success-100 rounded-full flex items-center justify-center mb-4">
              <div className="w-6 h-6 border-2 border-success-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Completing Sign In</h2>
            <p className="text-sm text-gray-500">Securely routing you to the dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 text-center max-w-sm w-full mx-4">
          <div className="w-12 h-12 mx-auto bg-success-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-6 h-6 border-2 border-success-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
