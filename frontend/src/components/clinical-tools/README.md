# Clinical tools

`ToolSurface` supplies the dialog or standalone frame; `ClinicalTool` owns input, model, sample, and result states. `model-utils.mjs` validates the API's JSON-encoded model definitions. Styles are scoped to this workflow.

## Routing

The root `@tools` parallel slot intercepts soft navigation to `/workspace/diagnosis` and `/workspace/detection`. Direct requests and refreshes use the standalone pages. Slot defaults and catch-all routes clear the overlay on other destinations. Legacy `/diagnostics` and `/detection` redirect to the canonical paths. AppShell reads its children slot segments so interception preserves the original shell.

Radix Dialog manages focus trapping, background isolation, Escape, and scroll locking. Closing goes Back; opener tracking restores focus to either the original control or the mobile navigation trigger.

## Data

Live definitions and submissions use the existing diagnosis service. Bundled definitions are an explicit offline fallback, not an alternative prediction engine. Detection samples come from `dummy-disease-detection-data.json`; only its inputs are loaded. Diagnosis maps five phrases in the existing `dummy-records-data.json` demonstration record to model features and uses the sample profile's gender. The five-symptom threshold excludes mapped context fields. Sample requests omit the authenticated token, including after editing sample values.

Units are copied from `backend/datasets/biochemical_units.csv`. That source does not define Very Low-Density Lipoprotein or Cholinesterase. These fields deliberately display “Unit not supplied”; do not infer training units from sample magnitudes. The API should supply authoritative units before clinical deployment.

Confidence is displayed as model output, not an individual's disease probability. All labels and scores come from the model. Supplementary diagnosis reports remain optional; the local report backend was unavailable during verification, while all three live prediction models worked.

## Verification — 2026-09-30

- Production build passed; all 10 tests in `frontend/tests` passed.
- Browser review at 1440×900, 768×1024 and 390×844.
- Homepage and workspace interception, direct routes, refresh, Back/Forward, Escape and close.
- Initial focus, keyboard wrap, background aria-hidden and scroll lock; opener restoration including mobile navigation.
- Complete editable samples; symptom search/removal; minimum count and negative-number validation.
- Live diagnosis, diabetes and liver predictions; result-to-edit regression fixed.
- Service failure tested with local service stopped: announced error, preserved inputs, retry available. Service restored afterward.

Visual captures are under `output/clinical-tools/` at repository root.

## Detection overview revision

Detection now uses the separate `DetectionTool` component. Both model names, real output labels, readiness, and returned results remain visible in the overview. `Load sample data` fills every model; `Run both models` submits the two existing APIs concurrently, with separate failure states. Input review uses a focused editor with the model overview retained as a rail on desktop and a compact switcher on mobile. Predictions remain informational.

Age, gender, creatinine, cholesterol and any other shared feature update across models because they describe the same subject. A changed value clears only affected predictions. Completed results stay available while reviewing another model. Samples omit the authenticated token even after editing.

Verification: both live models together and individually; shared-value propagation; unique-value result invalidation; negative-number validation; full-service failure with two independent errors and retained inputs; initial focus, keyboard wrap, Escape and focus restoration; desktop, tablet, and 390px mobile layouts. Automated suite now has 14 passing checks. No upcoming models or unverified clinical-accuracy claims were added.

## Diagnostics dropdown revision — 2026-10-01

Diagnostics uses `SymptomsPanel` for native category disclosures and a search across every symptom in the live model. Uncategorized features remain reachable under Other symptoms. Gender and removable selections share a compact panel; the footer keeps one minimum-count requirement. Sample loading sits beside Close. Both direct tool routes now retain the homepage behind an accessible dialog, matching intercepted navigation. Prediction requirements and API payloads are unchanged.

## Diagnosis result revision — 2026-10-01

`DiagnosisResult` renders the returned condition, ranked score bars, available report sections, and reviewed symptoms. Report lists accept strings or objects with a name, and absent sections are omitted. Scores retain the service's percentages; only the visual bar width is constrained to 0–100. The predicted class receives stronger emphasis. All scores remain accessible through a native disclosure. Back to symptoms preserves inputs and restores focus.

Verified live prediction, all 41 scores, return to saved inputs, desktop/tablet/mobile layouts, production build, and 14 existing tests. The local supplementary report service was unavailable, so the browser showed scores and symptoms without description or report sections.
