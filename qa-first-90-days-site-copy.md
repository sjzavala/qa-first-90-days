# qa-first-90-days — Site Copy (paste per section, replacing TODOs)

Voice: short, declarative, portfolio-style. Numbers where they exist. No filler.

---

## 1. Hero

**Eyebrow:** QA Engineering · Test Orchestration · Panel Presentation

**Title:** The first 90 days of quality at StrongMind.

**Subtitle:** A plan for founding the QA function — and the tooling I'd bring with me. Most of it already exists. This site is part of the demo: it tests itself in CI on every push.

**Buttons:** The plan ↓ · Counterspell ↗

---

## 2. Product Landscape & Risk Hierarchy

**Eyebrow:** Product Landscape & Risk Hierarchy

**Heading:** Allocating quality by failure cost.

**Intro:** StrongMind delivers across four distinct surfaces: district courseware, educator analytics, direct-to-family homeschool platforms, and agentic curriculum generation in Course Builder.

Each surface carries a fundamentally different blast radius. Quality engineering shouldn't be spread uniformly across the catalog—it should concentrate where an unhandled defect does the most damage to institutional trust and core operations.

**Risk table (highest first):**

| Surface | Critical Failure Mode | Business & Engineering Impact |
|---|---|---|
| **Grades & Progress Data** | State/district reporting mismatch; inaccurate transcript calculations | **Regulatory & Institutional Risk:** Compliance violations and audit exposure that cannot be patched away. |
| **Assessment Submission** | Silent submission drops; unhandled payload loss during quiz completion | **Irreversible Data Loss:** Erodes student and parent trust; triggers high-touch, unscalable customer support triage. |
| **Enrollment & Rostering** | Identity/LTI sync desync; student course lockout at term start | **Operational Blocker:** Halts instruction immediately; causes predictable day-one support spikes. |
| **AI Curriculum (Course Builder)** | Hallucinated or non-compliant instructional content published at scale | **Brand & Pedagogical Liability:** A governance failure rather than a code bug; requires evaluation rubrics over binary asserts. |
| **Content Delivery** | Lesson asset render failures; broken interactive modules | **Local Friction:** High visibility and frequent, but recoverable with rapid rollback or hotfix. |

**Closer:** StrongMind already treats generative curriculum as something that requires automated evaluation before publishing. I bring that exact mindset to synthetic test engineering: generating tests with AI is fast, but it demands an automated gate to ensure it actually protects the product rather than polluting the suite.

---|---|---|---|
| Day 30 | Release archaeology; risk map aligned with EM & Release; first quick-win fix shipped; baseline captured. | 1:1 discovery with product leads, peers, and Release; map existing shipping rituals and identify developer friction. | Audit environments, access, and CI permissions; establish documentation hub; align on leadership reporting cadence. |
| Day 60 | Playwright framework core on Team One; PR merge gate live (< 5 min); test conventions codified. | Pair with Team One engineers to build shared ownership; host framework brown-bag; involve peers in test design. | Establish recurring quality reporting format; provision tooling licenses; define criteria for future team scaling. |
| Day 90 | Co-authored release gates active; Team Two onboarding; AI test governance pipeline piloted. | Socialize standards ahead of enforcement; partner with Release on production Go/No-Go decisions. | Telemetry dashboard live against baseline; deliver initial quarterly review; ensure documentation is fully self-sustaining. |

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

**Body (consolidated):** Month two builds the foundation where the risk map points: a full vertical slice on a single product team. We set up Playwright with strict isolation and determinism from day one—zero shared state, dynamic assertions over fixed waits, and test retries tracked for triage rather than masked as passes. We ship a PR merge gate fast enough for engineers to actually wait on, backed by living documentation so test 200 matches the quality of test two—enabling team two to onboard from docs rather than my calendar.

The fixture below is Month 2 in miniature: an LMS reference app (quizzes, submissions, grade books) paired with a live, deterministic Playwright suite guarding those critical flows.

[demo embed]

**Success at day 60:**
- The riskiest flow covered by a suite the team trusts
- Merge gate live; time-to-feedback measured and published
- Documentation exists; a second engineer has added a test using only the docs

**Core test conventions (card under the success list):**
- **Isolation:** Zero shared state; fixtures seed auth and database resets per worker.
- **Selectors:** Semantic user-facing locators (`getByRole`, `getByLabel`) over brittle DOM paths.
- **Async:** Web-first assertions only; zero hardcoded timeouts.

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

**Body 2 (consolidated block):**

Generating a test is cheap; maintaining a bad one is expensive. **Counterspell** acts as an automated governance gate for AI-generated specs, evaluating every test across two layers before it enters the repository:

- **Deterministic Rules:** Blocks anti-patterns instantly (hardcoded waits, brittle selectors, `networkidle`).
- **Semantic Analysis:** Evaluates assertion substance, test independence, and net coverage gain.

Every evaluation outputs an auditable verdict—**ACCEPTED**, **REFACTORED**, or **REJECTED**—with logged rationale that engineers can challenge. Try the interactive inspector below, or view a recorded run.

*Note: This reference architecture uses a zero-dependency fixture to validate the pattern. Month 1 discovery will determine whether these gating rules run natively in StrongMind's existing CI/CD or as an integrated service.*

**Embed caption:** Live mode available during the presentation · replays shown otherwise

[Counterspell embed]

**Pipeline (lifecycle of an AI-generated test, draft → stabilize):**
- 01 Draft — AI explores product flows and drafts test specifications traced directly to user stories and acceptance criteria. A human engineer reviews every proposed spec. (reference implementation ↗ claude-qa-tms)
- 02 Govern — Counterspell evaluates the spec before it reaches the codebase: deterministic anti-pattern checks (no fixed waits or brittle selectors) followed by semantic validation of assertion value. (Counterspell, above ↑)
- 03 Target — Change-based test selection runs only the flows touched by a pull request's diff, keeping PR feedback under 5 minutes. Ambiguous changes escalate to full suites. (reference implementation ↗ playwright-test-selector)
- 04 Stabilize — Evidence-based flake detection that automatically quarantines unstable tests with strict expiration dates—ensuring merge gates stay trusted and flaky tests never live forever. (reference implementation ↗ flake-radar)

**Closer:** Each phase is backed by open-source tooling I've built to solve these specific orchestration challenges. At StrongMind, they serve as tested blueprints—adapted to your stack, integrated with your CI/CD, and owned by your engineers.

**Success at day 90:**
- **Active Quality Gates:** Automated PR merge gates live; formalized Go/No-Go criteria established with Release.
- **Self-Serve Onboarding:** Team two onboarded to the test framework using documentation alone.
- **AI Test Governance:** Automated governance gate (Counterspell pattern) reviewing synthetic tests with acceptance telemetry tracked.
- **Executive Telemetry Live:** Dashboards tracking cycle time, flake rate, and escaped defect trends against the Day 30 baseline.

**The Plan at a Glance (intro line):** Three tracks across ninety days—technical execution, developer enablement, and operational foundation.

| Phase | Technical Foundation | Team Enablement & Culture | Operations & Governance |
|


---

## 6. The Road Ahead

**Eyebrow:** The Road Ahead

**Heading:** From tactical gates to an engineering habit. 🧙‍♂️

**Body:** A 90-day plan is only successful if the momentum outlasts the onboarding window. By establishing clear baselines, proving value on a single team, and introducing governed automation, test orchestration stops being a bottleneck and becomes an everyday engineering habit. The goal isn't just a green suite—it's giving product teams the confidence to ship faster because they trust their safety net.

**Closing block:**

**Thank you for taking the time to explore this.**

Founding this function is as much about team enablement and developer experience as it is about pipelines. I'm excited for our conversation and look forward to discussing how we can tailor this roadmap to StrongMind.

**CI footnote:** *Practice what you preach: this deck runs its own Playwright smoke suite on every push.* [badge] · View the suite ↗

---

## Q&A pocket lines (not on the site — for the talk)

- "Why 30 days of learning?" → Building the wrong framework fast is the classic first-hire failure. The archaeology *is* the speed.
- "What if teams resist gates?" → Nobody gets a gate before they get a win. Win, then gate, then win.
- "Just you forever — what gets cut?" → Breadth of gates over depth of coverage. Every team gets a smoke gate before any team gets exhaustive regression.
- "Why Playwright?" → Auto-waiting kills a flake class, traces make failures cheap to diagnose, sharding is native. Cypress is home turf — I'm choosing against my own comfort because the tool fits the job.
- "Is Counterspell real or a demo?" → The gate logic is real and open-source; the thresholds are opinions I expect to tune against your suite. That tuning is a month-three activity, and it's in the plan.
