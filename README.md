# My-Personal-Blog

Ahmad Zaghloul's portfolio: software engineer and automotive sales consultant, Cairo.

Live at https://aizag206.github.io/My-Personal-Blog/

## Design

An instrument cluster. The hero is a dashboard: gauges that run a self-test sweep on load, a Cairo clock, and a **drive-mode switch** (Engineer / Showroom) that swaps the accent colour, the tagline and the gauge readings. The nav is a gear selector (P · R · N · D) that lights up as you scroll.

## Sections

- **Ignition**: name, role, live status (on shift / after hours), two gauges
- **D, The lineup**: Lawyer Assistant, Stance Store, eilaaflawfirm.com, Leadbot, each with a spec table
- **R, Track record**: sales stats and a timeline (Geely, Egytrade, Planet X, earlier)
- **P, Driver profile**: INFP-T trait bars and how they show up at work
- **N, Now**: what's happening this month. Update it and its date stamp when things change
- **Service log**: certificates, training, degree
- **Contact**

## Built with

Plain HTML, CSS and JavaScript, with no framework and no build step. Gauges are inline SVG drawn in `js/main.js`. The fonts are Chakra Petch and Figtree. Motion is switched off for visitors who ask for reduced motion.

## Updating

- Gauge values per mode live in the `data-engineer` / `data-showroom` attributes on each `.gauge` in `index.html`.
- Images live in `img/`.
- Deploys from `main` via GitHub Pages.
