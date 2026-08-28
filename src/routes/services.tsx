import { ArrowRight, Book, Briefcase, Clock, Copy, FileCheck2, FileText, Palette, Printer } from "lucide-react";
import { useState } from "react";
import { UploadPrintModal } from "@/components/UploadPrintModal";
import { PRINT_SERVICES } from "@/lib/data";
import slidePrinting from "@/assets/slide-printing.webp";
import { ShopLayout } from "@/components/ShopLayout";
import { useScrollRestoration } from "@/lib/useScrollRestoration";

const STEPS = [
  { title: "Share your file", note: "Bring a pen drive, email it or upload here." },
  { title: "Pick your options", note: "Paper, colour, copies and finishing." },
  { title: "Collect in minutes", note: "Most jobs are ready in 15 minutes." },
];

function getServiceIcon(name: string) {
  switch (name) {
    case "Color Printing": return <Palette className="size-5 sm:size-6" />;
    case "Photocopy": return <Copy className="size-5 sm:size-6" />;
    case "Spiral Binding": return <Book className="size-5 sm:size-6" />;
    case "Project Printing": return <FileText className="size-5 sm:size-6" />;
    case "Resume Printing": return <Briefcase className="size-5 sm:size-6" />;
    case "B&W Printing":
    default:
      return <Printer className="size-5 sm:size-6" />;
  }
}

export default function ServicesPage() {
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  useScrollRestoration(true);

  const handleOrder = (serviceName: string | null = null) => {
    setSelectedService(serviceName);
    setOpen(true);
  };

  return (
    <ShopLayout>
      <div className="pb-12 sm:pb-16 bg-background">
        
        {/* HERO SECTION */}
        <section className="mx-auto max-w-[1150px] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
          <div className="relative overflow-hidden rounded-[24px] sm:rounded-[2rem] bg-ink text-ink-foreground shadow-lg border border-border/10 min-h-[320px] sm:min-h-[440px] flex items-center">
            <img
              src={slidePrinting}
              alt="Professional printing services"
              className="absolute right-0 top-0 h-full w-full object-cover opacity-20 sm:opacity-60 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 sm:via-ink/80 to-transparent" />
            <div className="relative z-10 flex flex-col justify-center p-6 sm:p-14 md:p-16 w-full">
              <span className="mb-4 sm:mb-5 inline-block text-[11px] sm:text-[13px] font-bold text-accent uppercase tracking-[0.1em]">
                ✦ IN-STORE SERVICES
              </span>
              <h1 className="font-display text-[36px] sm:text-5xl lg:text-[64px] font-black text-white leading-[1.1] sm:leading-[1.05] tracking-tight mb-4 sm:mb-6 max-w-[280px] sm:max-w-none">
                Print. Bind. Done.
              </h1>
              <p className="text-[15px] sm:text-lg md:text-[19px] text-white/90 max-w-[100%] sm:max-w-[600px] leading-relaxed mb-6 sm:mb-10 line-clamp-3 sm:line-clamp-none">
                Thesis binding, jumbo xerox, AutoCAD prints, lamination and laser colour printouts — all under one roof at Clip N Copy.
              </p>
              <button
                onClick={() => handleOrder(null)}
                className="inline-flex h-[52px] sm:h-[54px] w-fit sm:w-[220px] items-center justify-center gap-2 rounded-full bg-primary px-8 font-bold text-white hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-glow"
              >
                Upload &amp; Print <ArrowRight className="size-4 sm:size-5" />
              </button>
            </div>
          </div>
        </section>

        {/* CORE SERVICES */}
        <section className="mx-auto max-w-[1150px] px-4 sm:px-6 lg:px-8 mt-[48px] sm:mt-[75px]">
          <h2 className="font-display text-[28px] sm:text-3xl font-black text-ink mb-6 sm:mb-10 leading-[1.1] max-w-[300px] sm:max-w-none">
            Everything you need, printed right
          </h2>
          
          {/* CORE SERVICES GRID */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {PRINT_SERVICES.map((s) => (
              <div 
                key={s.name} 
                className="group flex flex-col rounded-[20px] sm:rounded-[24px] bg-card p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.02)] border border-border/40 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)] hover:border-primary/20 transition-all hover:-translate-y-1 h-full min-h-[175px] sm:min-h-auto"
              >
                <div className="size-10 sm:size-12 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/20 transition-colors">
                  {getServiceIcon(s.name)}
                </div>
                <h3 className="text-[18px] sm:text-xl font-display font-bold text-ink mb-1 sm:mb-2">{s.name}</h3>
                <p className="text-[13px] sm:text-sm text-muted-foreground mb-4 sm:mb-6 flex-1 leading-relaxed">{s.note}</p>
                <div className="flex items-center justify-between border-t border-border/40 pt-3 sm:pt-4 mt-auto">
                  <span className="text-[12px] sm:text-[13px] font-bold text-primary">{s.price}</span>
                  <button 
                    onClick={() => handleOrder(s.name)} 
                    className="text-[12px] sm:text-[13px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Order now <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-[1150px] px-4 sm:px-6 lg:px-8 mt-[48px] sm:mt-[90px]">
          <div className="text-left sm:text-center mb-6 sm:mb-12">
            <h2 className="font-display text-[28px] sm:text-3xl font-black text-ink leading-[1.1] mb-2 sm:mb-0">How It Works</h2>
            <p className="text-[14px] text-muted-foreground sm:hidden">Get your documents printed in three simple steps.</p>
          </div>
          
          <div className="relative">
            {/* Desktop connecting line */}
            <div className="absolute top-[28px] left-[18%] right-[18%] hidden h-[1px] bg-primary/20 sm:block" />
            
            <div className="grid gap-4 sm:gap-10 grid-cols-1 sm:grid-cols-3 relative z-10">
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-4 sm:gap-0 bg-secondary/10 sm:bg-transparent rounded-[20px] sm:rounded-none p-5 sm:p-0 border border-border/40 sm:border-0 shadow-sm sm:shadow-none">
                  {/* Mobile Badge */}
                  <div className="sm:hidden size-7 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[14px]">
                    {i + 1}
                  </div>
                  {/* Desktop Large Number */}
                  <span className="hidden sm:inline-block font-display text-[56px] leading-[56px] font-black text-primary/30 mb-6 bg-background sm:px-6">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-[16px] sm:text-[20px] font-bold text-ink mb-1 sm:mb-2">
                      {s.title}
                    </h3>
                    <p className="text-[13px] sm:text-[16px] text-muted-foreground sm:max-w-[240px] leading-relaxed">{s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICE BENEFITS */}
        <section className="mx-auto max-w-[1150px] px-4 sm:px-6 lg:px-8 mt-[48px] sm:mt-[56px]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-around gap-4 sm:gap-6 rounded-[24px] sm:rounded-2xl bg-transparent sm:bg-secondary/30 p-0 sm:px-10 sm:py-6 border-0">
            
            <div className="flex items-center gap-4 sm:gap-3 bg-secondary/10 sm:bg-transparent rounded-[20px] sm:rounded-none p-4 sm:p-0 border border-border/40 sm:border-0 shadow-sm sm:shadow-none">
              <div className="size-10 sm:size-auto shrink-0 bg-primary/10 sm:bg-transparent rounded-full flex items-center justify-center">
                <Clock className="size-5 text-primary" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                <span className="font-bold text-ink text-[15px] sm:text-[16px]">15 Min Average</span>
                <span className="text-[13px] sm:hidden text-muted-foreground">Turnaround on standard print jobs</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-3 bg-secondary/10 sm:bg-transparent rounded-[20px] sm:rounded-none p-4 sm:p-0 border border-border/40 sm:border-0 shadow-sm sm:shadow-none">
              <div className="size-10 sm:size-auto shrink-0 bg-primary/10 sm:bg-transparent rounded-full flex items-center justify-center">
                <FileCheck2 className="size-5 text-primary" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                <span className="font-bold text-ink text-[15px] sm:text-[16px]">Project Ready</span>
                <span className="text-[13px] sm:hidden text-muted-foreground">Spiral, comb and hard binding</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-3 bg-secondary/10 sm:bg-transparent rounded-[20px] sm:rounded-none p-4 sm:p-0 border border-border/40 sm:border-0 shadow-sm sm:shadow-none">
              <div className="size-10 sm:size-auto shrink-0 bg-primary/10 sm:bg-transparent rounded-full flex items-center justify-center">
                <Printer className="size-5 text-primary" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                <span className="font-bold text-ink text-[15px] sm:text-[16px]">Up to A0 Size</span>
                <span className="text-[13px] sm:hidden text-muted-foreground">Jumbo xerox and drawing prints</span>
              </div>
            </div>
            
          </div>
        </section>

        {open && <UploadPrintModal onClose={() => setOpen(false)} serviceName={selectedService} />}
      </div>
    </ShopLayout>
  );
}
