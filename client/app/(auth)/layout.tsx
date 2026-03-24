export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">NexBoard</h1>
          <p className="text-gray-500 text-sm mt-1">Team project management</p>
        </div>
        {children}
      </div>
    </div>
  );
}
