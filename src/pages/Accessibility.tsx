import { LegalLayout, LegalSection, LegalList, LegalContactBox, Em } from "@/components/legal/LegalLayout";
import SEO from "@/components/SEO";

const LAST_UPDATED = "September 22, 2026";

const SECTIONS = [
  { id: "commitment", label: "1. Our Commitment" },
  { id: "measures", label: "2. What We Do" },
  { id: "limitations", label: "3. Known Limitations" },
  { id: "preferences", label: "4. Your Preferences" },
  { id: "feedback", label: "5. Feedback & Contact" },
];

const Accessibility = () => (
  <>
    <SEO
      title="Accessibility Statement | Teevexa"
      description="Teevexa's commitment to making teevexa.com usable by everyone, the measures we take, known limitations, and how to reach us if you hit a barrier."
      canonical="/accessibility"
    />
    <LegalLayout
      title="Accessibility Statement"
      subtitle="We want everyone to be able to use teevexa.com, whatever device, ability or assistive technology they use."
      lastUpdated={LAST_UPDATED}
      sections={SECTIONS}
    >
      <LegalSection id="commitment" number="1" title="Our Commitment">
        <p>
          Teevexa Ltd is committed to making this website accessible. We aim to meet the <Em>Web Content Accessibility Guidelines (WCAG) 2.2, Level AA</Em>. This is an ongoing effort: we are improving the site continuously and have not yet completed a formal third-party accessibility audit, so we do not claim full conformance.
        </p>
      </LegalSection>

      <LegalSection id="measures" number="2" title="What We Do">
        <LegalList items={[
          "Use semantic HTML, headings and landmarks so content can be navigated with assistive technology.",
          "Provide a “Skip to main content” link as the first focusable element on every public page.",
          "Make interactive elements keyboard-operable with visible focus, and label form fields and error messages.",
          "Move focus to the new step heading in multi-step forms and announce status messages to screen readers.",
          "Support light and dark themes and respect your operating system's reduced-motion setting.",
          "Provide text alternatives for meaningful images and avoid conveying information by colour alone.",
          "Review pages manually and fix accessibility issues as we find or are told about them.",
        ]} />
      </LegalSection>

      <LegalSection id="limitations" number="3" title="Known Limitations">
        <p>We know the site is not perfect. Areas we are still working on:</p>
        <LegalList items={[
          "Some screens inside the signed-in client portal and admin dashboard (data tables, charts, drag-and-drop boards) have not yet had a full accessibility review.",
          "Charts and maps may not have complete text equivalents.",
          "Images or documents uploaded by our team or clients (for example in blog posts or case studies) may occasionally lack descriptive alternative text.",
          "Third-party services we link to or embed are outside our control.",
        ]} />
      </LegalSection>

      <LegalSection id="preferences" number="4" title="Your Preferences">
        <p>
          You can switch between light and dark mode from the navigation bar. You can change cookie preferences at any time using the “Cookie settings” link in the site footer. Standard browser and operating-system features such as zoom, text scaling, high-contrast modes and screen readers are supported.
        </p>
      </LegalSection>

      <LegalSection id="feedback" number="5" title="Feedback & Contact">
        <p>
          If you find a barrier or need content in a different format, please tell us. We aim to respond within <Em>two business days</Em> and to fix reported issues promptly or offer an alternative way to access the information or service.
        </p>
        <LegalContactBox>
          <p><Em>Email:</Em> hello@teevexa.com</p>
          <p><Em>Phone:</Em> +254 783 797 132 (Mon–Fri, 8 AM – 6 PM EAT)</p>
          <p><Em>Post:</Em> TEEVEXA LTD, Nairobi, Kenya</p>
        </LegalContactBox>
      </LegalSection>
    </LegalLayout>
  </>
);

export default Accessibility;
