import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, ChevronUp, LifeBuoy, HelpCircle, FileText, BookOpen, Truck, CreditCard, ShoppingBag, RotateCcw, User, MapPin, Printer } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — Clip N Copy" },
      { name: "description", content: "Find answers, get support, and learn more about shopping with Clip N Copy." }
    ]
  }),
  component: HelpPage,
});

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-foreground transition-colors hover:text-primary"
      >
        <span>{question}</span>
        {open ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && <div className="pb-4 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2">{answer}</div>}
    </div>
  );
}

import { useAppBack } from "@/lib/useAppBack";

function HelpPage() {
  const goBack = useAppBack();

  return (
    <div className="section-shell py-10">
      <div className="mb-6">
        <button
          onClick={() => goBack("/")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </button>
      </div>

      <div className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl text-foreground">How Can We Help?</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Find answers, get support, and learn more about shopping with Clip N Copy.
        </p>
      </div>

      <div className="mx-auto max-w-5xl space-y-10">
          
          {/* CUSTOMER SUPPORT */}
          <section className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                <LifeBuoy className="size-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Customer Support</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Need help with your order, product, payment, or account? Our customer support team is here to help.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-primary/50" /> Order and delivery assistance</li>
              <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-primary/50" /> Product and availability questions</li>
              <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-primary/50" /> Payment and checkout support</li>
              <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-primary/50" /> Account and profile assistance</li>
              <li className="flex items-center gap-2"><div className="size-1.5 rounded-full bg-primary/50" /> General shopping assistance</li>
            </ul>
            <Link
              to="/contact"
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </Link>
          </section>

          {/* FAQs */}
          <section className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                <HelpCircle className="size-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Frequently Asked Questions</h2>
            </div>
            <div className="flex flex-col">
              <FAQItem 
                question="How can I place an order?"
                answer="Browse the store, select a product, add it to your cart, and proceed to checkout. Enter your delivery details and place the order."
              />
              <FAQItem 
                question="Can I change my order after placing it?"
                answer="Contact customer support as soon as possible. Changes may depend on whether the order has already been processed."
              />
              <FAQItem 
                question="How can I track my order?"
                answer="Use the Track Order option to check the current status of your order."
              />
              <FAQItem 
                question="What payment methods are available?"
                answer="Available payment options are shown during checkout."
              />
              <FAQItem 
                question="What if a product is out of stock?"
                answer="You can check other available products or contact us to ask about availability."
              />
              <FAQItem 
                question="Can I return a product?"
                answer="Returns are subject to the store's return policy and product eligibility. Contact support for assistance."
              />
              <FAQItem 
                question="How long does delivery take?"
                answer="Delivery time depends on your location, product availability, and the selected delivery option."
              />
            </div>
          </section>
          
          {/* HELP CENTER */}
          <section className="surface-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                <BookOpen className="size-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Help Center</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Looking for help with something specific? Choose a topic below.
            </p>
            
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-1">
                  <Truck className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Orders & Delivery</h3>
                </div>
                <p className="text-xs text-muted-foreground pl-7">Get help with order status, delivery updates, and order-related questions.</p>
              </div>
              
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-1">
                  <CreditCard className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Payments & Checkout</h3>
                </div>
                <p className="text-xs text-muted-foreground pl-7">Learn about checkout, payment options, and payment-related issues.</p>
              </div>
              
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-1">
                  <ShoppingBag className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Products & Availability</h3>
                </div>
                <p className="text-xs text-muted-foreground pl-7">Find information about stationery products, stock availability, and product details.</p>
              </div>
              
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-1">
                  <RotateCcw className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Returns & Refunds</h3>
                </div>
                <p className="text-xs text-muted-foreground pl-7">Learn about eligible returns, refunds, and return requests.</p>
              </div>
              
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-1">
                  <User className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Account & Login</h3>
                </div>
                <p className="text-xs text-muted-foreground pl-7">Get help with signing in, account details, and profile-related issues.</p>
              </div>
              
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-1">
                  <MapPin className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Store & Pickup</h3>
                </div>
                <p className="text-xs text-muted-foreground pl-7">Find information about store pickup and visiting the Clip N Copy store.</p>
              </div>
              
              <div className="group cursor-pointer">
                <div className="flex items-center gap-3 mb-1">
                  <Printer className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Printing & Binding Services</h3>
                </div>
                <p className="text-xs text-muted-foreground pl-7">Get information about printing, photocopying, binding, and project printing services.</p>
              </div>
            </div>
          </section>

          {/* TERMS & CONDITIONS */}
          <section className="surface-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                <FileText className="size-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Terms & Conditions</h2>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Shopping</h4>
                <p className="text-xs leading-relaxed">Product information, pricing, and availability may change from time to time.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Orders</h4>
                <p className="text-xs leading-relaxed">An order is confirmed only after successful placement through the checkout process.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Pricing</h4>
                <p className="text-xs leading-relaxed">Prices displayed on the website are the current selling prices. Any applicable charges will be shown during checkout.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Product Availability</h4>
                <p className="text-xs leading-relaxed">Products are subject to availability. An item may become unavailable before an order is processed.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Delivery</h4>
                <p className="text-xs leading-relaxed">Delivery timelines may vary depending on location, product availability, and operational conditions.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Returns</h4>
                <p className="text-xs leading-relaxed">Returns and refunds are subject to the applicable Clip N Copy return policy.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Account</h4>
                <p className="text-xs leading-relaxed">Customers are responsible for maintaining the security of their account credentials.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Website Use</h4>
                <p className="text-xs leading-relaxed">Users should provide accurate information while placing orders and using the website.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider mb-1">Policy Updates</h4>
                <p className="text-xs leading-relaxed">Clip N Copy may update these terms when necessary. Updated terms will be reflected on the website.</p>
              </div>
            </div>
          </section>
      </div>
      
      {/* Footer Contact CTA */}
      <div className="mx-auto mt-12 max-w-5xl rounded-3xl bg-primary/5 p-8 text-center sm:p-12">
        <h3 className="font-display text-2xl font-bold text-foreground">Still need help?</h3>
        <p className="mt-2 text-sm text-muted-foreground mb-6">
          Can't find what you're looking for? Our support team is ready to help.
        </p>
        <Link
          to="/contact"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
