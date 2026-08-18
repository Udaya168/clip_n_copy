import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Clock, FileCheck2, Printer, Sparkles } from "lucide-react";
import { useState } from "react";
import { UploadPrintModal } from "@/components/UploadPrintModal";
import { PRINT_SERVICES, STORE } from "@/lib/data";
import slidePrinting from "@/assets/slide-printing.webp";
import { ShopLayout } from "@/components/ShopLayout";
import { ProductCarousel } from "@/components/ProductCarousel";

import { useScrollRestoration } from "@/lib/useScrollRestoration";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Printing, Photocopy & Binding — Clip N Copy" },
      {
        name: "description",
        content:
          "B&W and colour printing from ₹2/page, jumbo xerox, spiral and thesis binding, AutoCAD prints and lamination at Clip N Copy, ITPL Main Road Bengaluru.",
      },
      { property: "og:title", content: "Print. Bind. Done. — Clip N Copy" },
      {
        property: "og:description",
        content:
          "Professional printing, photocopy and binding services in Kundalahalli, Bengaluru.",
      },
    ],
  }),
  component: Services,
});

const STEPS = [
  { title: "Share your file", note: "Bring a pen drive, email it or upload here." },
  { title: "Pick your options", note: "Paper, colour, copies and finishing." },
  { title: "Collect in minutes", note: "Most jobs are ready in 15 minutes." },
];

function Services() {
  const [open, setOpen] = useState(false);
  
  useScrollRestoration(true);

  return (
    <ShopLayout>
      <div className="pb-6">
        <section className="section-shell pt-8">
          <div className="relative overflow-hidden rounded-3xl">
            <img
              src={slidePrinting}
              alt="Printer with stacks of documents"
              width={1400}
              height={900}
              className="h-72 w-full object-cover sm:h-88"
            />
            <div className="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/70 to-ink/20" />
            <div className="absolute inset-0 flex flex-col justify-center gap-4 p-6 text-ink-foreground sm:p-12">
              <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-accent uppercase">
                <Sparkles className="size-3.5" /> In-store services
              </p>
              <h1 className="max-w-lg font-display text-3xl font-black sm:text-5xl">
                Print. Bind. Done.
              </h1>
              <p className="max-w-md text-sm text-ink-foreground/80">
                Thesis binding, jumbo xerox, AutoCAD prints, lamination and laser colour printouts —
                all under one roof at {STORE.name}.
              </p>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex h-12 w-fit items-center gap-2 rounded-full accent-gradient px-6 font-bold text-accent-foreground shadow-glow"
              >
                Upload &amp; Print <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="section-shell py-12">
          <ProductCarousel>
            {PRINT_SERVICES.map((s) => (
              <div key={s.name} className="min-w-0 shrink-0 grow-0 pl-4 w-[85%] sm:w-[50%] lg:w-[33.333%]">
                <div className="surface-card card-lift p-6 h-full">
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <Printer className="size-5" />
                  </span>
                  <h2 className="mt-4 font-display text-lg font-bold">{s.name}</h2>
                  <p className="text-sm font-semibold text-primary">{s.price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
                </div>
              </div>
            ))}
          </ProductCarousel>
        </section>

        <section className="section-shell pb-12">
          <div className="surface-card grid gap-6 p-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title}>
                <span className="grid size-9 place-items-center rounded-full bg-ink font-display text-sm font-bold text-ink-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-display font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-shell pb-14">
          <div className="grid gap-4 sm:grid-cols-3">
            <Highlight
              icon={<Clock className="size-5" />}
              title="15 min average"
              note="Turnaround on standard print jobs"
            />
            <Highlight
              icon={<FileCheck2 className="size-5" />}
              title="Project ready"
              note="Spiral, comb and hard binding"
            />
            <Highlight
              icon={<Printer className="size-5" />}
              title="Up to A0"
              note="Jumbo xerox and drawing prints"
            />
          </div>
        </section>

        {open && <UploadPrintModal onClose={() => setOpen(false)} />}
      </div>
    </ShopLayout>
  );
}

function Highlight({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="surface-card flex items-center gap-4 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl accent-gradient text-accent-foreground">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display font-bold">{title}</span>
        <span className="block text-sm text-muted-foreground">{note}</span>
      </span>
    </div>
  );
}
