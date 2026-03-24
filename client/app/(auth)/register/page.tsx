'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', displayName: '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router        = useRouter();

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
        <p className="text-sm text-gray-500 mt-1">Start managing projects with NexBoard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 text-danger-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={form.username} onChange={set('username')}
                   required minLength={3} className="input-field" placeholder="johndoe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input type="text" value={form.displayName} onChange={set('displayName')}
                   className="input-field" placeholder="John Doe" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={set('email')}
                 required className="input-field" placeholder="you@example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={form.password} onChange={set('password')}
                 required minLength={8} className="input-field" placeholder="Min. 8 characters" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
