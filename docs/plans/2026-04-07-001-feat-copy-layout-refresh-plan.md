---
title: "feat: copy and layout refresh (methodology, products, consulting, about, nav, footer)"
type: feat
status: active
date: 2026-04-07
---

# feat: copy and layout refresh

## Overview

Apply the Tomek.io copy/layout update spec to the live site. Mostly text
swaps, plus two structural changes: (1) the consulting section's left
column changes from a 2x2 "experience nodes" grid into a 4-step process
flow, and (2) the about section gains a workspace illustration in a left
column mirroring the consulting layout.

Branch policy per user request: **commit straight to `main`, no PR.**

## Problem Frame

The initial site shipped with placeholder/concept copy. Tom has now written
the real copy and a sharper layout brief. This plan applies it.

## Requirements Trace

- R1. Methodology section (`what-we-do.html`): replace body copy with the
  new "The problem / Our approach" two-card structure.
- R2. Products section (`products.html`): rename "Built Lab" → "Products";
  update Clifton + Dronz body copy; section title only — no card layout
  change.
- R3. Consulting left column (`consulting.html`): replace 2x2
  EXPERIENCE_NODE grid with a 4-step STEP_01–04 process; keep visual
  treatment (same 2x2 grid + bordered cards); add subtle connecting lines
  between cards to reinforce sequence; update subhead.
- R4. Consulting right column: remove HR Analytics tile; update copy on
  remaining 3 tiles; add new "Zero to One Product" tile (replaces HR
  Analytics slot to keep 4 tiles).
- R5. About section (`about.html`): replace bio with new two-paragraph
  copy; replace empty corner-bracket placeholder with `<img>` referencing
  `images/tomekio-workspace.png`; remove "Based in NYC" paragraph.
- R6. Nav: change `GET SCHEMATIC` → `GET IN TOUCH`, retarget to
  `mailto:hello@tomek.io`.
- R7. Footer: change tagline to "Lovingly built in Oakland, CA" (drop
  "Optimized for Humans and AIs"); change `mailto:tom@tomek.io` →
  `mailto:hello@tomek.io` on the CONTACT link.
- R8. Build script + workflow must copy `src/images/` → `dist/images/`
  so the about illustration ships once the PNG is added.

## Scope Boundaries

- No changes to the hero (Fig 1).
- No structural changes to the products bento grid (just text + section
  title).
- No new sections or routes.
- The actual `tomekio-workspace.png` file is **not** added in this commit.
  The markup will reference it at `src/images/tomekio-workspace.png`; the
  user drops it in afterwards. Until then the `<img>` 404s but the page
  still renders.
- The "Fig 5: Founder Profile" eyebrow becomes "Fig 5: About" per spec.

## Context & Research

### Relevant Code and Patterns

- `src/partials/what-we-do.html` — current methodology with 4/8 col grid
  and two `border-l border-primary/20` cards. Layout structure is reusable
  for the new copy.
- `src/partials/products.html` — bento grid is unchanged; only the H2
  ("Built Lab") and the two product `<p>` tags change.
- `src/partials/consulting.html` — left column currently renders a 2x2
  grid of `EXPERIENCE_NODE_*` divs; right column renders 4 service tiles
  with material symbols. Both need text/markup work.
- `src/partials/about.html` — left column is a `min-h-[300px]` div with
  two absolutely-positioned corner brackets and no content. That's where
  the workspace illustration goes.
- `src/partials/nav.html` — `GET SCHEMATIC` is the only CTA.
- `src/partials/footer.html` — tagline + CONTACT mailto.
- `build.js` — currently copies a hardcoded `STATIC_FILES` list. Needs
  a directory copy for `src/images/`.

### Key Decisions

- **Process card connectors:** use `::after` pseudo-elements with the
  existing `.technical-line` repeating-gradient utility, drawn between
  cards. Top row: a horizontal connector right edge of card 1 → left
  edge of card 2. Vertical connector bottom of cards 1+2 → top of cards
  3+4. Bottom row: horizontal connector card 3 → card 4. Implementation
  is CSS-only; no JS.
  - Fallback if the pseudo-elements get fiddly: use a single
    `<svg>` overlay positioned absolutely. Decide during implementation.
- **Workspace image markup:** `<img src="images/tomekio-workspace.png"
  alt="Tomekio workspace blueprint" class="w-full" loading="lazy">` —
  `loading="lazy"` because it sits below the fold on mobile. No
  intrinsic dimensions known yet; will let the image's natural aspect
  ratio drive layout.
- **Image directory copy in `build.js`:** add a small recursive copy
  helper (Node 20's `fs.cpSync(src, dst, { recursive: true })` is fine
  on the GitHub Actions runner). Skip if `src/images/` doesn't exist.

## Open Questions

### Resolved During Planning

- *Where does the new "Zero to One Product" tile go in the right column?*
  Replace the HR Analytics slot to keep the four-tile grid intact.
- *Fig number for About* — spec says "FIG 5: ABOUT". Currently "Fig 5:
  Founder Profile". Update.
- *Connector style* — CSS pseudo-elements first, SVG fallback during impl.

### Deferred to Implementation

- Exact dimensions/aspect ratio of `tomekio-workspace.png` (the user
  hasn't shipped it). The `<img>` will fit naturally regardless.

## Implementation Units

- [ ] **Unit 1: Methodology copy (Fig 2)**

**Goal:** Replace the two methodology cards with the new "The problem"
and "Our approach" copy.

**Files:**
- Modify: `src/partials/what-we-do.html`

**Approach:**
- Card 1 heading: "The problem". Body: "Most knowledge work is repetitive.
  The inbox triage, the status updates, the document wrangling. It eats
  your day and adds nothing."
- Card 2 heading: "Our approach". Body: "We give you superpowers, not an
  exercise regime. No migrations. No rewiring how you work. We build a
  clean pane of glass on top of the systems you already use, so the
  boring parts disappear underneath it."
- Keep the existing card markup (`p-8 border-l border-primary/20
  bg-surface-container-high/30`) and grid layout exactly.

---

- [ ] **Unit 2: Products section title + body copy (Fig 3)**

**Goal:** Rename section + tighten product blurbs.

**Files:**
- Modify: `src/partials/products.html`

**Approach:**
- H2: `Built Lab` → `Products`.
- Clifton `<p>`: "An AI chief-of-staff for solopreneurs. It runs your
  calendar, drafts your email, and guards your focus time."
- Dronz `<p>`: "AI-native document management. No folders. No tags. Just
  ask for what you need."
- All other markup, status badges, links, icons unchanged.

---

- [ ] **Unit 3: Consulting left column — 4-step process flow (Fig 4)**

**Goal:** Replace EXPERIENCE_NODE 2x2 grid with STEP_01–04 process,
update header + subhead, add visual connectors between cards.

**Files:**
- Modify: `src/partials/consulting.html`
- Modify: `src/styles/tailwind.css` (add `.process-card-connector`
  utilities under `@layer utilities` if needed)

**Approach:**
- Header eyebrow stays "Fig 4: Strategic Advisory". Title stays
  "Technical Consulting". Subhead becomes: "You have an AI product bet
  to make and no one to run it. We take it from concept to shipped, then
  hand it back to your team."
- Replace each EXPERIENCE_NODE card with a STEP_NN card. Keep the
  border + padding treatment. Add a small label for STEP and a card
  title:
  - STEP_01 Scope — "A small, time-boxed engagement. We pressure-test
    the bet and agree on what shipping looks like."
  - STEP_02 Build — "Discovery, hard scoping calls, and the first
    version built hands-on. AI-native from the start."
  - STEP_03 Ship — "Something real in front of users. Not a prototype.
    Not a deck."
  - STEP_04 Hand Off — "Your team is trained to keep going, or you've
    hired the right person to take it from here."
- Card markup: replace the existing `<div class="p-4 ...">` blocks with
  slightly taller `<div class="p-6 border border-outline-variant/15
  relative">` so connectors have room.
- Connectors: wrap the 2x2 grid in `relative`. Use absolutely positioned
  `<span class="technical-line">` elements between cards (horizontal
  between 1↔2 and 3↔4; vertical between 1↔3 and 2↔4). Keep them subtle
  (`opacity-30`). On mobile (single column) connectors hide via `hidden
  md:block`.

---

- [ ] **Unit 4: Consulting right column — service tile copy (Fig 4)**

**Goal:** Update the four service tiles, swap HR Analytics for Zero to
One Product.

**Files:**
- Modify: `src/partials/consulting.html`

**Approach:**
- Tile order (top to bottom):
  1. **AI Product Strategy** — "Turning vague AI bets into shipped
     products." (icon: keep `hub`)
  2. **Zero to One Product** — "Discovery, scoping, and building the
     first version hands-on." (icon: `rocket_launch`, replaces
     `analytics`)
  3. **Fractional Product Leadership** — "Running product while you
     figure out your first hire." (icon: keep `architecture`)
  4. **Technical Due Diligence** — "Honest reads on early-stage AI
     products for investors and acquirers." (icon: keep `verified_user`)
- Reorder: currently AI Strategy / HR Analytics / Tech DD / Fractional.
  New order matches above.
- Remove HR Analytics tile entirely.

---

- [ ] **Unit 5: About section — bio + workspace illustration (Fig 5)**

**Goal:** Replace bio copy and put the workspace illustration in the left
column.

**Files:**
- Modify: `src/partials/about.html`

**Approach:**
- Eyebrow: "Fig 5: Founder Profile" → "Fig 5: About".
- Replace the entire bio block with two `<p>` tags:
  - P1: "I'm Tom. I've spent my career building products in hard places:
    regulated industries, enterprise workflows, AI-native tools,
    early-stage bets. I've shipped new products inside big organizations
    and scrappy startups, so I know the awkward in-between when an idea
    is trying to become a real product."
  - P2: "I'm hands-on by choice. I write specs and I write code. I run
    discovery and I sit with customers. Closing the gap between a good
    idea and a shipped product is the work I want to do, and the work
    I'm best at."
- Remove the existing "Based in New York City..." paragraph.
- Replace the empty `min-h-[300px]` corner-bracket div with:
  ```
  <div class="relative">
    <div class="absolute -top-4 -left-4 w-24 h-24 border-t border-l border-primary"></div>
    <div class="absolute -bottom-4 -right-4 w-24 h-24 border-b border-r border-primary"></div>
    <img src="images/tomekio-workspace.png"
         alt="Tomekio workspace blueprint"
         class="relative w-full"
         loading="lazy" />
  </div>
  ```
  Corner brackets stay (visual frame); image slots inside.
- Keep the link + email icons row. Email icon already mailto'd to
  `tom@tomek.io` — Unit 7 will retarget it.

---

- [ ] **Unit 6: Nav CTA**

**Goal:** Update primary CTA.

**Files:**
- Modify: `src/partials/nav.html`

**Approach:**
- Anchor text: `GET SCHEMATIC` → `GET IN TOUCH`.
- `href`: `#consulting` → `mailto:hello@tomek.io`.

---

- [ ] **Unit 7: Footer tagline + contact email**

**Goal:** Drop the "Humans and AIs" tagline and route CONTACT to the new
hello@ inbox.

**Files:**
- Modify: `src/partials/footer.html`

**Approach:**
- Tagline span: "Lovingly built in Oakland, CA // Optimized for Humans
  and AIs" → "Lovingly built in Oakland, CA".
- CONTACT anchor `href`: `mailto:tom@tomek.io` →
  `mailto:hello@tomek.io`.
- Also update the `mailto:` on the about section's email icon (Unit 5
  doesn't touch hrefs — handle here for consistency).

---

- [ ] **Unit 8: Build pipeline — copy `src/images/`**

**Goal:** Make sure any file under `src/images/` ships to
`dist/images/` so the workspace PNG can be added later without further
plumbing.

**Files:**
- Modify: `build.js`
- Create: `src/images/.gitkeep`

**Approach:**
- After the `STATIC_FILES` loop, check if `src/images/` exists. If yes:
  `fs.cpSync(srcImages, distImages, { recursive: true })`. (Node 20
  supports this; the GitHub Actions workflow already pins Node 20.)
- Add `src/images/.gitkeep` so the directory exists in version control.
- README short note: drop static images into `src/images/`, reference
  them from partials as `images/<name>`.

## System-Wide Impact

- **Unchanged invariants:** The Tailwind config, `tailwind.css` custom
  utilities, partials include mechanism, deploy workflow, and DNS are
  all untouched. No risk to the live cert / domain.
- **Image asset deployment:** New code path in `build.js`. If
  `src/images/` is empty / missing, the `cpSync` is a no-op. No regression.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `tomekio-workspace.png` doesn't exist yet — about section ships with a broken image | Image is below the fold of the About section; alt text is meaningful; layout still renders. Document clearly in commit message + final user message that PNG must be dropped into `src/images/`. |
| Process-flow connectors look fiddly across breakpoints | Hide connectors on mobile (`hidden md:block`); accept the simpler stacked look. |
| `fs.cpSync` not available on the runner's Node version | Workflow pins Node 20, where `cpSync` is stable since 16.7. Safe. |

## Sources & References

- User spec in this LFG invocation
- Existing partials in `src/partials/`
