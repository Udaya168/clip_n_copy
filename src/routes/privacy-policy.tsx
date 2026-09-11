import { ShopLayout } from "@/components/ShopLayout";
import { STORE } from "@/lib/data";

export default function PrivacyPolicyPage() {
  return (
    <ShopLayout>
      <div className="section-shell pt-6 pb-10 md:pt-10 md:pb-16 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl text-foreground">Privacy Policy</h1>
        </div>

        <div className="surface-card p-6 sm:p-10 space-y-8 text-foreground/80 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
            <p>
              At Clip N Copy, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Clip N Copy and how we use it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
            <p>
              We collect information to provide better services to our users. The types of personal information we collect include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Delivery/address information</li>
              <li>Account information</li>
              <li>Order information</li>
              <li>Uploaded printing files</li>
              <li>Device/browser information where technically collected</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. How We Use Information</h2>
            <p>
              We use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Process orders and transactions</li>
              <li>Provide printing and other requested services</li>
              <li>Deliver products to your address</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Process payments securely</li>
              <li>Improve, personalize, and expand our website and services</li>
              <li>Find and prevent fraud and abuse</li>
              <li>Meet legal and regulatory requirements</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Uploaded Files</h2>
            <p>
              Uploaded printing files are handled securely and are used solely for the purpose of fulfilling your requested printing or service order. These files are stored temporarily and are subject to deletion according to our data retention practices and applicable legal requirements. We do not use your personal files for any other purpose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Payment Information</h2>
            <p>
              Payment details are processed through our applicable payment providers. Clip N Copy does not unnecessarily store sensitive payment credentials (such as full credit card numbers or CVVs) on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Cookies and Similar Technologies</h2>
            <p>
              We may use cookies and similar tracking technologies to track activity on our website and store certain information. This helps us analyze web traffic, tailor services to your needs, and improve overall user experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">7. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Delivery Partners:</strong> To deliver your orders securely and efficiently.</li>
              <li><strong>Payment Providers:</strong> To process payments securely.</li>
              <li><strong>Technology/Service Providers:</strong> To operate our website, host our data, and send emails (such as order confirmations).</li>
              <li><strong>Legal Authorities:</strong> Where legally required by law, subpoena, or other legal processes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">8. Data Security</h2>
            <p>
              We use appropriate technical and organizational measures designed to protect your personal information against accidental or unlawful destruction, loss, alteration, and unauthorized disclosure or access.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">9. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">10. User Rights</h2>
            <p>
              Subject to applicable law, you may have the right to request access to, correction, or deletion of your personal data. You may also have the right to object to or restrict certain processing of your data. To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">11. Children's Privacy</h2>
            <p>
              Our website is not intended for use by children under the applicable age of digital consent. We do not knowingly collect personal identifiable information from children. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">12. Third-Party Links</h2>
            <p>
              Our website may contain links to other websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">13. Changes to Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">14. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
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
