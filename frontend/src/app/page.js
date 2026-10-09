import WorkspaceEntry from "@/components/WorkspaceEntry";
import { ArrowRight } from "lucide-react";
import ServicesComponent from "@/components/ServicesComponet";
import HeroOrb from "@/components/HeroOrb";
import ProductsSection from "@/components/ProductsSection";

export default function Home() {
  return (
    <main className="bio-page home-landing home-restored overflow-hidden">
      <section className="restored-hero" aria-labelledby="home-hero-title">
        <div className="bio-container restored-hero-layout">
          <div className="restored-hero-copy">
            <h1 id="home-hero-title">
              Connecting<br />Biology And<br />Machines.
            </h1>
            <p className="restored-hero-subtitle">Personalized Health &amp; Biotech</p>
            <WorkspaceEntry className="restored-try">
              <span>Your Health</span>
              <span className="restored-try-icon" aria-hidden="true">
                <ArrowRight size={17} strokeWidth={1.7} />
              </span>
            </WorkspaceEntry>
          </div>

          <HeroOrb />
        </div>
      </section>

      <ProductsSection />

      <ServicesComponent />

      <section className="restored-cta" aria-labelledby="restored-cta-title">
        <div className="bio-container restored-cta-inner">
          <div><h2 id="restored-cta-title">See The Data.<br />Find The Context.</h2><p className="restored-cta-description">Start with a sample workspace of records, measurements and health trends.</p></div>
          <WorkspaceEntry className="restored-cta-action"><span>Your Health</span><ArrowRight size={20} aria-hidden="true" /></WorkspaceEntry>
        </div>
      </section>
    </main>
  );
}
