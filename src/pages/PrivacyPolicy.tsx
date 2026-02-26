import SectionHeading from "@/components/SectionHeading";

const PrivacyPolicy = () => {
  const lastUpdated = "February 26, 2026";

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <SectionHeading label="Legal" title="Privacy Policy" description={`Last updated: ${lastUpdated}`} />

        <div className="mt-12 prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">1. Introduction</h2>
            <p>
              TEEVEXA ("we," "our," or "us") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you visit our website at <span className="text-primary">teevexa.com</span>, use our services, or interact with us in any way.
            </p>
            <p>
              This policy is designed to comply with the Kenya Data Protection Act 2019, the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable international data protection laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">2. Data Controller</h2>
            <p>
              TEEVEXA, headquartered in Nairobi, Kenya, is the data controller responsible for your personal data. For any inquiries regarding this policy, please contact our Data Protection Officer at <span className="text-primary">privacy@teevexa.com</span>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">3. Information We Collect</h2>
            <p>We may collect the following categories of personal data:</p>
            <h3 className="text-lg font-semibold text-foreground/90">3.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">Identity Data:</strong> Full name, job title, company name.</li>
              <li><strong className="text-foreground/80">Contact Data:</strong> Email address, phone number, mailing address.</li>
              <li><strong className="text-foreground/80">Account Data:</strong> Username, password, account preferences.</li>
              <li><strong className="text-foreground/80">Project Data:</strong> Project requirements, briefs, budgets, timelines, and related files you submit.</li>
              <li><strong className="text-foreground/80">Financial Data:</strong> Billing address, payment card details (processed via PCI-DSS compliant third-party processors).</li>
              <li><strong className="text-foreground/80">Communication Data:</strong> Messages, feedback, support tickets, and consultation notes.</li>
              <li><strong className="text-foreground/80">Employment Data:</strong> CVs, cover letters, portfolios submitted through our careers page.</li>
            </ul>
            <h3 className="text-lg font-semibold text-foreground/90">3.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">Technical Data:</strong> IP address, browser type and version, operating system, device identifiers.</li>
              <li><strong className="text-foreground/80">Usage Data:</strong> Pages visited, time spent, click patterns, referring URLs.</li>
              <li><strong className="text-foreground/80">Cookie Data:</strong> Information collected through cookies and similar tracking technologies (see Section 9).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">4. Legal Basis for Processing</h2>
            <p>We process your personal data based on the following legal grounds:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">Contractual Necessity:</strong> To perform our obligations under a contract with you (e.g., delivering project services).</li>
              <li><strong className="text-foreground/80">Consent:</strong> Where you have given explicit consent (e.g., marketing communications).</li>
              <li><strong className="text-foreground/80">Legitimate Interests:</strong> To improve our services, ensure security, and conduct business analytics, provided these interests do not override your fundamental rights.</li>
              <li><strong className="text-foreground/80">Legal Obligation:</strong> To comply with applicable laws and regulations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">5. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Providing, operating, and maintaining our services and client portal.</li>
              <li>Processing and managing project inquiries, consultations, and proposals.</li>
              <li>Communicating with you about projects, updates, and support.</li>
              <li>Processing payments and invoicing.</li>
              <li>Evaluating job applications and managing recruitment.</li>
              <li>Personalizing your experience and improving our website.</li>
              <li>Conducting analytics and business intelligence.</li>
              <li>Detecting, preventing, and addressing fraud, security incidents, and technical issues.</li>
              <li>Complying with legal and regulatory obligations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">6. Data Sharing & Disclosure</h2>
            <p>We do not sell your personal data. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">Service Providers:</strong> Trusted third parties who assist in operating our business (hosting, analytics, payment processing), bound by data processing agreements.</li>
              <li><strong className="text-foreground/80">Professional Advisors:</strong> Lawyers, auditors, and consultants as necessary.</li>
              <li><strong className="text-foreground/80">Legal Authorities:</strong> When required by law, court order, or to protect our legal rights.</li>
              <li><strong className="text-foreground/80">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with appropriate safeguards.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">7. International Data Transfers</h2>
            <p>
              Your data may be transferred to, stored, and processed in countries outside your jurisdiction. When we transfer data internationally, we implement appropriate safeguards including Standard Contractual Clauses (SCCs), adequacy decisions, and binding corporate rules to ensure your data receives equivalent protection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">8. Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. Specific retention periods include:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">Client project data:</strong> Duration of the engagement plus 7 years.</li>
              <li><strong className="text-foreground/80">Financial records:</strong> As required by applicable tax and accounting regulations.</li>
              <li><strong className="text-foreground/80">Job applications:</strong> Up to 24 months after the recruitment process concludes.</li>
              <li><strong className="text-foreground/80">Marketing data:</strong> Until you withdraw consent or unsubscribe.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">9. Cookies & Tracking Technologies</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience. Categories include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">Strictly Necessary:</strong> Essential for website functionality (no consent required).</li>
              <li><strong className="text-foreground/80">Analytical/Performance:</strong> Help us understand how visitors interact with our site.</li>
              <li><strong className="text-foreground/80">Functional:</strong> Remember your preferences and settings.</li>
            </ul>
            <p>You can manage cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">10. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">Access:</strong> Request a copy of your personal data.</li>
              <li><strong className="text-foreground/80">Rectification:</strong> Correct inaccurate or incomplete data.</li>
              <li><strong className="text-foreground/80">Erasure:</strong> Request deletion of your data ("Right to be Forgotten").</li>
              <li><strong className="text-foreground/80">Restriction:</strong> Limit how we process your data.</li>
              <li><strong className="text-foreground/80">Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong className="text-foreground/80">Objection:</strong> Object to processing based on legitimate interests or direct marketing.</li>
              <li><strong className="text-foreground/80">Withdraw Consent:</strong> Where processing is based on consent, withdraw at any time.</li>
              <li><strong className="text-foreground/80">Non-Discrimination:</strong> Exercise your rights without discriminatory treatment (CCPA).</li>
            </ul>
            <p>To exercise any of these rights, contact us at <span className="text-primary">privacy@teevexa.com</span>. We will respond within 30 days (or as required by applicable law).</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">11. Data Security</h2>
            <p>
              We implement industry-standard technical and organizational measures to protect your personal data, including encryption in transit (TLS 1.3) and at rest (AES-256), access controls, regular security audits, and incident response procedures. However, no method of electronic transmission or storage is 100% secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">12. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that we have collected data from a child, we will take steps to delete it promptly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on our website. Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">14. Contact Us</h2>
            <p>For questions, concerns, or requests regarding this Privacy Policy or your personal data:</p>
            <div className="glass rounded-lg p-6 space-y-2 text-sm">
              <p className="text-foreground font-semibold">TEEVEXA — Data Protection Officer</p>
              <p>Email: <span className="text-primary">privacy@teevexa.com</span></p>
              <p>Phone: +254 783 797 132</p>
              <p>Address: Nairobi, Kenya</p>
            </div>
            <p className="text-xs">
              You also have the right to lodge a complaint with your local data protection authority, including the Office of the Data Protection Commissioner (Kenya), the Information Commissioner's Office (UK), or the relevant supervisory authority in the EU.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
