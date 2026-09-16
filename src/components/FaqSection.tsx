import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";

const faqs: [string, string][] = [
  ["Do you deliver nearby?", "Yes. Clip N Copy offers delivery within a 5 km radius around the store."],
  ["Can I send files for printing?", "Yes. Send your print requirements on WhatsApp and the team will confirm the format, finish and turnaround."],
  ["What printing services are available?", "Document printing, spiral binding, lamination, brochures, banners, posters, ID cards and magazines are available."],
  ["When is the store open?", "The Kundalahalli store is open daily from 9:00 AM to 9:30 PM."],
];

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-4 sm:px-7 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="animate-rise">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Before you visit</p>
          <h2 className="mt-3 font-display text-5xl font-extrabold leading-[0.92] sm:text-7xl text-foreground">
            Quick<br />answers.
          </h2>
          <div className="mt-8 flex items-center gap-3 border-l-2 border-foreground pl-4">
            <ShieldCheck className="size-6 text-primary" />
            <p className="max-w-xs text-xs leading-5 text-muted-foreground">
              For a custom printing request, WhatsApp the store directly for the fastest confirmation.
            </p>
          </div>
        </div>

        <div className="border-t border-border animate-rise" style={{ animationDelay: "150ms" }}>
          {faqs.map(([question, answer], index) => {
            const open = openFaq === index;
            return (
              <div key={question} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : index)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${index}`}
                  className="flex w-full items-center gap-4 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer group"
                >
                  <span className="text-[10px] font-bold text-primary">0{index + 1}</span>
                  <strong className="flex-1 font-display text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors">{question}</strong>
                  <ChevronDown className={`size-5 text-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                </button>
                <div
                  id={`faq-panel-${index}`}
                  className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <p className="overflow-hidden pb-6 pl-9 text-sm leading-6 text-muted-foreground">
                    {answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
