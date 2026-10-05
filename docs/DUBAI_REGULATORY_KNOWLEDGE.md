# Dubai building regulation knowledge for AMPHR

Working reference for anyone (or any Claude session) building AMPHR. Compiled from the user's DM PDFs and public web search on 2026-10-05.
Confidence: **[DM-PDF]** = from the user's Dubai Municipality documents; **[WEB]** = from web search summaries (official pages were blocked by the sandbox network, so confirm article numbers against the primary text); **[ASSUMPTION]** = our inference.

## 1. Law No. (3) of 2026, Quality and Safety of Buildings in Dubai
- Applies to all buildings in Dubai, including free zones and private development zones (e.g. DIFC), built before or after enactment. [WEB]
- Owners must have periodic inspections done by a licensed engineering firm accredited by Dubai Municipality, and fix defects found. [WEB]
- A **Quality and Safety Certificate** needs an engineering-firm assessment of structure, MEP, safety systems and overall technical condition. [WEB]
- **Validity:** 10 years if the Completion Certificate is under 40 years old; 5 years if 40 years or older. Renewable; renewal conditions set by a resolution of the Executive Council Chairman. [WEB]
- **Transition:** owners, contractors and engineering offices must comply within 1 year of the effective date (extendable). [WEB]
- **Penalties:** fine AED 100 to 1,000,000; repeat within 2 years doubles it, capped at AED 2,000,000. Administrative measures can include suspending building permits, suspending transactions with government or private bodies including Dubai Land Department, and suspending lease certification for units. [WEB]
- The Law was issued by Sheikh Mohammed bin Rashid in March 2026. [WEB]
- App link: `comp.js` (Law 3/2026 tracker) and the "Regulatory basis" card on the DM Permit page.

## 2. DM structural modification / alteration permit (NDT) [DM-PDF]
- NDT and material evaluation reports substantiate the structural model. Testing by an **EIAC-accredited / DM-registered lab**, submitted through an accredited structural consultant via **Dubai BPS**.
- Scope by modification type: slab penetrations (GPR + cover meter / Ferroscan); vertical extension / mezzanine (cores, UPV, geotech if foundation load rises); retrofitting (carbonation, half-cell, rebar exposure and caliper); PT slabs (GPR 2.0 to 4.0 GHz, as-built tendon profiling; no cutting of active strands without DM-approved de-tensioning).
- Report must include: EIAC certificate and equipment calibration certificates; scan maps and as-built overlays; core data to BS EN 12504-1 / ASTM C42 with GPR-first core locations, L/D and reinforcement correction to in-situ fcu; crack-width log and phenolphthalein carbonation depth.
- Consultant deliverables: condition assessment and integrity report, updated FE model (ETABS, SAFE, SAP2000, Prokon), propping and shoring method statement, repair / strengthening details (ACI 440.2R / DBC).
- App link: `js/dm.js` (DM Permit page).

## 3. DM evaluation systems [DM-PDF]
- Portals: Dubai BPS (central submission), Dubai Building Code (DBC), structural modification and alteration services.
- Existing-building assessment: NDT (UPV / echo, rebound), GPR / EM rebar mapping, corrosion potential mapping, core testing; third-party structural audits; demolition and shoring approvals.
- **DCLD-CQPS** gives Technical Approval for non-standard systems (precast, 3D printing, proprietary PT kits, composites, light-gauge steel).
- Engineers need DM Structural Engineer Registration by height class **G+1, G+4, G+12 or Unlimited**; labs need EIAC accreditation plus DM registration.

## 4. Third-party software and DM integration [user PDF "Which 3rd party software company has compliance..."]
- **No software vendor holds a DM certificate or delegated authority** to upload inspection reports directly or to issue a Building Completion Certificate (or a Quality and Safety Certificate under Law 3/2026). Issuing is a statutory authority function.
- The only submission gateway is **Dubai BPS / Build in Dubai**, used by DM-registered consultants and contractors with UAE Pass authentication. No public external API bypasses the consultant's legal undertaking or the DM inspectorate review.
- "DM compliance" claims by vendors mean forms, ITP workflows and checklists aligned to DM / Al Sa'fat / DBC. Examples named: Procore, Autodesk Construction Cloud, flowdit, PlanRadar, Novade (field / QA-QC); FirstBit ERP, PropertySurvey Pro (records). Reports are exported and then submitted to DM by the consultant.
- Reports DM accepts come from EIAC-accredited labs registered with Dubai Central Laboratory (examples named: Fugro, Bureau Veritas, SGS, Al Futtaim Element).
- BCC steps: field QA/QC (contractor and supervising consultant) -> NDT/material certification (EIAC lab, DCL calibration) -> authority NOCs (DEWA, Civil Defence, SIRA) -> final inspection request and issuance (DM-registered consultant via BPS).
- **AMPHR positioning:** a field capture, evidence and report-preparation tool that produces consultant-ready packs. It must never claim DM certification, direct DM filing or certificate issuance.

## 5. Other findings [WEB]
- **DBC 2021** parts: A General, B Architecture, C Accessibility, D Vertical transportation, E Building envelope, F Structure, G Incoming utilities, H Indoor environment, J Security, K Villas.
- DBC Part F.6.2.3 (Table F.3) and DM Circular 7.2.1 require supplementary cementitious materials (GGBS, fly ash) in structural concrete; minimum cube strength 35 MPa (C28/35) for structural concrete.
- DM periodic inspection rules for building sites: supervising consultants submit electronic inspection reports at least every two weeks in the DM-approved form; third-party structural inspection offices must be class 1 (unlimited floors) with at least 3 DM-accredited structural engineers, each with 10+ years' experience.
- Modification permit drawings: existing areas in yellow, proposed changes in red, demolition in green on approved plans.
- Specialised maintenance on existing buildings needs lab tests of concrete and reinforcing steel first, plus a consultant-approved repair proposal with calculations and material specs.
- Administrative Resolution 37 of 2021 amends the bylaw concerning building permits; Administrative Resolution 109 of 2022 regulates licensing of the specialised-maintenance / engineering activities. Not read in full; confirm scope before relying on them.

## Open items to verify with primary sources
- Exact Law 3/2026 article numbers, the effective date (which sets the 1-year deadline), and whether the certificate clock runs from the Completion Certificate date (we approximate with year built).
- Whether NDT acceptance thresholds in AMPHR's Settings (UPV, half-cell, etc.) match DBC / DCLD requirements. They are editable defaults from common practice and are not DM-mandated.
- DM URLs (dm.gov.ae, dlp.dubai.gov.ae) are blocked in the cloud sandbox; add them under Allowed domains if full-text fetching is wanted.
