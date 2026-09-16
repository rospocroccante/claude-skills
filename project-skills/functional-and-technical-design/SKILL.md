---
name: functional-and-technical-design
description: Produce a functional design and/or technical design document for a feature, system, or change. Use when the user asks to draft, scaffold, or structure a design doc, spec, RFC, or architecture write-up covering user-facing behavior, requirements, components, data model, APIs, or rollout.
---

# Functional and Technical Design

This skill should produce diagrams, always in editable plantuml, and if possible a way to render this. The document should always be markdown which contains a single header and multiple sections. Common knowledge about when to use which diagram should always be considered unless the user specifies a specific model. The goal of these documents is for us to provide clear intended designs for our customers who will partly implement it. We, the identity vendor, will implement anything related to the identity platform and the wallet and the client, the product team, will implement their API side which converses between the identity platform and the robot/wallet.

## Project Context

Use the project's own background to inform every design doc produced via this skill. Do not paste it verbatim into the output; let it shape the framing, ownership split, and open questions instead.

Keep that background in a context file inside the project (for example `context/project-summary.md`) and read it before drafting any design. It should state the project's purpose in one paragraph and name the sides involved: who provides the identity or platform layer, who builds the product on top, and which standards apply.

## Writing rules (apply to every design doc)

These come from prior feedback. Follow them unless the user overrides for a specific document.

### Voice and framing

- **Stay in our lane.** The identity vendor's deliverables are SSI / wallets / credentials / identity-platform integration. Design docs should be specific and prescriptive about that, and advisory (not prescriptive) about client-side product decisions, business logic, UX, and platform goals. We can guide and advise the product team, but the doc must not read as if the identity vendor is dictating the product.
- **Do not over-explain the identity platform's generic design.** That the identity platform must stay generic and reusable is an *internal concern of the identity vendor*. Customer-facing docs should not lecture the reader about it. Mention it only if the design would otherwise force the identity platform to special-case something.
- **No "why now" / market-timing sections.** Skip strategic-timing framing. Designs document intended behaviour, not why the project is happening.
- **Keep wording simple.** Prefer plain sentences over layered qualifiers. If a paragraph re-states what a table already says, cut it.
- **The doc is read by the product team but primarily a working artefact for us (the identity vendor) and our discussions.** Optimise for that: clear, concrete, easy to disagree with section by section.
- **When something is removed, omit it as if it was never there.** Do not leave "removed", "no longer", "previously", "we used to" markers. The document is a current-state artefact, not a changelog. The same applies when the user removes a goal, an open question, or a section across edits: just leave it out cleanly.

### Defaults to bake in unless overridden

- **Wallet topology:** cloud wallets are the initial focus. On-device wallets are an open investigation track, not an equal alternative. Write designs cloud-first; note where on-device would diverge, do not present them as a 50/50 choice.
- **Credential formats:** **mdoc is the credential format.** SD-JWT VC is only used as a fallback where required functionality is missing from mdoc — do not present it as an equal-weight alternative. **AnonCreds is not a goal** and should not be listed as one.
- **Verifier ≠ door.** A verifier is any relying party (another machine, an inspector with a verifier app, a regulator system, infrastructure with a reader). Use "verifier" generically; treat "door" as one example among several.
- **Verification routing:** verifier → the product API → the identity platform → wallet. The product team exposes the API to verifiers; the identity platform handles the OID4VP exchange with the wallet.
- **Multi-tenancy:** each customer has its own identity-platform project. Trust configuration, identity issuer, and audit data are scoped to that project.
- **No time-based acceptance criteria** (no "within 30 s", no "default 3 s timeout"). Specify behaviour and ordering; leave latency budgets to the technical design or implementation.

## When to use

Invoke this skill when the user asks to:

- Draft a new functional or technical design document for a feature, integration, or change that spans the identity vendor (the identity platform, wallet) and/or the product side (API, robot integration).
- Scaffold or restructure an existing design document, RFC, or spec into the standard functional/technical format used for customer hand-off.
- Add or update sequence, component, deployment, state, or use-case diagrams in PlantUML for an existing design.
- Capture intended behavior, requirements, component boundaries, data flow, or API contracts that the client will partly implement on their side.
- Produce design artifacts that clearly delineate the identity vendor's implementation responsibilities (the identity platform, wallet) from the product team's (API between the identity platform and the robot/wallet).

Do **not** invoke this skill for: ad-hoc code reviews, bug fixes, internal-only refactors with no customer-facing interface change, or documentation that is not a design document (e.g. READMEs, runbooks, release notes).

## Inputs

Before producing a design, gather the following. If anything is missing, ask the user before starting rather than guessing.

- **Type of document**: functional design, technical design, or both.
- **Subject**: the feature, flow, or system being designed (e.g. "credential issuance from the identity platform to wallet via the product API").
- **Scope boundary**: what is in scope vs. out of scope, and which side (the identity vendor / the product team) owns which parts.
- **Audience**: primarily the product team; note any other readers (the identity vendor's internal team, auditors, regulators).
- **Existing context**: links or references to prior designs, related documents in this repo, the identity platform docs, wallet docs, or relevant standards (OpenID4VC, DIDComm, mDL, etc.).
- **Diagram preferences**: any specific diagram types the user wants (sequence, component, deployment, state, use-case). If unspecified, pick based on what the section needs.
- **Output location**: where the markdown file should be written (path and filename).

## Process

1. Confirm the inputs above with the user; ask for anything missing.
2. Decide whether to produce the functional design, the technical design, or both, and in what order. Functional design typically comes first.
3. Outline the document headers from the relevant template(s) below, then fill section by section. Keep one top-level `#` header per document; use `##` and below for sections.
4. For each diagram, write it as a fenced ```plantuml``` block. Pick the diagram type by purpose:
   - **Sequence diagram** — interactions between actors/components over time (most flows between the identity platform, the product API, wallet, robot).
   - **Component diagram** — static structure and dependencies between systems.
   - **Deployment diagram** — runtime topology (hosts, networks, trust boundaries).
   - **State diagram** — lifecycle of a credential, session, or long-lived entity.
   - **Use-case diagram** — actor-to-capability mapping in the functional design.
   - **Activity diagram** — branching business logic where a sequence diagram would be overkill.
5. Where helpful, include a rendered preview alongside the source, an image link (e.g. `![](./diagrams/foo.png)`) created by the `plantuml` cli
6. Explicitly mark per-section ownership when responsibilities are split: **the identity vendor (the identity platform, wallet)** vs. **the product team (API, robot integration)**.
7. Collect unresolved items into the **Open Questions** section rather than inventing answers.
8. Review the finished document for: single `#` header, every diagram in editable PlantUML, ownership clearly delineated, no unanswered assumptions silently baked in.

---

## Functional Design Template

### 1. Overview
<!-- What problem is being solved, for whom, and why now. -->

### 2. Goals and Non-Goals
<!-- Explicit scope boundaries. -->

### 3. Stakeholders and Users
<!-- Roles, personas, and their needs. -->

### 4. User Stories / Use Cases
<!-- Narrative flows describing how users interact with the system. -->

### 5. Functional Requirements
<!-- Numbered, testable requirements (FR-1, FR-2, ...). -->

### 6. User Flows
<!-- Step-by-step flows, optionally with diagrams. -->

### 7. UX / UI Considerations
<!-- Screens, interactions, accessibility notes. -->

### 8. Acceptance Criteria
<!-- How we know each requirement is met. -->

### 9. Open Questions
<!-- Unresolved functional questions. -->

---

## Technical Design Template

### 1. Context and Background
<!-- Existing system state, constraints, and prior decisions. -->

### 2. Goals and Non-Goals
<!-- Technical scope boundaries. -->

### 3. Architecture Overview
<!-- High-level diagram and component summary. -->

### 4. Components
<!-- Per-component responsibilities, interfaces, and dependencies. -->

### 5. Data Model
<!-- Entities, schemas, relationships, migrations. -->

### 6. APIs and Interfaces
<!-- Endpoints, payloads, protocols, contracts. -->

### 7. Sequence Diagrams
<!-- Key flows across components. -->

### 8. Security and Privacy
<!-- Authn/authz, data handling, threat considerations. -->

### 9. Performance and Scalability
<!-- Expected load, bottlenecks, scaling strategy. -->

### 10. Observability
<!-- Logging, metrics, tracing, alerting. -->

### 11. Testing Strategy
<!-- Unit, integration, e2e, manual verification. -->

### 12. Rollout and Migration
<!-- Deployment steps, feature flags, backfills, rollback. -->

### 13. Alternatives Considered
<!-- Options rejected and why. -->

### 14. Risks and Mitigations
<!-- Known risks and how they are addressed. -->

### 15. Open Questions
<!-- Unresolved technical questions. -->
