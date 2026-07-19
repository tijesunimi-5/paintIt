# 🎨 PaintIT Studio - Developer Onboarding & Architecture Guide

Welcome to **PaintIT Studio**! This document is designed to give a new developer a complete, 3D-engine level understanding of the entire codebase within **one hour**.

---

## 🚀 1. Executive Summary & Tech Stack

**PaintIT Studio** is a photorealistic 3D interactive room visualization and paint project management platform. It allows **Painters** to create and share 3D room schemes and **Clients/Homeowners** to remap wall paint colors, test sheen finishes (Emulsion, Satin, Gloss), adjust indoor lighting, and submit feedback or project leads.

### Core Architecture
```
┌────────────────────────────────────────────────────────┐
│             Next.js 14 Frontend (App Router)          │
│   ┌────────────────────────────────────────────────┐   │
│   │ Three.js / React Three Fiber / Drei 3D Canvases│   │
│   └────────────────────────────────────────────────┘   │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST APIs
┌──────────────────────────▼─────────────────────────────┐
│                 Express.js Backend API                 │
│   ┌────────────────────────────────────────────────┐   │
│   │ PostgreSQL Database Pool (pg)                  │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Stack Breakdown
* **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS.
* **3D Engine**: Three.js, `@react-three/fiber` (R3F), `@react-three/drei`.
* **Backend**: Node.js, Express.js (`ES modules`), JWT Authentication.
* **Database**: PostgreSQL (`pg` connection pool).

---

## 📂 2. Folder Structure & Sitemap

### 🎨 Frontend (`/frontend`)

```
frontend/
├── app/
│   ├── (public)/                 # Publicly accessible routes
│   │   ├── workspace/            # Main interactive 3D studio workspace (/workspace)
│   │   ├── view/[sharedId]/      # Client shared concept 3D viewer (/view/xyz)
│   │   ├── login/                # Authentication login route
│   │   └── register/             # User registration route
│   ├── (painter)/                # Painter portal route group
│   │   ├── dashboard/            # Painter projects & quotes dashboard
│   │   └── profile/              # Painter public business profile setup
│   ├── (client)/                 # Client/Homeowner route group
│   │   ├── hub/                  # Client saved design remixes & hub
│   │   └── design/               # 2D preview design concept route
│   ├── playground/               # Internal 3D testbench with Leva controls
│   ├── globals.css               # Global CSS & Design System tokens
│   └── layout.tsx                # Root layout, providers & font initializers
│
├── components/
│   ├── canvas/                   # 3D WebGL Canvas Components (R3F)
│   │   ├── WorkspaceCanvas.tsx   # Core 3D studio canvas (lighting, raycasting, painting)
│   │   ├── playground-core.tsx   # Advanced 3D testbench engine with gizmo controls
│   │   ├── LightControls.tsx     # UI modal & state manager for indoor light bulbs
│   │   └── ClientPaintPicker.tsx # Client-facing color swatches & finish selectors
│   ├── studio/                   # Studio UI controls
│   │   └── PaintPicker.tsx       # Color picker & swatch array component
│   └── shared/                   # Global shared UI
│       ├── RoleGuard.tsx         # Security route guard & role isolation gatehouse
│       └── Navbar.tsx            # Navigation header component
│
├── config/
│   └── paintFinishes.ts          # Physical material sheen presets (Emulsion, Satin, Gloss)
│
├── context/
│   ├── AuthContext.tsx           # Global authentication state, JWT tokens & user payload
│   └── AlertContext.tsx          # Global toast notification alerts provider
│
└── utils/
    └── generateWallNormalMaps.ts # Procedural drywall plaster normal map generator (CanvasTexture)
```

### ⚡ Backend (`/backend`)

```
backend/
├── src/
│   ├── server.mjs                # Express app initialization, CORS & rate limiter
│   └── routes/
│       ├── auth.mjs              # User auth (/login, /register, /refresh, /me)
│       ├── leads.mjs             # Inbound client leads & feedback (/api/leads)
│       ├── visualization.mjs     # 3D visualization schemes (/api/visualizations)
│       └── painter.mjs           # Painter profile & concept catalog routes
├── database.mjs                  # PostgreSQL pg Pool connection setup
└── pgCodes.sql                   # SQL table schema definitions
```

---

## 🧊 3. How the 3D WebGL Painting Engine Works

Understanding the 3D pipeline is key to working with PaintIT Studio:

### 1. Dual Wall Mesh Architecture & Traversal
In high-fidelity GLTF models (`/models/selfcon.glb`), there are two sets of wall meshes:
* **Interior Painted Walls**: `wallLeft`, `wallRight`, `wallBack`, `wallFront`, `ceiling`.
* **Exterior Structural Shell**: `left`, `right`, `back`, `front`, `roof`.

To prevent **z-fighting** (shaking/flashing textures) and **color bleeding** at wall seams, the canvas cloning logic checks inside `useMemo`:
```typescript
const clonedScene = useMemo(() => {
  const clone = scene.clone();
  const hasInnerWalls = !!clone.getObjectByName('wallLeft');
  if (hasInnerWalls) {
    clone.traverse((node) => {
      if (node instanceof THREE.Mesh && WALL_MAPPING[node.name]) {
        node.visible = false; // Hide exterior duplicate walls immediately
      }
    });
  }
  return clone;
}, [scene]);
```

### 2. Physical Material Upgrading (`MeshPhysicalMaterial`)
When a user paints a surface:
1. The canvas raycaster identifies the mesh by name via `onClick`.
2. Standard materials upgrade dynamically to `THREE.MeshPhysicalMaterial`.
3. Sheen parameters from `paintFinishes.ts` are applied:
   * **Emulsion**: `roughness: 0.88`, `metalness: 0.0`, `clearcoat: 0.0` (Matte finish).
   * **Satin**: `roughness: 0.45`, `metalness: 0.05`, `clearcoat: 0.3` (Mid-sheen).
   * **Gloss**: `roughness: 0.15`, `metalness: 0.10`, `clearcoat: 1.0` (High reflectivity).
4. `side: THREE.DoubleSide` is assigned to prevent inverted normals from appearing invisible.
5. Drywall plaster bump texture (`generateWallNormalMap(512, 512)`) is assigned with `repeat.set(128, 128)` for micro-stipple realism.

---

## 🗄️ 4. Key Database Tables

| Table | Purpose | Key Columns |
| :--- | :--- | :--- |
| `users` | User accounts & role permissions | `id`, `full_name`, `email`, `password_hash`, `role` (`PAINTER` / `CONSUMER`) |
| `painter_profiles` | Painter business bio, location & rates | `id`, `user_id`, `bio`, `location`, `experience_years`, `skills` |
| `visualizations` | Saved 3D room schemes & remixed client designs | `id`, `user_id`, `name`, `room_data`, `light_data`, `camera_data`, `finish` |
| `leads` | Inbound customer project inquiries & design feedback | `id`, `user_id`, `email`, `conversion_source`, `meta_tracking_data` |

---

## ⚙️ 5. Development Setup & Commands

### Prerequisites
* Node.js v18+
* PostgreSQL database

### 1. Environment Setup

**Frontend (`frontend/.env.local`)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend (`backend/.env`)**:
```env
PORT=5000
DATABASE_URL=postgres://postgres:password@localhost:5432/paintit_db
JWT_SECRET=your_super_secret_jwt_key
```

### 2. Running the Application

**Run Frontend**:
```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:3000
```

**Run Backend**:
```bash
cd backend
npm install
npm start
# Server running on http://localhost:5000
```

### 3. Verification & Build Commands
```bash
# Check TypeScript compile health
cd frontend
npx tsc --noEmit
```

---

## 💡 6. Developer Guidelines & Architectural Rules

1. **Always Clone GLTF Scenes inside `useMemo`**: Never mutate `scene` directly; always use `scene.clone()` inside `useMemo` before rendering `<primitive object={clonedScene} />`.
2. **Handle Multi-Material Mesh Arrays**: Always check if a mesh material is an Array:
   ```typescript
   const singleMat = Array.isArray(node.material) ? node.material[0] : node.material;
   ```
3. **Environment Map CDN Paths**: When using Drei's `<Environment>`, always pass the explicit asset path to avoid 404 network crashes:
   ```tsx
   <Environment preset="apartment" path="https://unpkg.com/@react-three/drei@latest/assets/hdri/" />
   ```
4. **Service Worker Caching**: The application includes a Service Worker (`sw.js`). If 3D models don't update during local testing, open DevTools -> Application -> Service Workers -> Check **Bypass for network** or **Unregister**.
