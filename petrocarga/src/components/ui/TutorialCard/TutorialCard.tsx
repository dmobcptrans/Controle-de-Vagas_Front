import Link from 'next/link';
import { LucideIcon, Info } from 'lucide-react';

interface TutorialCardProps {
  href: string;

  title?: string;
  description: string;

  icon?: LucideIcon;

  className?: string;
}

export default function TutorialCard({
  href,
  title = 'Novo por aqui?',
  description,
  icon: Icon = Info,
  className = '',
}: TutorialCardProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-4
        rounded-xl border border-gray-100 border-l-4 border-l-[#1351B4]
        bg-white p-4
        transition-colors hover:bg-blue-50/30
        ${className}
      `}
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
        <Icon className="h-5 w-5 text-[#1351B4]" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#071D41]">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}