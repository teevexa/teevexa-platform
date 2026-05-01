import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen gradient-hero network-bg flex items-center justify-center px-4">
      <div className="text-center animate-fade-in max-w-md">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-4">404 Error</p>
        <h1 className="text-6xl md:text-8xl font-display font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-display font-bold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground leading-relaxed mb-10">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="glow-primary px-8" asChild>
            <Link to="/"><Home size={16} className="mr-2" /> Go Home</Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8" onClick={() => window.history.back()}>
            <ArrowLeft size={16} className="mr-2" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
