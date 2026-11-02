# Contributing to Verdara

Thank you for contributing to **Verdara: Spatial Climate Intelligence & Autonomous 3D Eco-District Twin**! As an open-source project submitted to the **Meta Global AI Hackathon 2026**, we welcome community improvements across frontend, 3D spatial simulation, Python machine learning evaluation, and DevOps.

---

## 1. Polyglot Architecture Overview

Verdara is organized as a multi-language polyglot repository:

- **TypeScript / Next.js 15 (`src/`)**: High-performance interactive UI, Three.js 60fps 3D Eco-District, MapLibre GIS urban radar, and camera sensor visor.
- **Python (`eval/` & `services/climate_eval/`)**: Meta SAM 3.1 & Muse Spark quantitative benchmark harness, NREL PVWatts v8 solar calculation engine, and open-weights LoRA distillation scripts.
- **Shell & Docker (`Dockerfile`, `compose.yaml`, `scripts/`)**: Production multi-stage Alpine containerization and developer automation via `Makefile`.
- **SQL (`supabase-schema.sql`)**: PostgreSQL 15+ schema with Row Level Security (RLS) and Write-Ahead Logging (WAL) resilience.

---

## 2. Quickstart Development Workflow

### Option A: Using Makefile (Recommended)
```bash
# Display all developer commands
make help

# Install dependencies
make setup

# Run local development server (http://localhost:3000)
make dev

# Run automated tests
make test

# Execute Python evaluation benchmarks
make eval
```

### Option B: Using Docker Compose
```bash
# Start all microservices (Next.js web + Python eval + Redis cache)
docker compose up -d

# View live container logs
docker compose logs -f

# Stop containers
docker compose down
```

---

## 3. Pull Request Guidelines

1. **Create a Feature Branch**: Always branch off `main` (e.g. `feature/my-improvement`).
2. **Strict Dash Rule**: Strictly ZERO em-dashes (`\u2014`) and ZERO en-dashes (`\u2013`). Use standard hyphens `-` or bullets `·`.
3. **Bilingual Localization**: Keep interface text fully localized for both English (`en`) and Indonesian (`id`).
4. **Pass Automated Tests**: Ensure all tests pass (`npx vitest run`) and Next.js builds cleanly (`npm run build`) before opening a PR.

---

## 4. License
Verdara is licensed under the [MIT License](LICENSE).
