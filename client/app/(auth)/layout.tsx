import { AntiGravityCanvas } from '@/components/ui/particle-effect-for-hero';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden selection:bg-blue-500 selection:text-white">
      <AntiGravityCanvas />
      <div className="relative z-10 w-full flex justify-center pointer-events-none min-h-screen items-center">
        {children}
      </div>
    </div>
  );
}
