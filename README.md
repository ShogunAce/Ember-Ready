# Ember Ready — California Wildfire Household Resilience Audit

> A personalized, scored, actionable wildfire readiness and home hardening platform for California residents grounded in real government spatial data, fire science codes, and live atmospheric conditions.

---

## 1. Problem Statement

Over 11 million California residents live in the Wildland-Urban Interface (WUI), facing catastrophic wildfire threats each fire season. Generic disaster checklists (Ready.gov, generic FEMA PDFs) fail residents because:
1. **They are not calibrated to specific parcel hazard zones:** A homeowner in Paradise or Mill Valley faces drastically different topography, fuel loading, and wind vectors than an urban resident.
2. **They treat homes like passive victims rather than fortifiable structures:** Over 90% of homes lost during California wildfires ignite from wind-blown embers entering vents, gutters, or burning mulch in the immediate 5-foot perimeter (Zone 0) — not from the advancing flame wall.
3. **Checklists are static and disconnected from real-time environmental context:** Homeowners don't know if an active Red Flag Warning is currently declared for their zone, whether active fires are burning 15 miles away, or what their local evacuation zone code is.

**Ember Ready** replaces generic advice with an audit tool that ingests an address, queries real state and federal geospatial data, scores home vulnerabilities according to CAL FIRE's actual **Public Resources Code § 4291** and **Assembly Bill 3074** standards, and generates a prioritized, actionable plan that saves lives, protects structures, and qualifies homeowners for insurance discounts under California's *Safer from Wildfires* framework.

---

## 2. Technical Architecture & Data Pipelines

```
                             ┌─────────────────────────────────┐
                             │    Ember Ready Frontend         │
                             │ (React 19 + Vite + Tailwind CSS)│
                             │   "Warm Topographic" System     │
                             └───────────────┬─────────────────┘
                                             │ JSON API
                                             ▼
                             ┌─────────────────────────────────┐
                             │   Full-Stack Express Server     │
                             │          (server.ts)            │
                             └──────┬──────────┬───────────────┘
                                    │          │
            ┌───────────────────────┘          └────────────────────────┐
            ▼                                                           ▼
┌───────────────────────────────┐                             ┌───────────────────────────────┐
│ Real Static Hazard Feeds      │                             │ Live Environmental Feeds      │
├───────────────────────────────┤                             ├───────────────────────────────┤
│ • CAL FIRE FRAP GIS Server    │                             │ • NWS api.weather.gov         │
│   (SRA/LRA, FHSZ Tiers)       │                             │   (Red Flag Warnings, RH%,    │
│ • FEMA National Risk Index    │                             │    Wind Gusts, Fire Weather)  │
│   (Wildfire percentile, EAL,  │                             │ • NASA FIRMS & NIFC WFIGS     │
│    Community Resilience)      │                             │   (Live satellite hotspots,   │
│ • US Census Geocoder / Google │                             │    active fire perimeters)    │
│   (Parcel coordinates, county)│                             │ • AirNow EPA / Open-Meteo     │
└───────────────────────────────┘                             │   (Live AQI & smoke PM2.5)    │
                                                              └───────────────────────────────┘
```

### Zero Synthetic Data Integration
Ember Ready makes live calls to real government endpoints:
1. **Geocoding**: Google Geocoding API + US Census Geocoder (`geocoding.geo.census.gov`) fallback with California boundary checks (`32.5°N – 42.0°N`, `124.5°W – 114.1°W`).
2. **CAL FIRE Fire Hazard Severity Zone (FHSZ)**: Queries the CAL FIRE FRAP ArcGIS Feature Service (`services1.arcgis.com/jUJYIo9tSA7EHvfZ`) to determine State Responsibility Area (SRA) vs Local Responsibility Area (LRA) and Hazard Tier (Very High, High, Moderate).
3. **FEMA National Risk Index (NRI)**: Ingests census tract and county wildfire hazard percentiles, Expected Annual Loss (EAL in $/yr), Community Resilience ratings, and Social Vulnerability metrics (`hazards.fema.gov/nri`).
4. **National Weather Service (`api.weather.gov`)**: Direct integration (no API key required) querying active Red Flag Warnings, relative humidity percentages, and wind gusts.
5. **NASA FIRMS Active Fires**: Ingests active thermal detections from NASA VIIRS and active California wildfire perimeters from the National Interagency Fire Center (NIFC WFIGS open GIS layer).
6. **AirNow & Open EPA**: Real-time US AQI, particulate matter (PM2.5), and wildfire smoke drift advisories.

---

## 3. CAL FIRE Defensible Space & Home Hardening Audit Engine

Scoring is grounded in California fire engineering standards:

| Zone / Component | Distance | Legal Standard | Primary Ignition Mechanism | Weight |
|---|---|---|---|---|
| **Zone 0** | 0 – 5 ft | AB 3074 / PRC § 4291(a)(1)(B) | Embers landing in bark mulch, dead leaves, or firewood touching siding | 25% |
| **Home Hardening** | Building Envelope | CBC Chapter 7A / IBHS Standard | Embers entering 1/4" attic vents, lodging in roof valleys, shattering single-pane glass | 35% |
| **Zone 1** | 5 – 30 ft | PRC § 4291(a)(1)(A) | Direct flame impingement, ladder fuels climbing from shrubs into canopy | 20% |
| **Zone 2** | 30 – 100 ft | PRC § 4291(a)(2) | Crown fires, heavy downed wood, unmowed dry annual grass | 10% |
| **Egress & Access** | Corridor | PRC § 4290 / CFC § 503 | Trapped residents during single-road bottleneck, engines blocked by low trees | 10% |

### Transparent Rationale
Instead of an opaque number, the dashboard provides a **Point Breakdown Matrix** explaining *why* points were deducted and citing the fire engineering principle behind each criterion.

### Interactive Remediations
Users can interactively check off actions on the **Prioritized Checklist** (ranked by impact vs effort) to see their overall Resilience Score update dynamically in real time.

---

## 4. Offline Resilience & Physical Field Binder View

During catastrophic wildfires, power grids fail and cellular towers burn down. Ember Ready is engineered for low-connectivity survival:
- **Offline Save**: Automatically caches audit reports locally in browser IndexedDB/LocalStorage, assignable by unique Audit ID (e.g., `EMBER-CA-94563-8821`), and exportable as raw JSON.
- **Dedicated Print View**: Formatted with a clean `@media print` stylesheet as an official physical field audit document containing:
  - Property coordinates & CAL FIRE classification
  - Hardening scorecard
  - Action checklist with pencil checkboxes
  - Household Evacuation Protocol ("The 6 P's" Go-Bag checklist, emergency frequencies, Genasys evacuation code).

---

## 5. Design System: "Warm Topographic"

A calm, serious field-guide aesthetic tailored to field work and emergency preparedness:
- **Palette:** Parchment background (`#F2EBDD`), deep clay/terracotta (`#B5542C`), sage green (`#6B7F5E`), charcoal text (`#2B2824`).
- **Reserved Alert Red (`#C23B22`):** Used *strictly* for active Red Flag Warnings or Very High hazard tiers — never decoratively.
- **Visual Motifs:** Topographic contour dividers, surveyor benchmark watermarks, unboxed metadata separators (`·`).

---

## 6. Non-Goals for this Build (Future Roadmap)

Flagged as explicit future extensions:
1. **Computer Vision / Drone Imagery Analysis**: Automated aerial vegetation boundary segmentation using satellite imagery.
2. **Earthquake / Multi-Hazard Module**: Expanding beyond wildfire into seismic and mudslide hazard cross-indices.
3. **Out-of-State Fire Codes**: Expanding beyond California to Oregon, Washington, Colorado, and Nevada.
