import SectionHeading from "@/components/SectionHeading";
import { Shield, Sparkles, Layers, Leaf, Eye, Users, Target, Award } from "lucide-react";

const timeline = [
  { year: "2021", title: "Founded", desc: "TEEVEXA launched with a vision to transform African tech." },
  { year: "2022", title: "First Enterprise Client", desc: "Delivered a full-stack platform for agricultural exports." },
  { year: "2023", title: "Team Expansion", desc: "Grew to 15+ engineers and designers across 3 countries." },
  { year: "2024", title: "Teevexa Trace", desc: "Began R&D on blockchain-powered traceability platform." },
  { year: "2025", title: "Scale & Impact", desc: "Serving clients across 5 industries in 8 African countries." },
];

const team = [
  { name: "Adebayo Okonkwo", role: "CEO & Founder", icon: Target },
  { name: "Fatima Al-Rashid", role: "CTO", icon: Layers },
  { name: "Samuel Mensah", role: "Head of Design", icon: Award },
  { name: "Amina Diallo", role: "VP of Engineering", icon: Users },
];

const About = () => (
  <>
    <section className="py-24 px-4 gradient-hero network-bg">
      <div className="container mx-auto text-center animate-fade-in">
        <SectionHeading label="About Us" title="Our Story" description="TEEVEXA — Tech Evolution for Exceptional Applications — was born from a belief that African businesses deserve world-class digital infrastructure." />
      </div>
    </section>

    <section className="py-24 px-4">
      <div className="container mx-auto max-w-3xl space-y-6 text-muted-foreground leading-relaxed">
        <p>Founded in 2021, TEEVEXA set out to bridge the technology gap facing African enterprises. We saw businesses struggling with outdated systems, fragmented workflows, and a lack of secure, scalable digital tools.</p>
        <p>Today, we partner with organizations across agriculture, logistics, trade, and the non-profit sector to deliver custom web and mobile solutions, enterprise software, and e-commerce platforms that meet global standards.</p>
        <p>Our next frontier is blockchain-powered traceability — through <span className="text-primary font-medium">Teevexa Trace</span>, we're building transparent, immutable supply chain solutions for Africa and beyond.</p>
      </div>
    </section>

    <section className="py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <SectionHeading label="Leadership" title="Meet the Team" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-6 text-center group hover:border-primary/40 transition-all duration-300">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <t.icon className="text-primary" size={28} />
              </div>
              <h3 className="font-display font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-24 px-4">
      <div className="container mx-auto">
        <SectionHeading label="Journey" title="Milestones" />
        <div className="mt-12 max-w-2xl mx-auto space-y-0">
          {timeline.map((t, i) => (
            <div key={t.year} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
                {i < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
              </div>
              <div className="pb-8">
                <span className="text-xs font-semibold text-primary">{t.year}</span>
                <h3 className="font-display font-semibold">{t.title}</h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-24 px-4 bg-card/30">
      <div className="container mx-auto">
        <SectionHeading label="Values" title="What Drives Us" />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: Shield, title: "Integrity" },
            { icon: Sparkles, title: "Innovation" },
            { icon: Layers, title: "Empowerment" },
            { icon: Leaf, title: "Sustainability" },
            { icon: Eye, title: "Transparency" },
          ].map((v) => (
            <div key={v.title} className="glass rounded-2xl p-5 text-center hover:border-primary/40 transition-all">
              <v.icon className="mx-auto text-primary mb-2" size={24} />
              <h4 className="font-display font-semibold text-sm">{v.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default About;
