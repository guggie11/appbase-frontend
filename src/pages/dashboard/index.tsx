/**
 * Archie Home — static design mockup.
 *
 * Deliberately NOT wired to the API: this page is the visual reference that
 * downstream projects copy. Every number is fixed sample content.
 */
import {
  LIFECYCLE,
  TEAM_SCORE,
  TEAM_METRICS,
  ROSTER,
  TEAM_BARS,
  CTA,
  RECOMMENDATION,
  FINDINGS,
  APPROVALS,
  FILTERS,
  INITIATIVES,
  DECISIONS,
  ACTIVITY,
  KNOWLEDGE,
  CONTINUE_CARDS,
  SUBMIT_STATS,
} from './mockData'

// ── Shared primitives ───────────────────────────────────────────────────────

const MONO = "'Geist Mono', ui-monospace, monospace"

const kicker: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#8a8c8e',
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e3e3',
  borderRadius: 16,
  padding: 20,
}

function SectionHead({
  title,
  right,
}: {
  title: string
  right?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
        flexWrap: 'wrap',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', color: '#1b1c1e' }}>
        {title}
      </h2>
      {right && <span style={kicker}>{right}</span>}
    </div>
  )
}

function Pill({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: '0.08em',
        padding: '3px 7px',
        borderRadius: 6,
        color,
        background: bg,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30, color: '#1b1c1e' }}>
      {/* Mockup disclosure — this page shows sample data, never live data. */}
      <div
        role="note"
        style={{
          ...card,
          padding: '10px 14px',
          background: '#fbf3dd',
          border: '1px solid #ecdcb0',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12.5,
          color: '#6b5618',
        }}
      >
        <span style={{ ...kicker, color: '#96731a' }}>Design mockup</span>
        <span>Sample content from the Archie v4 reference — not live data.</span>
      </div>

      {/* ── Command center ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span style={kicker}>AI Command Center</span>
        <h1
          style={{
            margin: 0,
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.12,
          }}
        >
          Good morning, Kang Guggie.
        </h1>
        <p style={{ margin: 0, fontSize: 14.5, color: '#4a4c4e', maxWidth: 680, lineHeight: 1.55 }}>
          Two initiatives need your decision today, and Archie finished reasoning on Payment Hub
          Modernization.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {LIFECYCLE.map((p) => (
            <div
              key={p.label}
              style={{
                border: '1px solid #e2e3e3',
                background: '#fff',
                borderRadius: 12,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 600, color: p.color }}>{p.count}</span>
              <span style={{ ...kicker, fontSize: 9.5 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team performance ── */}
      <section>
        <SectionHead title="Team performance" right={`${TEAM_SCORE.periodLabel} · ANALYTICS ↗`} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(230px, 0.85fr) 2fr',
            gap: 12,
          }}
          className="archie-perf-grid"
        >
          {/* Delivery score dial */}
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={kicker}>Team delivery score</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: `conic-gradient(#d8452a ${(TEAM_SCORE.value / 100) * 360}deg, #ececec 0deg)`,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 25,
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {TEAM_SCORE.value}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: TEAM_SCORE.deltaColor }}>
                  {TEAM_SCORE.delta}
                </span>
                <Pill text={TEAM_SCORE.band} color="#1f7d52" bg="#e8f4ed" />
                <span style={{ ...kicker, fontSize: 9, lineHeight: 1.5 }}>{TEAM_SCORE.note}</span>
              </div>
            </div>
          </div>

          {/* Metric grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 12,
            }}
          >
            {TEAM_METRICS.map((m) => (
              <div key={m.label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ ...kicker, fontSize: 9.5 }}>{m.label}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span style={{ fontSize: 23, fontWeight: 600, letterSpacing: '-0.02em' }}>
                    {m.value}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: m.deltaColor }}>
                    {m.delta}
                  </span>
                </div>
                <span style={{ fontSize: 11.5, color: '#6c6e70' }}>{m.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workload + weekly bars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 12,
            marginTop: 12,
          }}
        >
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={kicker}>Workload by architect</span>
              <span style={{ ...kicker, fontSize: 9 }}>Active / capacity</span>
            </div>
            {ROSTER.map((r) => (
              <div key={r.name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5 }}>
                  <span style={{ color: '#4a4c4e', minWidth: 0 }}>{r.name}</span>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 9.5, color: r.loadColor, letterSpacing: '0.06em' }}>
                      {r.load}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#8a8c8e' }}>{r.count}</span>
                  </span>
                </div>
                <div style={{ height: 5, borderRadius: 999, background: '#f0f0f0', overflow: 'hidden' }}>
                  <div
                    style={{
                      // Derive from active/capacity so the bar matches the count
                      // shown beside it (6 / 6 must read as full).
                      width: `${(() => {
                        const [a, cap] = r.count.split('/').map((n) => Number(n.trim()))
                        return cap > 0 ? Math.min(100, (a / cap) * 100) : 0
                      })()}%`,
                      height: '100%',
                      background: r.barColor,
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={kicker}>Decisions shipped per week</span>
              <span style={{ ...kicker, fontSize: 9 }}>8W</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 118 }}>
              {TEAM_BARS.map((b, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: b.h,
                    background: b.color,
                    borderRadius: '6px 6px 2px 2px',
                    minHeight: 4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team action needed ── */}
      <section
        style={{
          ...card,
          background: '#1b1c1e',
          border: 'none',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 24,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: '1 1 400px', minWidth: 0 }}>
          <span style={{ ...kicker, color: '#d8452a' }}>{CTA.kicker}</span>
          <span style={{ fontSize: 19, fontWeight: 600, color: '#fff', letterSpacing: '-0.015em' }}>
            {CTA.title}
          </span>
          <span style={{ fontSize: 13, color: '#b9babb', lineHeight: 1.55, maxWidth: 620 }}>
            {CTA.body}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              background: '#d8452a',
              color: '#fff',
              border: 'none',
              borderRadius: 11,
              padding: '10px 17px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {CTA.primary}
          </button>
          <button
            type="button"
            style={{
              background: 'transparent',
              color: '#e8e9ea',
              border: '1px solid #3a3c3e',
              borderRadius: 11,
              padding: '10px 17px',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {CTA.secondary}
          </button>
        </div>
      </section>

      {/* ── Archie recommendations ── */}
      <section>
        <SectionHead title="Archie recommendations" right="AI · EVIDENCE LINKED" />

        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ ...kicker, color: '#c0402a', maxWidth: 520, lineHeight: 1.5 }}>
              {RECOMMENDATION.kicker}
            </span>
            <Pill text="TODAY" color="#6c6e70" bg="#f0f0f0" />
          </div>

          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <p
              style={{
                margin: 0,
                flex: '1 1 420px',
                fontSize: 17,
                fontWeight: 500,
                lineHeight: 1.45,
                letterSpacing: '-0.012em',
                minWidth: 0,
              }}
            >
              {RECOMMENDATION.headline}
            </p>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em' }}>
                {RECOMMENDATION.confidence}
              </div>
              <div style={{ ...kicker, fontSize: 9 }}>Confidence</div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 12,
              paddingTop: 14,
              borderTop: '1px solid #eceded',
            }}
          >
            {RECOMMENDATION.tradeoffs.map((t) => (
              <div key={t.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ ...kicker, fontSize: 9 }}>{t.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{t.value}</span>
                <span style={{ fontSize: 11.5, color: '#6c6e70', lineHeight: 1.45 }}>{t.note}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
            <span style={{ ...kicker, fontSize: 9 }}>Evidence</span>
            {RECOMMENDATION.evidence.map((e) => (
              <Pill key={e} text={e} color="#4a4c4e" bg="#f4f4f4" />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 9,
              flexWrap: 'wrap',
              alignItems: 'center',
              paddingTop: 14,
              borderTop: '1px solid #eceded',
            }}
          >
            <button
              type="button"
              style={{
                background: '#d8452a',
                color: '#fff',
                border: 'none',
                borderRadius: 11,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Review &amp; decide
            </button>
            <button
              type="button"
              style={{
                background: '#fff',
                color: '#1b1c1e',
                border: '1px solid #dcdddd',
                borderRadius: 11,
                padding: '9px 16px',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Compare 3 options
            </button>
            <button
              type="button"
              style={{
                background: '#fff',
                color: '#1b1c1e',
                border: '1px solid #dcdddd',
                borderRadius: 11,
                padding: '9px 16px',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Ask the AI Team
            </button>
            <span style={{ ...kicker, fontSize: 9, marginLeft: 'auto' }}>Human decision required</span>
          </div>
        </div>

        {/* Findings */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: 12,
            marginTop: 12,
          }}
        >
          {FINDINGS.map((f) => (
            <div key={f.kind} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Pill text={f.kind} color={f.kindColor} bg={f.kindBg} />
              <span style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.45 }}>{f.title}</span>
              <span style={{ ...kicker, fontSize: 9, lineHeight: 1.5 }}>{f.meta}</span>
              <button
                type="button"
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 2,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#d8452a',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {f.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Waiting approval ── */}
      <section>
        <SectionHead title="Waiting approval" right="2 ON YOU" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {APPROVALS.map((a) => (
            <div
              key={a.title}
              style={{
                ...card,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: '1 1 340px', minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{a.title}</span>
                <span style={{ ...kicker, fontSize: 9 }}>{a.meta}</span>
              </div>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: a.ageColor, letterSpacing: '0.06em' }}>
                  {a.age}
                </span>
                <button
                  type="button"
                  style={{
                    background: '#1b1c1e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 15px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  style={{
                    background: '#fff',
                    color: '#4a4c4e',
                    border: '1px solid #dcdddd',
                    borderRadius: 10,
                    padding: '8px 15px',
                    fontSize: 12.5,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Request revision
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── My initiatives ── */}
      <section>
        <SectionHead title="My initiatives" right="14 ACTIVE · 3 BLOCKED" />

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              style={{
                color: f.color,
                background: f.bg,
                border: `1px solid ${f.border}`,
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12.5,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['ID', 'INITIATIVE', 'PHASE', 'NEXT ACTION', 'OWNER', 'PRIORITY'].map((h) => (
                  <th
                    key={h}
                    style={{
                      ...kicker,
                      fontSize: 9.5,
                      textAlign: 'left',
                      padding: '11px 16px',
                      borderBottom: '1px solid #e9eaea',
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INITIATIVES.map((i) => (
                <tr key={i.id} style={{ borderBottom: '1px solid #f1f2f2' }}>
                  <td style={{ padding: '13px 16px', fontFamily: MONO, fontSize: 11.5, color: '#8a8c8e' }}>
                    {i.id}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13.5, fontWeight: 500 }}>{i.name}</td>
                  <td style={{ padding: '13px 16px' }}>
                    <Pill text={i.phase} color={i.phaseColor} bg={i.phaseBg} />
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#4a4c4e' }}>{i.next}</td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: '#4a4c4e' }}>{i.owner}</td>
                  <td
                    style={{
                      padding: '13px 16px',
                      fontFamily: MONO,
                      fontSize: 9.5,
                      letterSpacing: '0.06em',
                      color: i.prColor,
                    }}
                  >
                    {i.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Recent decisions ── */}
      <section>
        <SectionHead title="Recent decisions" right="ADR TRACEABILITY 94%" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DECISIONS.map((d) => (
            <div key={d.adr} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: '#8a8c8e' }}>{d.adr}</span>
                <Pill text={d.status} color={d.stColor} bg={d.stBg} />
                <span style={{ ...kicker, fontSize: 9, marginLeft: 'auto' }}>{d.date}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{d.title}</span>
              <span style={{ fontSize: 12, color: '#6c6e70' }}>{d.meta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Activity + knowledge ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 12,
        }}
      >
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>AI Team activity</span>
            <span style={kicker}>Last 24h</span>
          </div>
          {ACTIVITY.map((a) => (
            <div key={a.initials + a.when} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  background: '#f0f0f0',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: MONO,
                  fontSize: 10.5,
                  color: '#4a4c4e',
                  flexShrink: 0,
                }}
              >
                {a.initials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{a.agent}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: '#8a8c8e', flexShrink: 0 }}>
                    {a.when}
                  </span>
                </div>
                <span style={{ fontSize: 12.5, color: '#6c6e70', lineHeight: 1.45 }}>{a.what}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Knowledge updates</span>
            <span style={kicker}>7 · HUB ↗</span>
          </div>
          {KNOWLEDGE.map((k) => (
            <div key={k.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: k.dot,
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 13, lineHeight: 1.4 }}>{k.title}</span>
                <span style={{ ...kicker, fontSize: 8.5 }}>{k.meta}</span>
              </div>
            </div>
          ))}
          <span
            style={{
              fontSize: 11.5,
              color: '#8a8c8e',
              lineHeight: 1.5,
              paddingTop: 11,
              borderTop: '1px solid #eceded',
            }}
          >
            Archie re-checks open initiatives against updated standards and flags conflicts.
          </span>
        </div>
      </section>

      {/* ── Continue working ── */}
      <section>
        <SectionHead title="Continue working" right="PICK UP WHERE YOU LEFT OFF · ALL INITIATIVES ↗" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {CONTINUE_CARDS.map((c) => (
            <div key={c.name} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <Pill text={c.phase} color={c.phaseColor} bg={c.phaseBg} />
                <span style={{ ...kicker, fontSize: 8.5 }}>{c.when}</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.012em' }}>{c.name}</span>
              <span style={{ fontSize: 12.5, color: '#6c6e70', lineHeight: 1.5, flex: 1 }}>{c.next}</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ ...kicker, fontSize: 8.5 }}>{c.owner}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#4a4c4e' }}>{c.progress}</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: '#f0f0f0', overflow: 'hidden' }}>
                  <div style={{ width: c.progress, height: '100%', background: '#d8452a', borderRadius: 999 }} />
                </div>
              </div>

              <button
                type="button"
                style={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#d8452a',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {c.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Submit initiative ── */}
      <section
        style={{
          ...card,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 22,
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f4f4f4',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: '1 1 360px', minWidth: 0 }}>
          <span style={kicker}>Every architecture starts with an initiative</span>
          <span style={{ fontSize: 13.5, color: '#4a4c4e', lineHeight: 1.55, maxWidth: 560 }}>
            Frame a business need in five fields. Archie handles discovery, analysis, and the first
            recommendation.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {SUBMIT_STATS.map((s) => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>{s.value}</span>
              <span style={{ ...kicker, fontSize: 8.5 }}>{s.label}</span>
            </div>
          ))}
          <button
            type="button"
            style={{
              background: '#d8452a',
              color: '#fff',
              border: 'none',
              borderRadius: 11,
              padding: '11px 19px',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Submit Initiative
          </button>
        </div>
      </section>

      <div style={{ ...kicker, fontSize: 9, textAlign: 'center', paddingBottom: 6 }}>
        Archie recommends · Authorized humans approve
      </div>
    </div>
  )
}
