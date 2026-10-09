"use client";

import { X } from "lucide-react";
import { useModalA11y } from "@/hooks/useModalA11y";
import BiochemicalsBarGraph from "./BiochemicalsBarGraph";

export default function BiometricsEntryModal({ isOpen, onClose, selectedBiometricEntry }) {
  useModalA11y(isOpen, onClose);
  if (!isOpen || !selectedBiometricEntry) return null;
  const dateValue = selectedBiometricEntry.created ?? selectedBiometricEntry.created_at;
  return (
    <div className="bio-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="bio-modal max-w-7xl" role="dialog" aria-modal="true" aria-labelledby="entry-title">
        <button type="button" className="bio-icon-button absolute right-4 top-4" onClick={onClose} aria-label="Close record"><X aria-hidden="true" size={18} /></button>
        <div className="mb-7 pr-14"><p className="bio-eyebrow !mb-2">Historical Record</p><h2 id="entry-title" className="bio-subtitle">Registered {new Date(dateValue).toLocaleDateString()}</h2></div>
        <div className="grid min-h-[520px] gap-5 lg:grid-cols-2">
          {selectedBiometricEntry.healthy?.length > 0 && <BiochemicalsBarGraph biochemicalsArray={selectedBiometricEntry.healthy} isHealthy isHyper={null} />}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {selectedBiometricEntry.hyperBiochemicals?.length > 0 && <BiochemicalsBarGraph biochemicalsArray={selectedBiometricEntry.hyperBiochemicals} isHealthy={false} isHyper />}
            {selectedBiometricEntry.hypoBiochemicals?.length > 0 && <BiochemicalsBarGraph biochemicalsArray={selectedBiometricEntry.hypoBiochemicals} isHealthy={false} isHyper={false} />}
          </div>
        </div>
      </section>
    </div>
  );
}
