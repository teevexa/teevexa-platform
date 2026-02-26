import SectionHeading from "@/components/SectionHeading";

const TermsOfService = () => {
  const lastUpdated = "February 26, 2026";

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <SectionHeading label="Legal" title="Terms of Service" description={`Last updated: ${lastUpdated}`} />

        <div className="mt-12 prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">1. Agreement to Terms</h2>
            <p>
              These Terms of Service ("Terms") constitute a legally binding agreement between you ("Client," "you," or "your") and TEEVEXA ("Company," "we," "our," or "us"), governing your access to and use of our website at <span className="text-primary">teevexa.com</span>, client portal, and all related services (collectively, the "Services").
            </p>
            <p>
              By accessing or using our Services, you confirm that you have read, understood, and agree to be bound by these Terms. If you are entering into these Terms on behalf of an organization, you represent that you have authority to bind that organization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">"Deliverables"</strong> means all work product, code, designs, documentation, and materials produced by TEEVEXA under a Statement of Work.</li>
              <li><strong className="text-foreground/80">"Statement of Work" (SOW)</strong> means a written document specifying the scope, timeline, milestones, and fees for a particular project engagement.</li>
              <li><strong className="text-foreground/80">"Confidential Information"</strong> means any non-public information disclosed by either party, including business strategies, technical data, financial information, and trade secrets.</li>
              <li><strong className="text-foreground/80">"Client Portal"</strong> means the secure online platform provided for project tracking, file sharing, messaging, and invoice management.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">3. Services</h2>
            <p>
              TEEVEXA provides software development, design, consulting, and related technology services as described on our website and in individual Statements of Work. Each engagement is governed by a separate SOW that details the specific scope, deliverables, timeline, and fees.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time with reasonable notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">4. Client Accounts</h2>
            <p>To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the security and confidentiality of your login credentials.</li>
              <li>Promptly notify us of any unauthorized access or security breach.</li>
              <li>Accept responsibility for all activities under your account.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or remain inactive for an extended period.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">5. Project Engagements</h2>
            <h3 className="text-lg font-semibold text-foreground/90">5.1 Statements of Work</h3>
            <p>
              All project engagements are governed by a mutually agreed SOW. In the event of conflict between these Terms and an SOW, the SOW shall prevail for that specific engagement.
            </p>
            <h3 className="text-lg font-semibold text-foreground/90">5.2 Client Obligations</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide timely feedback, approvals, and access to necessary resources.</li>
              <li>Designate an authorized point of contact for project decisions.</li>
              <li>Ensure all materials provided do not infringe third-party rights.</li>
            </ul>
            <h3 className="text-lg font-semibold text-foreground/90">5.3 Change Requests</h3>
            <p>
              Changes to project scope must be submitted in writing and are subject to review. Approved changes may result in adjusted timelines and fees, documented in an amended SOW.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">6. Fees & Payment</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fees are specified in each SOW and are quoted in the agreed currency.</li>
              <li>Invoices are due within 14 days of issuance unless otherwise specified.</li>
              <li>Late payments may incur interest at 1.5% per month or the maximum rate permitted by law, whichever is lower.</li>
              <li>All fees are exclusive of applicable taxes, which are the Client's responsibility.</li>
              <li>We reserve the right to suspend work on overdue accounts until payment is received.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">7. Intellectual Property</h2>
            <h3 className="text-lg font-semibold text-foreground/90">7.1 Client IP</h3>
            <p>
              You retain all rights to materials, content, and data you provide to us. You grant TEEVEXA a limited, non-exclusive license to use such materials solely for performing the Services.
            </p>
            <h3 className="text-lg font-semibold text-foreground/90">7.2 Deliverables</h3>
            <p>
              Upon full payment, all custom Deliverables created specifically for you are assigned to you, excluding Pre-Existing IP and Third-Party Components.
            </p>
            <h3 className="text-lg font-semibold text-foreground/90">7.3 Pre-Existing IP</h3>
            <p>
              TEEVEXA retains ownership of all pre-existing tools, frameworks, libraries, and methodologies. Where incorporated into Deliverables, you receive a perpetual, non-exclusive, royalty-free license to use them within the delivered project.
            </p>
            <h3 className="text-lg font-semibold text-foreground/90">7.4 Portfolio Rights</h3>
            <p>
              Unless agreed otherwise in the SOW, TEEVEXA may reference the project in our portfolio, case studies, and marketing materials, subject to confidentiality obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">8. Confidentiality</h2>
            <p>
              Both parties agree to hold Confidential Information in strict confidence and not disclose it to third parties except as necessary to perform obligations under these Terms. This obligation survives termination for a period of 3 years.
            </p>
            <p>Exceptions include information that is: publicly available; independently developed; rightfully received from a third party; or required to be disclosed by law.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">9. Warranties & Disclaimers</h2>
            <h3 className="text-lg font-semibold text-foreground/90">9.1 Our Warranties</h3>
            <p>We warrant that:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Services will be performed in a professional and workmanlike manner.</li>
              <li>Deliverables will materially conform to the specifications in the SOW for 30 days after acceptance ("Warranty Period").</li>
              <li>We will not knowingly introduce malicious code into Deliverables.</li>
            </ul>
            <h3 className="text-lg font-semibold text-foreground/90">9.2 Disclaimers</h3>
            <p>
              EXCEPT AS EXPRESSLY PROVIDED HEREIN, SERVICES AND DELIVERABLES ARE PROVIDED "AS IS." WE DISCLAIM ALL OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TEEVEXA'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THESE TERMS SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
            <p>
              IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, REGARDLESS OF THE THEORY OF LIABILITY.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless TEEVEXA from any claims, damages, or expenses arising from: (a) your breach of these Terms; (b) your use of the Services; (c) materials you provide that infringe third-party rights; or (d) your violation of applicable laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">12. Termination</h2>
            <h3 className="text-lg font-semibold text-foreground/90">12.1 Termination for Convenience</h3>
            <p>Either party may terminate an SOW with 30 days' written notice. Client shall pay for all work completed up to the effective termination date.</p>
            <h3 className="text-lg font-semibold text-foreground/90">12.2 Termination for Cause</h3>
            <p>Either party may terminate immediately if the other party materially breaches these Terms and fails to cure within 15 days of written notice.</p>
            <h3 className="text-lg font-semibold text-foreground/90">12.3 Effects of Termination</h3>
            <p>Upon termination: all outstanding fees become due; each party returns or destroys Confidential Information; and Sections 7, 8, 10, 11, and 14 survive.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">13. Acceptable Use</h2>
            <p>When using our Services and Client Portal, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe on intellectual property or privacy rights of others.</li>
              <li>Transmit malicious code, viruses, or harmful content.</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts.</li>
              <li>Use the Services for any unlawful, fraudulent, or harmful purpose.</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Services.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">14. Governing Law & Dispute Resolution</h2>
            <h3 className="text-lg font-semibold text-foreground/90">14.1 Governing Law</h3>
            <p>These Terms are governed by and construed in accordance with the laws of the Republic of Kenya, without regard to conflict of law principles.</p>
            <h3 className="text-lg font-semibold text-foreground/90">14.2 Dispute Resolution</h3>
            <p>
              The parties shall first attempt to resolve disputes through good-faith negotiation for 30 days. If unresolved, disputes shall be submitted to binding arbitration administered under the Nairobi Centre for International Arbitration (NCIA) Rules. The seat of arbitration shall be Nairobi, Kenya, and the language shall be English.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">15. Force Majeure</h2>
            <p>
              Neither party shall be liable for failure to perform obligations due to events beyond reasonable control, including natural disasters, pandemics, government actions, wars, cyberattacks, or infrastructure failures, provided the affected party gives prompt notice and uses reasonable efforts to mitigate the impact.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">16. General Provisions</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground/80">Entire Agreement:</strong> These Terms, together with applicable SOWs, constitute the entire agreement between the parties.</li>
              <li><strong className="text-foreground/80">Severability:</strong> If any provision is held invalid, the remaining provisions remain in full force.</li>
              <li><strong className="text-foreground/80">Waiver:</strong> Failure to enforce any right does not constitute a waiver of that right.</li>
              <li><strong className="text-foreground/80">Assignment:</strong> You may not assign these Terms without our prior written consent.</li>
              <li><strong className="text-foreground/80">Notices:</strong> All legal notices must be in writing and sent to the addresses specified in Section 17.</li>
              <li><strong className="text-foreground/80">Amendments:</strong> We may update these Terms with reasonable notice. Continued use constitutes acceptance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-display font-semibold text-foreground">17. Contact Information</h2>
            <div className="glass rounded-lg p-6 space-y-2 text-sm">
              <p className="text-foreground font-semibold">TEEVEXA — Legal Department</p>
              <p>Email: <span className="text-primary">legal@teevexa.com</span></p>
              <p>Phone: +254 783 797 132</p>
              <p>Address: Nairobi, Kenya</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
