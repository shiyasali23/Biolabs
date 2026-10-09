# Homepage products

Follows the site system in `/DESIGN.md`. Source of truth: `ProductsSection.jsx` and `ProductsSection.module.css`.

Order: Fold banner → Clinical Workspace + Personalized Health (two-up) → EPLIMO DNA kit.

- **Fold** (dark `#0c211c`): image left, copy right. Both halves split on the same line as the two cards below, so the copy starts on the right card's text line.
- **Product cards**: Clinical Workspace on `#eef0e6`, Personalized Health on `#dce6c8`. Label, title, one-line description, action with a circular arrow. Whole card is clickable and opens the workspace dialog. Stay two-up on phones.
- **EPLIMO** (light): copy left on the 36px line, two kit photos right between the right-card text line and the arrow edge, all vertically centred; 370px tall like Fold. Phones: photos stacked left, copy and vertical steps right.

Rules: 14px panels (10px phones), 18px gaps (14px phones), 36px text inset. Minimal copy; never truncate names. Fold opens in a new tab and announces it. Destinations: workspace dialog, `NEXT_PUBLIC_BIOFOLD_URL` (fallback `https://biofold.biolabsltd.com`). EPLIMO has no destination yet.
