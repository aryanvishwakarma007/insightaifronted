import './App.css'
import { useEffect, useRef, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  LabelList,
  PieChart,
  Pie,
} from 'recharts'

const NAV_ITEMS = [
  ['features', 'Features'],
  ['how-it-works', 'How It Works'],
  ['dashboard', 'Dashboard'],
  ['pricing', 'Pricing'],
  ['faq', 'FAQ'],
]

const FEATURE_CARDS = [
  {
    icon: 'AI',
    title: 'AI Excel Analyzer',
    text: 'Upload a spreadsheet and let InsightAI surface missing data, duplicates, inconsistencies and quality issues in seconds.',
  },
  {
    icon: '▥',
    title: 'AI Dashboard Generator',
    text: 'Turn raw tables into business-ready visual summaries with clean KPIs, trend views and actionable insights.',
  },
]

const STEPS = [
  ['01', 'Upload', 'Upload your Excel or CSV file securely.'],
  ['02', 'Analyze', 'InsightAI scans the data for errors, patterns and useful signals.'],
  ['03', 'Visualize', 'Get a clean dashboard view that is easier to understand and share.'],
]

const TESTIMONIALS = [
  ['Rahul S.', 'Business Analyst', 'InsightAI cuts repetitive reporting work and makes the important numbers easier to spot.'],
  ['Priya M.', 'Data Consultant', 'The clean analysis flow makes it much easier to catch issues before presenting a report.'],
  ['Amit K.', 'Startup Founder', 'A focused dashboard view helps our team understand performance without digging through sheets.'],
]

/* ---------------------------------------------------------
   Constants + helpers
   --------------------------------------------------------- */

const COLORS = ['#3d82ff', '#8b5cf6', '#2bd9a0', '#ff9f43', '#ff5c93', '#44e1ff', '#facc15', '#a3e635']
const MONEY = /sales|revenue|profit|amount|price|cost|income|salary|total|spend|balance/i
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DASH_NAV = [
  ['dx-top', 'Dashboard', '⌂'],
  ['dx-charts', 'Data Analysis', '◔'],
  ['dx-insights', 'AI Insights', '✦'],
  ['dx-tables', 'Reports', '▤'],
]

const INSIGHT_STYLE = {
  highlight: { icon: '↗', tone: 'green' },
  trend: { icon: '↗', tone: 'violet' },
  warning: { icon: '!', tone: 'orange' },
  region: { icon: '◎', tone: 'blue' },
  quality: { icon: '✓', tone: 'green' },
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#0a1125',
    border: '1px solid rgba(132,160,220,.28)',
    borderRadius: 10,
    color: '#eef5ff',
    fontSize: 13,
  },
  labelStyle: { color: '#8498b7' },
  itemStyle: { color: '#eef5ff' },
}

function compact(n, prefix = '') {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '-'
  const v = Number(n)
  const a = Math.abs(v)
  let s
  if (a >= 1e9) s = `${(v / 1e9).toFixed(1)}B`
  else if (a >= 1e6) s = `${(v / 1e6).toFixed(1)}M`
  else if (a >= 1e3) s = `${(v / 1e3).toFixed(1).replace(/\.0$/, '')}K`
  else s = String(Math.round(v * 100) / 100)
  return prefix + s
}

function full(n, prefix = '') {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '-'
  return prefix + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

function prettyLabel(label, multiYear) {
  const month = /^(\d{4})-(\d{2})$/.exec(label)
  if (month) {
    const name = MONTHS[Number(month[2]) - 1]
    return multiYear ? `${name} '${month[1].slice(2)}` : name
  }
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(label)
  if (day) return `${Number(day[3])} ${MONTHS[Number(day[2]) - 1]}`
  return label
}

function renderCell(value, column) {
  if (value === null || value === undefined) return <span className="dx-null">—</span>
  if (typeof value === 'number') return (MONEY.test(column) ? '₹' : '') + value.toLocaleString('en-IN')
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10)
  return String(value)
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function formatPercent(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0%'
  return `${Math.round(n * 10) / 10}%`
}

function identityFallback(data) {
  return data.dataset_identity || {
    category: 'General',
    icon: '📊',
    title: 'Data Analytics',
    description: 'General structured data analysis',
    confidence: 40,
  }
}

function detectedValue(value, fallback = 'Not detected') {
  return value || fallback
}

function App() {
  const [fileName, setFileName] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authModal, setAuthModal] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const heroRef = useRef(null)

  // dashboard dikh raha hai ya landing page
  const showDashboard = Boolean(analysisResult)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return

    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5

      hero.style.setProperty('--mx', `${x * 14}deg`)
      hero.style.setProperty('--my', `${-y * 10}deg`)
      hero.style.setProperty('--px', `${x * 18}px`)
      hero.style.setProperty('--py', `${y * 14}px`)
    }

    const onLeave = () => {
      hero.style.setProperty('--mx', '0deg')
      hero.style.setProperty('--my', '0deg')
      hero.style.setProperty('--px', '0px')
      hero.style.setProperty('--py', '0px')
    }

    hero.addEventListener('pointermove', onPointerMove)
    hero.addEventListener('pointerleave', onLeave)

    return () => {
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onLeave)
    }
  }, [showDashboard])

  const scrollToSection = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleFileUpload = async (event) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return

    setFileName(file.name)
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        // backend ka asli error message dikhao
        let detail = ''
        try {
          const body = await response.json()
          detail = body.detail
        } catch {
          // ignore
        }
        throw new Error(detail || `Upload failed with status ${response.status}`)
      }

      const data = await response.json()

      // file ka size aur upload time dashboard ke header ke liye
      setAnalysisResult({
        ...data,
        _size: file.size,
        _uploadedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Upload failed:', error)
      alert(
        error instanceof TypeError
          ? 'Upload failed. Make sure the backend server is running on http://127.0.0.1:8000'
          : error.message,
      )
    } finally {
      setUploading(false)
      input.value = '' // same file dobara select karne par bhi kaam kare
    }
  }

  // upload ke baad poora dashboard dikhao
  if (showDashboard) {
    return (
      <Dashboard
        data={analysisResult}
        uploading={uploading}
        onUpload={handleFileUpload}
        onHome={() => {
          setAnalysisResult(null)
          setFileName('')
        }}
      />
    )
  }

  return (
    <div className="app-shell">
      <div className="scene" aria-hidden="true">
        <div className="scene-glow scene-glow-1" />
        <div className="scene-glow scene-glow-2" />
        <div className="scene-glow scene-glow-3" />
        <div className="scene-stars" />
        <div className="scene-grid scene-grid-back" />
        <div className="scene-grid scene-grid-front" />
        <div className="scene-orb scene-orb-1" />
        <div className="scene-orb scene-orb-2" />
        <div className="scene-orb scene-orb-3" />
      </div>

      <header className="navbar">
        <div className="container nav-inner">
          <button
            className="brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Insight<span>AI</span>
          </button>

          <nav className="desktop-nav">
            {NAV_ITEMS.map(([id, label]) => (
              <button key={id} onClick={() => scrollToSection(id)}>
                {label}
              </button>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              className="ghost-button desktop-only"
              onClick={() => setAuthModal('signin')}
            >
              Sign In
            </button>
            <button
              className="primary-button desktop-only"
              onClick={() => setAuthModal('signup')}
            >
              Sign Up
            </button>

            <button
              className="menu-button mobile-only"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-nav">
            {NAV_ITEMS.map(([id, label]) => (
              <button key={id} onClick={() => scrollToSection(id)}>
                {label}
              </button>
            ))}
            <div className="mobile-nav-divider" />
            <button onClick={() => { setAuthModal('signin'); setMenuOpen(false) }}>
              Sign In
            </button>
            <button
              className="primary-button"
              onClick={() => { setAuthModal('signup'); setMenuOpen(false) }}
            >
              Sign Up
            </button>
          </div>
        )}
      </header>

      <main>
        <section ref={heroRef} className="hero section">
          <div className="hero-light" aria-hidden="true" />

          <div className="container hero-content">
            <div className="hero-badge">
              <span className="live-dot" />
              AI-POWERED DATA INTELLIGENCE
              <span className="hero-badge-star">✦</span>
            </div>

            <h1>
              Turn Your Excel Data Into
              <span className="gradient-text"> Instant Insights</span>
            </h1>

            <p className="hero-subtitle">
              InsightAI analyzes your spreadsheets, finds hidden problems,
              and transforms raw data into useful business insights.
            </p>

            <div className="hero-object" aria-hidden="true">
              <div className="hero-halo halo-a" />
              <div className="hero-halo halo-b" />
              <div className="hero-halo halo-c" />
              <div className="hero-sphere">
                <div className="sphere-scan" />
                <div className="sphere-lines" />
                <div className="sphere-core">AI</div>
              </div>
              <span className="orbit-node orbit-node-a" />
              <span className="orbit-node orbit-node-b" />
              <span className="orbit-node orbit-node-c" />
              <div className="hero-shadow" />
            </div>

            <div className="hero-actions">
              <input
                id="excel-file"
                type="file"
                className="file-input"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />

              <label htmlFor="excel-file" className="primary-button large-button">
                {uploading ? 'Processing...' : 'Upload Excel File'}
                <span>↗</span>
              </label>

              <button className="secondary-button large-button">
                See Demo <span>▶</span>
              </button>
            </div>

            {fileName && !uploading && (
              <div className="selected-file">
                Selected file: <strong>{fileName}</strong>
              </div>
            )}

            {uploading && (
              <div className="processing-message">
                <span className="spinner" />
                AI is processing your spreadsheet...
              </div>
            )}

            <div className="security-note">
              <span>🔒</span>
              Your uploaded data is processed securely and never stored on our servers.
            </div>
          </div>
        </section>

        <section id="features" className="section content-section">
          <div className="container">
            <SectionTitle
              eyebrow="POWERFUL INTELLIGENCE"
              title="Everything You Need to Understand Your Data"
              subtitle="Two focused AI capabilities, one clean workflow."
            />
            <div className="feature-grid">
              {FEATURE_CARDS.map((card) => (
                <article className="glass-card feature-card" key={card.title}>
                  <div className="card-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span className="link-text">Explore capability →</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section content-section section-alt">
          <div className="container">
            <SectionTitle
              eyebrow="SIMPLE WORKFLOW"
              title="How It Works"
              subtitle="Three clear steps from spreadsheet to insight."
            />
            <div className="steps-grid">
              {STEPS.map(([number, title, text]) => (
                <article className="glass-card step-card" key={number}>
                  <div className="step-number">{number}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="dashboard" className="section content-section">
          <div className="container">
            <SectionTitle
              eyebrow="LIVE DATA VIEW"
              title="See Your Data Come to Life"
              subtitle="A futuristic dashboard concept for KPI-first data storytelling."
            />

            <div className="dashboard-shell">
              <div className="dashboard-toolbar">
                <div className="window-dots">
                  <span /><span /><span />
                </div>
                <span>INSIGHTAI / ANALYTICS</span>
              </div>

              <div className="dashboard-stats">
                <DashboardMetric title="Total Revenue" value="₹12.4L" note="↑ 18% this month" />
                <DashboardMetric title="Data Errors Found" value="7" note="Needs review" danger />
                <DashboardMetric title="Top Performing Region" value="West" note="42% of total sales" />
              </div>

              <div className="chart-panel">
                <div className="chart-header">
                  <div>
                    <span className="eyebrow">PERFORMANCE</span>
                    <h3>AI-generated performance graph</h3>
                  </div>
                  <span className="chart-period">LAST 8 PERIODS</span>
                </div>

                <div className="chart">
                  <div className="chart-guides">
                    <span /><span /><span /><span />
                  </div>
                  <div className="chart-bars">
                    {[34, 49, 43, 66, 57, 79, 72, 92].map((height, index) => (
                      <span key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section content-section section-alt">
          <div className="container">
            <SectionTitle
              eyebrow="USER STORIES"
              title="Loved by Analysts Everywhere"
            />
            <div className="testimonial-grid">
              {TESTIMONIALS.map(([name, role, text]) => (
                <article className="glass-card testimonial-card" key={name}>
                  <div className="quote">“</div>
                  <p>{text}</p>
                  <strong>{name}</strong>
                  <small>{role}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="section content-section">
          <div className="container narrow">
            <SectionTitle
              eyebrow="PRICING"
              title="Simple, Transparent Pricing"
              subtitle="Start free and upgrade when you need more power."
            />

            <div className="pricing-grid">
              <article className="glass-card pricing-card">
                <h3>Free</h3>
                <div className="price">₹0</div>
                <span className="price-note">forever</span>
                <ul>
                  <li>✓ 5 Excel uploads / month</li>
                  <li>✓ Basic AI analysis</li>
                  <li>✓ 1 dashboard export</li>
                </ul>
                <button className="secondary-button full-button" onClick={() => setAuthModal('signup')}>
                  Get Started
                </button>
              </article>

              <article className="glass-card pricing-card pro-card">
                <span className="popular-badge">POPULAR</span>
                <h3>Pro</h3>
                <div className="price">₹499<span>/mo</span></div>
                <span className="price-note">billed monthly</span>
                <ul>
                  <li>✓ Unlimited uploads</li>
                  <li>✓ Advanced AI insights</li>
                  <li>✓ Unlimited dashboard exports</li>
                  <li>✓ Priority support</li>
                </ul>
                <button className="primary-button full-button" onClick={() => setAuthModal('signup')}>
                  Upgrade to Pro
                </button>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="section content-section">
          <div className="container narrow">
            <SectionTitle
              eyebrow="FAQ"
              title="Frequently Asked Questions"
            />

            <div className="faq-list">
              <FaqQuestion
                question="Is my data safe?"
                answer="The selected file is sent to your local FastAPI backend for processing."
              />
              <FaqQuestion
                question="What file formats are supported?"
                answer="The upload control accepts .xlsx, .xls and .csv files."
              />
              <FaqQuestion
                question="Can I cancel anytime?"
                answer="The pricing UI is currently a frontend concept and can later be connected to payments."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="brand footer-brand">Insight<span>AI</span></div>
          <p>Built for data analysts, by a future data analyst.</p>
          <small>© 2026 InsightAI. All rights reserved.</small>
        </div>
      </footer>

      {authModal && (
        <div className="modal-backdrop" onClick={() => setAuthModal(null)}>
          <div className="auth-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setAuthModal(null)}>✕</button>
            <div className="modal-icon">{authModal === 'signin' ? '→' : '+'}</div>
            <span className="eyebrow">INSIGHTAI ACCOUNT</span>
            <h2>{authModal === 'signin' ? 'Welcome Back' : 'Create Your Account'}</h2>
            <p>
              {authModal === 'signin'
                ? 'Sign in to continue to InsightAI.'
                : 'Start analyzing your data for free.'}
            </p>

            <form onSubmit={(event) => event.preventDefault()}>
              {authModal === 'signup' && (
                <input type="text" placeholder="Full Name" className="modal-input" />
              )}
              <input type="email" placeholder="Email address" className="modal-input" />
              <input type="password" placeholder="Password" className="modal-input" />
              <button type="submit" className="primary-button full-button">
                {authModal === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="modal-switch">
              {authModal === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setAuthModal('signup')}>Sign Up</button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setAuthModal('signin')}>Sign In</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------
   Dashboard
   --------------------------------------------------------- */

function Dashboard({ data: initialData, onUpload, uploading, onHome }) {
  const [active, setActive] = useState('dx-top')
  const [showAll, setShowAll] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [data, setData] = useState(initialData)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterLocation, setFilterLocation] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [chatBusy, setChatBusy] = useState(false)
  const [forecast, setForecast] = useState(null)
  const [forecastBusy, setForecastBusy] = useState(false)
  const noticeTimer = useRef(null)

  useEffect(() => {
    setData(initialData)
    setFilterCategory('All')
    setFilterLocation('All')
    setDateFrom('')
    setDateTo('')
    setForecast(null)
    setChatMessages([])
  }, [initialData])

  const metric = data.primary_metric
  const metric2 = data.secondary_metric
  const categoryName = data.primary_category
  const money1 = metric && MONEY.test(metric) ? '₹' : ''
  const money2 = metric2 && MONEY.test(metric2) ? '₹' : ''

  const trend = data.charts?.trend ?? []
  const secondaryTrend = data.charts?.secondary_trend ?? []
  const categories = data.charts?.category ?? []
  const distribution = data.charts?.distribution ?? []
  const locations = data.charts?.location ?? []
  const insights = data.insights ?? []
  const details = data.column_details ?? []
  const quality = data.quality ?? {}
  const columns = data.columns ?? []
  const preview = data.preview ?? []
  const identity = identityFallback(data)
  const identifierColumns = data.identifier_columns ?? []
  const flagColumns = data.flag_columns ?? []
  const removedGeneratedColumns = data.removed_generated_columns ?? []
  const analytics = data.analytics ?? {}
  const removedGeneratedSet = new Set(removedGeneratedColumns.map((value) => String(value).trim().toLowerCase()))
  const flagSet = new Set(flagColumns.map((value) => String(value).trim().toLowerCase()))
  const isExcludedColumn = (value) => {
    const key = String(value ?? '').trim().toLowerCase()
    return removedGeneratedSet.has(key) || flagSet.has(key)
  }
  // Defensive frontend filtering keeps stale/older backend responses from
  // leaking generated columns or boolean flags into business analytics.
  const advancedKpis = (analytics.kpis ?? []).filter((item) => {
    const label = String(item?.label ?? '').replace(/^Total |^Average |^Highest /, '').trim().toLowerCase()
    return !isExcludedColumn(label)
  })
  const missingByColumn = (analytics.missing_by_column ?? []).filter((item) => !removedGeneratedSet.has(String(item?.column ?? '').trim().toLowerCase()))
  const outliers = (analytics.outliers ?? []).filter((item) => !flagSet.has(String(item?.column ?? '').trim().toLowerCase()))
  const correlations = (analytics.correlations ?? []).filter((item) => !flagSet.has(String(item?.x ?? '').trim().toLowerCase()) && !flagSet.has(String(item?.y ?? '').trim().toLowerCase()))
  const anomalies = analytics.anomalies ?? []
  const statSummary = (analytics.stat_summary ?? []).filter((item) => !isExcludedColumn(item?.column))

  const multiYear = new Set(trend.filter((t) => /^\d{4}-/.test(t.label)).map((t) => t.label.slice(0, 4))).size > 1
  const trendData = trend.map((t) => ({
    name: prettyLabel(t.label, multiYear),
    value: t.value,
  }))
  const secondaryTrendData = secondaryTrend.map((t) => ({
    name: prettyLabel(t.label, multiYear),
    value: t.value,
  }))
  const hasDate = Boolean(data.primary_date)
  const hasSecondaryTrend = Boolean(metric2) && secondaryTrendData.length > 0
  const hasLocation = Boolean(data.location_column) && locations.length > 0
  const dateQualityWarning = data.date_parse_quality != null && Number(data.date_parse_quality) < 95
  const filteredCategories = categories.filter((item) => !categorySearch || String(item.label).toLowerCase().includes(categorySearch.toLowerCase()))
  const filteredLocations = locations.filter((item) => !locationSearch || String(item.label).toLowerCase().includes(locationSearch.toLowerCase()))

  const rows = showAll ? preview : preview.slice(0, 10)
  const ext = (data.filename || '').split('.').pop()?.toLowerCase()

  const notify = (message) => {
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 3000)
  }

  const goTo = (id) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const downloadReport = () => {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [
      'InsightAI report',
      `File,${q(data.filename)}`,
      `Dataset type,${q(identity.title)}`,
      `Dataset category,${q(identity.category)}`,
      `Total rows,${data.total_rows}`,
      `Total columns,${data.total_columns}`,
      `Missing cells,${data.missing_values}`,
      `Rows with missing data,${data.rows_with_missing ?? quality.rows_with_missing ?? 0}`,
      `Duplicate rows,${data.duplicate_rows}`,
      `Primary metric,${q(metric)}`,
      `Secondary metric,${q(metric2)}`,
      `Category column,${q(categoryName)}`,
      `Date column,${q(data.primary_date)}`,
      `Date parse quality,${data.date_parse_quality != null ? `${data.date_parse_quality}%` : 'N/A'}`,
      `Location column,${q(data.location_column)}`,
      `Identifier columns excluded,${q(identifierColumns.join(' | '))}`,
      `Generated columns removed,${q(removedGeneratedColumns.join(' | '))}`,
      '',
      'Column,Data type,Detected type,Missing values,Unique values',
      ...details.map((c) => [q(c.name), q(c.dtype), q(c.detected_type), c.missing, c.unique].join(',')),
      '',
      'AI insights',
      ...insights.map((i) => q(`${i.title}: ${i.text}`)),
    ]
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'insightai_report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const applyFilters = async () => {
    if (!data.analysis_id) { notify('This analysis session has expired. Upload the file again.'); return }
    try {
      const response = await fetch('http://127.0.0.1:8000/filter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: data.analysis_id,
          filters: {
            category_column: categoryName,
            category_value: filterCategory,
            location_column: data.location_column,
            location_value: filterLocation,
            date_column: data.primary_date,
            date_from: dateFrom, date_to: dateTo,
          },
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Filter failed')
      setData((prev) => ({ ...prev, ...payload }))
      notify('Dashboard updated with the selected filters.')
    } catch (error) {
      notify(error.message || 'Could not apply filters.')
    }
  }

  const clearFilters = () => {
    setFilterCategory('All'); setFilterLocation('All'); setDateFrom(''); setDateTo('')
    // Re-fetch the original dashboard through the current session.
    fetch('http://127.0.0.1:8000/filter', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis_id: data.analysis_id, filters: {} }),
    }).then((r) => r.json()).then((payload) => setData((prev) => ({ ...prev, ...payload }))).catch(() => {})
    notify('Filters cleared.')
  }

  const askChat = async () => {
    const question = chatQuestion.trim()
    if (!question || !data.analysis_id || chatBusy) return
    setChatBusy(true)
    setChatMessages((m) => [...m, { role: 'user', text: question }])
    setChatQuestion('')
    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: data.analysis_id, question }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Chat failed')
      setChatMessages((m) => [...m, { role: 'assistant', text: payload.answer }])
    } catch (error) {
      setChatMessages((m) => [...m, { role: 'assistant', text: error.message || 'Could not answer that question.' }])
    } finally { setChatBusy(false) }
  }

  const runForecast = async () => {
    if (!data.analysis_id || forecastBusy) return
    setForecastBusy(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/forecast', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: data.analysis_id, periods: 6 }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Forecast failed')
      setForecast(payload)
    } catch (error) { setForecast({ available: false, reason: error.message }) }
    finally { setForecastBusy(false) }
  }

  const downloadServerReport = async (format) => {
    if (!data.analysis_id) return
    try {
      const response = await fetch('http://127.0.0.1:8000/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: data.analysis_id, format }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail || 'Report generation failed')
      if (format === 'csv') {
        const blob = new Blob([payload.content], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = payload.filename; a.click(); URL.revokeObjectURL(url)
      } else if (payload.content_base64) {
        const binary = atob(payload.content_base64); const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
        const blob = new Blob([bytes], { type: 'application/pdf' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = payload.filename; a.click(); URL.revokeObjectURL(url)
      }
      notify(`${format.toUpperCase()} report generated.`)
    } catch (error) { notify(error.message || 'Report generation failed.') }
  }

  const saveDashboard = () => {
    try {
      localStorage.setItem('insightai_saved_dashboard', JSON.stringify({ filename: data.filename, savedAt: new Date().toISOString(), analysis_id: data.analysis_id }))
      notify('Dashboard saved locally on this browser.')
    } catch { notify('Could not save dashboard locally.') }
  }

  const uploadedLabel = data._uploadedAt
    ? new Date(data._uploadedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  const kpis = [
    {
      tone: 'blue',
      icon: '▦',
      label: 'Total Rows',
      value: Number(data.total_rows).toLocaleString('en-IN'),
      foot: 'Total number of records in your file',
    },
    {
      tone: 'violet',
      icon: '▥',
      label: 'Total Columns',
      value: data.total_columns,
      foot: removedGeneratedColumns.length
        ? `${removedGeneratedColumns.length} generated column(s) excluded`
        : 'Usable columns detected',
    },
    {
      tone: 'orange',
      icon: '⚠',
      label: 'Missing Values',
      value: Number(data.missing_values).toLocaleString('en-IN'),
      delta: formatPercent(quality.missing_percent),
      deltaTone: Number(quality.missing_percent) > 0 ? 'warn' : 'good',
      foot: `${Number(data.rows_with_missing ?? 0).toLocaleString('en-IN')} rows with missing data`,
    },
    {
      tone: 'green',
      icon: '⧉',
      label: 'Duplicate Rows',
      value: Number(data.duplicate_rows).toLocaleString('en-IN'),
      delta: formatPercent(quality.duplicate_percent),
      deltaTone: Number(quality.duplicate_percent) > 0 ? 'warn' : 'good',
      foot: 'Exact duplicate records found',
    },
    ...advancedKpis.slice(0, 2).map((item, index) => ({
      tone: index === 0 ? 'violet' : 'blue',
      icon: index === 0 ? 'Σ' : '≈',
      label: item.label,
      value: item.display,
      foot: 'Automatically calculated from the detected metric',
    })),
  ]

  return (
    <div className="dx-root">
      {/* ---------- top bar ---------- */}
      <header className="dx-topbar">
        <button className="dx-brand" onClick={onHome} title="Back to home">
          <span className="dx-brand-mark">AI</span>
          <span>
            <strong>
              Insight<span>AI</span>
            </strong>
            <small>Turn your data into insights</small>
          </span>
        </button>

        <div className="dx-top-right">
          <input
            id="dx-file"
            type="file"
            className="file-input"
            accept=".xlsx,.xls,.csv"
            onChange={onUpload}
          />
          <label htmlFor="dx-file" className="dx-upload">
            {uploading ? 'Analyzing...' : '⬆ Upload New File'}
          </label>
          <div className="dx-user">
            <span className="dx-avatar">A</span>
            <span className="dx-user-name">Aryan</span>
          </div>
        </div>
      </header>

      <div className="dx-shell">
        {/* ---------- sidebar ---------- */}
        <aside className="dx-side">
          <nav aria-label="Dashboard sections">
            {DASH_NAV.map(([id, label, icon]) => (
              <button
                key={id}
                className={`dx-nav ${active === id ? 'is-active' : ''}`}
                onClick={() => goTo(id)}
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </button>
            ))}
            <button className="dx-nav" onClick={() => notify('Settings page is coming soon.')}>
              <span aria-hidden="true">⚙</span>
              Settings
            </button>
          </nav>

          <div className="dx-help">
            <div className="dx-help-bot" aria-hidden="true">🤖</div>
            <strong>Need Help?</strong>
            <p>Ask our AI assistant anything about your data.</p>
            <button onClick={() => document.getElementById('dx-chat')?.scrollIntoView({ behavior: 'smooth' })}>Open Chat</button>
          </div>
          <small className="dx-version">InsightAI v6.0.0</small>
        </aside>

        {/* ---------- main ---------- */}
        <main className="dx-main" id="dx-top">
          <div className="dx-head">
            <div>
              <h1>Dashboard</h1>
              <p>Here&apos;s what we found in your data</p>
            </div>

            <div className="dx-file">
              <div className="dx-file-icon" aria-hidden="true">▤</div>
              <div className="dx-file-text">
                <strong>{data.filename}</strong>
                <small>
                  {uploadedLabel && `Uploaded on: ${uploadedLabel}`}
                  {data._size ? `  |  ${formatSize(data._size)}` : ''}
                </small>
              </div>
              <div className="dx-file-tags">
                <span className="dx-tag">{ext === 'csv' ? 'CSV' : 'Excel'}</span>
                <span className="dx-tag is-ok">● Analysis Completed</span>
              </div>
            </div>
          </div>

          {/* KPI cards */}
          <section className="dx-kpis">
            {kpis.map((k) => (
              <article key={k.label} className={`dx-card dx-kpi tone-${k.tone}`}>
                <div className="dx-kpi-row">
                  <div className="dx-kpi-icon" aria-hidden="true">{k.icon}</div>
                  <div>
                    <span className="dx-kpi-label">{k.label}</span>
                    <div className="dx-kpi-value">
                      {k.value}
                      {k.delta && <em className={k.deltaTone === 'warn' ? 'dx-warn' : ''}>{k.delta}</em>}
                    </div>
                  </div>
                </div>
                <small>{k.foot}</small>
              </article>
            ))}
          </section>

          {/* Dataset identity + detection summary */}
          <section className="dx-grid dx-grid-a dx-analysis-context">
            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>{identity.icon} {identity.title}</h2>
                  <p>{identity.description}</p>
                </div>
                <span className="dx-tag is-ai">{identity.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 0 4px' }}>
                <div style={{ fontSize: 42, lineHeight: 1 }} aria-hidden="true">{identity.icon}</div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontSize: 15, color: '#eef5ff' }}>Detected automatically</strong>
                  <span style={{ display: 'block', marginTop: 5, color: '#8498b7', fontSize: 13 }}>
                    {identity.confidence ?? 0}% confidence from the dataset structure and column names.
                  </span>
                </div>
              </div>
            </article>

            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>Data Detection Summary</h2>
                  <p>InsightAI decides which fields are useful for analysis.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <DetectionRow label="Primary metric" value={detectedValue(metric)} />
                <DetectionRow label="Secondary metric" value={detectedValue(metric2)} />
                <DetectionRow label="Category" value={detectedValue(categoryName)} />
                <DetectionRow label="Date" value={detectedValue(data.primary_date)} />
                <DetectionRow
                  label="Date quality"
                  value={data.date_parse_quality != null ? `${data.date_parse_quality}% parsed` : 'N/A'}
                />
                <DetectionRow label={data.location_type === 'state' ? 'State' : 'Location'} value={detectedValue(data.location_column)} />
                <DetectionRow label="IDs excluded" value={identifierColumns.length ? `${identifierColumns.length} column(s)` : 'None'} />
                <DetectionRow label="Flags excluded" value={flagColumns.length ? `${flagColumns.length} column(s)` : 'None'} />
                <DetectionRow label="Generated removed" value={removedGeneratedColumns.length ? `${removedGeneratedColumns.length} column(s)` : 'None'} />
              </div>
              {dateQualityWarning && (
                <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255, 166, 0, .08)', border: '1px solid rgba(255, 166, 0, .18)', color: '#f5c46b', fontSize: 12 }}>
                  ⚠ Some date values could not be parsed. Trend calculations use only valid date rows.
                </div>
              )}
            </article>
          </section>

          {/* Smart filters */}
          <section className="dx-card" id="dx-filters" style={{ marginBottom: 18 }}>
            <div className="dx-card-head">
              <div><h2>Smart Filters</h2><p>Filter the same uploaded dataset and recalculate KPIs, charts and quality signals.</p></div>
              <span className="dx-tag is-ai">Live analysis</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
              <label style={{ color:'#8498b7', fontSize:12 }}>Category<select value={filterCategory} onChange={(e)=>setFilterCategory(e.target.value)} style={{ display:'block', width:'100%', marginTop:6, padding:'9px 10px', borderRadius:8, background:'#0a1125', color:'#eef5ff', border:'1px solid rgba(132,160,220,.2)' }}><option>All</option>{categories.map(x=><option key={x.label}>{x.label}</option>)}</select></label>
              <label style={{ color:'#8498b7', fontSize:12 }}>Location<select value={filterLocation} onChange={(e)=>setFilterLocation(e.target.value)} style={{ display:'block', width:'100%', marginTop:6, padding:'9px 10px', borderRadius:8, background:'#0a1125', color:'#eef5ff', border:'1px solid rgba(132,160,220,.2)' }}><option>All</option>{locations.map(x=><option key={x.label}>{x.label}</option>)}</select></label>
              <label style={{ color:'#8498b7', fontSize:12 }}>From<input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} style={{ display:'block', width:'100%', marginTop:6, padding:'8px 10px', borderRadius:8, background:'#0a1125', color:'#eef5ff', border:'1px solid rgba(132,160,220,.2)' }} /></label>
              <label style={{ color:'#8498b7', fontSize:12 }}>To<input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} style={{ display:'block', width:'100%', marginTop:6, padding:'8px 10px', borderRadius:8, background:'#0a1125', color:'#eef5ff', border:'1px solid rgba(132,160,220,.2)' }} /></label>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:12 }}>
              <button className="dx-download" onClick={applyFilters}>Apply Filters</button>
              <button className="dx-ghost" onClick={clearFilters}>Clear</button>
              <button className="dx-ghost" onClick={saveDashboard}>Save Dashboard</button>
              <button className="dx-ghost" onClick={()=>downloadServerReport('csv')}>Export CSV</button>
              <button className="dx-ghost" onClick={()=>downloadServerReport('pdf')}>Export PDF</button>
            </div>
          </section>

          {/* Advanced analytics */}
          <section className="dx-grid dx-grid-a" id="dx-advanced">
            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>Advanced Analytics</h2>
                  <p>Statistical checks that do not depend on a specific business type.</p>
                </div>
                <span className="dx-tag is-ai">Automated analysis</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10 }}>
                {advancedKpis.slice(0, 6).map((item) => (
                  <div key={item.label} style={{ padding: 12, borderRadius: 12, background: 'rgba(132,160,220,.06)', border: '1px solid rgba(132,160,220,.12)' }}>
                    <small style={{ color: '#8498b7' }}>{item.label}</small>
                    <strong style={{ display: 'block', marginTop: 6, color: '#eef5ff', fontSize: 17 }}>{item.display}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>Data Quality Signals</h2>
                  <p>Missing data, outliers and unusual periods.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                <div><small style={{ color: '#8498b7' }}>Columns with missing data</small><strong style={{ display:'block', marginTop:4 }}>{quality.columns_with_missing ?? missingByColumn.length}</strong></div>
                <div><small style={{ color: '#8498b7' }}>Outlier columns</small><strong style={{ display:'block', marginTop:4 }}>{quality.outlier_columns ?? outliers.length}</strong></div>
                <div><small style={{ color: '#8498b7' }}>Trend anomalies</small><strong style={{ display:'block', marginTop:4 }}>{anomalies.length}</strong></div>
              </div>
            </article>
          </section>

          <section className="dx-grid dx-grid-a">
            <article className="dx-card">
              <div className="dx-card-head">
                <div><h2>Missing Data Breakdown</h2><p>Columns with the largest number of missing values.</p></div>
              </div>
              {missingByColumn.length ? (
                <div className="dx-table-wrap">
                  <table className="dx-table"><thead><tr><th>Column</th><th>Missing</th><th>Rows %</th></tr></thead><tbody>
                    {missingByColumn.map((item) => <tr key={item.column}><td>{item.column}</td><td className="dx-warn">{Number(item.missing).toLocaleString('en-IN')}</td><td>{item.percentage}%</td></tr>)}
                  </tbody></table>
                </div>
              ) : <div className="dx-empty">No missing values detected.</div>}
            </article>

            <article className="dx-card">
              <div className="dx-card-head">
                <div><h2>Outlier Detection</h2><p>IQR-based statistical screening; not every outlier is an error.</p></div>
              </div>
              {outliers.length ? (
                <div className="dx-table-wrap"><table className="dx-table"><thead><tr><th>Column</th><th>Outliers</th><th>Share</th></tr></thead><tbody>
                  {outliers.map((item) => <tr key={item.column}><td>{item.column}</td><td>{Number(item.count).toLocaleString('en-IN')}</td><td>{item.percentage}%</td></tr>)}
                </tbody></table></div>
              ) : <div className="dx-empty">No statistically significant IQR outliers detected.</div>}
            </article>
          </section>

          <section className="dx-grid dx-grid-a">
            <article className="dx-card">
              <div className="dx-card-head"><div><h2>Numeric Relationships</h2><p>Highest absolute Pearson correlations among usable numeric fields.</p></div></div>
              {correlations.length ? (
                <div className="dx-table-wrap"><table className="dx-table"><thead><tr><th>Field A</th><th>Field B</th><th>Correlation</th><th>Strength</th></tr></thead><tbody>
                  {correlations.map((item) => <tr key={`${item.x}-${item.y}`}><td>{item.x}</td><td>{item.y}</td><td>{item.correlation}</td><td>{item.strength}</td></tr>)}
                </tbody></table></div>
              ) : <div className="dx-empty">Not enough varied numeric fields for correlation analysis.</div>}
            </article>

            <article className="dx-card">
              <div className="dx-card-head"><div><h2>Trend Anomalies</h2><p>Periods that are unusually far from the trend average.</p></div></div>
              {anomalies.length ? (
                <div className="dx-table-wrap"><table className="dx-table"><thead><tr><th>Period</th><th>Value</th><th>Signal</th></tr></thead><tbody>
                  {anomalies.map((item) => <tr key={`${item.label}-${item.z_score}`}><td>{item.label}</td><td>{item.display}</td><td>{item.direction} ({item.z_score})</td></tr>)}
                </tbody></table></div>
              ) : <div className="dx-empty">{trend.length < 6 ? 'Not enough trend periods for reliable anomaly detection.' : 'No strong trend anomalies detected in the available periods.'}</div>}
            </article>
          </section>

          {/* Primary trend + secondary metric */}
          <section className="dx-grid dx-grid-a" id="dx-charts">
            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>{metric ? `${metric} Trend${hasDate ? ' Over Time' : ''}` : 'Primary Trend'}</h2>
                  <p>
                    {!metric
                      ? 'No suitable numeric metric was detected.'
                      : hasDate
                        ? `${metric} grouped by ${data.primary_date}`
                        : `Sampled ${trend.length} analysis points because no date column was detected`}
                  </p>
                </div>
                {metric && <span className="dx-tag">Primary metric</span>}
              </div>

              {trendData.length > 0 ? (
                <div className="dx-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(132,160,220,.12)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#8498b7', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: '#8498b7', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={62}
                        tickFormatter={(v) => compact(v, money1)}
                      />
                      <Tooltip
                        {...TOOLTIP_STYLE}
                        formatter={(v) => [full(v, money1), metric || 'Value']}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={metric || 'Value'}
                        stroke={COLORS[0]}
                        strokeWidth={2.8}
                        dot={{ r: 3, fill: COLORS[0], strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="dx-empty">Not enough data to draw the primary trend.</div>
              )}
            </article>

            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>{metric2 ? `${metric2} Trend` : 'Secondary Metric'}</h2>
                  <p>
                    {metric2
                      ? `${metric2} is shown separately so different units do not distort the main trend.`
                      : 'No additional numeric metric was detected.'}
                  </p>
                </div>
                {metric2 && <span className="dx-tag">Secondary metric</span>}
              </div>

              {hasSecondaryTrend ? (
                <div className="dx-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={secondaryTrendData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(132,160,220,.12)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#8498b7', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: '#8498b7', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={62}
                        tickFormatter={(v) => compact(v, money2)}
                      />
                      <Tooltip
                        {...TOOLTIP_STYLE}
                        formatter={(v) => [full(v, money2), metric2]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={metric2}
                        stroke={COLORS[1]}
                        strokeWidth={2.8}
                        dot={{ r: 3, fill: COLORS[1], strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="dx-empty">{metric2 ? 'No usable secondary trend points were returned.' : 'This dataset has only one suitable numeric metric.'}</div>
              )}
            </article>
          </section>

          {/* Category + location/state */}
          <section className="dx-grid dx-grid-a">
            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>{metric && categoryName ? `${metric} by ${categoryName}` : 'By Category'}</h2>
                  <p>
                    {metric && categoryName
                      ? `Total ${metric.toLowerCase()} in each ${categoryName.toLowerCase()}`
                      : 'No suitable category column found'}
                  </p>
                </div>
                {categories.length > 0 && <input value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} placeholder={`Filter ${categoryName || 'category'}...`} style={{ width: 150, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(132,160,220,.2)', background: '#0a1125', color: '#eef5ff' }} />}
              </div>

              {filteredCategories.length > 0 ? (
                <div className="dx-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredCategories} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(132,160,220,.12)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: '#8498b7', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: '#8498b7', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={62}
                        tickFormatter={(v) => compact(v, money1)}
                      />
                      <Tooltip
                        {...TOOLTIP_STYLE}
                        cursor={{ fill: 'rgba(132,160,220,.08)' }}
                        formatter={(v) => [full(v, money1), metric || 'Count']}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                        {filteredCategories.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                        <LabelList
                          dataKey="display"
                          position="top"
                          fill="#cfdcff"
                          fontSize={12}
                          formatter={(v) => `${money1}${v}`}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="dx-empty">No suitable category data was found for this chart.</div>
              )}
            </article>

            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>{data.location_type === 'state' ? 'State-wise Analysis' : 'Location-wise Analysis'}</h2>
                  <p>
                    {data.location_column
                      ? `${metric || 'Records'} grouped by ${data.location_column}`
                      : 'No state or location column was detected'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {data.location_column && <span className="dx-tag">{data.location_type === 'state' ? 'State' : 'Location'}</span>}
                  {locations.length > 0 && <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} placeholder="Filter location..." style={{ width: 145, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(132,160,220,.2)', background: '#0a1125', color: '#eef5ff' }} />}
                </div>
              </div>

              {filteredLocations.length > 0 ? (
                <div className="dx-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredLocations}
                      layout="vertical"
                      margin={{ top: 6, right: 16, left: 10, bottom: 4 }}
                    >
                      <CartesianGrid stroke="rgba(132,160,220,.12)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: '#8498b7', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => compact(v, money1)}
                      />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={112}
                        tick={{ fill: '#cfdcff', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        {...TOOLTIP_STYLE}
                        formatter={(v) => [full(v, money1), metric || 'Records']}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                        {filteredLocations.map((_, i) => (
                          <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                        ))}
                        <LabelList
                          dataKey="display"
                          position="right"
                          fill="#cfdcff"
                          fontSize={11}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="dx-empty">Upload a dataset containing a State, City, Region or Location column to unlock this analysis.</div>
              )}
            </article>
          </section>

          {/* Donut + insights */}
          <section className="dx-grid dx-grid-b" id="dx-insights">
            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>{categoryName ? `${categoryName} Distribution` : 'Category Distribution'}</h2>
                  <p>Share of total {metric ? metric.toLowerCase() : 'records'}</p>
                </div>
              </div>

              {distribution.length > 0 ? (
                <div className="dx-donut-wrap">
                  <div className="dx-donut">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="value"
                          nameKey="label"
                          innerRadius="64%"
                          outerRadius="94%"
                          paddingAngle={2}
                          stroke="none"
                        >
                          {distribution.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [full(v, money1), name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="dx-donut-center">
                      <small>Total {metric}</small>
                      <strong>{money1}{data.metric_total_display}</strong>
                    </div>
                  </div>

                  <ul className="dx-donut-legend">
                    {distribution.map((d, i) => (
                      <li key={d.label}>
                        <span>
                          <i style={{ background: COLORS[i % COLORS.length] }} />
                          {d.label}
                        </span>
                        <b>{d.percentage}%</b>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="dx-empty">Not enough data to show a distribution.</div>
              )}
            </article>

            <article className="dx-card">
              <div className="dx-card-head">
                <h2>✦ AI Insights</h2>
                <span className="dx-tag is-ai">Automated analysis</span>
              </div>

              <ul className="dx-insights">
                {insights.map((item, i) => {
                  const style = INSIGHT_STYLE[item.type] || INSIGHT_STYLE.quality
                  const icon = item.type === 'trend' && item.direction === 'down' ? '↘' : style.icon
                  const tone = item.type === 'trend' && item.direction === 'down' ? 'orange' : style.tone
                  return (
                    <li key={i} className={`tone-${tone}`}>
                      <div className="dx-insight-icon" aria-hidden="true">{icon}</div>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.text}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </article>
          </section>

          <section className="dx-grid dx-grid-a">
            <article className="dx-card">
              <div className="dx-card-head"><div><h2>Forecast</h2><p>Basic trend-based projection for datasets with enough valid time periods.</p></div><button className="dx-ghost" onClick={runForecast}>{forecastBusy ? 'Calculating...' : 'Generate Forecast'}</button></div>
              {!forecast ? (
                <div className="dx-empty">Click Generate Forecast to test whether this dataset supports forecasting.</div>
              ) : forecast.available ? (
                <div className="dx-forecast-wrap" style={{display:"grid",gap:12}}>
                  <div className="dx-forecast-meta" style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10}}>
                    <div><span className="dx-mini-label">Projected metric</span><strong>{forecast.metric}</strong></div>
                    <div><span className="dx-mini-label">Frequency</span><strong>{forecast.frequency}</strong></div>
                    <div><span className="dx-mini-label">Future periods</span><strong>{forecast.forecast?.length || 0}</strong></div>
                  </div>
                  <div className="dx-forecast-chart" style={{height:340,minHeight:300,width:"100%",padding:"8px 0"}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecast.chart || []} margin={{ top: 12, right: 18, left: 8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,160,220,.12)" />
                        <XAxis dataKey="label" stroke="#7185a7" tick={{ fill:'#8498b7', fontSize:11 }} minTickGap={28} />
                        <YAxis stroke="#7185a7" tick={{ fill:'#8498b7', fontSize:11 }} tickFormatter={(v) => { const n=Number(v); return Math.abs(n)>=10000000 ? `${(n/10000000).toFixed(1)}Cr` : Math.abs(n)>=100000 ? `${(n/100000).toFixed(1)}L` : Math.abs(n)>=1000 ? `${(n/1000).toFixed(1)}K` : Math.round(n).toLocaleString('en-IN') }} />
                        <Tooltip contentStyle={{ background:'#0a1125', border:'1px solid rgba(91,125,190,.28)', borderRadius:10, color:'#eef5ff' }} labelStyle={{ color:'#aebfe0' }} formatter={(value, name) => [Number(value).toLocaleString('en-IN',{maximumFractionDigits:2}), name === 'actual' ? 'Actual' : 'Forecast']} />
                        <Line type="monotone" dataKey="actual" name="Actual" stroke="#5b8cff" strokeWidth={3} dot={{ r:3 }} activeDot={{ r:6 }} connectNulls={false} />
                        <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#a56cff" strokeWidth={3} strokeDasharray="7 5" dot={{ r:3 }} activeDot={{ r:6 }} connectNulls={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="dx-forecast-legend" style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap",fontSize:12,color:"#aebfe0"}}><span><i className="actual-dot" /> Actual</span><span><i className="forecast-dot" /> Forecast</span><span className="dx-forecast-note">Trend-based estimate — not a guarantee.</span></div>
                  <div className="dx-table-wrap dx-forecast-table" style={{marginTop:4}}><table className="dx-table"><thead><tr><th>Future Period</th><th>Forecast {forecast.metric}</th></tr></thead><tbody>{forecast.forecast.map(x=><tr key={x.label}><td>{x.label}</td><td>{x.display}</td></tr>)}</tbody></table></div>
                  <p style={{color:'#8498b7',fontSize:12,marginTop:10}}>Method: {forecast.method}. Historical values are Actual; projected values are Forecast.</p>
                </div>
              ) : <div className="dx-empty">{forecast.reason}</div>}
            </article>

            <article className="dx-card" id="dx-chat">
              <div className="dx-card-head"><div><h2>✦ Chat with Your Data</h2><p>Ask questions about the uploaded dataset. If OPENAI_API_KEY is configured, InsightAI can use an LLM; otherwise it uses a deterministic analytics assistant.</p></div><span className="dx-tag is-ai">AI Assistant</span></div>
              <div style={{ maxHeight:180, overflowY:'auto', display:'grid', gap:8, marginBottom:10 }}>{chatMessages.length ? chatMessages.map((m,i)=><div key={i} style={{ padding:'9px 11px', borderRadius:10, background:m.role==='user'?'rgba(61,130,255,.10)':'rgba(43,217,160,.08)', border:'1px solid rgba(132,160,220,.12)', color:'#dce7fb', fontSize:13 }}><strong>{m.role==='user'?'You':'InsightAI'}:</strong> {m.text}</div>) : <div className="dx-empty">Try: “What is the total amount?”, “Which category is highest?”, or “How many missing values are there?”</div>}</div>
              <div style={{ display:'flex', gap:8 }}><input value={chatQuestion} onChange={(e)=>setChatQuestion(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter') askChat()}} placeholder="Ask something about your data..." style={{ flex:1, padding:'10px 12px', borderRadius:9, border:'1px solid rgba(132,160,220,.2)', background:'#0a1125', color:'#eef5ff' }} /><button className="dx-download" onClick={askChat}>{chatBusy?'...':'Ask'}</button></div>
            </article>
          </section>

          {/* Preview + column summary */}
          <section className="dx-grid dx-grid-c" id="dx-tables">
            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>Data Preview</h2>
                  <p>
                    {showAll
                      ? `First ${rows.length} of ${Number(data.total_rows).toLocaleString('en-IN')} rows`
                      : 'First 10 rows of your data'}
                  </p>
                </div>
                {preview.length > 10 && (
                  <button className="dx-ghost" onClick={() => setShowAll((s) => !s)}>
                    {showAll ? 'Show less' : 'View All Data'}
                  </button>
                )}
              </div>

              <div className={`dx-table-wrap ${showAll ? 'is-tall' : ''}`}>
                <table className="dx-table">
                  <thead>
                    <tr>
                      {columns.map((c) => (
                        <th key={c}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, r) => (
                      <tr key={r}>
                        {columns.map((c) => (
                          <td key={c}>{renderCell(row[c], c)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="dx-card">
              <div className="dx-card-head">
                <div>
                  <h2>Column Summary</h2>
                  <p>Data type and basic information</p>
                </div>
              </div>

              <div className="dx-table-wrap">
                <table className="dx-table">
                  <thead>
                    <tr>
                      <th>Column Name</th>
                      <th>Detected Type</th>
                      <th>Data Type</th>
                      <th>Missing Values</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((c) => (
                      <tr key={c.name}>
                        <td>
                          {c.name}
                          {identifierColumns.includes(c.name) && <span className="dx-tag" style={{ marginLeft: 7 }}>ID</span>}
                        </td>
                        <td>{c.detected_type || (identifierColumns.includes(c.name) ? 'Identifier' : 'Field')}</td>
                        <td>{c.dtype}</td>
                        <td className={c.missing > 0 ? 'dx-warn' : ''}>{Number(c.missing).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {statSummary.length > 0 && (
                <div style={{ marginTop: 16 }}><strong style={{ color: '#eef5ff' }}>Numeric Summary</strong><div className="dx-table-wrap" style={{ marginTop: 8 }}><table className="dx-table"><thead><tr><th>Column</th><th>Mean</th><th>Median</th><th>Min</th><th>Max</th></tr></thead><tbody>{statSummary.map((item) => <tr key={item.column}><td>{item.column}</td><td>{item.mean}</td><td>{item.median}</td><td>{item.min}</td><td>{item.max}</td></tr>)}</tbody></table></div></div>
              )}

              <button className="dx-download" onClick={downloadReport}>
                ⬇ Download Report
              </button>
            </article>
          </section>
        </main>
      </div>

      {notice && (
        <div className="dx-notice" role="status">
          {notice}
        </div>
      )}
    </div>
  )
}

function DetectionRow({ label, value }) {
  return (
    <div style={{ padding: '10px 12px', border: '1px solid rgba(132,160,220,.12)', borderRadius: 10, background: 'rgba(10,17,37,.34)' }}>
      <span style={{ display: 'block', color: '#8498b7', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
      <strong style={{ display: 'block', marginTop: 4, color: '#eef5ff', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(value)}>{value}</strong>
    </div>
  )
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}

function DashboardMetric({ title, value, note, danger = false }) {
  return (
    <div className="dashboard-metric">
      <span>{title}</span>
      <strong>{value}</strong>
      <small className={danger ? 'danger' : ''}>{note}</small>
    </div>
  )
}

function FaqQuestion({ question, answer }) {
  return (
    <article className="glass-card faq-card">
      <h3>{question}</h3>
      <p>{answer}</p>
    </article>
  )
}

export default App