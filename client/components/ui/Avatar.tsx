interface AvatarProps {
  name: string;
  src?:  string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const colors = [
  'bg-primary', 'bg-success', 'bg-warning', 'bg-info',
  'bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4',
];

export default function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const initials   = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colorIndex = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  }

  return (
    <div
      className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center
                  justify-center text-primary-foreground font-semibold shrink-0`}
      title={name}
    >
      {initials}
    </div>
  );
}
