import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Linkedin, Twitter, Github, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Will connect to DB later
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
  };

  return (
    <>
      <section className="py-24 px-4 gradient-hero network-bg">
        <div className="container mx-auto text-center animate-fade-in">
          <SectionHeading label="Contact" title="Get in Touch" description="Have a question or ready to start a project? We'd love to hear from you." />
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                  <CheckCircle className="mx-auto text-primary mb-4" size={48} />
                  <h3 className="font-display font-bold text-xl mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" required placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" required placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" required rows={5} placeholder="Tell us about your project..." />
                  </div>
                  <Button type="submit" size="lg" className="w-full glow-primary" disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-display font-semibold">Contact Info</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3"><Mail size={16} className="text-primary" /> info@teevexa.com</div>
                  <div className="flex items-center gap-3"><Phone size={16} className="text-primary" /> +234 800 TEE VEXA</div>
                  <div className="flex items-start gap-3"><MapPin size={16} className="text-primary mt-0.5" /> Lagos, Nigeria</div>
                </div>
              </div>
              <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-display font-semibold">Follow Us</h3>
                <div className="flex gap-3">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn"><Linkedin size={20} /></a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter"><Twitter size={20} /></a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub"><Github size={20} /></a>
                </div>
              </div>
              <div className="glass rounded-2xl p-6 h-48 flex items-center justify-center text-muted-foreground text-sm">
                <MapPin className="mr-2" size={16} /> Map placeholder
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
