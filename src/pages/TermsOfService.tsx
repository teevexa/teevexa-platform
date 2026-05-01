import { LegalLayout, LegalSection, LegalSubSection, LegalList, LegalContactBox, Em } from "@/components/legal/LegalLayout";
import SEO from "@/components/SEO";

const LAST_UPDATED = "February 26, 2026";

const SECTIONS = [
  { id: "agreement", label: "1. Agreement to Terms" },
  { id: "definitions", label: "2. Definitions" },
  { id: "services", label: "3. Services" },
  { id: "accounts", label: "4. Client Accounts" },
  { id: "engagements", label: "5. Project Engagements" },
  { id: "fees", label: "6. Fees & Payment" },
  { id: "intellectual-property", label: "7. Intellectual Property" },
  { id: "confidentiality", label: "8. Confidentiality" },
  { id: "warranties", label: "9. Warranties & Disclaimers" },
  { id: "liability", label: "10. Limitation of Liability" },
  { id: "indemnification", label: "11. Indemnification" },
  { id: "termination", label: "12. Termination" },
  { id: "acceptable-use", label: "13. Acceptable Use" },
  { id: "governing-law", label: "14. Governing Law & Disputes" },
  { id: "force-majeure", label: "15. Force Majeure" },
  { id: "general", label: "16. General Provisions" },
  { id: "contact", label: "17. Contact Information" },
];

const TermsOfService = () => (
  <>
  <SEO
    title="Terms of Service | Teevexa"
    description="Read Teevexa's terms of service governing the use of our website, products, and services."
    canonical="/legal/terms-of-service"
    noindex
  />
  <LegalLayout
    title="Terms of Service"
    subtitle="Please read these terms carefully before accessing or using any of our services."
    lastUpdated={LAST_UPDATED}
    sections={SECTIONS}
  >
    <LegalSection id="agreement" number="1" title="Agreement to Terms">
      <p>
        These Terms of Service (<Em>"Terms"</Em>) constitute a legally binding agreement between you (<Em>"Client,"</Em> <Em>"you,"</Em> or <Em>"your"</Em>) and <Em>TEEVEXA</Em> (<Em>"Company," "we," "our,"</Em> or <Em>"us"</Em>), governing your access to and use of our website at <span className="text-primary font-medium">teevexa.com</span>, client portal, and all related services (collectively, the <Em>"Services"</Em>).
      </p>
      <p>
        By accessing or using our Services, you confirm that you have read, understood, and agree to be bound by these Terms. If you are entering into these Terms on behalf of an organization, you represent that you have the authority to bind that organization.
      </p>
      <p>
        If you do not agree to these Terms, you must immediately discontinue use of our Services.
      </p>
    </LegalSection>

    <LegalSection id="definitions" number="2" title="Definitions">
      <LegalList items={[
        <><Em>"Deliverables"</Em> means all work product, code, designs, documentation, and materials produced by TEEVEXA under a Statement of Work.</>,
        <><Em>"Statement of Work" (SOW)</Em> means a written document specifying the scope, timeline, milestones, and fees for a particular project engagement.</>,
        <><Em>"Confidential Information"</Em> means any non-public information disclosed by either party, including business strategies, technical data, financial information, and trade secrets.</>,
        <><Em>"Client Portal"</Em> means the secure online platform provided for project tracking, file sharing, messaging, and invoice management.</>,
        <><Em>"Pre-Existing IP"</Em> means any intellectual property owned or developed by either party before the commencement of a project engagement.</>,
        <><Em>"Third-Party Components"</Em> means open-source software, licensed libraries, or tools incorporated into Deliverables that are subject to their own license terms.</>,
      ]} />
    </LegalSection>

    <LegalSection id="services" number="3" title="Services">
      <p>
        TEEVEXA provides software development, design, consulting, and related technology services as described on our website and in individual Statements of Work. Each engagement is governed by a separate SOW that details the specific scope, deliverables, timeline, and fees.
      </p>
      <p>
        We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time with reasonable notice. We will not be liable to you or any third party for any such modification, suspension, or discontinuation.
      </p>
    </LegalSection>

    <LegalSection id="accounts" number="4" title="Client Accounts">
      <p>To access certain features of our Services, including the Client Portal, you must create an account. By creating an account, you agree to:</p>
      <LegalList items={[
        "Provide accurate, current, and complete registration information.",
        "Maintain the security and confidentiality of your login credentials.",
        "Promptly notify us of any unauthorized access or suspected security breach.",
        "Accept full responsibility for all activities that occur under your account.",
        "Not share your credentials with unauthorized third parties.",
      ]} />
      <p>
        We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or remain inactive for an extended period without notice.
      </p>
    </LegalSection>

    <LegalSection id="engagements" number="5" title="Project Engagements">
      <LegalSubSection title="5.1 Statements of Work">
        <p>
          All project engagements are governed by a mutually agreed SOW. In the event of a conflict between these Terms and an SOW, the SOW shall prevail for that specific engagement only.
        </p>
      </LegalSubSection>
      <LegalSubSection title="5.2 Client Obligations">
        <p>To ensure successful project delivery, you agree to:</p>
        <LegalList items={[
          "Provide timely feedback, approvals, and access to necessary resources within agreed timeframes.",
          "Designate an authorized point of contact with decision-making authority.",
          "Ensure all materials, content, and assets provided do not infringe third-party intellectual property or privacy rights.",
          "Obtain all necessary licenses, consents, and permissions for materials you provide.",
        ]} />
      </LegalSubSection>
      <LegalSubSection title="5.3 Change Requests">
        <p>
          Changes to project scope must be submitted in writing and are subject to review. Approved changes will be documented in a written change order or amended SOW and may result in adjusted timelines and additional fees. Verbal change requests will not be honored.
        </p>
      </LegalSubSection>
    </LegalSection>

    <LegalSection id="fees" number="6" title="Fees & Payment">
      <LegalList items={[
        "Fees are specified in each SOW and are quoted in the agreed currency.",
        "Invoices are due within 14 calendar days of issuance unless otherwise specified in the SOW.",
        <>Late payments may incur interest at <Em>1.5% per month</Em> (or the maximum rate permitted by applicable law, whichever is lower) from the due date until payment is received.</>,
        "All fees are exclusive of applicable taxes, levies, and duties, which are the Client's sole responsibility.",
        "We reserve the right to suspend work or withhold Deliverables on accounts with overdue invoices until payment is received in full.",
        "Disputed invoices must be raised in writing within 7 days of receipt; undisputed portions remain due on the original date.",
      ]} />
    </LegalSection>

    <LegalSection id="intellectual-property" number="7" title="Intellectual Property">
      <LegalSubSection title="7.1 Client-Owned Materials">
        <p>
          You retain all rights, title, and interest in and to materials, content, data, and pre-existing intellectual property you provide to us. You grant TEEVEXA a limited, non-exclusive, royalty-free license to use such materials solely for the purpose of performing the Services under the applicable SOW.
        </p>
      </LegalSubSection>
      <LegalSubSection title="7.2 Custom Deliverables">
        <p>
          Upon receipt of full payment, TEEVEXA assigns to you all right, title, and interest in and to custom Deliverables created specifically for you under an SOW, excluding Pre-Existing IP and Third-Party Components.
        </p>
      </LegalSubSection>
      <LegalSubSection title="7.3 Pre-Existing & Platform IP">
        <p>
          TEEVEXA retains sole ownership of all pre-existing tools, frameworks, methodologies, know-how, and reusable components developed before or independently of any engagement. Where such elements are incorporated into Deliverables, you receive a perpetual, non-exclusive, non-transferable, royalty-free license to use them within the delivered project only.
        </p>
      </LegalSubSection>
      <LegalSubSection title="7.4 Portfolio Rights">
        <p>
          Unless expressly agreed otherwise in the SOW, TEEVEXA may reference the existence and general nature of the project in our portfolio, case studies, pitch materials, and marketing, subject to confidentiality obligations. We will not disclose proprietary business information without your consent.
        </p>
      </LegalSubSection>
    </LegalSection>

    <LegalSection id="confidentiality" number="8" title="Confidentiality">
      <p>
        Each party agrees to hold the other party's Confidential Information in strict confidence and not to disclose it to any third party without prior written consent, except to employees or contractors who need to know it to fulfill obligations under these Terms and who are bound by equivalent confidentiality obligations.
      </p>
      <p>
        This obligation survives the termination or expiry of these Terms for a period of <Em>3 years</Em>.
      </p>
      <p>Exceptions apply to information that is:</p>
      <LegalList items={[
        "Publicly available through no fault of the receiving party.",
        "Independently developed by the receiving party without reference to Confidential Information.",
        "Rightfully received from a third party without restriction.",
        "Required to be disclosed by applicable law, regulation, or court order (provided prompt notice is given where legally permitted).",
      ]} />
    </LegalSection>

    <LegalSection id="warranties" number="9" title="Warranties & Disclaimers">
      <LegalSubSection title="9.1 Our Warranties">
        <p>TEEVEXA warrants that:</p>
        <LegalList items={[
          "Services will be performed in a professional and workmanlike manner consistent with industry standards.",
          <>Custom Deliverables will materially conform to the specifications in the applicable SOW for <Em>30 days</Em> following acceptance (<Em>"Warranty Period"</Em>). During this period, we will remedy non-conformances at no additional charge.</>,
          "We will not knowingly introduce malicious code, backdoors, or unauthorized tracking into Deliverables.",
          "We have the right to grant the licenses and assignments described in Section 7.",
        ]} />
      </LegalSubSection>
      <LegalSubSection title="9.2 Disclaimers">
        <p className="uppercase text-xs font-semibold tracking-wide text-foreground/60 mb-1">Important</p>
        <p>
          Except as expressly set forth in Section 9.1, the Services and Deliverables are provided <Em>"AS IS"</Em> and <Em>"AS AVAILABLE."</Em> To the fullest extent permitted by applicable law, TEEVEXA disclaims all other warranties, express or implied, including without limitation warranties of merchantability, fitness for a particular purpose, title, and non-infringement.
        </p>
        <p>
          We do not warrant that the Services will be uninterrupted, error-free, or that defects will be corrected.
        </p>
      </LegalSubSection>
    </LegalSection>

    <LegalSection id="liability" number="10" title="Limitation of Liability">
      <p className="uppercase text-xs font-semibold tracking-wide text-foreground/60 mb-1">Cap on Liability</p>
      <p>
        To the maximum extent permitted by applicable law, TEEVEXA's total aggregate liability to you arising out of or related to these Terms or any SOW — whether in contract, tort, or otherwise — shall not exceed the <Em>total fees actually paid by you in the 12 months immediately preceding the event giving rise to the claim.</Em>
      </p>
      <p className="uppercase text-xs font-semibold tracking-wide text-foreground/60 mb-1 mt-3">Exclusion of Consequential Damages</p>
      <p>
        In no event shall either party be liable to the other for any indirect, incidental, special, consequential, exemplary, or punitive damages, including but not limited to loss of profits, revenue, data, goodwill, or business opportunities, regardless of the theory of liability and whether or not advised of the possibility of such damages.
      </p>
      <p>
        The limitations in this section reflect a reasonable allocation of risk and form an essential basis of the agreement between the parties.
      </p>
    </LegalSection>

    <LegalSection id="indemnification" number="11" title="Indemnification">
      <p>
        You agree to indemnify, defend, and hold harmless TEEVEXA, its directors, officers, employees, contractors, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to:
      </p>
      <LegalList items={[
        "Your breach of any provision of these Terms or any applicable SOW.",
        "Your unauthorized use of the Services or Client Portal.",
        "Materials you provide that infringe or misappropriate third-party intellectual property, privacy, or other rights.",
        "Your violation of any applicable law or regulation.",
      ]} />
    </LegalSection>

    <LegalSection id="termination" number="12" title="Termination">
      <LegalSubSection title="12.1 Termination for Convenience">
        <p>
          Either party may terminate an SOW for any reason upon <Em>30 days' written notice</Em>. Upon termination, the Client shall pay for all work completed and expenses reasonably incurred up to the effective termination date. Work in progress at termination may be delivered in its then-current state.
        </p>
      </LegalSubSection>
      <LegalSubSection title="12.2 Termination for Cause">
        <p>
          Either party may terminate an SOW immediately upon written notice if the other party commits a material breach and fails to cure such breach within <Em>15 days</Em> of receiving written notice describing the breach in reasonable detail.
        </p>
      </LegalSubSection>
      <LegalSubSection title="12.3 Effects of Termination">
        <p>Upon expiry or termination of any SOW:</p>
        <LegalList items={[
          "All outstanding fees and expenses become immediately due and payable.",
          "Each party shall promptly return or certifiably destroy the other party's Confidential Information.",
          "Sections 7 (IP), 8 (Confidentiality), 10 (Liability), 11 (Indemnification), and 14 (Governing Law) survive.",
        ]} />
      </LegalSubSection>
    </LegalSection>

    <LegalSection id="acceptable-use" number="13" title="Acceptable Use">
      <p>When using our Services and Client Portal, you agree not to:</p>
      <LegalList items={[
        "Violate any applicable local, national, or international laws or regulations.",
        "Infringe on the intellectual property, privacy, or other legal rights of any person.",
        "Transmit or introduce malicious code, viruses, ransomware, spyware, or other harmful software.",
        "Attempt to gain unauthorized access to our systems, networks, or other users' accounts.",
        "Use the Services for any unlawful, fraudulent, deceptive, or harmful purpose.",
        "Reverse-engineer, decompile, disassemble, or attempt to derive source code from any component of the Services.",
        "Scrape, harvest, or collect data from our Services without express written permission.",
        "Resell, sublicense, or commercially exploit the Services without our written consent.",
      ]} />
    </LegalSection>

    <LegalSection id="governing-law" number="14" title="Governing Law & Dispute Resolution">
      <LegalSubSection title="14.1 Governing Law">
        <p>
          These Terms are governed by and construed in accordance with the laws of the <Em>Republic of Kenya</Em>, without regard to its conflict of law principles.
        </p>
      </LegalSubSection>
      <LegalSubSection title="14.2 Dispute Resolution">
        <p>
          The parties shall first attempt in good faith to resolve any dispute through direct negotiation for <Em>30 days</Em> after one party notifies the other in writing. If unresolved, disputes shall be submitted to binding arbitration administered under the <Em>Nairobi Centre for International Arbitration (NCIA) Rules</Em>. The seat of arbitration shall be Nairobi, Kenya, conducted in the English language. The arbitral award shall be final and binding.
        </p>
      </LegalSubSection>
      <LegalSubSection title="14.3 Injunctive Relief">
        <p>
          Nothing in this section prevents either party from seeking urgent injunctive or other equitable relief in a court of competent jurisdiction to prevent irreparable harm.
        </p>
      </LegalSubSection>
    </LegalSection>

    <LegalSection id="force-majeure" number="15" title="Force Majeure">
      <p>
        Neither party shall be liable for any delay or failure to perform their obligations under these Terms to the extent such delay or failure is caused by events beyond their reasonable control, including but not limited to natural disasters, pandemics, epidemics, acts of government or regulatory authorities, wars, civil unrest, cyberattacks, telecommunications failures, or critical infrastructure outages (<Em>"Force Majeure Events"</Em>).
      </p>
      <p>
        The affected party must provide prompt written notice of the Force Majeure Event and use commercially reasonable efforts to mitigate its impact and resume performance. If the Force Majeure Event continues for more than <Em>60 days</Em>, either party may terminate the affected SOW without liability.
      </p>
    </LegalSection>

    <LegalSection id="general" number="16" title="General Provisions">
      <LegalList items={[
        <><Em>Entire Agreement:</Em> These Terms, together with all applicable SOWs, constitute the complete and exclusive agreement between the parties regarding its subject matter and supersede all prior agreements, representations, and understandings.</>,
        <><Em>Severability:</Em> If any provision of these Terms is held invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.</>,
        <><Em>Waiver:</Em> Failure to enforce any right or provision under these Terms shall not constitute a waiver of that right or provision.</>,
        <><Em>Assignment:</Em> You may not assign or transfer any rights or obligations under these Terms without our prior written consent. TEEVEXA may assign these Terms in connection with a merger, acquisition, or sale of substantially all assets.</>,
        <><Em>Notices:</Em> All legal notices must be delivered in writing by email or registered mail to the addresses specified in Section 17 and shall be deemed received on the next business day.</>,
        <><Em>Amendments:</Em> We may update these Terms from time to time. Material changes will be communicated with at least 14 days' notice. Continued use of our Services after the effective date constitutes acceptance of the updated Terms.</>,
        <><Em>No Partnership:</Em> Nothing in these Terms creates a partnership, joint venture, agency, employment, or franchise relationship between the parties.</>,
      ]} />
    </LegalSection>

    <LegalSection id="contact" number="17" title="Contact Information">
      <p>For legal inquiries, notices, or questions about these Terms, please contact us at:</p>
      <LegalContactBox>
        <p className="font-semibold text-foreground">TEEVEXA — Legal Department</p>
        <p>Email: <span className="text-primary font-medium">info@teevexa.com</span></p>
        <p>Phone: <span className="text-foreground/70">+254 783 797 132</span></p>
        <p>Address: <span className="text-foreground/70">Nairobi, Kenya</span></p>
      </LegalContactBox>
    </LegalSection>
  </LegalLayout>
  </>
);

export default TermsOfService;
