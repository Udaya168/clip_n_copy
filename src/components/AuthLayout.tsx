import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Edit3, Layers, Cloud } from "lucide-react";
import { useAppBack } from "@/lib/useAppBack";

export function AuthLayout({ children }: { children: ReactNode }) {
  const goBack = useAppBack();
  return (
    <>
      {/* MOBILE UI (< 768px) */}
      <div className="flex flex-col h-[100dvh] overflow-hidden w-full bg-[#F8FAFC] md:hidden px-4 py-4 font-sans box-border">
        <div className="mb-4 shrink-0">
          <button 
            onClick={(e) => { e.preventDefault(); goBack("/"); }}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0647E8] transition-colors text-[13px] font-medium"
          >
            <ArrowLeft className="w-[16px] h-[16px]" /> Back to Home
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-[400px] mx-auto min-h-0">
          <div className="mb-4 flex flex-col items-center animate-fade-scale shrink-0">
            <img src="/logo.webp" alt="Clip N Copy" className="h-[38px] w-auto object-contain" />
            <div className="mt-1.5 text-[9px] font-bold text-[#0647E8] tracking-[0.2em] text-center">
              BOOK, STATIONERY & PRINTING
            </div>
          </div>
          
          <div className="w-full bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-slide-up flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
            {children}
          </div>
        </div>
      </div>

      {/* DESKTOP UI (>= 768px) */}
      <div className="hidden md:flex h-[100dvh] overflow-hidden w-full relative font-sans flex-row bg-gradient-to-br from-[#081021] via-[#0B1A3F] to-[#122A63] box-border">
        
        {/* Background Cutout for the right side */}
        <div className="absolute top-0 right-0 h-full w-[50%] bg-[#F8FAFC] z-0" />
        
        {/* Soft overlay patterns & depth effects */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden w-[50%]">
          {/* Subtle dots texture */}
          <div 
            className="absolute inset-0 opacity-[0.02]" 
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #ffffff 2px, transparent 0)", backgroundSize: "32px 32px" }} 
          />
          {/* Soft radial glow behind the content */}
          <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[50%] rounded-full bg-[#3B82F6]/10 blur-[120px]" />
          <div className="absolute bottom-0 left-[20%] w-[60%] h-[40%] rounded-full bg-[#1E3A8A]/20 blur-[100px]" />
        </div>

        {/* Left Side: Promotional Panel */}
        <div className="w-[50%] flex flex-col px-[40px] lg:px-[60px] xl:px-[80px] py-[32px] relative z-10 shrink-0 h-full box-border">
          <div className="flex-none mb-[40px]">
            <button 
              onClick={(e) => { e.preventDefault(); goBack("/"); }}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-[14px] font-medium z-30 animate-fade-scale w-fit"
            >
              <ArrowLeft className="w-[18px] h-[18px]" /> Back to Home
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-[500px] w-full mx-auto lg:mx-0 animate-slide-right">
            <div className="mb-[24px] animate-fade-scale flex flex-col items-start lg:items-start mx-auto lg:mx-0 items-center">
              <div className="bg-white px-5 py-2.5 rounded-2xl shadow-lg inline-flex mb-1">
                <img src="/logo.webp" alt="Clip N Copy" className="h-[40px] md:h-[46px] w-auto object-contain" />
              </div>
              <div className="mt-2 text-[10px] font-bold text-blue-200/70 tracking-[0.25em] text-center lg:text-left">
                BOOK, STATIONERY & PRINTING
              </div>
            </div>
            
            <h1 className="text-[52px] font-black text-white/90 leading-[0.95] mb-[16px] tracking-tight drop-shadow-sm">
              <div className="animate-slide-right" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>Create.</div>
              <div className="text-blue-300/80 animate-slide-right" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>Edit.</div>
              <div className="animate-slide-right" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>Copy.</div>
            </h1>
            
            <p className="text-slate-300 text-[17px] max-w-[480px] leading-[1.5] mb-[24px] font-medium stagger-1">
              Your creative workspace starts here. Clip N Copy helps you create, edit, organize, and manage your content with ease.
            </p>
            
            <div className="flex flex-col gap-[12px]">
              {[
                { icon: Zap, title: "Fast Content Creation", desc: "Streamline your workflow." },
                { icon: Edit3, title: "Smart Editing Tools", desc: "Everything you need to polish your work." },
                { icon: Layers, title: "Easy Project Management", desc: "Organize your projects efficiently." },
                { icon: Cloud, title: "Secure Cloud Storage", desc: "Keep your data safe and accessible." },
              ].map((f, i) => (
                <div key={i} className={`stagger-${i+1}`}>
                  <div className="flex items-center gap-[16px] px-[20px] py-[12px] rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group cursor-default h-[70px] box-border backdrop-blur-sm">
                    <div className="w-[42px] h-[42px] bg-white/[0.08] rounded-xl flex items-center justify-center border border-white/[0.05] shrink-0 group-hover:scale-105 group-hover:bg-white/[0.12] transition-all duration-300">
                      <f.icon className="w-[18px] h-[18px] text-blue-200/90 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-white/80 font-semibold text-[15px] tracking-wide leading-tight group-hover:text-white transition-colors">{f.title}</h3>
                      <p className="text-slate-400 text-[13px] mt-1 leading-tight">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Side: Login Card */}
        <div className="w-[50%] flex flex-col items-center justify-center p-8 lg:p-12 relative z-20 shrink-0 h-full animate-slide-left box-border bg-[#F8FAFC]">
          <div 
            className="w-full bg-[#FFFFFF] relative z-20 mx-auto"
            style={{ 
              maxWidth: '540px',
              borderRadius: '30px',
              padding: '44px 40px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)'
            }}
          >
            {children}
          </div>
        </div>
      </div>
      
      <style>
        {`
          .animate-slide-right { animation: fadeSlideRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-left { animation: fadeSlideLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-fade-scale { animation: fadeScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-slide-up { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          
          @keyframes fadeSlideRight {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeSlideLeft {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes staggerUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .stagger-1 { animation: staggerUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.1s; opacity: 0; }
          .stagger-2 { animation: staggerUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.2s; opacity: 0; }
          .stagger-3 { animation: staggerUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.3s; opacity: 0; }
          .stagger-4 { animation: staggerUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: 0.4s; opacity: 0; }
        `}
      </style>
    </>
  );
}
