import {useEffect, useState} from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {useT} from 'web/lib/locale'
import {getCompletedProfilesCreations, getProfilesCreations} from 'web/lib/supabase/users'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCounts(rows: any[]) {
  const counts: Record<string, number> = {}
  for (const r of rows) {
    const date = new Date(r.created_time).toISOString().split('T')[0]
    counts[date] = (counts[date] || 0) + 1
  }
  return counts
}

function cumulativeFromCounts(counts: Record<string, number>, sortedDates: string[]) {
  const out: Record<string, number> = {}
  let prev = 0
  for (const d of sortedDates) {
    prev += counts[d] || 0
    out[d] = prev
  }
  return out
}

function toISODate(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .split('T')[0]
}

function addDays(d: Date, days: number) {
  const nd = new Date(d)
  nd.setUTCDate(nd.getUTCDate() + days)
  return nd
}

function buildDailyRange(startStr: string, endStr: string) {
  const out: string[] = []
  const start = new Date(startStr + 'T00:00:00.000Z')
  const end = new Date(endStr + 'T00:00:00.000Z')
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(toISODate(d))
  return out
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({active, payload, label}: any) {
  if (!active || !payload?.length) return null

  const date = payload[0]?.payload?.date
    ? new Date(payload[0].payload.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : formatDate(label)

  return (
    <div
      style={{
        background: 'rgb(247 244 239)', // canvas-50
        border: '1.5px solid rgb(232 213 188)', // canvas-200
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(44,36,22,0.12)',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'rgb(140 128 112)',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
        }}
      >
        {date}
      </p>
      {payload.map((entry: any) => (
        <div
          key={entry.dataKey}
          style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: entry.color,
              flexShrink: 0,
            }}
          />
          <span style={{fontSize: '12px', color: 'rgb(140 128 112)', fontWeight: 500}}>
            {entry.name}
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: 'rgb(30 26 20)',
              marginLeft: 'auto',
              paddingLeft: '12px',
            }}
          >
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

function CustomLegend({payload}: any) {
  return (
    <div style={{display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px'}}>
      {payload?.map((entry: any) => (
        <div key={entry.value} style={{display: 'flex', alignItems: 'center', gap: '7px'}}>
          <div
            style={{
              width: '24px',
              height: '3px',
              background: entry.color,
              borderRadius: '2px',
              ...(entry.payload?.strokeDasharray
                ? {
                    backgroundImage: `repeating-linear-gradient(90deg, ${entry.color} 0, ${entry.color} 4px, transparent 4px, transparent 7px)`,
                    background: 'none',
                  }
                : {}),
            }}
          />
          <span style={{fontSize: '12px', fontWeight: 600, color: 'rgb(140 128 112)'}}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Chart ────────────────────────────────────────────────────────────────────

export default function ChartMembers() {
  const [data, setData] = useState<any[]>([])
  const [chartHeight, setChartHeight] = useState(380)
  const [loading, setLoading] = useState(true)
  const t = useT()

  useEffect(() => {
    function applyHeight() {
      setChartHeight(window.innerWidth < 420 ? 280 : 380)
    }
    applyHeight()
    window.addEventListener('resize', applyHeight)
    return () => window.removeEventListener('resize', applyHeight)
  }, [])

  useEffect(() => {
    async function load() {
      const [allProfiles, completedProfiles] = await Promise.all([
        getProfilesCreations(),
        getCompletedProfilesCreations(),
      ])

      const countsAll = buildCounts(allProfiles)
      const countsCompleted = buildCounts(completedProfiles)

      const allDates = Object.keys(countsAll)
      const completedDates = Object.keys(countsCompleted)
      const sorted = [...allDates, ...completedDates].sort((a, b) => a.localeCompare(b))
      const minDateStr = sorted[0]
      const maxDateStr = sorted[sorted.length - 1]

      const dates = buildDailyRange(minDateStr, maxDateStr)
      const cumAll = cumulativeFromCounts(countsAll, dates)
      const cumCompleted = cumulativeFromCounts(countsCompleted, dates)

      setData(
        dates.map((date) => ({
          date,
          dateTs: new Date(date + 'T00:00:00.000Z').getTime(),
          profilesCreations: cumAll[date] || 0,
          profilesCompletedCreations: cumCompleted[date] || 0,
        })),
      )
      setLoading(false)
    }
    void load()
  }, [])

  // Colors from palette
  const AMBER = 'rgb(193 127 62)' // primary-500
  const SAGE = 'rgb(107 143 113)' // green-500

  return (
    <div>
      {/* Loading shimmer */}
      {loading && (
        <div
          style={{
            height: `${chartHeight}px`,
            background: 'rgb(247 244 239)',
            borderRadius: '16px',
            border: '1.5px solid rgb(232 213 188)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="animate-pulse"
        >
          <span style={{fontSize: '13px', color: 'rgb(140 128 112)', fontWeight: 500}}>
            Loading chart…
          </span>
        </div>
      )}

      {!loading && (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <AreaChart data={data} margin={{top: 16, right: 16, bottom: 8, left: -8}}>
            {/* Gradient fills */}
            <defs>
              <linearGradient id="gradAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AMBER} stopOpacity={0.18} />
                <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SAGE} stopOpacity={0.14} />
                <stop offset="95%" stopColor={SAGE} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-stroke)" vertical={false} />

            <XAxis
              dataKey="dateTs"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatDate}
              tick={{fontSize: 11, fill: 'rgb(140 128 112)', fontWeight: 500}}
              axisLine={{stroke: 'rgb(222 203 178)'}} // canvas-300
              tickLine={{stroke: 'rgb(222 203 178)'}}
              tickCount={6}
            />

            <YAxis
              tick={{fontSize: 11, fill: 'rgb(140 128 112)', fontWeight: 500}}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v)}
              width={40}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{stroke: 'rgb(193 127 62)', strokeWidth: 1, strokeDasharray: '4 2'}}
            />

            <Legend content={<CustomLegend />} />

            {/* Completed (sage, behind) */}
            <Area
              type="monotone"
              dataKey="profilesCompletedCreations"
              name={t('stats.with_bio', 'Completed')}
              stroke={SAGE}
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gradSage)"
              dot={false}
              activeDot={{r: 4, fill: SAGE, stroke: 'rgb(247 244 239)', strokeWidth: 2}}
            />

            {/* Total (amber, on top) */}
            <Area
              type="monotone"
              dataKey="profilesCreations"
              name={t('stats.total', 'Total')}
              stroke={AMBER}
              strokeWidth={2.5}
              fill="url(#gradAmber)"
              dot={false}
              activeDot={{r: 5, fill: AMBER, stroke: 'rgb(247 244 239)', strokeWidth: 2}}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
