# Finance Life-Sim — Tech Stack & Deployment Spec

**Recommendation: React + Vite**, deployed as a static build via GitHub Actions.

Why React here specifically: this game is fundamentally a state machine — one money pool, two derived views (buckets/instruments), a deck of conditional cards, several small decision trees. That maps directly onto React's component + state model (`useState`/`useReducer`), and stays maintainable as the branching card logic grows. Vanilla JS would work but gets messy fast once you're re-rendering bucket bars, modals, and the timeline all off the same state. As a side benefit, React/Vite is also the more portfolio-relevant stack for the Founding Engineer / Applied AI Engineer roles you're targeting.

| Option | Pros | Cons |
|---|---|---|
| Vanilla JS/HTML/CSS | Zero build step, push straight to Pages | Manual DOM updates get messy once state is this complex |
| **React + Vite (recommended)** | Clean component model, matches the state-heavy design, huge ecosystem | Needs a build step + GitHub Actions to deploy |
| Vue + Vite | Similar benefits, gentler learning curve, no JSX | Smaller ecosystem, less aligned with your target roles |
| React via CDN (no build) | Zero setup, good for a same-day throwaway prototype | No routing/npm packages, gets unwieldy as the app grows — prototype only |

**Suggested path:** prototype the core loop today as a no-build React (CDN/Babel-standalone) single file to validate the loop feels right, then port to a proper Vite + React project for the real build.

**How GitHub Pages actually works:** it only serves static files (HTML/CSS/JS) — there is no server-side code, ever, which is a perfect fit for the "no backend" requirement. Two ways to deploy:
- **Branch-based:** Settings → Pages → pick a branch (e.g. `main` or `gh-pages`) and optionally a `/docs` folder → served at `https://<username>.github.io/<repo>/`.
- **GitHub Actions build (recommended for Vite):** a workflow runs `npm install && npm run build` on every push, uploads the `dist/` folder as a Pages artifact, and Pages serves that. Avoids committing build output to git.
- For Vite, set `base: '/<repo-name>/'` in `vite.config.js` so asset paths resolve correctly under the repo subpath.

**State persistence:** `localStorage` — works fine on GitHub Pages since everything is client-side, no backend needed anywhere.
