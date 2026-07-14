# 🚀 PaintIt Production Launch Roadmap

A categorized tracking index of engineering backlogs, architectural upgrades, and deployment milestones required to scale PaintIt from local sandbox into a production-grade 3D workspace app.

---

## 📱 Core UI Framework & PWA Foundations

- [ ] **Native PWA Configuration**
- [ ] Add manifest file schemas (`manifest.json`) supporting asset caching and offline launch vectors.
- [ ] Register service worker scripts to streamline network payloads.
- [ ] Configure apple-mobile-web mobile headers for a seamless app window environment.
- [ ] **Global Application Theme Customization**
- [ ] Embed explicit root theme colors (`#0a0a0a`) in the metadata layer to match the premium dark background.
- [ ] Build responsive edge margins with `touch-action: auto` properties to protect system pull-down bar behaviors on mobile devices.

---

## 🎨 Contextual Workspace HUD & Material Systems

- [ ] **Context-Aware HUD Redirection**
- [ ] Build a structural conditional component routing layer within `FloatingAdminPanel`.
- [ ] Route mesh target click events into independent modules based on geometry tagging metadata:
  - `Wall Mesh Click` -> Surface Paint Module (Solid Swatch Array).
  - `Floor/Door/Furniture Click` -> Texture Material Array.
- [ ] **PBR Material Asset Pipeline Engine**
- [ ] Structure dynamic directory paths within `/public/textures/` for curated floorboards, wood textures, tiles, and fabrics.
- [ ] Program a dedicated Three.js asynchronous `TextureLoader` engine into `playground-core.tsx`.
- [ ] Bind texture maps cleanly down to custom mesh structures using:
    - Diffuse maps (`Map`) for base visual tracking.
    - `Roughness Map` parameters for matte vs. shiny reflectivity behaviors.
    - `Normal Map` vectors to fake tactile depth cracks and splits safely.
- [ ] **Dynamic Texture Transformation Sliders**
- [ ] Add uniform tile repeating range sliders (`Texture Scale / Repeat`) into the active texture panel to scale material density on the fly.

---

## 🏛️ Advanced Architecture & Material Layouts

- [ ] **Blender Mesh Structural Segmentation**
- [ ] Re-export the core room geometry file (`selfcon.glb`) with separate, distinct meshes for two-tone designs (e.g., separating `wall_front_top` from a physical lower `wall_front_bottom_wainscot` molding trim layer).
- [ ] **Custom Two-Tone Shader Math (Alternative)**
- [ ] Implement a custom Three.js `ShaderMaterial` to create procedural horizontal color-split walls using height thresholds if physical mesh separation is bypassed.

---

## 🌟 Premium Interactions & Cinematic Enhancements

- [ ] **User Presentation View Layer**
- [ ] Build an authenticated end-user preview interface that strips out editing tools, bounding boxes, and transformer gizmos entirely.
- [ ] Position the fallback camera at a natural human-eye standpoint (~1.55m elevation height) pulled slightly back from the entryway.
- [ ] Refactor rotation physics to use expensive heavy camera damping (`dampingFactor: 0.04`) to give orbit actions a cinematic drift.
- [ ] **Interactive Mechanics**
- [ ] Add click event listeners to door geometries to execute smooth rotation animation transforms (swinging doors open/closed).

---

## 💾 Infrastructure, Serialization & Persistence

- [ ] **Extended State Serialization Payloads**
- [ ] Expand the database update array schemas to explicitly write, pass, and read texture asset path strings alongside flat color hex choices for each model ID group.
- [ ] **Hydration Integrity Checks**
- [ ] Audit localStorage syncing states to handle concurrent camera positioning limit modifications seamlessly across devices.
