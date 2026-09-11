# qa-first-90-days — Site Copy (paste per section, replacing TODOs)

Voice: short, declarative, portfolio-style. Numbers where they exist. No filler.

---

## 1. Hero

**Eyebrow:** QA Engineering · Test Orchestration · Panel Presentation

**Title:** The first 90 days of quality at StrongMind.

**Subtitle:** A realistic roadmap for getting StrongMind's QA function off the ground—and the working tooling to back it up. No hypotheticals or hand-waving: just battle-tested patterns, working code, and an approach built to help the whole team ship with confidence.

**Buttons:** The plan ↓ · Counterspell ↗

---

## 2. Product Landscape & Risk Hierarchy

**Eyebrow:** Product Landscape & Risk Hierarchy

**Heading:** Allocating quality where failure actually hurts.

**Intro:** StrongMind is juggling four pretty different things: core district courseware, educator reporting, homeschool tools, and Course Builder's agentic generation.

A defect doesn't carry the same weight across all four. Quality effort shouldn't just be spread out like peanut butter across every feature ticket—it needs to zero in on the spots where an escaped bug actually threatens school trust, accreditation, or day-one learning.

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

## 3. Day 30 · Discovery & Quick Wins

**Heading:** Listen first, build second.

**Body:** The fastest way to burn out as a first test hire is trying to install a whole philosophy before understanding how the team already works. Month one is about paying attention: watching real deploys, digging through recent post-mortems, and asking engineers one straightforward question—*how do you know this is solid before it goes out?* You take in the answers without judgment, map out where the friction really is, and agree on the high-risk zones with Engineering and Release. That way, what comes next is built on reality, not my own assumptions.

And you knock out one small, visible win early. You build trust by fixing something real right away—hunting down an annoying flake, shaving time off a slow CI step, or helping one team clean up a shaky release step. Listening gives you the lay of the land; delivering something helpful earns you the room to build.

**Success at day 30:**
- Current-state writeup delivered: how each team ships and verifies today
- Risk map agreed with the EM and Release
- One visible improvement shipped
- Baseline started: escaped defects, pipeline times, flake incidents — day-one numbers, so day-90 claims are measurable

---

## 4. Day 60 · The Core Spine

**Heading:** Go deep with one crew before spreading it wide.

**Body (consolidated):** Instead of scattering half-baked setups across five teams, month two focuses on one full slice where the risk is highest. We set up Playwright right from the start—independent tests, zero shared data pollution, web assertions that wait on real UI state instead of arbitrary pauses, and tracking retries so flakes get fixed instead of swept under the rug. We get PR checks fast enough that developers don't mind waiting on them, and document the patterns cleanly so test 200 is just as solid as test two. The real test of success? Team two getting up and running from the docs, not from my calendar.

The demo below is Month 2 in miniature: a clean LMS reference setup (quizzes, submissions, grade books) paired with a deterministic Playwright suite protecting the core flows.

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

## 5. Day 90 · Sustainable Process

**Heading:** Turning what works into a habit everyone shares.

**Body:** Month three is where good habits turn into everyday process. We sit down with Release to figure out our actual checks: what stops a PR from merging, what halts a release, and how the team makes a confident call based on real signals. A merge check is fast and automated. A release call is about judgment—and shipping on a green build nobody trusts is way worse than stopping on a red one. You build these gates with the people who have to live with them, not hand them down from above. Once the standards feel natural, team two steps in, and we bring in AI governance from day one so automation stays clean as it grows.

**Gate comparison (cards, under the body):**

| | Merge Gate (Automated & Binary) | Release Gate (Evidence & Judgment) |
|---|---|---|
| Trigger | PR commit or pull request event | Release candidate / deployment cut to staging |
| Scope | Delta-only test execution (change-impacted flows) | Full regression, synthetic smoke, data migrations, API contract parity |
| SLA / Evaluation | Fast feedback (< 5 minutes) | Thresholds (zero P0/P1 defects, flake score ≤ 1%, latency budgets maintained) |
| Criteria / Output | 100% deterministic green; blocks merge automatically on red | Auditable Release Brief with joint sign-off (EM, Release, QA) |

**Heading 2:** Counterspell — Keeping AI-Generated Tests Honest

**Body 2 (consolidated block):**

Look, generating tests with AI takes two seconds. Maintaining broken, noisy ones takes forever. **Counterspell** is just a smart filter that catches the junk before it hits main, looking at every new spec in two passes:

- **Deterministic Rules:** Knocks out the obvious headaches right away—hardcoded timeouts, fragile DOM paths, or relying on network idle.
- **Semantic Checks:** Makes sure the test actually tests something real, runs independently, and isn't just adding bloat to the suite.

Every check gives a clear, logged call—**ACCEPTED**, **REFACTORED**, or **REJECTED**—with straightforward reasons so anyone on the team can see the reasoning. Check out the inspector below or watch a quick replay to see it move.

*Note: This reference architecture uses a zero-dependency fixture to show the pattern working. In month one, we'll see whether it makes more sense to run these rules right inside StrongMind's CI or as an integrated check.*

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

## 6. The Long View

**Eyebrow:** The Long View

**Heading:** Building something teams actually love using. 🧙‍♂️

**Body:** Honestly, testing isn’t about policing people or getting in the way of the work. It’s just about giving everyone the confidence to build without having to second-guess every move. When feedback is fast, the tests actually hold up, and the pipeline stays honest, quality stops feeling like a chore and just becomes second nature. At the end of the day, the goal is simple: support a crew that’s genuinely stoked on what they’re creating, where nobody has to dread deploy day. 🪄

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
