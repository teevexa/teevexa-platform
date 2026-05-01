import { LegalLayout, LegalSection, LegalSubSection, LegalList, LegalContactBox, Em } from "@/components/legal/LegalLayout";

const LAST_UPDATED = "February 26, 2026";

const SECTIONS = [
  { id: "what-are-cookies", label: "1. What Are Cookies?" },
  { id: "why-we-use", label: "2. Why We Use Cookies" },
  { id: "cookie-categories", label: "3. Cookie Categories" },
  { id: "specific-cookies", label: "4. Cookies We Set" },
  { id: "third-party", label: "5. Third-Party Cookies" },
  { id: "manage-cookies", label: "6. Managing Your Cookies" },
  { id: "do-not-track", label: "7. Do Not Track" },
  { id: "updates", label: "8. Policy Updates" },
  { id: "contact", label: "9. Contact Us" },
];

const CookiePolicy = () => (
  <LegalLayout
    title="Cookie Policy"
    subtitle="This policy explains what cookies are, how we use them, and how you can control them."
    lastUpdated={LAST_UPDATED}
    sections={SECTIONS}
  >
    <LegalSection id="what-are-cookies" number="1" title="What Are Cookies?">
      <p>
        Cookies are small text files that a website places on your device (computer, smartphone, or tablet) when you visit it. They allow the website to remember your actions and preferences over time so you don't have to re-enter them each time you visit.
      </p>
      <p>
        Similar technologies — including <Em>pixel tags</Em> (web beacons), <Em>local storage</Em>, <Em>session storage</Em>, and <Em>device fingerprinting</Em> — may be used alongside or instead of cookies for comparable purposes. This policy covers all such technologies collectively.
      </p>
      <p>
        Cookies can be <Em>session cookies</Em> (deleted when you close your browser) or <Em>persistent cookies</Em> (which remain until they expire or you delete them). They can be set by us (<Em>first-party cookies</Em>) or by third-party services we use (<Em>third-party cookies</Em>).
      </p>
    </LegalSection>

    <LegalSection id="why-we-use" number="2" title="Why We Use Cookies">
      <p>We use cookies and similar technologies to:</p>
      <LegalList items={[
        "Keep you signed in and maintain your session securely across pages.",
        "Remember your preferences (e.g., language, theme, notification settings).",
        "Understand how visitors use our website so we can improve the experience.",
        "Identify and fix technical errors or performance issues.",
        "Measure the effectiveness of marketing campaigns.",
        "Protect the website and its users from security threats and abuse.",
      ]} />
    </LegalSection>

    <LegalSection id="cookie-categories" number="3" title="Cookie Categories">
      <LegalSubSection title="Strictly Necessary">
        <p>
          These cookies are essential for the website to function correctly. They enable core features such as user authentication, session management, security, and the client portal. Because they are strictly necessary, they do not require your consent and cannot be disabled through our cookie controls.
        </p>
        <p><Em>Examples:</Em> session tokens, CSRF protection tokens, load-balancing cookies.</p>
      </LegalSubSection>

      <LegalSubSection title="Analytical / Performance">
        <p>
          These cookies help us understand how visitors interact with our website — which pages are most popular, where visitors come from, and how long they spend on different sections. The data is aggregated and anonymized; we do not use it to identify individual users.
        </p>
        <p><Em>Examples:</Em> page view tracking, session duration, click heatmaps, error logging.</p>
        <p><Em>Legal basis: Consent.</Em></p>
      </LegalSubSection>

      <LegalSubSection title="Functional">
        <p>
          Functional cookies enable enhanced personalization features that go beyond core functionality. They remember choices you make — such as your preferred communication language, timezone, or portal layout settings — to provide a more tailored experience.
        </p>
        <p><Em>Legal basis: Consent.</Em></p>
      </LegalSubSection>

      <LegalSubSection title="Marketing / Targeting">
        <p>
          Marketing cookies track your browsing activity to help us deliver advertising that is relevant to your interests and to measure the effectiveness of our campaigns. These cookies may be set by our advertising partners and may link your activity across different websites.
        </p>
        <p>We only set marketing cookies where you have given <Em>explicit consent</Em>. You can withdraw this consent at any time.</p>
        <p><Em>Legal basis: Explicit consent.</Em></p>
      </LegalSubSection>
    </LegalSection>

    <LegalSection id="specific-cookies" number="4" title="Cookies We Set">
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-xs border-collapse min-w-[520px]">
          <thead>
            <tr className="bg-muted/40">
              <th className="text-left px-3 py-2.5 font-semibold text-foreground/80 border border-border/30">Cookie Name</th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground/80 border border-border/30">Category</th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground/80 border border-border/30">Purpose</th>
              <th className="text-left px-3 py-2.5 font-semibold text-foreground/80 border border-border/30">Duration</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["teevexa_session", "Strictly Necessary", "Maintains your authenticated session in the client portal", "Session"],
              ["teevexa_csrf", "Strictly Necessary", "Cross-site request forgery protection token", "Session"],
              ["teevexa_cookie_consent", "Strictly Necessary", "Stores your cookie consent preferences", "1 year"],
              ["teevexa_lang", "Functional", "Remembers your preferred interface language", "1 year"],
              ["teevexa_theme", "Functional", "Stores your display theme preference", "1 year"],
              ["_analytics_id", "Analytical", "Assigns an anonymous visitor ID for usage analytics", "2 years"],
              ["_analytics_session", "Analytical", "Groups page views within a single session", "30 minutes"],
            ].map(([name, cat, purpose, duration]) => (
              <tr key={name} className="odd:bg-muted/10">
                <td className="px-3 py-2 border border-border/20 font-mono text-primary/80">{name}</td>
                <td className="px-3 py-2 border border-border/20">{cat}</td>
                <td className="px-3 py-2 border border-border/20 text-muted-foreground">{purpose}</td>
                <td className="px-3 py-2 border border-border/20 whitespace-nowrap">{duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        This table lists first-party cookies we directly set. Third-party cookies are listed in Section 5.
      </p>
    </LegalSection>

    <LegalSection id="third-party" number="5" title="Third-Party Cookies">
      <p>
        Some cookies on our website are set by third-party services that we embed or integrate with. These third parties may use cookies independently of us and in accordance with their own privacy policies.
      </p>
      <LegalList items={[
        <><Em>Supabase / Infrastructure:</Em> Backend session management and authentication cookies.</>,
        <><Em>Analytics providers:</Em> Used to measure site performance and visitor behavior (only with your consent).</>,
        <><Em>Embedded content:</Em> If pages embed third-party content (e.g., videos, maps), those services may set their own cookies.</>,
      ]} />
      <p>
        We do not control third-party cookies and recommend reviewing the privacy policies of these services directly. You can opt out of many third-party analytics cookies by visiting industry opt-out tools such as the <Em>Network Advertising Initiative (NAI)</Em> opt-out page or the <Em>Digital Advertising Alliance (DAA)</Em> opt-out page.
      </p>
    </LegalSection>

    <LegalSection id="manage-cookies" number="6" title="Managing Your Cookies">
      <LegalSubSection title="Cookie Consent Banner">
        <p>
          When you first visit our website, we present a cookie consent banner that allows you to accept all cookies, accept only necessary cookies, or customize your preferences by category. You can update your preferences at any time by clicking <Em>"Cookie Settings"</Em> in the footer of any page.
        </p>
      </LegalSubSection>

      <LegalSubSection title="Browser Settings">
        <p>
          All modern browsers allow you to control cookies through their settings. You can configure your browser to:
        </p>
        <LegalList items={[
          "Block all cookies.",
          "Block third-party cookies while allowing first-party cookies.",
          "Delete all existing cookies.",
          "Set alerts when cookies are being placed.",
        ]} />
        <p>
          Note: disabling cookies may impair your ability to use certain features of our website, including signing in to the Client Portal.
        </p>
        <LegalList items={[
          <><Em>Chrome:</Em> Settings → Privacy and Security → Cookies and other site data</>,
          <><Em>Firefox:</Em> Settings → Privacy & Security → Cookies and Site Data</>,
          <><Em>Safari:</Em> Preferences → Privacy → Manage Website Data</>,
          <><Em>Edge:</Em> Settings → Cookies and site permissions</>,
        ]} />
      </LegalSubSection>

      <LegalSubSection title="Mobile Devices">
        <p>
          On mobile, you can manage cookie and tracking settings through your device's privacy settings. On iOS, navigate to Settings → Safari → Privacy & Security. On Android, use the browser app's privacy settings.
        </p>
      </LegalSubSection>
    </LegalSection>

    <LegalSection id="do-not-track" number="7" title="Do Not Track">
      <p>
        Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked across sites. Because there is no universally agreed technical standard for interpreting DNT signals, our website does not currently alter its data collection practices in response to DNT signals.
      </p>
      <p>
        You can use our cookie consent controls (Section 6) to achieve equivalent outcomes — specifically, disabling analytical and marketing cookies.
      </p>
    </LegalSection>

    <LegalSection id="updates" number="8" title="Policy Updates">
      <p>
        We may update this Cookie Policy periodically to reflect changes in our technology, legal requirements, or business practices. When we make material changes, we will update the "Last Updated" date and, where appropriate, display a notification on our website or notify you via email.
      </p>
      <p>
        Continued use of our website after changes to this policy constitutes your acknowledgment of the updated terms. If changes affect cookies requiring consent, we will re-request your consent where necessary.
      </p>
    </LegalSection>

    <LegalSection id="contact" number="9" title="Contact Us">
      <p>If you have questions about our use of cookies or this Cookie Policy, please reach out:</p>
      <LegalContactBox>
        <p className="font-semibold text-foreground">TEEVEXA — Privacy Team</p>
        <p>Email: <span className="text-primary font-medium">info@teevexa.com</span></p>
        <p>Phone: <span className="text-foreground/70">+254 783 797 132</span></p>
        <p>Address: <span className="text-foreground/70">Nairobi, Kenya</span></p>
      </LegalContactBox>
    </LegalSection>
  </LegalLayout>
);

export default CookiePolicy;
