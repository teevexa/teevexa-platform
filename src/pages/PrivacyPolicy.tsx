import { LegalLayout, LegalSection, LegalSubSection, LegalList, LegalContactBox, Em } from "@/components/legal/LegalLayout";

const LAST_UPDATED = "February 26, 2026";

const SECTIONS = [
  { id: "introduction", label: "1. Introduction" },
  { id: "data-controller", label: "2. Data Controller" },
  { id: "information-collected", label: "3. Information We Collect" },
  { id: "legal-basis", label: "4. Legal Basis for Processing" },
  { id: "how-we-use", label: "5. How We Use Your Data" },
  { id: "data-sharing", label: "6. Data Sharing & Disclosure" },
  { id: "international-transfers", label: "7. International Transfers" },
  { id: "data-retention", label: "8. Data Retention" },
  { id: "cookies", label: "9. Cookies & Tracking" },
  { id: "your-rights", label: "10. Your Rights" },
  { id: "security", label: "11. Data Security" },
  { id: "children", label: "12. Children's Privacy" },
  { id: "changes", label: "13. Policy Changes" },
  { id: "contact", label: "14. Contact Us" },
];

const PrivacyPolicy = () => (
  <LegalLayout
    title="Privacy Policy"
    subtitle="We are committed to protecting your privacy and handling your personal data with transparency and care."
    lastUpdated={LAST_UPDATED}
    sections={SECTIONS}
  >
    <LegalSection id="introduction" number="1" title="Introduction">
      <p>
        <Em>TEEVEXA</Em> (<Em>"we," "our,"</Em> or <Em>"us"</Em>) is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when you visit our website at <span className="text-primary font-medium">teevexa.com</span>, use our client portal, or interact with us in any capacity.
      </p>
      <p>
        This policy is designed to comply with the <Em>Kenya Data Protection Act 2019</Em>, the EU <Em>General Data Protection Regulation (GDPR)</Em>, the <Em>California Consumer Privacy Act (CCPA)</Em>, and other applicable international data protection laws. By using our Services, you acknowledge that you have read and understood this policy.
      </p>
    </LegalSection>

    <LegalSection id="data-controller" number="2" title="Data Controller">
      <p>
        TEEVEXA, headquartered in Nairobi, Kenya, is the <Em>data controller</Em> responsible for your personal data collected through our website and services. We determine the purposes and means of processing your personal data as described in this policy.
      </p>
      <p>
        For any questions or concerns regarding this policy or our data practices, please contact our <Em>Data Protection Officer (DPO)</Em> at <span className="text-primary font-medium">info@teevexa.com</span>.
      </p>
    </LegalSection>

    <LegalSection id="information-collected" number="3" title="Information We Collect">
      <LegalSubSection title="3.1 Information You Provide Directly">
        <LegalList items={[
          <><Em>Identity Data:</Em> Full name, job title, company name.</>,
          <><Em>Contact Data:</Em> Email address, phone number, mailing address.</>,
          <><Em>Account Data:</Em> Username, password, account preferences and settings.</>,
          <><Em>Project Data:</Em> Project requirements, briefs, budgets, timelines, and files submitted through our portal.</>,
          <><Em>Financial Data:</Em> Billing address and payment details (processed via PCI-DSS compliant third-party processors — we do not store raw card data).</>,
          <><Em>Communication Data:</Em> Messages, feedback, support tickets, consultation notes, and correspondence with us.</>,
          <><Em>Employment Data:</Em> CVs, cover letters, and portfolios submitted through our careers page.</>,
        ]} />
      </LegalSubSection>
      <LegalSubSection title="3.2 Information Collected Automatically">
        <LegalList items={[
          <><Em>Technical Data:</Em> IP address, browser type and version, operating system, device identifiers, and time zone.</>,
          <><Em>Usage Data:</Em> Pages visited, time spent on pages, click patterns, navigation paths, and referring URLs.</>,
          <><Em>Cookie Data:</Em> Information collected through cookies and similar tracking technologies (see Section 9 and our <span className="text-primary">Cookie Policy</span>).</>,
        ]} />
      </LegalSubSection>
    </LegalSection>

    <LegalSection id="legal-basis" number="4" title="Legal Basis for Processing">
      <p>We process your personal data under the following legal grounds:</p>
      <LegalList items={[
        <><Em>Contractual Necessity:</Em> To fulfil our obligations under a contract with you or your organization (e.g., delivering project services, managing the client portal).</>,
        <><Em>Consent:</Em> Where you have provided explicit, informed consent — for example, to receive marketing communications or enable non-essential cookies. You may withdraw consent at any time.</>,
        <><Em>Legitimate Interests:</Em> To improve our services, ensure platform security, conduct analytics, and communicate about related services — provided these interests are not overridden by your fundamental rights and freedoms.</>,
        <><Em>Legal Obligation:</Em> To comply with applicable laws, regulations, tax obligations, or lawful requests from public authorities.</>,
      ]} />
    </LegalSection>

    <LegalSection id="how-we-use" number="5" title="How We Use Your Data">
      <p>We use your personal data for the following purposes:</p>
      <LegalList items={[
        "Providing, operating, and maintaining our Services and Client Portal.",
        "Processing and managing project inquiries, consultations, proposals, and engagements.",
        "Communicating with you about your projects, service updates, and support requests.",
        "Processing payments, issuing invoices, and managing accounts receivable.",
        "Evaluating job applications and managing our recruitment process.",
        "Personalizing your experience and improving website functionality.",
        "Conducting analytics, reporting, and business intelligence to improve our offerings.",
        "Detecting, preventing, and addressing fraud, abuse, security incidents, and technical issues.",
        "Complying with legal and regulatory obligations and defending legal claims.",
        "Sending relevant marketing communications where you have consented or we have a legitimate interest.",
      ]} />
    </LegalSection>

    <LegalSection id="data-sharing" number="6" title="Data Sharing & Disclosure">
      <p>
        We do <Em>not sell, rent, or trade</Em> your personal data to third parties. We may share your information in the following limited circumstances:
      </p>
      <LegalList items={[
        <><Em>Service Providers:</Em> Trusted third-party vendors who assist in operating our business, including cloud hosting, analytics platforms, payment processors, and email services. All processors are bound by data processing agreements and required to maintain equivalent privacy protections.</>,
        <><Em>Professional Advisors:</Em> Lawyers, accountants, auditors, and insurers as necessary to protect our legal and business interests.</>,
        <><Em>Legal Authorities:</Em> Law enforcement agencies, regulators, courts, or other authorities when required by applicable law, legal process, or to protect the rights and safety of TEEVEXA, our clients, or the public.</>,
        <><Em>Business Transfers:</Em> In connection with a merger, acquisition, restructuring, or sale of all or substantially all of our assets, with appropriate confidentiality protections in place prior to any transfer.</>,
      ]} />
    </LegalSection>

    <LegalSection id="international-transfers" number="7" title="International Data Transfers">
      <p>
        As a company that works with global clients and technology providers, your personal data may be transferred to, stored, and processed in countries outside your home jurisdiction — including countries that may have different data protection standards.
      </p>
      <p>
        When we transfer personal data internationally, we implement appropriate safeguards, including:
      </p>
      <LegalList items={[
        <>European Commission-approved <Em>Standard Contractual Clauses (SCCs)</Em> for transfers from the EEA, UK, or Switzerland.</>,
        <>Reliance on adequacy decisions where applicable jurisdictions are deemed to provide equivalent protection.</>,
        "Binding contractual commitments with service providers requiring equivalent data protection standards.",
      ]} />
    </LegalSection>

    <LegalSection id="data-retention" number="8" title="Data Retention">
      <p>
        We retain personal data only for as long as is necessary to fulfil the purposes outlined in this policy or as required by applicable law. Our retention practices include:
      </p>
      <LegalList items={[
        <><Em>Client project data:</Em> Duration of the engagement plus 7 years (to meet audit, legal, and tax requirements).</>,
        <><Em>Financial and billing records:</Em> As required by applicable tax and accounting regulations (typically 7 years in Kenya).</>,
        <><Em>Job applications:</Em> Up to 24 months after the conclusion of a recruitment process, unless you consent to longer retention for future opportunities.</>,
        <><Em>Marketing data:</Em> Until you withdraw consent or unsubscribe, after which we retain a suppression record to honor your preference.</>,
        <><Em>Website analytics data:</Em> Aggregated anonymized data may be retained indefinitely; individual session data is typically retained for up to 26 months.</>,
      ]} />
      <p>When data is no longer required, we securely delete or anonymize it.</p>
    </LegalSection>

    <LegalSection id="cookies" number="9" title="Cookies & Tracking Technologies">
      <p>
        We use cookies and similar technologies (including pixel tags, local storage, and session identifiers) to operate and improve our website, analyze usage patterns, and remember your preferences.
      </p>
      <p>Cookie categories we use:</p>
      <LegalList items={[
        <><Em>Strictly Necessary:</Em> Essential for the website to function. These cannot be disabled without breaking core functionality.</>,
        <><Em>Analytical / Performance:</Em> Help us understand how visitors interact with our site (e.g., page views, session duration, error rates). Used with your consent.</>,
        <><Em>Functional:</Em> Enable personalization features such as remembered preferences and language settings. Used with your consent.</>,
        <><Em>Marketing:</Em> Used to deliver relevant advertising and track campaign effectiveness. Only set with your explicit consent.</>,
      ]} />
      <p>
        You can manage your cookie preferences at any time through the cookie banner on our site or your browser settings. See our full <span className="text-primary font-medium">Cookie Policy</span> for more detail.
      </p>
    </LegalSection>

    <LegalSection id="your-rights" number="10" title="Your Rights">
      <p>
        Depending on your jurisdiction, you have the following rights regarding your personal data. To exercise any of these rights, contact us at <span className="text-primary font-medium">info@teevexa.com</span>. We will respond within <Em>30 days</Em> (or within the timeframe required by applicable law).
      </p>
      <LegalList items={[
        <><Em>Right of Access:</Em> Request a copy of the personal data we hold about you (subject access request).</>,
        <><Em>Right to Rectification:</Em> Request correction of inaccurate or incomplete personal data.</>,
        <><Em>Right to Erasure:</Em> Request deletion of your personal data where there is no compelling reason for continued processing ("Right to be Forgotten").</>,
        <><Em>Right to Restriction:</Em> Request that we limit the processing of your data in certain circumstances.</>,
        <><Em>Right to Data Portability:</Em> Receive your personal data in a structured, commonly used, machine-readable format and transmit it to another controller.</>,
        <><Em>Right to Object:</Em> Object to processing based on our legitimate interests or for direct marketing purposes.</>,
        <><Em>Right to Withdraw Consent:</Em> Where processing is based on your consent, withdraw it at any time without affecting the lawfulness of prior processing.</>,
        <><Em>Right of Non-Discrimination (CCPA):</Em> Exercise your privacy rights without receiving discriminatory treatment.</>,
      ]} />
      <p>
        You also have the right to lodge a complaint with the relevant supervisory authority, including the <Em>Office of the Data Protection Commissioner (Kenya)</Em>, the <Em>Information Commissioner's Office (UK)</Em>, or the relevant EU supervisory authority.
      </p>
    </LegalSection>

    <LegalSection id="security" number="11" title="Data Security">
      <p>
        We implement robust technical and organizational measures to protect your personal data against unauthorized access, loss, alteration, disclosure, or destruction. Our security measures include:
      </p>
      <LegalList items={[
        "Encryption of data in transit using TLS 1.3 and at rest using AES-256.",
        "Role-based access controls with the principle of least privilege.",
        "Multi-factor authentication for administrative access.",
        "Regular vulnerability scanning, penetration testing, and security audits.",
        "A documented incident response plan and data breach notification procedures.",
      ]} />
      <p>
        While we maintain rigorous safeguards, no method of electronic transmission or storage is completely secure. In the event of a data breach that poses a significant risk to your rights, we will notify you and the relevant authorities as required by applicable law.
      </p>
    </LegalSection>

    <LegalSection id="children" number="12" title="Children's Privacy">
      <p>
        Our Services are not directed to, and we do not knowingly collect personal data from, individuals under the age of <Em>18</Em>. If we become aware that personal data has been collected from a child without verifiable parental consent, we will take immediate steps to delete that information.
      </p>
      <p>
        If you believe that a child has provided us with personal data, please contact us at <span className="text-primary font-medium">info@teevexa.com</span> so we can act promptly.
      </p>
    </LegalSection>

    <LegalSection id="changes" number="13" title="Changes to This Policy">
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or business operations. When we make material changes, we will:
      </p>
      <LegalList items={[
        "Update the \"Last Updated\" date at the top of this page.",
        "Notify registered users via email with at least 14 days' notice before changes take effect.",
        "Display a prominent notice on our website where appropriate.",
      ]} />
      <p>
        Your continued use of our Services after the effective date of any updated policy constitutes your acceptance of those changes.
      </p>
    </LegalSection>

    <LegalSection id="contact" number="14" title="Contact Us">
      <p>For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our Data Protection Officer:</p>
      <LegalContactBox>
        <p className="font-semibold text-foreground">TEEVEXA — Data Protection Officer</p>
        <p>Email: <span className="text-primary font-medium">info@teevexa.com</span></p>
        <p>Phone: <span className="text-foreground/70">+254 783 797 132</span></p>
        <p>Address: <span className="text-foreground/70">Nairobi, Kenya</span></p>
      </LegalContactBox>
    </LegalSection>
  </LegalLayout>
);

export default PrivacyPolicy;
