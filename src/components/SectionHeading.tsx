import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

const SectionHeading = ({ label, title, description, className, align = "center" }: SectionHeadingProps) => {
  return (
    <div className={cn("max-w-3xl space-y-3", align === "center" ? "mx-auto text-center" : "", className)}>
      {label && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">{label}</span>
      )}
      <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">{title}</h2>
      {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  );
};

export default SectionHeading;
