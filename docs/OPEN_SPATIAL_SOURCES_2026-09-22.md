# OPEN SPATIAL SOURCES — 2026-09-22

Purpose: identify acupoint/meridian spatial sources that can legally and technically support HIU YHCT Atlas. Public availability alone is never treated as redistribution permission.

## Runtime-ready schematic source

### FuriaRozkwit/acupuncture-3d
- Pinned upstream: `1fc9ec98d365c9fb035844e2775c1be05a0a05fc`.
- Reusable scope: 361 authored proportional acupoint anchors, 14-channel topology and proportional rig under MIT; calibrated/structural metadata used by HIU remains under the upstream CC BY-SA 4.0 attribution boundary.
- HIU use: deterministic projection onto BodyParts3D FMA7163, producing 675 bilateral/midline anchors covering 361 unique point codes and all 14 channels.
- Runtime label: `LICENSED_SCHEMATIC / UNVERIFIED`.
- Do not promote to faculty-reviewed/published coordinates without review evidence.
- Do not invent BL-39 topology; it is absent upstream.

## Reusable data, not directly transferable to BodyParts3D

### AcuSim — Dryad doi:10.5061/dryad.zs7h44jkz
- Dryad release: 2025-03-28.
- License: CC0 under Dryad dataset reuse terms.
- Scope: 63,936 RGB-D images, 504 synthetic anatomical models, 174 cervicocranial acupoints.
- Published annotation representation is view-relative image x/y plus normalized camera depth/height and visibility/meridian metadata.
- Allowed project use now: research/validation/reference pipelines, with scholarly citation.
- Runtime coordinate import: BLOCKED until a deterministic transformation to `BodyParts3D-4.0-browser-meters-Y-up` and surface-anchor QA are validated.

### AcuAtlas 361-point reference dataset
- License audited by project: CC BY 4.0.
- Exact audited JSON exposes `view/x/y` mapped body-plate coordinates rather than transferable BodyParts3D XYZ.
- Allowed project use now: catalogue/source cross-check.
- Runtime coordinate import: BLOCKED until a verified 3D transform/surface registration exists.

## Investigated but not importable yet

### MetaAcuPoint — Zenodo doi:10.5281/zenodo.17713204
- Related 2025 paper describes MetaHuman-based hand acupoint localisation and bone-attached socket placement.
- Dataset is available from Zenodo, but the exact record Rights/license field was not independently retrievable in this audit.
- No BodyParts3D transform is established.
- Decision: QUARANTINE until exact record license and coordinate-frame mapping are verified.

### TARA
- NIH-funded TARA advertises an open-access atlas/ontology and a standardized 3D coordinate system.
- The current ontology is useful for identifiers and anatomical relationships, but the exact redistribution license for curated rows has not been verified for HIU bundling.
- Decision: QUARANTINE for bundled rows; monitor as a future standardized coordinate source.

### spacejohnlf/tcm-acupoints
- Repository code is MIT.
- Its README explicitly describes the 3D positions as teaching/illustrative coordinates, not a standard clinical coordinate database, and the point set is partial.
- Decision: implementation reference only; do not replace the more complete Furia schematic layer.

### Antonio-Abrao/acu-master
- GPL-3.0 application with point-position tooling.
- Decision: reference only in this MIT project unless a deliberate GPL licensing decision is made.

## Project rule

A coordinate source enters published runtime positions only after two independent gates:
1. reuse license is verified for the exact artifact;
2. coordinates are deterministically registered to BodyParts3D and pass surface/side/landmark QA.

Until then, spatial data is either `LICENSED_SCHEMATIC / UNVERIFIED`, reference-only, or quarantined.
