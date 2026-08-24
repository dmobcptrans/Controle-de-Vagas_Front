interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;

  userName?: string;
  showCurrentDate?: boolean;

  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  userName,
  showCurrentDate = false,
  children,
}: PageHeaderProps) {
  const currentDate = showCurrentDate
    ? new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(new Date())
    : null;

  return (
    <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {userName ? `Bem-vindo, ${userName}!` : title}
        </h1>

        {(description || currentDate) && (
          <p className="mt-1 text-xs text-white/60 capitalize">
            {description ?? currentDate}
          </p>
        )}

        {children}
      </div>
    </header>
  );
}