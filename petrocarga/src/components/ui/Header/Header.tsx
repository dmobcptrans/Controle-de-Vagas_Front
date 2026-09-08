import { ReactNode } from 'react';

interface PaginationInfo {
  totalElementos: number;
  totalPaginas: number;
  tamanhoPagina: number;
  pagina: number;
}

interface HeaderProps {
  /**
   * Título principal do Header
   */
  title: string;

  /**
   * Subtítulo opcional
   */
  subtitle?: string | null;

  /**
   * Mostra a data atual automaticamente
   */
  showDate?: boolean;

  /**
   * Mostra a hora atual automaticamente
   */
  showTime?: boolean;

  /**
   * Informações de paginação.
   * Quando informado, o Header mostra:
   * "Página X de Y • Z elementos"
   */
  pagination?: PaginationInfo;

  /**
   * Conteúdo adicional opcional
   */
  children?: ReactNode;

  /**
   * Classes adicionais
   */
  className?: string;
}

export function Header({
  title,
  subtitle,
  showDate = false,
  showTime = false,
  pagination,
  children,
  className = '',
}: HeaderProps) {
  /**
   * Data atual
   */
  const agora = new Date();

  const hoje = agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  /**
   * Hora atual
   */
  const hora = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  /**
   * Página atual convertida para uma
   * representação amigável.
   *
   * Backend normalmente começa em 0.
   */
  const paginaAtual = pagination ? pagination.pagina + 1 : 0;

  return (
    <header
      className={`
        bg-blue-800
        px-4
        pt-1
        pb-7
        sm:px-8
        ${className}
      `}
    >
      <div className="mx-auto max-w-4xl">
        {/* =====================================================
            TÍTULO
        ===================================================== */}
        <h1
          className="
            mb-1
            text-2xl
            font-bold
            tracking-tight
            text-white
          "
        >
          {title}
        </h1>

        {/* =====================================================
            SUBTÍTULO / DATA / HORA
        ===================================================== */}
        {(subtitle || showDate || showTime) && (
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-2
              gap-y-1
            "
          >
            {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}

            {showDate && (
              <p
                className="
                  text-xs
                  capitalize
                  text-white/50
                "
              >
                {hoje}
              </p>
            )}

            {showTime && (
              <>
                {(subtitle || showDate) && (
                  <span className="text-xs text-white/30">•</span>
                )}

                <p className="text-xs text-white/50">{hora}</p>
              </>
            )}
          </div>
        )}

        {/* =====================================================
            PAGINAÇÃO INFORMATIVA
        ===================================================== */}
        {pagination && (
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              text-white/50
            "
          >
            <span>
              Página{' '}
              <span className="font-medium text-white/80">{paginaAtual}</span>{' '}
              de{' '}
              <span className="font-medium text-white/80">
                {pagination.totalPaginas}
              </span>
            </span>

            <span className="text-white/30">•</span>

            <span>
              {pagination.totalElementos}{' '}
              {pagination.totalElementos === 1 ? 'elemento' : 'elementos'}
            </span>
          </div>
        )}

        {/* =====================================================
            CONTEÚDO EXTRA
        ===================================================== */}
        {children}
      </div>
    </header>
  );
}
