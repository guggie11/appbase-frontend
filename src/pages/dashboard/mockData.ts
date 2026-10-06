/**
 * Static mockup data, transcribed from the Archie v4 "Archie Home" export.
 *
 * This dashboard is a DESIGN REFERENCE, not a live view: every figure here is
 * fixed sample content so downstream projects have a visual target to copy.
 * Nothing in this file is derived from the API.
 */

export const PHASE = {
  discover: { phase: 'DISCOVER', phaseColor: '#5b87a8', phaseBg: '#eaf1f6' },
  analyze: { phase: 'ANALYZE', phaseColor: '#96731a', phaseBg: '#fbf3dd' },
  reasoning: { phase: 'REASONING', phaseColor: '#c0402a', phaseBg: '#fdece8' },
  decide: { phase: 'DECIDE', phaseColor: '#c0402a', phaseBg: '#fdece8' },
  report: { phase: 'REPORT', phaseColor: '#1f7d52', phaseBg: '#e8f4ed' },
  submitted: { phase: 'SUBMITTED', phaseColor: '#6c6e70', phaseBg: '#eeeeee' },
} as const

export const LIFECYCLE = [
  { label: 'DISCOVER', count: '3', color: '#1b1c1e' },
  { label: 'ANALYZE', count: '4', color: '#1b1c1e' },
  { label: 'REASONING', count: '2', color: '#1b1c1e' },
  { label: 'DECIDE', count: '2', color: '#d8452a' },
  { label: 'REPORT', count: '3', color: '#1b1c1e' },
  { label: 'BLOCKED', count: '3', color: '#96731a' },
]

export const TEAM_SCORE = {
  value: 86,
  delta: '+6',
  deltaColor: '#2e9e6b',
  note: '6 ARCHITECTS · 14 ACTIVE INITIATIVES',
  band: 'STRONG',
  periodLabel: 'LAST 30 DAYS',
}

export const TEAM_METRICS = [
  { label: 'CYCLE TIME', value: '9.4d', delta: '−2.1d', deltaColor: '#2e9e6b', note: 'Intake to approved ADR' },
  { label: 'DECISION THROUGHPUT', value: '23', delta: '+5', deltaColor: '#2e9e6b', note: 'ADRs shipped by the team' },
  { label: 'REVIEW SLA', value: '91%', delta: '+7', deltaColor: '#2e9e6b', note: 'Reviewed within 3 days' },
  { label: 'REWORK RATE', value: '12%', delta: '+3', deltaColor: '#96731a', note: 'Revisions after review' },
]

export const ROSTER = [
  { name: 'You · Enterprise Arch.', load: 'OVER', loadColor: '#d8452a', barColor: '#d8452a', count: '6 / 6' },
  { name: 'R. Sitompul · Data', load: 'HEALTHY', loadColor: '#2e9e6b', barColor: '#2e9e6b', count: '3 / 5' },
  { name: 'A. Nabila · Solution', load: 'HIGH', loadColor: '#96731a', barColor: '#c99a1f', count: '4 / 5' },
  { name: 'H. Wijaya · Security', load: 'HEALTHY', loadColor: '#2e9e6b', barColor: '#2e9e6b', count: '2 / 5' },
]

export const TEAM_BARS = [
  { h: '34%', color: '#dcdddd' },
  { h: '52%', color: '#dcdddd' },
  { h: '44%', color: '#dcdddd' },
  { h: '68%', color: '#dcdddd' },
  { h: '58%', color: '#dcdddd' },
  { h: '76%', color: '#7ba7c7' },
  { h: '62%', color: '#7ba7c7' },
  { h: '92%', color: '#d8452a' },
]

export const CTA = {
  kicker: 'TEAM ACTION NEEDED',
  title: 'Your queue is at capacity — 6 of 6 initiatives sit with you.',
  body: 'H. Wijaya has room for two. Rebalancing now protects the 3-day review SLA on Payment Hub and Core Banking Gateway.',
  primary: 'Rebalance workload',
  secondary: 'View team board',
}

export const RECOMMENDATION = {
  kicker: 'REASONING COMPLETE · INI-2041 PAYMENT HUB MODERNIZATION',
  headline:
    'Adopt the domain-aligned payment hub with event-driven integration, reusing the existing ISO 20022 canonical model.',
  confidence: 89,
  tradeoffs: [
    { label: 'COST VS VALUE', value: 'Medium / High', note: '18-month payback, reuses canonical model' },
    { label: 'RISK VS BENEFIT', value: 'Contained', note: '2 high risks with named controls' },
    { label: 'BUILD VS BUY', value: 'Reuse + extend', note: 'Replaces 2 of 4 legacy adapters' },
  ],
  evidence: ['Payments Standard v4.2', 'ADR-0188', 'TOGAF Phase C', 'Core Banking SAD', '+9 sources'],
}

export const FINDINGS = [
  {
    kind: 'REUSE',
    kindColor: '#1f7d52',
    kindBg: '#e8f4ed',
    title: 'Customer 360 can reuse the approved Event Backbone pattern instead of a new pipeline',
    meta: 'SAVES ~6 WEEKS · MATCHED FROM 4 PRIOR INITIATIVES',
    cta: 'Apply',
  },
  {
    kind: 'CONFLICT',
    kindColor: '#c0402a',
    kindBg: '#fdece8',
    title: 'Branch Channel scope overlaps INI-1996 Digital Onboarding on 5 capabilities',
    meta: 'DETECTED VIA ENTERPRISE GRAPH · BUSINESS CAPABILITY LAYER',
    cta: 'Inspect',
  },
  {
    kind: 'DEBT',
    kindColor: '#96731a',
    kindBg: '#fbf3dd',
    title: 'Legacy FX adapter is now referenced by 3 target-state designs',
    meta: 'TECHNOLOGY DEBT · SEVERITY HIGH',
    cta: 'Log finding',
  },
]

export const APPROVALS = [
  {
    title: 'ADR-0214 — Event-driven integration for Payment Hub',
    meta: 'SOLUTION ARCH. REQUESTED · EVIDENCE COMPLETE',
    age: 'DUE TODAY',
    ageColor: '#d8452a',
  },
  {
    title: 'Target State Architecture — Customer 360 (v0.9)',
    meta: 'GOVERNANCE REVIEW · 1 CONDITION OPEN',
    age: '2 DAYS',
    ageColor: '#8a8c8e',
  },
]

export const FILTERS = [
  { label: 'Mine', color: '#fff', bg: '#1b1c1e', border: '#1b1c1e' },
  { label: 'Needs decision', color: '#4a4c4e', bg: '#fff', border: '#dcdddd' },
  { label: 'Blocked', color: '#4a4c4e', bg: '#fff', border: '#dcdddd' },
  { label: 'All', color: '#4a4c4e', bg: '#fff', border: '#dcdddd' },
]

export const INITIATIVES = [
  { id: '2041', name: 'Payment Hub Modernization', ...PHASE.reasoning, next: 'Review options', owner: 'You', priority: 'CRITICAL', prColor: '#d8452a' },
  { id: '2038', name: 'Customer 360 Data Domain', ...PHASE.analyze, next: 'Close 2 gaps', owner: 'R. Sitompul', priority: 'HIGH', prColor: '#96731a' },
  { id: '2033', name: 'Core Banking API Gateway', ...PHASE.decide, next: 'Approve ADR', owner: 'You', priority: 'HIGH', prColor: '#96731a' },
  { id: '2027', name: 'Branch Channel Consolidation', ...PHASE.discover, next: 'Answer 3 Qs', owner: 'You', priority: 'MEDIUM', prColor: '#6c6e70' },
  { id: '2019', name: 'Regulatory Reporting Uplift', ...PHASE.report, next: 'Export ADD', owner: 'A. Nabila', priority: 'MEDIUM', prColor: '#6c6e70' },
  { id: '2014', name: 'Legacy CRM Rationalization', ...PHASE.submitted, next: 'Start discover', owner: 'Unassigned', priority: 'LOW', prColor: '#a3a5a7' },
]

export const DECISIONS = [
  { adr: 'ADR-0211', status: 'APPROVED', stColor: '#1f7d52', stBg: '#e8f4ed', title: 'Use canonical ISO 20022 model for all payment interfaces', meta: 'Approved by H. Wijaya · 6 evidence links · INI-2041', date: '2 SEP' },
  { adr: 'ADR-0209', status: 'CONDITIONAL', stColor: '#96731a', stBg: '#fbf3dd', title: 'Single data ownership per customer master attribute', meta: 'Condition: stewardship model signed off by Q4 · INI-2038', date: '29 AUG' },
  { adr: 'ADR-0206', status: 'REJECTED', stColor: '#c0402a', stBg: '#fdece8', title: 'Direct point-to-point integration for branch channel', meta: 'Rejected — conflicts with Integration Standard v2.1', date: '26 AUG' },
]

export const ACTIVITY = [
  { initials: 'EA', agent: 'Enterprise Architect', what: 'Synthesized 3 options and final recommendation for INI-2041', when: '12M' },
  { initials: 'SE', agent: 'Security Architect', what: 'Flagged 2 high risks with proposed controls', when: '40M' },
  { initials: 'DA', agent: 'Data Architect', what: 'Mapped 18 data flows, found 2 ownership gaps', when: '2H' },
  { initials: 'RV', agent: 'Reviewer', what: 'Completeness check passed on Target State v0.9', when: '5H' },
]

export const KNOWLEDGE = [
  { title: 'Cloud Hosting Standard updated to v3.0', meta: 'AUTHORITATIVE · EFFECTIVE 1 SEP · AFFECTS 4 INITIATIVES', dot: '#d8452a' },
  { title: 'TM Forum ODA component map imported', meta: 'REFERENCE · 62 COMPONENTS', dot: '#7ba7c7' },
  { title: '12 ADRs from 2025 portfolio indexed', meta: 'PROJECT KNOWLEDGE · SEARCHABLE', dot: '#7ba7c7' },
  { title: 'Data Residency Policy supersedes PL-0042', meta: 'AUTHORITATIVE · CONFLICT CHECK RUN', dot: '#c99a1f' },
  { title: 'Integration Standard v2.1 clarifies event contracts', meta: 'AUTHORITATIVE · AFFECTS 2 INITIATIVES', dot: '#7ba7c7' },
  { title: 'ArchiMate 3.2 modelling guide added', meta: 'REFERENCE · 1 OWNER ASSIGNED', dot: '#7ba7c7' },
  { title: 'Payments Standard v4.2 review due 15 Sep', meta: 'AUTHORITATIVE · EFFECTIVE DATE EXPIRING', dot: '#c99a1f' },
]

export const CONTINUE_CARDS = [
  { ...PHASE.reasoning, name: 'Payment Hub Modernization', next: 'Archie compared 3 options and produced a decision matrix. Your review unblocks the ADR.', when: '12 MIN AGO', progress: '72%', owner: 'You · Enterprise Arch.', cta: 'Review reasoning' },
  { ...PHASE.analyze, name: 'Customer 360 Data Domain', next: 'Impact matrix drafted across 18 applications. Data Architect flagged two ownership gaps.', when: '2H AGO', progress: '48%', owner: 'R. Sitompul', cta: 'Open analysis' },
  { ...PHASE.discover, name: 'Branch Channel Consolidation', next: 'Archie needs 3 answers on scope boundaries before it can finish discovery.', when: 'YESTERDAY', progress: '21%', owner: 'You · Enterprise Arch.', cta: 'Answer 3 questions' },
]

export const SUBMIT_STATS = [
  { value: '24 min', label: 'MEDIAN TO FIRST RECOMMENDATION' },
  { value: '5 fields', label: 'MINIMUM INTAKE' },
  { value: '70%', label: 'ARTIFACT CONTENT AUTOMATED' },
]
