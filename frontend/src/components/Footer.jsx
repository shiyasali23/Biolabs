import Link from "next/link";
import {
  ArrowUpRight,
} from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Footer({ homepage = false }) {
  return (
    <footer className="public-footer" id="site-footer">
      <div className="bio-container footer-primary">
        <section className="footer-brand" aria-label="Biolabs">
          <BrandLogo className="footer-brand-lockup" />
          {!homepage && <h2>One Clinical Picture, Without Losing The Detail.</h2>}
          <p>{homepage ? "Connecting biological data, clinical intelligence and computational technology." : "Connect records, measurements, analytics, and health context in one clear workspace."}</p>
          {!homepage && (
            <Link className="footer-inline-link" href="/customer?sample=1">
              Your Health <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" />
            </Link>
          )}
        </section>

        <nav className="footer-navigation" aria-label="Footer navigation">
          <div className="footer-group">
            <p className="footer-group-title">Products</p>
            <div className="footer-link-list">
              <Link href="/customer?sample=1"><span>{homepage ? "Personalized Health" : "Personalized health"}</span>{!homepage && <ArrowUpRight aria-hidden="true" />}</Link>
              <Link href="/sign-up"><span>{homepage ? "Clinical Workspace" : "Clinical workspace"}</span>{!homepage && <ArrowUpRight aria-hidden="true" />}</Link>
              <a href={process.env.NEXT_PUBLIC_BIOFOLD_URL || "https://biofold.biolabsltd.com"} target="_blank" rel="noreferrer"><span>Fold<span className="sr-only"> (opens in a new tab)</span></span><ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          <div className="footer-group">
            <p className="footer-group-title">Platform</p>
            <div className="footer-link-list">
              <Link href="/workspace/analytics"><span>Analytics</span>{!homepage && <ArrowUpRight aria-hidden="true" />}</Link>
              <Link href="/workspace/vault"><span>{homepage ? "Vault" : "Medical vault"}</span>{!homepage && <ArrowUpRight aria-hidden="true" />}</Link>
              <Link href="/workspace/food"><span>Nutrition</span>{!homepage && <ArrowUpRight aria-hidden="true" />}</Link>
              <Link href="/health"><span>Health assessment</span>{!homepage && <ArrowUpRight aria-hidden="true" />}</Link>
            </div>
          </div>
          <div className="footer-group">
            <p className="footer-group-title">Company</p>
            <div className="footer-link-list">
              <Link href="/info"><span>About Biolabs</span>{!homepage && <ArrowUpRight aria-hidden="true" />}</Link>
              {!homepage && <Link href="/profile"><span>Your profile</span><ArrowUpRight aria-hidden="true" /></Link>}
              <Link href="/sign-in"><span>Sign in</span>{!homepage && <ArrowUpRight aria-hidden="true" />}</Link>
            </div>
          </div>
        </nav>
      </div>

      <div className="bio-container footer-bottom">
        {!homepage && <p className="footer-assurance">Sample data is always clearly labeled.</p>}
        <p className="footer-copyright">© {new Date().getFullYear()} Biolabs. All rights reserved.</p>
        <p className="footer-disclaimer">Information is provided for clinical decision support and is not a substitute for professional medical judgment.</p>
      </div>
    </footer>
  );
}
