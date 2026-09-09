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

---|---|---|---|
| Day 30 | Release archaeology; risk map agreed with EM and Release; one visible fix shipped; metrics baseline started | 1:1s with every product team lead, the QA peers, and Release; learn how decisions get made here — and earn the right to be in them | Environments, access, CI permissions; pick the home for QA docs and standards; agree a reporting cadence with my manager |
| Day 60 | Framework spine on team one; merge gate live; conventions doc; feedback time published | Pair with team-one engineers so the suite is ours, not mine; first brown-bag on the framework; QA peers involved in test design | Quality status reporting format established; tooling and licenses sorted; hiring input if the function grows |
| Day 90 | Gates written with Release; standards published; team two onboarding from docs; AI governance pilot | Standards socialized before they're enforced — reviewed with leads, adopted with buy-in; go/no-go run as a partnership with Release | Metrics dashboard live; quarterly quality review format proposed; docs current enough that day 91 doesn't depend on my memory |

---

## 3. Day 30 — Learn the terrain

**Heading:** Archaeology before architecture.

**Body:** The fastest way for a first QA hire to fail is to ship a framework for a company they haven't understood. Month one is deliberate: watch releases happen, read the last incidents, and ask every product team the same question — how do you know it works before it ships? Map the answers without judgment. Then align on the risk ranking with Engineering and Release, so month two builds on a shared map, not my assumptions.

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

**Gate comparison (cards, under the body):**

| | Merge Gate (Automated & Binary) | Release Gate (Evidence & Judgment) |
|---|---|---|
| Trigger | PR commit or pull request event | Release candidate / deployment cut to staging |
| Scope | Delta-only test execution (change-impacted flows) | Full regression, synthetic smoke, data migrations, API contract parity |
| SLA / Evaluation | Fast feedback (< 5 minutes) | Thresholds (zero P0/P1 defects, flake score ≤ 1%, latency budgets maintained) |
| Criteria / Output | 100% deterministic green; blocks merge automatically on red | Auditable Release Brief with joint sign-off (EM, Release, QA) |

**Heading 2:** Counterspell — The Automated Governance Gate for AI-Generated Tests

**Body 2:** Generating a test is now cheap: anyone can do it in seconds. Judging whether it deserves a place in the suite is the expensive part, and it is where quality is won or lost. Counterspell reviews every AI-generated spec in two passes: deterministic rule checks (anti-pattern detection for hardcoded waits, brittle selectors, and networkidle) and semantic analysis (assertion value, test independence, and coverage delta). Each spec receives one of three verdicts: ACCEPTED, REFACTORED (with suggested fixes), or REJECTED. Every ruling is logged with its reasons, so every decision can be audited and argued with. Try it below, or watch a recorded run.

**Embed intro:** Counterspell is internal tooling — QA and engineers only. It gates AI-generated tests before they enter the suite, the way a linter gates code. No student ever sees it; every student depends on it.

**Reference-architecture note:** This reference architecture validates the orchestration pattern in a zero-dependency fixture before adapting to StrongMind's live stack in Month 1. The Day 30 discovery phase determines whether these gating rules run natively in your existing CI/CD or as an integrated service.

**Embed caption:** Live mode available during the presentation · replays shown otherwise

[Counterspell embed]

**Pipeline (lifecycle of an AI-generated test, draft → telemetry):**
- 01 Draft — AI explores product flows and drafts test specifications traced directly to user stories and acceptance criteria. A human engineer reviews every proposed spec. (working prior art ↗ claude-qa-tms)
- 02 Govern — Counterspell evaluates the spec before it reaches the codebase: deterministic anti-pattern checks (no fixed waits or brittle selectors) followed by semantic validation of assertion value. (Counterspell, above ↑)
- 03 Target — Change-based test selection runs only the flows touched by a pull request's diff, keeping PR feedback under 5 minutes. Ambiguous changes escalate to full suites. (working prior art ↗ playwright-test-selector)
- 04 Stabilize — Evidence-based flake detection that automatically quarantines unstable tests with strict expiration dates—ensuring merge gates stay trusted and flaky tests never live forever. (working prior art ↗ flake-radar)
- 05 Evaluate — Telemetry and benchmarking that measure tooling ROI: tracking pipeline execution speeds, agent token efficiency, and defect escape prevention over time. (working prior art ↗ claude-agent-swarm)

**Closer:** Each stage has working prior art — built and open-sourced before anyone asked. At StrongMind, these become your pipeline: adapted to your stack, owned by your teams.

**Success at day 90:**
- Quality gates written with Release and in use: merge vs. release, go/no-go format
- Standards published; second team onboarded from docs alone
- A governance gate — Counterspell or its equivalent in your stack — reviewing every AI-generated test; acceptance rate tracked
- Metrics dashboard live against the day-one baseline

**The plan at a glance (intro line):** Three lanes, ninety days — the technical work is only the first column.

| Phase | Core responsibilities | Team & culture | Operations |
|


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
