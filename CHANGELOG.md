# Changelog

All notable changes to the **PaintIt** 3D Room Visualizer project are documented in this file.

---

## [1.2.0] - 2026-07-16

### 🚀 Added
- **Client Revision Pipeline**: Introduced an interactive modal on public share links (`/view/[sharedId]`) allowing clients to send custom color tweaks and notes directly to the painter.
- **Client Read-Only Mode**: Added `isReadOnly` prop to `PaintPicker` to hide custom color mixing controls when viewed by clients.
- **Auto-Landscape Lock**: Added automatic screen orientation switching to landscape for 3D views (`/workspace` and `/view/[sharedId]`) with clean exit/unlock hooks.
- **Collapsible Header HUD**: Top navigation bar now automatically slides out during canvas interaction and returns when expanding bottom control sheets.

### ⚡ Fixed
- **Prerender Build Failure**: Wrapped `/workspace` page contents inside a React `<Suspense>` boundary to prevent Next.js App Router bailout during `npm run build`.
- **WebGL Context Loss**: Prevented VRAM exhaustion crashes by removing cubemap shadows on point lights, memoizing active bulb arrays, and adding hydration locks to prevent duplicate execution.
- **Database Column Parity**: Fixed SQL save exceptions (`column "light_data" does not exist`) by adding JSONB columns for `light_data`, `camera_data`, and `global_environment` to the `visualizations` table.
- **Zod Validation Stripping**: Fixed data loss on save by expanding `visualizationSchema` in `validator.mjs` to validate light, camera, and environment payloads.
- **TypeScript Strict Compilation**: Cleared ESLint and TypeScript compilation errors regarding explicit `any` types, unused variables, and `ScreenOrientation` DOM type casts.

### 🔄 Changed
- **Dynamic Template Lookups**: Removed static `mockMap` fallbacks in `src/routes/visualization.mjs` in favor of dynamic queries to `master_designs` for both string handles and UUID keys.
- **Public Share Endpoint**: Ensured `/api/visualizations/share/:shareId` properly resolves public design presets and painter profiles without requiring authentication bearer tokens.

---

## [1.1.0] - 2026-07-15
- **Workspace Canvas Engine**: Initial integration of Three.js / React Three Fiber interactive 3D model viewport.
- **Lighting Controls**: Overhead bulb toggle switches and daylight/atmosphere night mode controls.