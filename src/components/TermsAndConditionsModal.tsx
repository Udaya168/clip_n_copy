import React, { useEffect, useRef } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { STORE } from "@/lib/data";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsAndConditionsModal({ isOpen, onClose }: TermsAndConditionsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl max-h-[85vh] bg-white rounded-[24px] shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 id="modal-title" className="text-[20px] sm:text-[24px] font-black text-slate-900 leading-tight">
              TERMS & CONDITIONS
            </h2>
            <p className="text-[13px] sm:text-[14px] text-slate-500 font-medium mt-1">
              Please review the important terms before using Clip N Copy.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-[14px] leading-relaxed text-slate-600 bg-slate-50/50">
          
          <section className="space-y-2">
            <h3 className="text-[16px] font-bold text-slate-900">1. Acceptance of Terms</h3>
            <p>
              Using the website means the customer agrees to these terms, including any future amendments or modifications. Do not continue to use Clip N Copy if you do not agree to take all of the terms and conditions stated here.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[16px] font-bold text-slate-900">2. Orders & Payments</h3>
            <p>
              Orders are placed through our website and are subject to acceptance by Clip N Copy. All prices are displayed in Indian Rupees (INR) and are subject to change without notice. Applicable charges, including taxes and delivery fees, are shown before order confirmation.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[16px] font-bold text-slate-900">3. Printing Services & Liability</h3>
            <p>
              The customer is entirely responsible for the content of any uploaded files. We do not permit the printing of illegal, harmful, abusive, fraudulent, or copyrighted material without explicit permission. Clip N Copy reserves the right to reject files that violate applicable law or these terms.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[16px] font-bold text-slate-900">4. Delivery / Pickup</h3>
            <p>
              Delivery availability and estimated delivery times will be provided at checkout. Clip N Copy is not liable for delays caused by circumstances outside the company's reasonable control.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[16px] font-bold text-slate-900">5. User Responsibility</h3>
            <p>
              Customers must provide accurate contact and delivery information. Customers agree to the proper use of the website and shall not engage in misuse, fraudulent activity, or unauthorized access.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[16px] font-bold text-slate-900">6. Privacy</h3>
            <p>
              Your use of the website is also governed by our Privacy Policy, which outlines how we collect, use, and protect your data. By using Clip N Copy, you consent to our data practices.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[16px] font-bold text-slate-900">7. Changes to Terms</h3>
            <p>
              These terms may be updated from time to time. We encourage users to frequently check for any changes. Your continued use of the website after any changes indicates your acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-200">
            <h3 className="text-[16px] font-bold text-slate-900">Contact</h3>
            <p>
              If you have any questions about these Terms, please contact us at: <br/>
              <strong>{STORE.name}</strong> • Phone: {STORE.phone} <br/>
              {STORE.address}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-white shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto sm:px-8 h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[15px] transition-colors shadow-sm flex items-center justify-center sm:mx-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
