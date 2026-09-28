# From Molecule to Machine

**[Read the interactive course](https://rohit-2002-28.github.io/molecule-to-machine/)**

A complete, independent technical learning website connecting molecular
electronic structure, quantum algorithms, scientific validation, and resource
estimation. All 34 original lessons are preserved, with source citations and
caveats, rather than replaced by summaries.

## The learning experience

- A static, directly addressable page for every lesson, with curriculum and
  section navigation, previous/next links, and printable original text.
- Locally rendered equations, selectable code, original Markdown downloads,
  full-text section search, and a 52-term glossary.
- 34 lesson-specific vector concept plates, 102 explained knowledge checks,
  and nine interactive educational model types.
- Local-only read markers, bookmarks, saved section, and check answers.
  Reading completion is independent of check results. Clear/reset controls
  and explicit unavailable-storage states are included.
- Responsive light/dark/system themes, keyboard-operated dialogs,
  reduced-motion support, and independently scrollable wide content.

The models are **illustrative, not scientific calculations**. The physical
qubit scaling illustration is **not a quantum resource estimator**. No
chemistry package, remote AI inference, or quantum hardware is run by the site.

## Development

Use Node.js 24 (minimum 22.12) and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/molecule-to-machine/`.
The stack is Astro static generation, strict TypeScript, unified/remark/rehype,
KaTeX, and small native browser scripts. No client framework, backend, CDN
fonts, service worker, accounts, or analytics is required.

```sh
npm run validate:release
npm run check
npm test
npm run build
npm run validate:links
npx playwright install chromium
npm run test:browser
```

`npm run verify` runs the release gate, type checks, unit tests, production
build, link validation, and desktop/mobile browser suite. Install Playwright's
Chromium first. CI installs the browser and its system dependencies itself.

## Content and teaching additions

`src/content/course.json` is the original course export and source of truth.
Do not replace its full bodies with summaries. Each lesson contains its
number, title, Markdown body, source references, and caveats.

`src/data/learning.ts` contains separately authored teaching additions:
concept-plate descriptions, model context, cross-team handoffs, and three
questions per lesson. `src/lib/models.ts` implements testable, bounded
educational mathematics; it is intentionally not QDK Chemistry.

The Markdown pipeline normalizes `\(...\)` and `\[...\]` outside code, renders
math with untrusted commands disabled, and removes raw executable HTML.
Literal underscores in simple TeX `\text{}` and `\texttt{}` groups are escaped
in the rendering AST only; mathematical subscripts and the downloadable
original Markdown remain unchanged. Wide regions are keyboard-accessible
in generated HTML even with JavaScript disabled.

Release validation requires exactly 34 unique sequential nonplaceholder
lessons, substantial full bodies, source metadata, successful equations, and
complete teaching additions. Link validation checks every local link/anchor,
all fresh lesson routes, and exact original Markdown downloads.

## GitHub Pages

The project base path is `/molecule-to-machine/`. A chapter such as
`/molecule-to-machine/lessons/21/` is a real generated HTML file and works from
a fresh URL or reload. `404.html` is a useful not-found page, **not** an SPA
redirect. No hash-router recovery hack is used.

`.github/workflows/pages.yml` validates and deploys `dist` using the standard
GitHub Pages artifact and deployment actions. Pushes to `main` run it, and
`workflow_dispatch` supports a deliberately selected ref. Configure the
repository's Pages source as **GitHub Actions**. Workflow permissions are
read-only for the build and Pages/OIDC write permissions only for deployment.

## Source scope and notices

The primary source is public `microsoft/qdk-chemistry` revision
`97a3ff4fb86ebd5a2516e3548cece69127fd3555`. Resource chapters also preserve
independently pinned external QDK references. The course is revision-bound:
it does not claim every newer package behaves identically.

This is not an official Microsoft website, organizational chart, hardware
readiness statement, or demonstration of practical quantum advantage.
Upstream source snippets retain MIT attribution; fonts retain their Open
Font License. See `public/third-party-notices.txt` and the website's About page.

The browser stores learning data under `molecule-to-machine:learning:v1`
and the optional theme under `molecule-to-machine:theme`. No progress leaves
the browser. GitHub Pages still serves ordinary hosting requests.
