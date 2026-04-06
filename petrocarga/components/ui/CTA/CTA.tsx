import Link from "next/link";
import { ReactNode } from "react";

type CTAProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  variant?: "dark" | "light";
};

export function CTA({
  href,
  title,
  description,
  icon,
  variant = "dark",
}: CTAProps) {
  const styles = {
    dark: {
      container:
        "bg-[#071D41] hover:bg-[#0C3D8A] border-[#FFCD07] text-white",
      description: "text-white/60",
      iconWrapper: "bg-white/15",
    },
    light: {
      container:
        "bg-white hover:bg-black/10 border-green-700 text-black shadow-sm",
      description: "text-gray-500",
      iconWrapper: "bg-green-700",
    },
  };

  const current = styles[variant];

  return (
    <div className="-mt-4 mb-5">
      <Link
        href={href}
        className={`flex items-center justify-between transition-colors rounded-2xl px-5 py-4 border-l-4 ${current.container}`}
      >
        <div>
          <p className="font-semibold text-[15px] mb-0.5">
            {title}
          </p>
          <p className={`text-xs ${current.description}`}>
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0 ${current.iconWrapper}`}
        >
          {icon}
        </div>
      </Link>
    </div>
  );
}