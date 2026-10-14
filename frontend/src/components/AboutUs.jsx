"use client";

import Link from "next/link";
import { ArrowRight, Globe2, HeartPulse, Network, Stethoscope } from "lucide-react";

// Release-note entries: [title, description], indexed by `releases[].indices`.
const services = [
  ["Diseases Detections", "Analyze biochemical and biometric inputs with focused screening models designed to surface patterns that may warrant further clinical review."],
  ["Diagnostics Center", "Structure reported symptoms and generate an informational model result with supporting precautions, nutrition considerations, and care context."],
  ["Food Recommendation", "Explore nutritional data and personalized food recommendations informed by available health metrics and biochemical measurements."],
  ["Analytics Platform", "Monitor biochemical measurements over time, compare results with reference ranges, and review associated clinical context."],
  ["Intelligence", "A connected health assistant that can review questions, document extracts, and available biometrics to provide general informational support."],
  ["Vault", "Organize medical-report extracts, personal notes, and health observations in a private authenticated workspace."],
  ["Fold", "Explore biology-specific medicine research through protein structures, molecular interactions, and computational analysis."],
  ["Mind", "Structured tools for reviewing psychological wellbeing and supporting informed conversations about mental health."],
  ["Genes", "Genetic-data analysis designed to organize sequence information and surface patterns for qualified clinical interpretation."],
];

const releases = [
  { version: "v1.0.0", date: "04 Oct 2024", status: "Released", indices: [0, 1, 2, 3] },
  { version: "v2.0.0", date: "18 Jun 2025", status: "Released", indices: [4, 5] },
  { version: "v3.0.0", date: "Product roadmap", status: "Upcoming", indices: [6, 7, 8] },
];

export default function AboutUs({ isLogined }) {
  return (
    <div className="bio-container pb-24 pt-10 sm:pb-28 sm:pt-16">
      <section className="grid gap-10 border-b pb-16 lg:grid-cols-[.72fr_1.28fr] lg:gap-24 lg:pb-24" aria-labelledby="about-biolabs-heading">
        <div>
          <p className="bio-eyebrow">About Biolabs</p>
          <h1 id="about-biolabs-heading" className="bio-title max-w-lg">Built To Help People Understand And Protect Their Health.</h1>
        </div>
        <div className="space-y-6 text-lg leading-8 text-[var(--biolabs-slate)]">
          <p>Biolabs was founded on October 4, 2024, with a clear purpose: to help keep people healthy through understandable, connected clinical intelligence.</p>
          <p>The platform is built on advanced technology and informed by medical expertise. It brings biochemical analysis, clinical records, disease-detection tools, nutrition information, and personalized intelligence into one coherent health workspace.</p>
          <p>Its architecture is designed to serve individuals as well as hospitals, laboratories, healthcare providers, and other institutions that can contribute to a more connected health ecosystem.</p>
          <Link href={isLogined ? "/workspace/analytics" : "/#solutions"} className="bio-link">{isLogined ? "Open your analytics" : "Explore the platform"}<ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </section>

      <section data-reveal className="grid gap-8 border-y bg-[var(--biolabs-porcelain)] px-5 py-10 sm:px-10 sm:py-16 lg:grid-cols-[.72fr_1.28fr] lg:gap-24 lg:px-14" aria-labelledby="vision-heading">
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-[var(--biolabs-teal)]"><Globe2 aria-hidden="true" size={22} /></span>
          <p className="bio-eyebrow !mb-3 mt-7">Our Vision</p>
          <h2 id="vision-heading" className="text-3xl font-medium tracking-[-.035em]">Essential Health Insight Should Not Depend On Geography Or Income.</h2>
        </div>
        <div className="space-y-6 self-center text-lg leading-8 text-[var(--biolabs-slate)]">
          <p>Health is one of the most valuable parts of a human life. Our vision is a world where every individual, regardless of location, has access to essential tools and resources for maintaining their wellbeing.</p>
          <p>We want to reduce barriers for communities in remote regions with limited healthcare facilities by providing useful medical insight without creating additional financial strain. Geographic isolation and economic constraints should not prevent anyone from pursuing their fullest health potential.</p>
        </div>
      </section>

      <section className="py-16 sm:py-24" aria-labelledby="capabilities-heading">
        <div className="max-w-2xl" data-reveal>
          <p className="bio-eyebrow">What Biolabs Is Capable Of</p>
          <h2 id="capabilities-heading" className="bio-title">Intelligence For Personal Care And The Wider Healthcare System.</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="bio-card p-5 sm:p-9" data-reveal style={{ "--reveal-index": 0 }}>
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><Stethoscope aria-hidden="true" size={22} /></span>
            <h3 className="mt-7 text-2xl font-medium tracking-[-.025em]">Personalized And Provider-Connected Care</h3>
            <p className="mt-5 text-base leading-7 text-[var(--biolabs-slate)]">Biolabs can work as a personalized health assistant shaped around each user. It can also connect with healthcare providers such as hospitals and laboratories, learn from local health patterns, and give doctors, nurses, and other professionals clearer context for treatment and diagnostic workflows.</p>
          </article>
          <article className="bio-card p-5 sm:p-9" data-reveal style={{ "--reveal-index": 1 }}>
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><Network aria-hidden="true" size={22} /></span>
            <h3 className="mt-7 text-2xl font-medium tracking-[-.025em]">A Connected Global Health Foundation</h3>
            <p className="mt-5 text-base leading-7 text-[var(--biolabs-slate)]">Connecting healthcare information worldwide can bring knowledge under one umbrella. That foundation can reveal emerging health trends, guide medication development and delivery, identify regions with healthcare-worker shortages, and expose gaps in medical equipment or pharmaceutical availability.</p>
          </article>
        </div>
      </section>

      <section data-reveal className="grid gap-6 border bg-white p-5 sm:p-10 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-8" aria-labelledby="responsibility-heading">
        <span className="grid h-14 w-14 place-items-center rounded-lg bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><HeartPulse aria-hidden="true" size={25} /></span>
        <div><p className="bio-eyebrow !mb-2">Clinical Responsibility</p><h2 id="responsibility-heading" className="text-2xl font-medium">Decision Support, With Professional Judgment Kept At The Center.</h2><p className="bio-body mt-3 max-w-4xl">Biolabs is designed to reduce fragmentation and support more informed decisions. It does not replace qualified medical professionals, independent clinical judgment, or appropriate medical care.</p></div>
      </section>
      <section className="py-16 sm:py-24" aria-labelledby="release-notes-heading">
        <div className="mb-10 max-w-2xl" data-reveal>
          <p className="bio-eyebrow">Release Notes</p>
          <h2 id="release-notes-heading" className="bio-title">How The Platform Has Evolved.</h2>
          <p className="bio-body mt-5">Each release expands the clinical information Biolabs can organize, analyze, and make easier to understand.</p>
        </div>

        <div className="space-y-5">
          {releases.map((release) => (
            <article key={release.version} className="bio-card overflow-hidden" data-reveal>
              <header className="flex flex-col gap-5 border-b bg-[var(--biolabs-mist)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex items-center gap-5">
                  <span className="font-mono text-xs font-semibold text-[var(--biolabs-teal)]">{release.date}</span>
                  <span className="h-5 w-px bg-[var(--biolabs-cloud)]" aria-hidden="true" />
                  <h3 className="text-xl font-medium">{release.version}</h3>
                </div>
                <span className={release.status === "Released" ? "bio-status-normal" : "bio-status-warning"}>{release.status}</span>
              </header>
              <div className="grid border-t divide-y bg-white md:grid-cols-2">
                {release.indices.map((serviceIndex) => {
                  const service = services[serviceIndex];
                  if (!service) return null;
                  return (
                    <div key={serviceIndex} className="bg-white p-5 sm:p-7">
                      <p className="text-lg font-semibold text-[var(--biolabs-ink)]">{service[0]}</p>
                      <p className="mt-3 text-sm leading-6 text-[var(--biolabs-slate)]">{service[1]}</p>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
