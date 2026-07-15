# 点翠 · Diǎn Cuì — iGEM Team Wiki

An engineered, cruelty-free echo of **Diǎn Cuì (点翠)** kingfisher-feather structural colour, built from waste cotton, bacterial cellulose, and reflectin protein.

## About the project

Traditional Diǎn Cuì jewellery uses the iridescent feathers of the kingfisher bird to produce vivid structural colour without pigment. This project recreates that effect through synthetic biology, turning landfill-bound waste cotton into a wearable photonic film — no birds, no rare earth metals, no petrochemical dyes.

### Four modules, one supply chain

| Module | Name | Role |
|--------|------|------|
| 1 | **Cellulose Recovery** | Waste cotton → glucose feedstock via a four-enzyme cocktail |
| 2 | **Pigment Film** | Indigo undertone in bacterial cellulose scaffold |
| 3 | **CNC Iridescent Film** | Cellulose nanocrystal chiral-nematic self-assembly → Bragg-reflected structural colour |
| 4 | **Reflectin Layer** | Truncated squid reflectin nanoparticles → tunable second structural-colour layer |

## Tech stack

- **React 19** + **TypeScript 6**
- **Vite 8** (build tool)
- **React Router 7** (client-side routing)
- **CSS** (no framework — hand-written design system with CSS custom properties)
- **Fonts**: Cormorant Garamond (display) + Inter (body), served via Google Fonts

## Project structure

```
newWiki/
├── index.html              # Entry HTML
├── src/
│   ├── main.tsx            # React root + StrictMode
│   ├── router.tsx          # All routes (7 pages)
│   ├── index.css           # Global styles + design tokens
│   ├── components/
│   │   ├── Nav.tsx         # Top nav bar + mobile overlay (portal)
│   │   ├── RingNav.tsx     # Floating ring navigator
│   │   └── Footer.tsx      # Site footer
│   └── pages/
│       ├── Home.tsx / .css           # Landing page with intro wheel + TOC
│       ├── Project.tsx / .css        # Project Description
│       ├── WetLab.tsx                # Wet Lab Experiments
│       ├── HumanPractices.tsx        # Human Practices
│       ├── Attributions.tsx / .css   # Team & Attributions
│       ├── AIComputationalMethods.tsx
│       └── AIEthicsSafety.tsx
├── package.json
└── tsconfig.json
```

## Getting started

```bash
# Install dependencies
npm install

# Start dev server (hot-reload on http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Design tokens

The design system uses CSS custom properties defined in `src/index.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--kingfisher-1` | `#0e6e6a` | Primary teal |
| `--kingfisher-2` | `#17a398` | Bright teal |
| `--kingfisher-3` | `#2f8fd6` | Blue accent |
| `--ink` | `#0b0f10` | Dark background |
| `--paper` | `#faf6ee` | Light background |
| `--cream-glow` | `#f4ecd8` | Warm highlight |
| `--gold` | `#c9a24b` | Gold accent |
| `--font-display` | Cormorant Garamond | Headings |
| `--font-body` | Inter | Body text |

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Preface glow, four-module intro wheel, TOC totems |
| `/Project-Description.html` | Project | Full pipeline, modelling, engineering cycle, results, contributions |
| `/Wet-Lab-Experiments.html` | Wet Lab | Protocols, notebook, parts, safety |
| `/Human-Practices.html` | Human Practices | Stakeholder engagement, education, heritage-craft outreach |
| `/Attributions.html` | Team | Team members, advisors, PIs, individual contributions |
| `/AI-Computational-Methods.html` | AI & Computational Methods | Computational approaches used |
| `/AI-Ethics-Safety.html` | AI Ethics & Safety | AI ethics and safety considerations |
