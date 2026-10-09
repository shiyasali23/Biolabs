"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Apple,
  ArrowUpRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Database,
  Microscope,
  Stethoscope,
} from "lucide-react";
import { useUser } from "@/contexts/userContext";
import { useIntelligence } from "@/contexts/intelligenceContext";
import NoDataFound from "./NoDataFound";
import { openClinicalTool } from "./clinical-tools/navigation";

const icons = [Microscope, Stethoscope, Apple, ChartNoAxesCombined, BrainCircuit, Database];
const services = [
  ["Disease Detection", "Review biochemical measurements with a selected prediction model."],
  ["Diagnostics Center", "Explore symptom patterns with an informational assessment."],
  ["Nutrition", "Curated food and nutrition recommendations."],
  ["Analytics Platform", "Monitor health indicators and biochemical trends."],
  ["Intelligence", "Explore records and health context with AI assistance."],
  ["Vault", "Keep medical records and results together."],
];

export default function ServicesComponent() {
  const { isLogined } = useUser();
  const { openIntelligence } = useIntelligence();
  const router = useRouter();
  const [noDataFoundModalOpen, setNoDataFoundModalOpen] = useState(false);
  const [noDataFoundRoute, setNoDataFoundRoute] = useState(null);

  const onServiceClick = (index, event) => {
    if (index === 0) openClinicalTool(router, "detection", event.currentTarget);
    else if (index === 1) openClinicalTool(router, "diagnosis", event.currentTarget);
    else if (index === 2) router.push("/workspace/food");
    else if (index === 3 && isLogined) router.push("/workspace/analytics");
    else if (index === 3) { setNoDataFoundRoute("analytics"); setNoDataFoundModalOpen(true); }
    else if (index === 4) openIntelligence();
    else if (index === 5 && isLogined) router.push("/workspace/vault");
    else if (index === 5) { setNoDataFoundRoute("vault"); setNoDataFoundModalOpen(true); }
  };

  return (
    <section className="home-services restored-services" id="solutions" aria-label="Biolabs services">
      <div className="bio-container">
        <header className="services-heading">
          <div><p className="services-eyebrow">Inside The Platform</p><h2>From Records<br />To Understanding.</h2></div>
        </header>
        <div className="service-grid">
          {services.map(([title, description], index) => {
            const Icon = icons[index];
            return (
              <button
                type="button"
                onClick={event => onServiceClick(index, event)}
                className={`service-card service-card-${index}`}
                aria-label={`Open ${title}`}
                key={title}
              >
                <span className="service-card-top">
                  <span className="service-icon"><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></span>
                </span>
                <span className="service-card-body">
                  <strong>{title}</strong>
                  <span className="service-description">{description}</span>
                </span>
                <span className="service-card-footer">
                  <span>Explore {title === "Analytics Platform" ? "analytics" : title === "Diagnostics Center" ? "diagnostics" : title.toLowerCase()}</span>
                  <span className="service-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {noDataFoundModalOpen && (
        <NoDataFound isOpen onClose={() => setNoDataFoundModalOpen(false)} isModal route={noDataFoundRoute} />
      )}
    </section>
  );
}
