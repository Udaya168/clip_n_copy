import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Clock, Printer, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero.webp";

export function HeroSection() {
  return (
    <section className="section-shell pt-6 md:pt-10 pb-6">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0B2455] text-white shadow-xl">
        <div className="grid items-center md:grid-cols-2">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.15 }}
            className="flex flex-col justify-center gap-8 p-8 sm:p-12 lg:p-16"
          >
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-xl font-display text-4xl leading-[1.1] font-black tracking-tight sm:text-5xl lg:text-6xl text-white"
              >
                Everything you need,
                <br />
                all in one place.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md text-lg text-blue-100 sm:text-xl font-medium"
              >
                Books, stationery, office supplies, printing & more delivered fast.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/shop"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-[#FF8C00] px-8 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(255,140,0,0.5)] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:bg-[#FF9B26] hover:shadow-[0_12px_24px_-6px_rgba(255,140,0,0.6)]"
              >
                Shop Now <ArrowRight className="size-5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 text-sm font-bold backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:bg-white/20 hover:border-white/40"
              >
                Explore Services
              </Link>
            </motion.div>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 text-sm text-blue-200 font-semibold sm:flex sm:flex-wrap sm:gap-x-8">
              {[
                { icon: <Clock className="size-5 text-[#FF8C00]" />, text: "Same-day Delivery" },
                { icon: <Printer className="size-5 text-[#FF8C00]" />, text: "Printing & Binding" },
                { icon: <BadgeCheck className="size-5 text-[#FF8C00]" />, text: "Genuine Brands" },
                { icon: <ShieldCheck className="size-5 text-[#FF8C00]" />, text: "Secure Payment" }
              ].map((badge, i) => (
                <motion.li 
                  key={badge.text}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2"
                >
                  {badge.icon} {badge.text}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Image */}
          <div className="relative h-64 sm:h-80 md:h-full md:min-h-[36rem] order-first md:order-last overflow-hidden">
            <motion.img
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 8, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              src={heroImage}
              alt="Stationery and supplies on a desk"
              width={1600}
              height={1100}
              className="absolute inset-0 size-full object-cover origin-center"
            />
            {/* Gradient overlay to smoothly blend image into the dark background on desktop */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2455] via-[#0B2455]/40 to-transparent md:bg-gradient-to-r md:from-[#0B2455] md:via-[#0B2455]/20 md:to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
