# QA at StrongMind — my first 90 days

A panel-presentation site. Same stack and design system as [the portfolio](https://sjzavala.github.io/portfolio/): plain HTML, CSS and JS, Space Grotesk + DM Sans + JetBrains Mono, copper accent, numbered sections. Static, deploys to GitHub Pages, and tests itself.

> Copy lives in `qa-first-90-days-site-copy.md` and is pasted into `index.html` verbatim, section by section. The "Q&A pocket lines" at the bottom of that file are for the talk and are deliberately not on the site.

## Art direction

Three pieces in `assets/art/`, and nothing else: `hero.png` (21:9, full-bleed behind the title under a dark gradient), `counterspell.png` (16:9, the Day 90 section banner), `emblem.png` (1:1, favicon here and the watermark on Counterspell's verdict cards and spell log). Web derivatives live in `assets/art/web/`: WebP at three widths each with `srcset` (the largest hero is about 200 KB), PNG emblem at 64/192/256/512. Regenerate with `sips -Z <width>` and `cwebp -q 92`.

The palette is sampled from the pixels. Cyan glow (`#2fd6c9`, `#5bf8eb` on dark) is the only accent on this site. The hero's red (`#f4655c`) and green (`#55efb6`) are reserved for Counterspell's COUNTERED and RESOLVES states; RESHAPED is cyan. Nothing else on either surface uses red or green, so the art and the verdicts speak the same language.

## Slides

| # | id | Section |
|---|---|---|
| 1 | `#hero` | Hero: title, one line, nav |
| 2 | `#you` | What I know about you: product map (cards) and risk ranking (table) |
| 3 | `#day-30` | Learn the terrain: week-by-week plan and success measures |
| 4 | `#day-60` | One team, one spine: the course-app demo (six test clips, runner output, repo link) |
| 5 | `#day-90` | Practice into process: Counterspell embedded live, then the Produce → Select → Trust → Measure → Explain pipeline with repo links |
| 6 | `#metrics` | How you'll know it's working: metrics table by phase |
| 7 | `#tests` | This site tests itself: CI badge and links |

## Presenting

Scroll, or use the keys. `↓` `↑` (also `J` `K`, `PageDown` `PageUp`) move one slide; `1`–`7` jump; `Home` `End`. The HUD in the corner shows the position. Keys are ignored while a form control has focus, and while the Counterspell iframe has focus: click anywhere outside the demo to get them back.

Desktop-first at 1440 wide. Mobile works but is not the point.

## The embedded demo

`counterspell/` is a built copy of [counterspell-web](../counterspell-web). It opens in replay mode by default, so the demo needs no backend and no network beyond the static files. To run it live against a deployed backend during the talk, add `?api=https://your-api.vercel.app` to this page's URL; the parameter is passed into the iframe and it switches to live mode.

Refresh the embed after changing counterspell-web:

```bash
npm run sync:counterspell     # builds ../counterspell-web and copies dist/ into counterspell/
```

## Day 60 media

`media/*.webm` and `media/*.png` come from the course-app's own Playwright suite run with `npm run test:record` in [course-app](../course-app), which turns on Playwright's video and screenshot capture (slowed down so a viewer can follow the clicks). `media/suite-run.txt` is the list-reporter output of a normal run. Re-record and copy the files to refresh.

## This site tests itself

```bash
npm install
npx playwright install chromium webkit   # first time
npm test
```

`e2e/site.spec.js` covers: title and headings, six slides in order, nav targets, keyboard navigation (arrows, J/K, digits, Home/End, HUD, ignoring form controls), the six clips and their posters answering 200, the runner log showing a green run, the Counterspell iframe booting in replay mode and playing a recording with no backend, the four pipeline steps and three repo links, the footer badge, external-link hygiene, and no horizontal overflow. Chromium and Mobile Safari.

`.github/workflows/ci.yml` stages the deployable artifact (`index.html css js assets media counterspell`) into `dist/`, runs the suite **against that staged copy** (`SITE_DIR=dist`), and deploys it to GitHub Pages only when green. Testing the artifact rather than the source tree is what catches a file that was left out of the deploy. During staging the footer badge's link is rewritten to the exact Actions run that built the page. One-time setup: **Settings → Pages → Source: GitHub Actions**. The badge in the footer points at that workflow, so it renders once the repo exists at `github.com/sjzavala/qa-first-90-days`.

