# qa-first-90-days — Site Copy (paste per section, replacing TODOs)

Voice: short, declarative, portfolio-style. Numbers where they exist. No filler.

---

## 1. Hero

**Eyebrow:** QA Engineering · Test Orchestration · Panel Presentation

**Title:** The first 90 days of quality at StrongMind.

**Subtitle:** A plan for founding the QA function — and the tooling I'd bring with me. Most of it already exists. This site is part of the demo: it tests itself in CI on every push.

**Buttons:** The plan ↓ · Counterspell ↗

---

## 2. What I know about you

**Heading:** Your products, ranked by what a defect costs.

**Intro:** StrongMind runs a courseware platform serving 6–12 digital curriculum to schools and districts, analytics that teachers act on, a family-facing homeschool product, and Course Builder — AI-generated curriculum on an agentic architecture. Different products, different failure costs. Quality effort should follow the cost.

**Risk table (highest first):**

| Surface | Worst escaped defect | Why it ranks here |
|---|---|---|
| Grades & progress data | A student sees a wrong grade; a district report is wrong | Trust and compliance — the defect you can't apologize your way out of |
| Assessment submission | A quiz submits but doesn't save | One lost submission = one family's trust, at scale |
| Enrollment & rostering | A student can't reach their course | Blocks learning on day one; support load spikes |
| AI-generated content (Course Builder) | Wrong content ships at scale | Not a bug — a governance gap. Generation is cheap; judgment is the product |
| Content delivery | A lesson renders broken | Visible, frequent, usually recoverable |

**Closer:** You already govern AI-generated curriculum — Course Builder evaluates what its agents produce before it ships. I bring the same discipline to AI-generated tests. Same architecture, pointed at quality.

---

## 3. Day 30 — Learn the terrain

**Heading:** Archaeology before architecture.

**Body:** The fastest way for a first QA hire to fail is to ship a framework for a company they haven't understood. Month one is deliberate: watch releases happen, read the last incidents, and ask every product team the same question — how do you know it works before it ships? Map the answers without judgment. Then align on the risk ranking above with Engineering and Release, so month two builds on a shared map, not my assumptions.

**And one visible win.** Trust is earned with something small and real in the first weeks — a flake root-caused, a CI run made faster, a readiness checklist for one team. Listening produces the map; the win earns the room to act on it.

**Success at day 30:**
- Current-state writeup delivered: how each team ships and verifies today
- Risk map agreed with the EM and Release
- One visible improvement shipped
- Baseline started: escaped defects, pipeline times, flake incidents — day-one numbers, so day-90 claims are measurable

---

## 4. Day 60 — One team, one spine

**Heading:** Deep on one team before wide on all of them.

**Body:** Month two builds the framework where the risk map points — one product team, full vertical slice. Playwright, with isolation and determinism designed in from test one: no shared state, no fixed waits, retries as reporting rather than fixes. A merge gate on that team's PRs, fast enough to trust. Conventions written down as the tests are written, so test two hundred looks like test two — and team two onboards from docs, not from my calendar.

**The demo below is that month, in miniature.** A small course app — assignment list, quiz submission, grade display — with the real suite running against it in CI. This is the shape of the deliverable, built the way I'd build it there.

**Embed intro:** This app is a stand-in for your product — the LMS silhouette: assignments, a quiz, a grade. Students would see something like this. Everything below it is what engineers see: the suite and tooling that guard it.

[demo embed]

**Success at day 60:**
- The riskiest flow covered by a suite the team trusts
- Merge gate live; time-to-feedback measured and published
- Conventions doc exists; a second engineer has added a test using only the docs

---

## 5. Day 90 — Practice into process

**Heading:** From one team's suite to the company's quality system.

**Body:** Month three turns practice into process. With Release, we write the gates: what blocks a merge, what blocks a release, and who makes the go/no-go call on what evidence. A merge gate is automated and binary. A release gate is a judgment call with evidence — and a green build you don't believe is worse than a red one. Gates are written with the teams that live under them, not handed down. The standards get published, the second team onboards, and the AI layer starts — governed from day one, not bolted on after.

**Heading 2:** Counterspell — AI writes the test. Counterspell decides whether it ships.

**Body 2:** Generating a test is now cheap: anyone can do it in seconds. Judging whether it deserves a place in the suite is the expensive part, and it is where quality is won or lost. Counterspell reviews every AI-generated spec in two passes: deterministic anti-pattern checks (fixed waits, networkidle, brittle selectors and missing assertions are flagged on sight) and a semantic validation pass that scores test value (does the assertion prove the behaviour, is the test independent, does it add coverage). Verdicts map to standard outcomes: RESOLVES (accepted), RESHAPED (refactor required, with suggested fixes), COUNTERED (rejected). Every ruling is logged with its reasons, so every decision can be audited and argued with. Try it below, or watch a recorded run.

**Embed intro:** Counterspell is internal tooling — QA and engineers only. It gates AI-generated tests before they enter the suite, the way a linter gates code. No student ever sees it; every student depends on it.

**Reference-architecture note:** This is a reference architecture. It validates the orchestration pattern — generate, lint, validate, log, decide — against a zero-dependency fixture app before adapting it to StrongMind's live stack in Month 1. The pattern is what transfers: AI-generated tests can be gated, logged, and argued with. Whether it lands as this tool adapted or as these rules rebuilt inside what you already run is a decision we make together with your teams, on your stack.

**Embed caption:** Live mode available during the presentation · replays shown otherwise

[Counterspell embed]

**Pipeline (verb, capability, prior-art link):**
- 01 Produce — AI test generation with human review: agents explore the product, file cases, and draft specs that trace back to them. A person approves every one. (working prior art ↗ claude-qa-tms)
- 02 Select — Change-based test selection: run only what a change can affect. Anything the selector can't justify escalates to the full suite. (working prior art ↗ playwright-test-selector)
- 03 Trust — Flake scoring and quarantine with expiry: flakiness judged on evidence, quarantined with a due date — never forever. (working prior art ↗ flake-radar)
- 04 Measure — Tooling that has to earn its keep: benchmarks decide whether the extra automation and agents are worth their cost. (working prior art ↗ claude-agent-swarm)
- 05 Explain — Every automated decision lands where a human can argue with it. (Counterspell, above ↑)

**Closer:** Each stage has working prior art — built and open-sourced before anyone asked. At StrongMind, these become your pipeline: adapted to your stack, owned by your teams.

**Success at day 90:**
- Quality gates written with Release and in use: merge vs. release, go/no-go format
- Standards published; second team onboarded from docs alone
- A governance gate — Counterspell or its equivalent in your stack — reviewing every AI-generated test; acceptance rate tracked
- Metrics dashboard live against the day-one baseline

---

## 6. How you'll know it's working

**Heading:** Measure it or don't claim it.

| Phase | What's measured | What good looks like |
|---|---|---|
| Day 30 | Baseline captured | Escaped defects, flake incidents, pipeline time — recorded, published |
| Day 60 | Feedback speed | Merge-gate runtime the team actually waits for; suite green streak |
| Day 90 | Trust | Flake rate trending down; zero P1s shipped through a green gate |
| Ongoing | The real one | Escaped defects fall quarter over quarter — the only metric users feel |

**Closer:** Every number here is observable. None of them require taking my word for it — which is the point of the whole function.

---

## 7. Footer

**Line:** This site tests itself — a Playwright suite runs against it in CI on every push. [badge]

**Sub-line:** Built with Claude Code · Reviewed by me · Counterspell verdicts logged

---

## Q&A pocket lines (not on the site — for the talk)

- "Why 30 days of learning?" → Building the wrong framework fast is the classic first-hire failure. The archaeology *is* the speed.
- "What if teams resist gates?" → Nobody gets a gate before they get a win. Win, then gate, then win.
- "Just you forever — what gets cut?" → Breadth of gates over depth of coverage. Every team gets a smoke gate before any team gets exhaustive regression.
- "Why Playwright?" → Auto-waiting kills a flake class, traces make failures cheap to diagnose, sharding is native. Cypress is home turf — I'm choosing against my own comfort because the tool fits the job.
- "Is Counterspell real or a demo?" → The gate logic is real and open-source; the thresholds are opinions I expect to tune against your suite. That tuning is a month-three activity, and it's in the plan.
