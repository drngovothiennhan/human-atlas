# Kinhlac.online 3D functional parity — clean-room checklist

Updated: 2026-09-23

This project reproduces interaction capabilities, not proprietary models, styling, source code, or bulk text from kinhlac.online.

## Publicly observable / publicly described functions

| Function | HIU Atlas state |
| --- | --- |
| Interactive 3D meridian viewer in browser | Implemented |
| Rotate 3D body | Implemented |
| Zoom / pinch / wheel | Implemented |
| Show 12 primary meridians | Implemented simultaneously or one-by-one |
| Click/tap an acupoint to inspect | Implemented |
| Search for an acupoint | Implemented by code/name/body region |
| Fly camera to searched acupoint | Implemented |
| Direct browser learning without install | Implemented as static GitHub Pages |
| Point catalogue linked to 3D | Implemented for 361 standard meridian points |
| Point identification metadata | Implemented with Vietnamese terminology when official FHIR source is reachable at build; Pinyin/Han fallback |
| Anatomical reference around point | Implemented with controlled surface region + anatomical landmarks |
| Meridian-first simplified anatomy background | Implemented with surface / compact landmark muscle / skeleton presets |

## HIU Atlas additions

- 14-channel educational layer: 12 primary meridians + Ren/CV + Du/GV.
- Left/right/both side filtering.
- Per-meridian color coding.
- Point pulse and channel flow animation, with reduced-motion support.
- Previous/next point navigation.
- Vietnamese terminology fetched from the Vietnam Ministry of Health FHIR CodeSystem during build, with deterministic local fallback.
- Controlled anatomy regions/landmarks from TARA, without copying WHO prose or clinical needling instructions.
- BodyParts3D registration workflow remains separately labeled from schematic/unverified coordinates.

## Guardrails

- No proprietary kinhlac.online 3D assets, source code, layout, or bulk text are copied.
- No unverified 3D coordinate is promoted to FACULTY_REVIEWED/PUBLISHED.
- Clinical needling depth, angle, and treatment claims are not generated from missing data.
