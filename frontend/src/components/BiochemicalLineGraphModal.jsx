"use client";

import { X } from "lucide-react";
import { useModalA11y } from "@/hooks/useModalA11y";
import BiochemicalLineGraph from "./BiochemicalLineGraph";

export default function BiochemicalLineGraphModal({ isOpen, onClose, selectedBiochemical }) {
  useModalA11y(isOpen, onClose);
  if (!isOpen || !selectedBiochemical) return null;
  return (
    <div className="bio-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="bio-modal max-w-3xl" role="dialog" aria-modal="true" aria-label={`${selectedBiochemical.name} trend`}>
        <button type="button" className="bio-icon-button absolute right-4 top-4 z-10" onClick={onClose} aria-label="Close trend"><X aria-hidden="true" size={18} /></button>
        <div className="mt-12"><BiochemicalLineGraph biochemical={selectedBiochemical} name={selectedBiochemical.name} /></div>
      </section>
    </div>
  );
}
