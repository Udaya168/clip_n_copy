import { useState } from "react";
import { ArrowLeft, Phone, Mail, MessageCircle, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppBack } from "@/lib/useAppBack";
import { STORE } from "@/lib/data";
import { ShopLayout } from "@/components/ShopLayout";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const goBack = useAppBack();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. Validation is handled by HTML5 `required` attributes natively before this triggers
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      setIsSuccess(true);
    } catch (err) {
      setError("Unable to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ShopLayout>
      <div className="section-shell py-10 md:py-16 max-w-5xl mx-auto">
        {/* Top Section */}
        <div className="mb-8">
          <button
            onClick={() => goBack("/")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </button>
          
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl text-foreground">Contact Us</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            We’re here to help. Get in touch with us for any questions, support, or assistance.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Main Content Area - Form / Success State */}
          <div className="order-2 lg:order-1">
            <div className="surface-card p-6 sm:p-8 relative min-h-[400px]">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center text-center h-full py-12 animate-in fade-in zoom-in duration-300">
                  <div className="grid size-20 place-items-center rounded-full bg-[#25D366]/10 text-[#25D366] mb-6">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground mb-3">Message Sent Successfully!</h2>
                  <p className="text-muted-foreground max-w-sm mb-8">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <Button 
                    onClick={() => setIsSuccess(false)}
                    variant="outline"
                    size="lg" 
                    className="rounded-full font-bold px-8"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-6">Send us a message</h2>
                  
                  {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl bg-destructive/10 p-4 text-destructive animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="size-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold">{error}</p>
                    </div>
                  )}
                  
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name *</label>
                        <input
                          type="text"
                          id="name"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address *</label>
                        <input
                          type="email"
                          id="email"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone Number (Optional)</label>
                        <input
                          type="tel"
                          id="phone"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                          placeholder="+91"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="subject" className="text-sm font-semibold text-foreground">Subject *</label>
                        <input
                          type="text"
                          id="subject"
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                          placeholder="How can we help?"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="message" className="text-sm font-semibold text-foreground">Message *</label>
                      <textarea
                        id="message"
                        disabled={isSubmitting}
                        rows={5}
                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y min-h-[120px] disabled:opacity-50"
                        placeholder="Describe your issue or question..."
                        required
                      ></textarea>
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full sm:w-auto h-12 px-8 rounded-full font-bold transition-all"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message <Send className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Contact Options */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Contact Options */}
            <div className="space-y-4">
              <a 
                href={`tel:${STORE.phoneRaw}`}
                className="group flex items-start gap-4 surface-card p-5 transition-all hover:border-primary/30 hover:bg-secondary/50"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Phone className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Call Us</h3>
                  <p className="mt-1 text-sm font-medium text-foreground">{STORE.phone}</p>
                  <p className="text-xs text-muted-foreground mt-1">Available 9:00 AM - 8:00 PM</p>
                </div>
              </a>
              
              <a 
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-4 surface-card p-5 transition-all hover:border-[#25D366]/30 hover:bg-[#25D366]/5"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                  <MessageCircle className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-[#25D366] transition-colors">WhatsApp</h3>
                  <p className="mt-1 text-sm font-medium text-foreground">Chat with us</p>
                  <p className="text-xs text-muted-foreground mt-1">Quickest response time</p>
                </div>
              </a>
              
              <a 
                href="mailto:support@clipncopy.in"
                className="group flex items-start gap-4 surface-card p-5 transition-all hover:border-primary/30 hover:bg-secondary/50"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Email Us</h3>
                  <p className="mt-1 text-sm font-medium text-foreground">support@clipncopy.in</p>
                  <p className="text-xs text-muted-foreground mt-1">We usually reply within 24 hours</p>
                </div>
              </a>
            </div>

            {/* Support Info */}
            <div className="surface-card p-6 bg-primary/5 border-primary/20">
              <h3 className="font-bold text-foreground mb-2">Need help with an order?</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Check your order status, track shipments, or request returns directly from your account.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/orders"
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  View My Orders
                </Link>
                <Link
                  to="/help"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-primary/20 bg-white px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                >
                  Visit Help & Support
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
