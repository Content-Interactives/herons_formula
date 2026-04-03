# Heron's Formula

React + Vite tool: given triangle side lengths \(a,b,c\), computes semiperimeter \(s\) and area \(\sqrt{s(s-a)(s-b)(s-c)}\). Implementation in `HeronsFormula.jsx`.

**Live site:** [https://content-interactives.github.io/herons_formula](https://content-interactives.github.io/herons_formula)

Curriculum alignment and placement: [Standards.md](Standards.md).

---

## Stack

| Layer | Notes |
|--------|--------|
| Build | Vite 6, `@vitejs/plugin-react` |
| UI | React 19 |
| Styling | Tailwind 3 |
| Icons | lucide-react |
| Deploy | `gh-pages -d dist`; `predeploy` runs `vite build` |

---

## Layout

```
vite.config.js          # base: '/herons_formula/'
src/
  main.jsx → App.jsx → components/HeronsFormula.jsx
  components/ui/
```

---

## `vite.config.js`

`base: '/herons_formula/'` must match the GitHub Pages repository path.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run deploy` | Build and push `dist/` to `gh-pages` |

---

## Embedding

Validate triangle inequality handling in `HeronsFormula.jsx` when reusing inputs from host pages.
