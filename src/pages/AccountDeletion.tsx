import SEO from "@/components/SEO";

const STEPS = [
  { n: "1", text: "Open the Teevexa Trace or Teevexa Trace Field app on your device." },
  { n: "2", text: "Sign in to your account." },
  { n: "3", text: 'Navigate to the Settings tab (⚙️) at the bottom of the screen.' },
  { n: "4", text: 'Scroll to the "Danger Zone" section at the bottom of the page.' },
  { n: "5", text: 'Tap "Delete Account" and follow the confirmation prompts.' },
];

const DELETED_DATA = [
  "Your profile (name, company, phone number)",
  "Your account credentials and login access",
  "Your push notification records",
  "Your role and app access permissions",
  "Photos and audio evidence files you uploaded to our servers",
];

const RETAINED_DATA = [
  "Supply chain events you logged — anonymised (your identity is removed but the event record is kept to preserve the integrity of the supply chain timeline for your organisation's clients)",
  "Blockchain transaction records on the Polygon network — these are immutable by design and cannot be erased from a public blockchain",
];

export default function AccountDeletion() {
  return (
    <>
      <SEO
        title="Delete Your Account | Teevexa Trace"
        description="Instructions for deleting your Teevexa Trace or Teevexa Trace Field account and associated data."
        canonical="/account/delete"
        noindex
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">

          {/* Header */}
          <div className="mb-10">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
              Account Management
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Delete Your Account
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              You can permanently delete your Teevexa Trace or Teevexa Trace Field account
              directly from within the app. This page explains what happens when you do.
            </p>
          </div>

          {/* In-app steps */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4">How to delete your account</h2>
            <ol className="space-y-3">
              {STEPS.map(({ n, text }) => (
                <li key={n} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                    {n}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <hr className="border-border mb-10" />

          {/* What is deleted */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-1">What data is deleted</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The following data is permanently and irreversibly removed from our systems immediately upon deletion:
            </p>
            <ul className="space-y-2">
              {DELETED_DATA.map((item) => (
                <li key={item} className="flex gap-3 items-start text-sm text-muted-foreground">
                  <span className="flex-shrink-0 text-destructive font-bold mt-0.5">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* What is retained */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-1">What data is retained</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The following data cannot be deleted due to supply chain integrity and blockchain immutability requirements:
            </p>
            <ul className="space-y-3">
              {RETAINED_DATA.map((item) => (
                <li key={item} className="flex gap-3 items-start text-sm text-muted-foreground">
                  <span className="flex-shrink-0 text-amber-500 font-bold mt-0.5">!</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-border mb-10" />

          {/* Manual request fallback */}
          <section className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-2">Can't access the app?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              If you are unable to sign in to delete your account through the app, you can submit a
              manual deletion request by emailing us. We will process your request within 30 days.
            </p>
            <a
              href="mailto:support@teevexa.com?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20Teevexa%20Trace%20account.%0A%0AEmail%20address%20associated%20with%20the%20account%3A%20"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Email support@teevexa.com →
            </a>
          </section>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            This page applies to the{" "}
            <strong className="text-muted-foreground">Teevexa Trace</strong> and{" "}
            <strong className="text-muted-foreground">Teevexa Trace Field</strong> mobile
            applications published on Google Play and the Apple App Store by Teevexa.
            For general privacy questions, see our{" "}
            <a href="/legal/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>

        </div>
      </div>
    </>
  );
}
