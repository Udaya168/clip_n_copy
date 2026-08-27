import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function SectionHead({
  eyebrow,
  title,
  sub,
  ctaLabel,
  to,
  search,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  ctaLabel?: string;
  to?: string;
  search?: Record<string, string>;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-bold tracking-widest text-primary uppercase">{eyebrow}</p>
        )}
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{title}</h2>
        {sub && <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {ctaLabel && to && (
        <Link
          to={to}
          
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primary hover:gap-2.5 transition-all"
        >
          {ctaLabel} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
