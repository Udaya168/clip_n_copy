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
      <div className="hidden md:flex h-[100dvh] overflow-hidden w-full relative font-sans flex-row bg-[#0647E8] box-border">
        
        {/* Background Cutout */}
        <div className="absolute top-0 right-0 h-full w-[50%] bg-[#F8FAFC] z-0" />
        
        {/* Soft overlay patterns */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden w-[50%]">
          <div 
            className="absolute inset-0 opacity-[0.1]" 
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #ffffff 2px, transparent 0)", backgroundSize: "32px 32px" }} 
          />
          <div className="absolute -top-[10%] -left-[5%] w-[80%] h-[40%] rounded-full bg-white/10 blur-[100px]" />
        </div>

        {/* Left Side: Promotional Panel */}
        <div className="w-[50%] flex flex-col px-[40px] lg:px-[60px] xl:px-[80px] py-[32px] relative z-10 shrink-0 h-full box-border">
          <div className="flex-none mb-[40px]">
            <button 
              onClick={(e) => { e.preventDefault(); goBack("/"); }}
              className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors text-[14px] font-medium z-30 animate-fade-scale w-fit"
            >
              <ArrowLeft className="w-[18px] h-[18px]" /> Back to Home
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-[500px] w-full mx-auto lg:mx-0 animate-slide-right">
            <div className="mb-[16px] animate-fade-scale">
              <img src="/logo.webp" alt="Clip N Copy" className="h-[44px] md:h-[50px] w-auto object-contain" />
              <div className="mt-1 text-[10px] font-bold text-blue-200 tracking-[0.2em]">
                BOOK, STATIONERY & PRINTING
              </div>
            </div>
            
            <h1 className="text-[52px] font-black text-white leading-[0.95] mb-[12px] tracking-tight">
              <div className="animate-slide-right" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>Create.</div>
              <div className="text-blue-200 animate-slide-right" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>Edit.</div>
              <div className="animate-slide-right" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>Copy.</div>
            </h1>
            
            <p className="text-blue-100 text-[18px] max-w-[500px] leading-[1.4] mb-[16px] font-medium stagger-1">
              Your creative workspace starts here. Clip N Copy helps you create, edit, organize, and manage your content with ease.
            </p>
            
            <div className="flex flex-col gap-[10px]">
              {[
                { icon: Zap, title: "FAST CONTENT CREATION", desc: "Streamline your workflow." },
                { icon: Edit3, title: "SMART EDITING TOOLS", desc: "Everything you need to polish your work." },
                { icon: Layers, title: "EASY PROJECT MANAGEMENT", desc: "Organize your projects efficiently." },
                { icon: Cloud, title: "SECURE CLOUD STORAGE", desc: "Keep your data safe and accessible." },
              ].map((f, i) => (
                <div key={i} className={`stagger-${i+1}`}>
                  <div className="flex items-center gap-[16px] px-[16px] py-[8px] rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm group cursor-default h-[62px] box-border">
                    <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                      <f.icon className="w-[20px] h-[20px] text-[#0647E8] transition-transform duration-300" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-white font-bold text-[16px] tracking-wide leading-tight">{f.title}</h3>
                      <p className="text-blue-200 text-[14px] mt-0.5 leading-tight">{f.desc}</p>
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
