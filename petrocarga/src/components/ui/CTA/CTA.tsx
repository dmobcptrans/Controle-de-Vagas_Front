import Link from 'next/link';
import { ReactNode } from 'react';

type CTAProps = {
  href?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'dark' | 'light';
  children?: ReactNode;
  className?: string;

  /**
   * Quando true, o CTA filho controla
   * a estrutura interna, mas mantém
   * a identidade visual do CTA pai.
   */
  unstyled?: boolean;
};

export function CTA({
  href,
  title,
  description,
  icon,
  onClick,
  variant = 'dark',
  children,
  className = '',
  unstyled = false,
}: CTAProps) {
const styles = {
  dark: {
    container: 'bg-[#071D41] border-[#FFCD07]',
    text: 'text-white',
    hover: 'hover:bg-[#0C3D8A]',
    description: 'text-white/60',
    iconWrapper: 'bg-white/15',
  },

  light: {
    container: 'bg-white border-green-700 shadow-sm',
    text: 'text-black',
    hover: 'hover:bg-black/10',
    description: 'text-gray-500',
    iconWrapper: 'bg-green-700',
  },
};

  const current = styles[variant];

  const content = (
    <>
      {(title || description) && (
        <div className="min-w-0">
          {title && (
            <p className="font-semibold text-[15px] mb-0.5">
              {title}
            </p>
          )}

          {description && (
            <p className={`text-xs ${current.description}`}>
              {description}
            </p>
          )}
        </div>
      )}

      {icon && (
        <div
          className={`
            rounded-xl
            w-11 h-11
            flex items-center justify-center
            flex-shrink-0
            ${current.iconWrapper}
          `}
        >
          {icon}
        </div>
      )}

      {children}
    </>
  );

  /**
   * Estrutura padrão do CTA.
   *
   * O unstyled remove apenas essa parte,
   * permitindo que o filho controle seu layout.
   */
  const defaultClassName = `
    flex
    items-center
    justify-between
    gap-4
    w-full
    px-5
    py-4
    text-left
  `;

  /**
   * Identidade visual compartilhada por todos os CTAs.
   */
  const baseClassName = `
    rounded-2xl
    border-l-4
    overflow-hidden
  `;

  const isInteractive =
    !!href || (!!onClick && !children);

const classNameFinal = `
  ${baseClassName}
  ${unstyled ? '' : defaultClassName}

  ${current.container}
  ${unstyled ? '' : current.text}
  ${unstyled || !isInteractive ? '' : current.hover}

  ${className}
`;
  /**
   * O espaçamento externo continua sendo
   * responsabilidade do CTA pai.
   */
  const wrapperClassName = '-mt-4 mb-5';

  // CTA de navegação
  if (href) {
    return (
      <div className={wrapperClassName}>
        <Link
          href={href}
          className={`
            ${classNameFinal}
            ${isInteractive ? 'cursor-pointer' : ''}
          `}
        >
          {content}
        </Link>
      </div>
    );
  }

  // CTA com interação simples
  if (onClick && !children) {
    return (
      <div className={wrapperClassName}>
        <button
          type="button"
          onClick={onClick}
          className={`
            ${classNameFinal}
            cursor-pointer
          `}
        >
          {content}
        </button>
      </div>
    );
  }

  // CTA composto
  return (
    <div className={wrapperClassName}>
      <div
        className={`
          ${classNameFinal}
          cursor-default
        `}
      >
        {content}
      </div>
    </div>
  );
}