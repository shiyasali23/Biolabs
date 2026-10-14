"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import cellOrb from "../../public/images/biolabs/biolabs-cell-orb.webp";

export default function HeroOrb() {
  const artworkRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const artwork = artworkRef.current;
    if (!artwork || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.08 }
    );

    observer.observe(artwork);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={artworkRef}
      className={`restored-hero-art restored-hero-orbit${isVisible ? " is-orbiting" : ""}`}
    >
      <span className="bio-grid-field" aria-hidden="true" />

      <span className="bio-orbit bio-orbit-teal" aria-hidden="true">
        <i />
      </span>
      <span className="bio-orbit bio-orbit-gold" aria-hidden="true">
        <i />
      </span>
      <span className="bio-orbit bio-orbit-violet" aria-hidden="true">
        <i />
      </span>

      <span className="bio-orbit-field" aria-hidden="true" />

      <svg
        className="bio-signal-pattern"
        viewBox="0 0 900 520"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="signal-teal" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86b7ad" stopOpacity="0" />
            <stop offset="0.24" stopColor="#6aa99d" stopOpacity="0.58" />
            <stop offset="0.76" stopColor="#6aa99d" stopOpacity="0.42" />
            <stop offset="1" stopColor="#86b7ad" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="signal-gold" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b6aa6c" stopOpacity="0" />
            <stop offset="0.3" stopColor="#a99a55" stopOpacity="0.46" />
            <stop offset="0.82" stopColor="#a99a55" stopOpacity="0.3" />
            <stop offset="1" stopColor="#b6aa6c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="signal-violet" x1="0" y1="0" x2="900" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#806989" stopOpacity="0" />
            <stop offset="0.28" stopColor="#755d80" stopOpacity="0.38" />
            <stop offset="0.8" stopColor="#755d80" stopOpacity="0.24" />
            <stop offset="1" stopColor="#806989" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path className="signal-path signal-path-teal" d="M18 314C151 166 263 183 358 252C472 335 585 350 883 142" />
        <path className="signal-path signal-path-gold" d="M0 405C151 267 289 353 407 258C532 157 667 127 900 246" />
        <path className="signal-path signal-path-violet" d="M37 92C177 223 298 78 432 180C561 278 687 379 892 304" />
        <path className="signal-path signal-path-teal" d="M91 468C257 399 319 219 484 305C625 379 731 471 900 399" />
        <path className="signal-path signal-path-gold" d="M210 26C342 148 454 57 579 131C703 204 766 229 900 96" />

        <g className="signal-nodes">
          <circle cx="171" cy="236" r="4" />
          <circle cx="309" cy="337" r="3" />
          <circle cx="435" cy="180" r="4" />
          <circle cx="568" cy="337" r="3" />
          <circle cx="674" cy="160" r="4" />
          <circle cx="786" cy="367" r="3" />
        </g>
      </svg>

      <div className="restored-cell-frame">
        <Image
          src={cellOrb}
          alt="A microscopy-inspired biological cell with membranes, vesicles, and connected internal structures."
          priority
          fetchPriority="high"
          sizes="(max-width: 560px) 52vw, (max-width: 820px) 56vw, 500px"
        />
      </div>
    </figure>
  );
}
