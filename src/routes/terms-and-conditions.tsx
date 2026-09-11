import { ShopLayout } from "@/components/ShopLayout";
import { STORE } from "@/lib/data";

export default function TermsAndConditionsPage() {
  return (
    <ShopLayout>
      <div className="section-shell pt-6 pb-10 md:pt-10 md:pb-16 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl text-foreground">Terms & Conditions</h1>
        </div>

        <div className="surface-card p-6 sm:p-10 space-y-8 text-foreground/80 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
            <p>
              Welcome to Clip N Copy. These terms and conditions outline the rules and regulations for the use of Clip N Copy's Website, located at Clip N Copy. By accessing this website we assume you accept these terms and conditions. Do not continue to use Clip N Copy if you do not agree to take all of the terms and conditions stated on this page.
            </p>
            <p>
              Clip N Copy provides stationery, books, school supplies, office supplies, printing, photocopying, binding and related services. This website is operated by Clip N Copy and associated under Mavros Tech Pvt Ltd.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Acceptance of Terms</h2>
            <p>
              Using the website means the customer agrees to these terms, including any future amendments or modifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Products and Services</h2>
            <p>
              We strive to display product descriptions, images, prices, and availability as accurately as possible. However, errors may occur. We reserve the right to correct any errors and to change or update information at any time without prior notice.
            </p>
            <p>
              We reserve the right to update products, pricing, and availability. We may modify or discontinue our printing and other services without notice at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Orders</h2>
            <p>
              Orders are placed through our website and are subject to acceptance by Clip N Copy. Upon placing an order, you will receive an order confirmation. The customer is responsible for providing accurate contact, payment, and delivery information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Printing & Upload Services</h2>
            <p>
              The customer is entirely responsible for the content of any uploaded files. You warrant that any files uploaded are legally owned or authorized by you for reproduction.
            </p>
            <p>
              We do not permit the printing of illegal, harmful, abusive, fraudulent, or copyrighted material without explicit permission. Clip N Copy reserves the right to reject files that violate applicable law or these terms. The printing specifications selected by the customer (such as paper type, size, and finishing) are their responsibility, and we print according to the selected options.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Pricing and Payments</h2>
            <p>
              All prices are displayed in Indian Rupees (INR). Prices are subject to change without notice. Applicable charges, including taxes and delivery fees, are shown before order confirmation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Delivery</h2>
            <p>
              Delivery availability and estimated delivery times will be provided at checkout. Clip N Copy is not liable for delays caused by circumstances outside the company's reasonable control.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">8. Customer Responsibilities</h2>
            <p>
              Customers must provide accurate contact and delivery information. Customers agree to the proper use of the website and shall not engage in misuse, fraudulent activity, or unauthorized access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">9. Intellectual Property</h2>
            <p>
              Website design, branding, logos, text, graphics, and software belong to Clip N Copy/Mavros Tech Pvt Ltd or their respective owners. Unauthorized use or reproduction is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">10. Prohibited Activities</h2>
            <p>
              Users must not engage in fraud, abuse, unauthorized access, malicious activity, the upload of unlawful content, scraping, or any attempts to disrupt the website or its services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Clip N Copy and Mavros Tech Pvt Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our website or services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">12. Changes to Terms</h2>
            <p>
              These terms may be updated from time to time. We encourage users to frequently check this page for any changes. Your continued use of the website after any changes indicates your acceptance of the new terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">13. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">14. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              <strong>{STORE.name}</strong><br />
              {STORE.address}<br />
              Phone: {STORE.phone}
            </p>
          </section>
        </div>
      </div>
    </ShopLayout>
  );
}
