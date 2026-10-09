import Image from "next/image";
import WorkspaceEntry from "./WorkspaceEntry";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import styles from "./ProductsSection.module.css";

function ProductCard({ id, tone, audience, title, description, action, destination }) {
  return (
    <article className={`${styles.card} ${tone}`} aria-labelledby={id}>
      <p className={styles.audience}>{audience}</p>
      <div className={styles.cardBody}>
        <div>
          <h3 id={id}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
        <WorkspaceEntry className={styles.cardAction} destination={destination}>
          <span>{action}</span>
          <span className={styles.cardArrow} aria-hidden="true"><ArrowRight size={18} strokeWidth={1.6} /></span>
        </WorkspaceEntry>
      </div>
    </article>
  );
}

const eplimoFlow = ["Receive", "Collect", "Sequence", "Predict"];

export default function ProductsSection() {
  return (
    <section className={styles.section} id="products" aria-labelledby="products-title">
      <div className="bio-container">
        <header className={styles.heading}>
          <h2 id="products-title">Our Products</h2>
        </header>

        <div className={styles.collection}>
          <article className={styles.fold} aria-labelledby="fold-product-title">
            <div className={styles.bannerImage}>
              <div className={styles.bannerFrame}>
                <Image src="/images/biolabs/fold-molecular-dark-v3.jpg" alt="" fill
                  quality={75} sizes="(max-width: 700px) 210px, 400px" />
              </div>
            </div>
            <div className={styles.foldCopy}>
              <div className={styles.cardBody}>
                <div className={styles.foldText}>
                  <p className={styles.audience}>Our New Biotech Branch For Bioscientists And Life Science Teams</p>
                  <h3 id="fold-product-title">Fold</h3>
                  <p className={styles.description}>Computational research for biology-specific medicines.</p>
                </div>
                <Link className={styles.cardAction} href={process.env.NEXT_PUBLIC_BIOFOLD_URL || "https://biofold.biolabsltd.com"} target="_blank" rel="noopener noreferrer">
                  <span>Start experiment</span>
                  <span className={styles.cardArrow} aria-hidden="true"><ArrowUpRight size={18} strokeWidth={1.6} /></span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>
              </div>
            </div>
          </article>

          <div className={styles.productRow}>
            <ProductCard id="clinical-product-title" tone={styles.clinical} audience="AI-Integrated CRM For Clinics & Laboratories"
              title="Clinical Workspace" description="Millions of data points, connected. Analytics built on your clinical data."
              action="Create a workspace" destination="/workspace/analytics" />
            <ProductCard id="health-product-title" tone={styles.health} audience="For Individuals"
              title="Personalized Health" description="Your measurements and health trends, in focus."
              action="Your Health" />
          </div>

          <article className={styles.eplimo} aria-labelledby="eplimo-product-title">
            <div className={styles.eplimoGallery}>
              <figure className={styles.eplimoShot}>
                <Image src="/images/biolabs/eplimo-kit-closed.png" alt="The EPLIMO kit box, closed, with its embossed wordmark."
                  fill quality={75} sizes="(max-width: 1023px) 22vw, 280px" />
              </figure>
              <figure className={styles.eplimoShot}>
                <Image src="/images/biolabs/eplimo-kit-open.png" alt="The EPLIMO kit opened, showing the saliva collection tube and sealed envelope."
                  fill quality={75} sizes="(max-width: 1023px) 22vw, 280px" />
              </figure>
            </div>
            <div className={styles.eplimoBody}>
              <p className={styles.audience}>At-Home DNA Kit</p>
              <h3 id="eplimo-product-title" className={styles.eplimoStatement}><span className="sr-only">EPLIMO: </span>Decode Your DNA.<br /><span className={styles.eplimoStatementSoft}>Manage Your Triggers.</span></h3>
              <p className={styles.eplimoLead}>One saliva sample. A lifetime of insight.</p>
              <ol className={styles.eplimoFlow} aria-label="How it works">
                {eplimoFlow.map((step, index) => (
                  <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>
                ))}
              </ol>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
