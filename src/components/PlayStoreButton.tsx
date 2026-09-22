import { Button } from "@/components/ui/button";

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.5 2.6c-.3.2-.5.6-.5 1.1v16.6c0 .5.2.9.5 1.1l9.3-9.4L4.5 2.6zm10.7 8.4 2.6-2.6L6.4 2.2c-.3-.2-.6-.2-.9-.1l9.7 8.9zm0 2-9.7 8.9c.3.1.6.1.9-.1l11.4-6.2-2.6-2.6zm3.6-3.1-2.9 2.9 2.9 2.9 2.5-1.4c.7-.4.7-1.4 0-1.8l-2.5-1.6z" />
  </svg>
);

interface Props {
  href: string;
  /** e.g. "Teevexa Trace" — used for the accessible label. */
  app: string;
  variant?: "default" | "outline";
  className?: string;
}

/** Text-based "Get it on Google Play" link button (opens the store listing in a new tab). */
const PlayStoreButton = ({ href, app, variant = "default", className = "" }: Props) => (
  <Button size="lg" variant={variant} className={`text-base px-8 ${variant === "default" ? "glow-primary" : ""} ${className}`} asChild>
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Get it on Google Play: ${app}`}>
      <span className="mr-2 inline-flex"><PlayIcon /></span> Get it on Google Play
    </a>
  </Button>
);

export default PlayStoreButton;
