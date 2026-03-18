import { useState, useEffect, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from "recharts";

import { loadData, saveData, exportData, importData } from './storage.js';

// ═══════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════
const DEFAULT_DATA = {
  // ── SCORECARD (8421 Goals) ──
  scorecard: {
    outreach: {
      metrics: [
        { name: "Website Views", weight: 0.15, goal: 1147, values: { Jan: 1074, Feb: 905 } },
        { name: "Company LinkedIn Impressions", weight: 0.20, goal: 1732, values: { Jan: 1941, Feb: 619 } },
        { name: "Marketing Contacts", weight: 0.30, goal: 30, values: { Jan: 148, Feb: 315 } },
        { name: "Marketing Email Opens", weight: 0.15, goal: 1178, values: { Jan: 1454, Feb: 1286 } },
        { name: "Pamphlets Sent", weight: 0.10, goal: 22, values: { Jan: 10, Feb: 0 } },
        { name: "LinkedIn Personal Followers", weight: 0.10, goal: 22, values: { Jan: 30, Feb: 32 } },
      ]
    },
    cx: {
      metrics: [
        { name: "Industry Emails (6 pts/mo)", weight: 0.30, goal: 6, values: { Jan: 6, Feb: 6 } },
        { name: "Website Content (quarterly)", weight: 0.20, goal: 1, values: { Jan: 1, Feb: 1 } },
        { name: "Catalog/Trifold (quarterly)", weight: 0.20, goal: 1, values: { Jan: 1, Feb: 0 } },
        { name: "Post Install Follow-Through %", weight: 0.30, goal: 1, values: { Jan: 0, Feb: 0 } },
      ]
    }
  },
  // ── PROSPECTING ──
  prospecting: [
    { id: "p1", name: "Welltower / StoryPoint / Ventas", tier: 1, category: "Senior Living", revenue: "$14B+ acquisitions", timeline: "Q2 2026",
      contacts: [{ name: "Tim Bryant", title: "President, StoryPoint", email: "", status: "Not in Apollo", location: "Ohio" }],
      tasks: [
        { desc: "Find Tim Bryant on LinkedIn; add to Apollo", status: "Not Started" },
        { desc: "Map StoryPoint communities to serviceable geography", status: "Not Started" },
        { desc: "Research Welltower acquisition targets in footprint", status: "Not Started" },
        { desc: "Identify VP Ops, VP Procurement, Regional Directors", status: "Not Started" },
        { desc: "Build Welltower corporate procurement target list (Toledo HQ)", status: "Not Started" },
        { desc: "Research Ventas $2.2B acquisitions for local overlap", status: "Not Started" },
        { desc: "Craft RIDEA transition outreach angle", status: "Not Started" },
        { desc: "Prepare multi-community rollout capabilities deck", status: "Not Started" },
      ]},
    { id: "p2", name: "H.O.P.E. Campus / The Centers", tier: 1, category: "Institutional", revenue: "$14M renovation", timeline: "Immediate",
      contacts: [{ name: "Christie Tatman-Stroh", title: "CAO", email: "christie.tatmanstroh@thecentersohio.org", status: "Added 3/18", location: "Cleveland, OH" }],
      tasks: [
        { desc: "Reach out to Christie Tatman-Stroh (CAO)", status: "Not Started" },
        { desc: "Research GC and architect on renovation", status: "Not Started" },
        { desc: "Contact Cuyahoga County procurement office", status: "Not Started" },
        { desc: "Prepare FF&E proposal (residential, school, clinical)", status: "Not Started" },
        { desc: "Determine procurement path — RFP vs. vendor discretion", status: "Not Started" },
        { desc: "Identify additional contacts: COO, Facilities Director", status: "Not Started" },
      ]},
    { id: "p3", name: "Edward Rose & Sons", tier: 2, category: "Multifamily", revenue: "$250M revenue co.", timeline: "Q2 2026",
      contacts: [{ name: "13 contacts in Apollo", title: "Various — Director+", email: "Multiple", status: "In DB", location: "Bloomfield Hills, MI" }],
      tasks: [
        { desc: "Review 13 Apollo contacts — identify warm signals", status: "Not Started" },
        { desc: "Activate 2 unsent contacts immediately", status: "Not Started" },
        { desc: "Research current & upcoming development projects", status: "Not Started" },
        { desc: "Target Dir. of Purchasing, VP Construction", status: "Not Started" },
        { desc: "Develop standardized FF&E package pitch", status: "Not Started" },
        { desc: "Investigate preferred vendor list process", status: "Not Started" },
      ]},
    { id: "p4", name: "Town Square Adult Day", tier: 2, category: "Senior Living", revenue: "Standardization play", timeline: "Q2-Q3 2026",
      contacts: [{ name: "Gerry Gavin", title: "Dir. Business Development", email: "ggavin@townsquare.net", status: "Added 3/18", location: "New Jersey" }],
      tasks: [
        { desc: "Reach out to Gerry Gavin", status: "Not Started" },
        { desc: "Study townsquare.net themed environment concept", status: "Not Started" },
        { desc: "Develop standardization proposal per storefront type", status: "Not Started" },
        { desc: "Pitch efficiency angle for construction budgets", status: "Not Started" },
        { desc: "Offer proof-of-concept at favorable terms", status: "Not Started" },
      ]},
    { id: "p5", name: "Aria Senior Living", tier: 2, category: "Senior Living", revenue: "Local operator", timeline: "Active",
      contacts: [{ name: "Derek Hansen", title: "Owner/Operator", email: "derek@ariacares.com", status: "In DB — 0 outreach", location: "Gates Mills, OH" }],
      tasks: [
        { desc: "Follow up with Mike Cozart (N2) for warm intro", status: "Not Started" },
        { desc: "Send direct email if intro stalls (2 weeks)", status: "Not Started" },
        { desc: "Research Aria communities & expansion plans", status: "Not Started" },
        { desc: "Add Derek to Apollo sequence as backup", status: "Not Started" },
      ]},
    { id: "p6", name: "Sunrise of Parma", tier: 2, category: "Senior Living", revenue: "National chain, local ED", timeline: "Fix Sendgrid first",
      contacts: [{ name: "Rima Hansen", title: "Executive Director", email: "rima.hansen@sunriseseniorliving.com", status: "In DB — seq FAILED", location: "Cleveland, OH" }],
      tasks: [
        { desc: "FIX SENDGRID EMAIL ISSUE IN APOLLO", status: "Not Started" },
        { desc: "Re-add Rima to working sequence / send direct email", status: "Not Started" },
        { desc: "Engage with Rima's LinkedIn content", status: "Not Started" },
        { desc: "Research Sunrise of Parma refresh cycles", status: "Not Started" },
        { desc: "Identify Sunrise national procurement contacts", status: "Not Started" },
      ]},
    { id: "p7", name: "SLK Capital / Ridgeville Farms", tier: 3, category: "Development", revenue: "Emerging — new build", timeline: "Q2 2026",
      contacts: [{ name: "Ryan Kozak", title: "Principal (assumed)", email: "", status: "Not in Apollo", location: "North Ridgeville" }],
      tasks: [
        { desc: "Research SLK Capital & Ryan Kozak on LinkedIn", status: "Not Started" },
        { desc: "Determine Ridgeville Farms development scope", status: "Not Started" },
        { desc: "Reach out to RDL Architects separately", status: "Not Started" },
        { desc: "Add Ryan Kozak to Apollo once found", status: "Not Started" },
        { desc: "Send cold outreach referencing project", status: "Not Started" },
      ]},
    { id: "p8", name: "Kirk Gibson Foundation", tier: 3, category: "Nonprofit", revenue: "Relationship play", timeline: "Q2 2026",
      contacts: [{ name: "Steve Annear", title: "CEO", email: "steve@kirkgibsonfoundation.org", status: "Added 3/18", location: "Birmingham, MI" }],
      tasks: [
        { desc: "Send personal cold email to Steve Annear", status: "Not Started" },
        { desc: "Offer FF&E/signage donation for event or facility", status: "Not Started" },
        { desc: "Attend upcoming foundation event", status: "Not Started" },
        { desc: "Research facility/event FF&E needs", status: "Not Started" },
      ]},
  ],
  // ── TRADE SHOWS ──
  tradeShows: [
    { id: "ts1", name: "Design Ohio", industry: "A&D", cost: 650, date: "Feb 2026", location: "Akron", priority: "HIGH", status: "CONFIRMED", leads: 0, meetings: 0, revenue: 0, notes: "" },
    { id: "ts2", name: "OASC", industry: "SL", cost: 300, date: "Mar 2026", location: "Newark, OH", priority: "MEDIUM", status: "RECOMMENDED", leads: 0, meetings: 0, revenue: 0, notes: "" },
    { id: "ts3", name: "OHCA", industry: "SL", cost: 2825, date: "May 2026", location: "Westerville", priority: "HIGH", status: "RECOMMENDED", leads: 0, meetings: 0, revenue: 0, notes: "" },
    { id: "ts4", name: "NeOHcon", industry: "A&D", cost: 282, date: "Oct 2026", location: "Cleveland", priority: "MEDIUM", status: "CONFIRMED", leads: 0, meetings: 0, revenue: 0, notes: "" },
    { id: "ts5", name: "OLC", industry: "Library", cost: 1500, date: "Oct 2026", location: "Kalahari", priority: "HIGH", status: "CONFIRMED", leads: 0, meetings: 0, revenue: 0, notes: "" },
    { id: "ts6", name: "ToledoCon", industry: "A&D", cost: 0, date: "Nov 2026", location: "Toledo", priority: "LOW", status: "OPTIONAL", leads: 0, meetings: 0, revenue: 0, notes: "" },
    { id: "ts7", name: "Ohio Housing", industry: "AH", cost: 3100, date: "Dec 2026", location: "TBD", priority: "HIGH", status: "CONFIRMED", leads: 0, meetings: 0, revenue: 0, notes: "" },
    { id: "ts8", name: "AHF Live", industry: "AH", cost: 6950, date: "Nov 2026", location: "Chicago", priority: "HIGH", status: "CONFIRMED", leads: 0, meetings: 0, revenue: 0, notes: "" },
  ],
  // ── EMAIL CALENDAR ──
  emails: [],
  // ── LINKEDIN ──
  linkedin: [],
  // ── REBRAND ──
  rebrand: [
    { id: "rb1", phase: "1. LOGO", task: "Logo concepts (3-5 options)", start: "Mar 1", end: "Mar 15", owner: "Designer/Josh", status: "Not Started" },
    { id: "rb2", phase: "1. LOGO", task: "Logo refinement & selection", start: "Mar 15", end: "Mar 31", owner: "Team/Zack", status: "Not Started" },
    { id: "rb3", phase: "1. LOGO", task: "Final logo files (all formats)", start: "Apr 1", end: "Apr 7", owner: "Designer", status: "Not Started" },
    { id: "rb4", phase: "2. COLORS", task: "Brand color palette", start: "Apr 8", end: "Apr 15", owner: "Claude/Josh", status: "Not Started" },
    { id: "rb5", phase: "2. COLORS", task: "Brand guidelines document", start: "Apr 15", end: "Apr 30", owner: "Claude", status: "Not Started" },
    { id: "rb6", phase: "3. WEBSITE", task: "Sitemap & wireframes", start: "May 1", end: "May 15", owner: "Claude", status: "Not Started" },
    { id: "rb7", phase: "3. WEBSITE", task: "Homepage design", start: "May 15", end: "May 31", owner: "Claude", status: "Not Started" },
    { id: "rb8", phase: "3. WEBSITE", task: "Industry pages (8)", start: "Jun 1", end: "Jun 30", owner: "Claude", status: "Not Started" },
    { id: "rb9", phase: "3. WEBSITE", task: "Portfolio/project pages", start: "Jul 1", end: "Jul 15", owner: "Claude/Josh", status: "Not Started" },
    { id: "rb10", phase: "3. WEBSITE", task: "Photos", start: "Jul 15", end: "Jul 31", owner: "Claude", status: "Not Started" },
    { id: "rb11", phase: "3. WEBSITE", task: "Testing & QA", start: "Aug 1", end: "Aug 15", owner: "Team", status: "Not Started" },
    { id: "rb12", phase: "3. WEBSITE", task: "Launch", start: "Aug 15", end: "Aug 31", owner: "Josh", status: "Not Started" },
    { id: "rb13", phase: "4. COLLATERAL", task: "Marketing materials update", start: "Sep 1", end: "Sep 7", owner: "Josh", status: "Not Started" },
    { id: "rb14", phase: "4. COLLATERAL", task: "Business cards reorder", start: "Sep 1", end: "Sep 15", owner: "Josh", status: "Not Started" },
    { id: "rb15", phase: "4. COLLATERAL", task: "Trade show banners", start: "Sep 15", end: "Oct 1", owner: "Josh", status: "Not Started" },
  ],
  // ── SIGNAGE ──
  signage: {
    targets: { Q1: 200000, Q2: 300000, Q3: 350000, Q4: 350000 },
    actuals: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
    tactics: [
      { desc: "Trade Show Signage Presence — samples at ALL shows", priority: "HIGH", status: "Not Started" },
      { desc: "Triumph AHF Booth Partnership — co-branded booth", priority: "HIGH", status: "Not Started" },
      { desc: "'One Stop Shop' Messaging — FF&E + Signage", priority: "HIGH", status: "Not Started" },
      { desc: "Related Affordable Case Studies", priority: "MEDIUM", status: "Not Started" },
      { desc: "Email Campaign — Signage Focus to AH/Commercial", priority: "MEDIUM", status: "Not Started" },
      { desc: "LinkedIn Content — Signage project spotlights", priority: "MEDIUM", status: "Not Started" },
      { desc: "Architect/GC Outreach — single-source procurement", priority: "HIGH", status: "Not Started" },
      { desc: "Website Signage Page — dedicated capability page", priority: "HIGH", status: "Not Started" },
    ]
  },
  // ── INBOX ──
  inbox: [],
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TIER_C = { 1: "#e74c3c", 2: "#f0a030", 3: "#27ae60" };
const STATUS_C = { "Not Started": "#5a6068", "In Progress": "#f0a030", "Done": "#2ecc71", "Blocked": "#e74c3c" };
const PRI_C = { HIGH: "#e74c3c", MEDIUM: "#f0a030", LOW: "#27ae60" };

// ═══════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════
const S = {
  card: { background: "rgba(50,42,32,0.7)", border: "1px solid rgba(192,118,60,0.12)", borderRadius: 12, padding: "16px 20px" },
  cardHover: { borderColor: "rgba(192,118,60,0.35)" },
  kpi: { background: "linear-gradient(135deg, rgba(50,42,32,0.9) 0%, rgba(40,34,26,0.9) 100%)", border: "1px solid rgba(192,118,60,0.15)", borderRadius: 12, padding: "16px 20px", position: "relative", overflow: "hidden" },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: "#c0763c", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 },
  input: { background: "rgba(30,26,21,0.8)", border: "1px solid rgba(192,118,60,0.2)", borderRadius: 8, padding: "8px 12px", color: "#e8ddd0", fontSize: 13, width: "100%", outline: "none", fontFamily: "inherit" },
  select: { background: "rgba(30,26,21,0.8)", border: "1px solid rgba(192,118,60,0.2)", borderRadius: 8, padding: "8px 12px", color: "#e8ddd0", fontSize: 12, outline: "none", fontFamily: "inherit", cursor: "pointer" },
  btn: { background: "rgba(192,118,60,0.2)", border: "1px solid rgba(192,118,60,0.4)", color: "#c0763c", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" },
  btnPrimary: { background: "rgba(192,118,60,0.35)", border: "1px solid rgba(192,118,60,0.6)", color: "#f0e6d8", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" },
  btnDanger: { background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", color: "#e74c3c", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" },
  badge: (color) => ({ fontSize: 10, padding: "2px 10px", borderRadius: 5, background: `${color}22`, color, fontWeight: 600 }),
  dim: { fontSize: 11, color: "#6a6058" },
  sub: { fontSize: 11, color: "#8a7e70" },
  label: { fontSize: 11, color: "#8a7e70", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 },
};

const KpiCard = ({ icon, label, value, sub }) => (
  <div style={S.kpi}>
    <div style={{ position: "absolute", top: 10, right: 14, fontSize: 26, opacity: 0.25 }}>{icon}</div>
    <div style={S.label}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: "#f0e6d8", lineHeight: 1, marginTop: 4 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#c0763c", marginTop: 6 }}>{sub}</div>}
  </div>
);

const StatusBadge = ({ status }) => <span style={S.badge(STATUS_C[status] || "#888")}>{status}</span>;

const TaskRow = ({ task, onCycle, onDelete }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, background: task.status === "Done" ? "rgba(46,204,113,0.05)" : "rgba(50,42,32,0.4)", border: `1px solid ${task.status === "Done" ? "rgba(46,204,113,0.15)" : "rgba(192,118,60,0.08)"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 4 }}>
    <div onClick={onCycle} style={{ width: 22, height: 22, borderRadius: 5, background: STATUS_C[task.status] || "#555", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
      {task.status === "Done" ? "✓" : task.status === "In Progress" ? "→" : task.status === "Blocked" ? "!" : "○"}
    </div>
    <div style={{ flex: 1, fontSize: 13, color: task.status === "Done" ? "#6a6058" : "#e8ddd0", textDecoration: task.status === "Done" ? "line-through" : "none" }}>{task.desc}</div>
    <StatusBadge status={task.status} />
    {onDelete && <button onClick={onDelete} style={{ ...S.btnDanger, padding: "3px 8px", fontSize: 10 }}>✕</button>}
  </div>
);

const AddTaskInput = ({ onAdd, placeholder }) => {
  const [v, setV] = useState("");
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); }}} placeholder={placeholder || "Add new task..."} style={{ ...S.input, flex: 1 }} />
      <button onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); }}} style={S.btnPrimary}>+ Add</button>
    </div>
  );
};

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "scorecard", label: "8421 Goals", icon: "🎯" },
  { id: "prospecting", label: "Prospecting", icon: "🔍" },
  { id: "tradeshows", label: "Trade Shows", icon: "🎪" },
  { id: "emails", label: "Email Mktg", icon: "📧" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "rebrand", label: "Rebrand", icon: "🎨" },
  { id: "signage", label: "Signage", icon: "🪧" },
  { id: "inbox", label: "Inbox", icon: "📥" },
];

export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState(null);
  const saveTimeout = useRef(null);

  useEffect(() => {
    loadData().then(d => { setData(d || DEFAULT_DATA); setLoading(false); });
  }, []);

  const update = useCallback((fn) => {
    setData(prev => {
      const next = fn(JSON.parse(JSON.stringify(prev)));
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => saveData(next), 500);
      return next;
    });
  }, []);

  if (loading || !data) return <div style={{ background: "#1a1612", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#c0763c", fontSize: 16 }}>Loading dashboard...</div>;

  const cycleStatus = (current) => {
    const order = ["Not Started", "In Progress", "Done", "Blocked"];
    return order[(order.indexOf(current) + 1) % order.length];
  };

  // ── COMPUTED STATS ──
  const allProspectTasks = data.prospecting.flatMap(p => p.tasks);
  const allRebrandTasks = data.rebrand;
  const allSignageTactics = data.signage.tactics;
  const totalTasks = allProspectTasks.length + allRebrandTasks.length + allSignageTactics.length;
  const doneTasks = [...allProspectTasks, ...allRebrandTasks, ...allSignageTactics].filter(t => t.status === "Done").length;
  const inProgTasks = [...allProspectTasks, ...allRebrandTasks, ...allSignageTactics].filter(t => t.status === "In Progress").length;
  const totalShowCost = data.tradeShows.reduce((s, t) => s + (t.cost || 0), 0);
  const totalShowLeads = data.tradeShows.reduce((s, t) => s + (t.leads || 0), 0);

  const calcScore = (metrics) => {
    return (month) => {
      let score = 0;
      metrics.forEach(m => {
        const val = m.values[month];
        if (val !== undefined && val !== null && m.goal > 0) {
          score += m.weight * (val / m.goal);
        }
      });
      return score;
    };
  };

  // ═══════════════════════════════════════
  // OVERVIEW TAB
  // ═══════════════════════════════════════
  const OverviewTab = () => {
    const outScore = calcScore(data.scorecard.outreach.metrics);
    const cxScore = calcScore(data.scorecard.cx.metrics);
    const scoreData = MONTHS.filter(m => {
      return data.scorecard.outreach.metrics.some(met => met.values[m] !== undefined);
    }).map(m => ({ month: m, outreach: +(outScore(m).toFixed(2)), cx: +(cxScore(m).toFixed(2)) }));

    const statusData = [
      { name: "Not Started", value: totalTasks - doneTasks - inProgTasks, fill: "#5a6068" },
      { name: "In Progress", value: inProgTasks, fill: "#f0a030" },
      { name: "Done", value: doneTasks, fill: "#2ecc71" },
    ].filter(d => d.value > 0);

    const signageTarget = Object.values(data.signage.targets).reduce((a, b) => a + b, 0);
    const signageActual = Object.values(data.signage.actuals).reduce((a, b) => a + b, 0);

    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          <KpiCard icon="🏢" label="Opportunities" value={data.prospecting.length} sub={`${data.prospecting.filter(p=>p.tier===1).length} Tier 1`} />
          <KpiCard icon="📋" label="Total Tasks" value={totalTasks} sub={`${doneTasks} done · ${inProgTasks} active`} />
          <KpiCard icon="🎯" label="Outreach Score" value={scoreData.length > 0 ? scoreData[scoreData.length-1].outreach : "—"} sub="Target: ≥1.0" />
          <KpiCard icon="🪧" label="Signage Revenue" value={`$${(signageActual/1000).toFixed(0)}K`} sub={`Target: $${(signageTarget/1000).toFixed(0)}K`} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {/* Scorecard Trend */}
          <div style={S.card}>
            <div style={S.sectionTitle}>Monthly Score Trend</div>
            <ResponsiveContainer height={180}>
              <AreaChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,118,60,0.1)" />
                <XAxis dataKey="month" tick={{ fill: "#8a7e70", fontSize: 10 }} axisLine={false} />
                <YAxis tick={{ fill: "#8a7e70", fontSize: 10 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "#2a2219", border: "1px solid #c0763c44", borderRadius: 8, color: "#e8ddd0", fontSize: 12 }} />
                <Area type="monotone" dataKey="outreach" stroke="#c0763c" fill="rgba(192,118,60,0.15)" strokeWidth={2} name="Outreach" />
                <Area type="monotone" dataKey="cx" stroke="#2ecc71" fill="rgba(46,204,113,0.1)" strokeWidth={2} name="CX" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Task Donut */}
          <div style={S.card}>
            <div style={S.sectionTitle}>Task Completion</div>
            <div style={{ position: "relative", height: 180 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value" stroke="none">
                    {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#2a2219", border: "1px solid #c0763c44", borderRadius: 8, color: "#e8ddd0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f0e6d8" }}>{totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0}%</div>
                <div style={{ fontSize: 9, color: "#8a7e70" }}>Complete</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              {statusData.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#8a7e70" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.fill }} />{s.name} ({s.value})
                </div>
              ))}
            </div>
          </div>

          {/* Trade Show ROI */}
          <div style={S.card}>
            <div style={S.sectionTitle}>Trade Show Investment</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ background: "rgba(30,26,21,0.6)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#f0e6d8" }}>${(totalShowCost/1000).toFixed(1)}K</div>
                <div style={{ fontSize: 9, color: "#8a7e70" }}>Total Spend</div>
              </div>
              <div style={{ background: "rgba(30,26,21,0.6)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#f0e6d8" }}>{totalShowLeads}</div>
                <div style={{ fontSize: 9, color: "#8a7e70" }}>Leads Captured</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#8a7e70", marginBottom: 6 }}>Upcoming Shows:</div>
            {data.tradeShows.filter(t => t.status !== "REMOVE").slice(0, 4).map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid rgba(192,118,60,0.06)" }}>
                <span style={{ fontSize: 11, color: "#a89a88" }}>{t.name}</span>
                <span style={{ fontSize: 10, color: "#6a6058" }}>{t.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={S.sectionTitle}>Quick Navigation</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {TABS.filter(t => t.id !== "overview").map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{ ...S.card, cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(192,118,60,0.4)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(192,118,60,0.12)"}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e8ddd0" }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // SCORECARD TAB (8421 Goals)
  // ═══════════════════════════════════════
  const ScorecardTab = () => {
    const renderMetrics = (title, metrics, path) => {
      const calcFn = calcScore(metrics);
      return (
        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={S.sectionTitle}>{title}</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px 10px", color: "#8a7e70", fontSize: 10, borderBottom: "1px solid rgba(192,118,60,0.1)" }}>Metric</th>
                  <th style={{ textAlign: "center", padding: "8px 6px", color: "#8a7e70", fontSize: 10, borderBottom: "1px solid rgba(192,118,60,0.1)", width: 50 }}>Wt</th>
                  <th style={{ textAlign: "center", padding: "8px 6px", color: "#8a7e70", fontSize: 10, borderBottom: "1px solid rgba(192,118,60,0.1)", width: 60 }}>Goal</th>
                  {MONTHS.map(m => <th key={m} style={{ textAlign: "center", padding: "8px 4px", color: "#8a7e70", fontSize: 10, borderBottom: "1px solid rgba(192,118,60,0.1)", width: 55 }}>{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, mi) => (
                  <tr key={mi}>
                    <td style={{ padding: "6px 10px", color: "#e8ddd0", borderBottom: "1px solid rgba(192,118,60,0.06)" }}>{m.name}</td>
                    <td style={{ textAlign: "center", padding: "6px", color: "#8a7e70", borderBottom: "1px solid rgba(192,118,60,0.06)" }}>{(m.weight * 100).toFixed(0)}%</td>
                    <td style={{ textAlign: "center", padding: "6px", color: "#c0763c", fontWeight: 600, borderBottom: "1px solid rgba(192,118,60,0.06)" }}>{m.goal.toLocaleString()}</td>
                    {MONTHS.map(month => {
                      const val = m.values[month];
                      const ratio = val !== undefined && m.goal > 0 ? val / m.goal : null;
                      const color = ratio === null ? "#3a3228" : ratio >= 1 ? "#2ecc71" : ratio >= 0.7 ? "#f0a030" : "#e74c3c";
                      return (
                        <td key={month} style={{ textAlign: "center", padding: "4px 2px", borderBottom: "1px solid rgba(192,118,60,0.06)" }}>
                          <input
                            type="number"
                            value={val !== undefined ? val : ""}
                            placeholder="—"
                            onChange={e => {
                              const v = e.target.value === "" ? undefined : Number(e.target.value);
                              update(d => {
                                d.scorecard[path].metrics[mi].values[month] = v;
                                return d;
                              });
                            }}
                            style={{ background: val !== undefined ? `${color}18` : "transparent", border: `1px solid ${val !== undefined ? `${color}44` : "rgba(192,118,60,0.08)"}`, borderRadius: 5, padding: "4px 2px", color: "#e8ddd0", fontSize: 11, width: 48, textAlign: "center", outline: "none", fontFamily: "inherit" }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ padding: "8px 10px", fontWeight: 700, color: "#c0763c", borderTop: "2px solid rgba(192,118,60,0.2)" }}>SCORE (Target: ≥1.0)</td>
                  {MONTHS.map(month => {
                    const score = calcFn(month);
                    const hasData = metrics.some(m => m.values[month] !== undefined);
                    return (
                      <td key={month} style={{ textAlign: "center", padding: "8px 4px", borderTop: "2px solid rgba(192,118,60,0.2)" }}>
                        {hasData ? (
                          <span style={{ fontWeight: 800, fontSize: 13, color: score >= 1 ? "#2ecc71" : score >= 0.7 ? "#f0a030" : "#e74c3c" }}>
                            {score.toFixed(2)}
                          </span>
                        ) : <span style={{ color: "#3a3228" }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f0e6d8" }}>8421 Goals — Monthly Scorecard</h2>
            <div style={S.sub}>Track weighted metrics monthly. Click any cell to enter data.</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ ...S.kpi, padding: "10px 16px" }}>
              <div style={{ fontSize: 9, color: "#8a7e70" }}>2026 GOALS</div>
              <div style={{ fontSize: 12, color: "#e8ddd0", marginTop: 2 }}>Signage: <b style={{ color: "#c0763c" }}>$1.2M</b></div>
              <div style={{ fontSize: 12, color: "#e8ddd0" }}>FF&E: <b style={{ color: "#c0763c" }}>$13.8M</b></div>
            </div>
          </div>
        </div>
        {renderMetrics("Outreach Metrics", data.scorecard.outreach.metrics, "outreach")}
        {renderMetrics("Customer Experience Metrics", data.scorecard.cx.metrics, "cx")}
      </div>
    );
  };

  // ═══════════════════════════════════════
  // PROSPECTING TAB
  // ═══════════════════════════════════════
  const ProspectingTab = () => {
    if (detailId) {
      const proj = data.prospecting.find(p => p.id === detailId);
      if (!proj) { setDetailId(null); return null; }
      const done = proj.tasks.filter(t => t.status === "Done").length;
      return (
        <div>
          <button onClick={() => setDetailId(null)} style={S.btn}>← Back to Pipeline</button>
          <div style={{ ...S.card, marginTop: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={S.badge(TIER_C[proj.tier])}>TIER {proj.tier}</span>
                  <span style={{ ...S.badge("#888"), background: "rgba(192,118,60,0.1)" }}>{proj.category}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: 20, color: "#f0e6d8" }}>{proj.name}</h2>
                <div style={{ ...S.sub, marginTop: 4 }}>{proj.revenue} · {proj.timeline}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: TIER_C[proj.tier] }}>{proj.tasks.length > 0 ? Math.round((done/proj.tasks.length)*100) : 0}%</div>
                <div style={S.dim}>complete</div>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div style={S.sectionTitle}>Contacts</div>
          {proj.contacts.map((c, i) => (
            <div key={i} style={{ ...S.card, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f0e6d8" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#a89a88" }}>{c.title}</div>
                {c.email && <div style={{ fontSize: 11, color: "#c0763c" }}>📧 {c.email}</div>}
              </div>
              <span style={S.badge(c.email ? "#2ecc71" : "#e74c3c")}>{c.status}</span>
            </div>
          ))}

          {/* Tasks */}
          <div style={{ ...S.sectionTitle, marginTop: 16 }}>Action Items</div>
          {proj.tasks.map((t, i) => (
            <TaskRow key={i} task={t}
              onCycle={() => update(d => { const p = d.prospecting.find(x => x.id === detailId); p.tasks[i].status = cycleStatus(p.tasks[i].status); return d; })}
              onDelete={() => update(d => { const p = d.prospecting.find(x => x.id === detailId); p.tasks.splice(i, 1); return d; })}
            />
          ))}
          <AddTaskInput onAdd={(desc) => update(d => { const p = d.prospecting.find(x => x.id === detailId); p.tasks.push({ desc, status: "Not Started" }); return d; })} />
        </div>
      );
    }

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f0e6d8" }}>Prospecting Pipeline</h2>
          <button onClick={() => {
            const name = prompt("Opportunity name:");
            if (name) update(d => { d.prospecting.push({ id: `p${Date.now()}`, name, tier: 2, category: "Other", revenue: "", timeline: "", contacts: [], tasks: [] }); return d; });
          }} style={S.btnPrimary}>+ New Opportunity</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {data.prospecting.map(p => {
            const done = p.tasks.filter(t => t.status === "Done").length;
            const pct = p.tasks.length > 0 ? Math.round((done / p.tasks.length) * 100) : 0;
            return (
              <div key={p.id} onClick={() => setDetailId(p.id)} style={{ ...S.card, cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(192,118,60,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(192,118,60,0.12)"}>
                <div style={{ position: "absolute", top: 0, left: 0, width: `${pct}%`, height: 3, background: TIER_C[p.tier] }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f0e6d8" }}>{p.name}</div>
                  <span style={S.badge(TIER_C[p.tier])}>T{p.tier}</span>
                </div>
                <div style={S.dim}>{p.category} · {p.revenue}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                  <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: TIER_C[p.tier], borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: TIER_C[p.tier] }}>{pct}%</span>
                </div>
                <div style={{ ...S.dim, marginTop: 6 }}>✅ {done}/{p.tasks.length} tasks · {p.contacts.length > 0 ? (p.contacts[0].email ? "📧" : "⚠️") : "—"} {p.contacts[0]?.name || "No contact"}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // TRADE SHOWS TAB
  // ═══════════════════════════════════════
  const TradeShowsTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f0e6d8" }}>Trade Shows</h2>
          <div style={S.sub}>Budget: $20,000 · Committed: ${totalShowCost.toLocaleString()} · Buffer: ${(20000 - totalShowCost).toLocaleString()}</div>
        </div>
        <button onClick={() => {
          const name = prompt("Show name:");
          if (name) update(d => { d.tradeShows.push({ id: `ts${Date.now()}`, name, industry: "", cost: 0, date: "", location: "", priority: "MEDIUM", status: "TBD", leads: 0, meetings: 0, revenue: 0, notes: "" }); return d; });
        }} style={S.btnPrimary}>+ Add Show</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {data.tradeShows.map((ts, i) => (
          <div key={ts.id} style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f0e6d8" }}>{ts.name}</div>
              <span style={S.badge(PRI_C[ts.priority] || "#888")}>{ts.priority}</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <span style={S.dim}>{ts.industry}</span>
              <span style={S.dim}>📍 {ts.location}</span>
              <span style={S.dim}>📅 {ts.date}</span>
              <span style={S.dim}>${ts.cost.toLocaleString()}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
              {[["Leads", "leads"], ["Meetings", "meetings"], ["Revenue", "revenue"]].map(([label, key]) => (
                <div key={key} style={{ background: "rgba(30,26,21,0.5)", borderRadius: 6, padding: "6px 8px" }}>
                  <div style={{ fontSize: 9, color: "#8a7e70" }}>{label}</div>
                  <input type="number" value={ts[key] || ""} placeholder="0"
                    onChange={e => update(d => { d.tradeShows[i][key] = Number(e.target.value) || 0; return d; })}
                    style={{ background: "transparent", border: "none", color: "#f0e6d8", fontSize: 16, fontWeight: 700, width: "100%", outline: "none", fontFamily: "inherit" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <select value={ts.status} onChange={e => update(d => { d.tradeShows[i].status = e.target.value; return d; })} style={{ ...S.select, flex: 1, fontSize: 11 }}>
                {["CONFIRMED","RECOMMENDED","OPTIONAL","TBD","COMPLETED","REMOVE"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => update(d => { d.tradeShows.splice(i, 1); return d; })} style={S.btnDanger}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // REBRAND TAB
  // ═══════════════════════════════════════
  const RebrandTab = () => {
    const phases = [...new Set(data.rebrand.map(t => t.phase))];
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f0e6d8" }}>Rebrand Timeline</h2>
            <div style={S.sub}>Budget: $9,000 · Mar–Aug 2026 · Wix Platform</div>
          </div>
          <button onClick={() => {
            const task = prompt("Task description:");
            if (task) update(d => { d.rebrand.push({ id: `rb${Date.now()}`, phase: "Other", task, start: "", end: "", owner: "Josh", status: "Not Started" }); return d; });
          }} style={S.btnPrimary}>+ Add Task</button>
        </div>
        {phases.map(phase => {
          const items = data.rebrand.filter(t => t.phase === phase);
          const done = items.filter(t => t.status === "Done").length;
          return (
            <div key={phase} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#c0763c" }}>{phase}</div>
                <span style={{ fontSize: 10, color: "#8a7e70" }}>{done}/{items.length} complete</span>
              </div>
              {items.map((t, idx) => {
                const gi = data.rebrand.indexOf(t);
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, ...S.card, padding: "10px 14px", marginBottom: 4 }}>
                    <div onClick={() => update(d => { d.rebrand[gi].status = cycleStatus(d.rebrand[gi].status); return d; })}
                      style={{ width: 22, height: 22, borderRadius: 5, background: STATUS_C[t.status], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                      {t.status === "Done" ? "✓" : "○"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: t.status === "Done" ? "#6a6058" : "#e8ddd0", textDecoration: t.status === "Done" ? "line-through" : "none" }}>{t.task}</div>
                      <div style={S.dim}>{t.start} → {t.end} · {t.owner}</div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // ═══════════════════════════════════════
  // SIGNAGE TAB
  // ═══════════════════════════════════════
  const SignageTab = () => {
    const qData = ["Q1","Q2","Q3","Q4"].map(q => ({ name: q, target: data.signage.targets[q]/1000, actual: data.signage.actuals[q]/1000 }));
    return (
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f0e6d8", marginBottom: 4 }}>Signage Growth — $250K → $1.2M</h2>
        <div style={{ ...S.sub, marginBottom: 16 }}>Target Margin: 40% · Primary Partner: Triumph · Key Client: Related Affordable</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={S.card}>
            <div style={S.sectionTitle}>Quarterly Revenue ($K)</div>
            <ResponsiveContainer height={200}>
              <BarChart data={qData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,118,60,0.1)" />
                <XAxis dataKey="name" tick={{ fill: "#8a7e70", fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: "#8a7e70", fontSize: 11 }} axisLine={false} />
                <Tooltip contentStyle={{ background: "#2a2219", border: "1px solid #c0763c44", borderRadius: 8, color: "#e8ddd0", fontSize: 12 }} />
                <Bar dataKey="target" fill="rgba(192,118,60,0.3)" radius={[4,4,0,0]} name="Target" />
                <Bar dataKey="actual" fill="#c0763c" radius={[4,4,0,0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={S.card}>
            <div style={S.sectionTitle}>Enter Quarterly Actuals</div>
            {["Q1","Q2","Q3","Q4"].map(q => (
              <div key={q} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#8a7e70", width: 30 }}>{q}</span>
                <span style={{ fontSize: 11, color: "#6a6058", width: 80 }}>Target: ${(data.signage.targets[q]/1000).toFixed(0)}K</span>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "#8a7e70" }}>$</span>
                  <input type="number" value={data.signage.actuals[q] || ""} placeholder="0"
                    onChange={e => update(d => { d.signage.actuals[q] = Number(e.target.value) || 0; return d; })}
                    style={{ ...S.input, width: 100 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={S.sectionTitle}>Growth Tactics</div>
        {data.signage.tactics.map((t, i) => (
          <TaskRow key={i} task={{ desc: t.desc, status: t.status }}
            onCycle={() => update(d => { d.signage.tactics[i].status = cycleStatus(d.signage.tactics[i].status); return d; })}
            onDelete={() => update(d => { d.signage.tactics.splice(i, 1); return d; })} />
        ))}
        <AddTaskInput placeholder="Add signage tactic..." onAdd={(desc) => update(d => { d.signage.tactics.push({ desc, priority: "MEDIUM", status: "Not Started" }); return d; })} />
      </div>
    );
  };

  // ═══════════════════════════════════════
  // EMAIL TAB (placeholder + add)
  // ═══════════════════════════════════════
  const EmailTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f0e6d8" }}>Email Marketing Calendar</h2>
          <div style={S.sub}>Goal: 6 industry + 2 Uplifting per month = Score of 1.0</div>
        </div>
        <button onClick={() => {
          const topic = prompt("Email subject/topic:");
          if (topic) update(d => { d.emails.push({ id: `em${Date.now()}`, date: "", type: "In The New", industry: "", topic, status: "Not Started" }); return d; });
        }} style={S.btnPrimary}>+ Add Email</button>
      </div>
      {data.emails.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
          <div style={{ fontSize: 14, color: "#a89a88", marginBottom: 8 }}>No emails added yet</div>
          <div style={S.dim}>Add your email calendar entries using the + button above. Pattern: AH → C&U → SL → Library → Comm/HC → A&D + 2 Uplifting per month.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {data.emails.map((em, i) => (
            <div key={em.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
              <div onClick={() => update(d => { d.emails[i].status = cycleStatus(d.emails[i].status); return d; })}
                style={{ width: 22, height: 22, borderRadius: 5, background: STATUS_C[em.status], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                {em.status === "Done" ? "✓" : "○"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#e8ddd0" }}>{em.topic}</div>
                <div style={S.dim}>{em.date} · {em.type} · {em.industry}</div>
              </div>
              <StatusBadge status={em.status} />
              <button onClick={() => update(d => { d.emails.splice(i, 1); return d; })} style={S.btnDanger}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // LINKEDIN TAB
  // ═══════════════════════════════════════
  const LinkedInTab = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f0e6d8" }}>LinkedIn Content Plan</h2>
          <div style={S.sub}>Goal: 22 new followers/mo · 1,732 impressions/mo · 2-3 posts/week</div>
        </div>
        <button onClick={() => {
          const topic = prompt("Post topic:");
          if (topic) update(d => { d.linkedin.push({ id: `li${Date.now()}`, day: "Tuesday", type: "POV", theme: "", topic, status: "Not Started" }); return d; });
        }} style={S.btnPrimary}>+ Add Post</button>
      </div>
      {data.linkedin.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
          <div style={{ fontSize: 14, color: "#a89a88", marginBottom: 8 }}>No posts added yet</div>
          <div style={S.dim}>Add your LinkedIn content calendar. Post types: POV, Process, Project Moment, Human, Reflection. Themes: Foundations, Standards, Timing.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {data.linkedin.map((post, i) => (
            <div key={post.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px" }}>
              <div onClick={() => update(d => { d.linkedin[i].status = cycleStatus(d.linkedin[i].status); return d; })}
                style={{ width: 22, height: 22, borderRadius: 5, background: STATUS_C[post.status], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                {post.status === "Done" ? "✓" : "○"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#e8ddd0" }}>{post.topic}</div>
                <div style={S.dim}>{post.day} · {post.type} · {post.theme}</div>
              </div>
              <StatusBadge status={post.status} />
              <button onClick={() => update(d => { d.linkedin.splice(i, 1); return d; })} style={S.btnDanger}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // INBOX TAB
  // ═══════════════════════════════════════
  const InboxTab = () => {
    const [newItem, setNewItem] = useState("");
    const [newCat, setNewCat] = useState("Idea");
    return (
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f0e6d8", marginBottom: 4 }}>Inbox — Capture Zone</h2>
        <div style={{ ...S.sub, marginBottom: 16 }}>Dump ideas, leads, and random notes here. Sort them into proper tabs later.</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <select value={newCat} onChange={e => setNewCat(e.target.value)} style={S.select}>
            {["Idea","Lead","Note","Follow-up","Resource"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={newItem} onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && newItem.trim()) { update(d => { d.inbox.unshift({ id: `in${Date.now()}`, text: newItem.trim(), category: newCat, date: new Date().toLocaleDateString(), resolved: false }); return d; }); setNewItem(""); }}}
            placeholder="Quick capture — type and hit Enter..." style={{ ...S.input, flex: 1 }} />
          <button onClick={() => { if (newItem.trim()) { update(d => { d.inbox.unshift({ id: `in${Date.now()}`, text: newItem.trim(), category: newCat, date: new Date().toLocaleDateString(), resolved: false }); return d; }); setNewItem(""); }}} style={S.btnPrimary}>+ Capture</button>
        </div>

        {data.inbox.length === 0 ? (
          <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📥</div>
            <div style={{ fontSize: 14, color: "#a89a88" }}>Inbox empty</div>
            <div style={S.dim}>Type anything above to capture it. Ideas, leads, random thoughts — all welcome.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.inbox.map((item, i) => (
              <div key={item.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", opacity: item.resolved ? 0.5 : 1 }}>
                <div onClick={() => update(d => { d.inbox[i].resolved = !d.inbox[i].resolved; return d; })}
                  style={{ width: 22, height: 22, borderRadius: 5, background: item.resolved ? "#2ecc71" : "#5a6068", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                  {item.resolved ? "✓" : "○"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: item.resolved ? "#6a6058" : "#e8ddd0", textDecoration: item.resolved ? "line-through" : "none" }}>{item.text}</div>
                  <div style={S.dim}>{item.date}</div>
                </div>
                <span style={S.badge("#c0763c")}>{item.category}</span>
                <button onClick={() => update(d => { d.inbox.splice(i, 1); return d; })} style={S.btnDanger}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  const tabContent = {
    overview: <OverviewTab />,
    scorecard: <ScorecardTab />,
    prospecting: <ProspectingTab />,
    tradeshows: <TradeShowsTab />,
    emails: <EmailTab />,
    linkedin: <LinkedInTab />,
    rebrand: <RebrandTab />,
    signage: <SignageTab />,
    inbox: <InboxTab />,
  };

  return (
    <div style={{ background: "linear-gradient(145deg, #1a1612 0%, #2a2219 40%, #1e1a15 100%)", minHeight: "100vh", color: "#e8ddd0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(90deg, rgba(192,118,60,0.12) 0%, rgba(30,26,21,0) 100%)", borderBottom: "1px solid rgba(192,118,60,0.15)", padding: "14px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#c0763c", textTransform: "uppercase", fontWeight: 600 }}>Contract Source</div>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#f0e6d8", letterSpacing: -0.3 }}>2026 Marketing Command Center</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "#6a6058" }}>Auto-saves</span>
            <button onClick={async () => { await saveData(data); alert("Saved!"); }} style={S.btn}>💾 Save</button>
            <button onClick={() => exportData(data)} style={S.btn}>📤 Export</button>
            <button onClick={async () => { const d = await importData(); if (d) { setData(d); await saveData(d); alert("Imported!"); }}} style={S.btn}>📥 Import</button>
            <button onClick={() => { if (confirm("Reset ALL data to defaults? This cannot be undone.")) { setData(DEFAULT_DATA); saveData(DEFAULT_DATA); }}} style={S.btnDanger}>Reset</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>
        {/* Sidebar Nav */}
        <div style={{ width: 180, background: "rgba(30,26,21,0.5)", borderRight: "1px solid rgba(192,118,60,0.1)", padding: "12px 0", flexShrink: 0 }}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => { setTab(t.id); setDetailId(null); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", cursor: "pointer", background: tab === t.id ? "rgba(192,118,60,0.12)" : "transparent", borderLeft: tab === t.id ? "3px solid #c0763c" : "3px solid transparent", transition: "all 0.1s" }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = "rgba(192,118,60,0.06)"; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span style={{ fontSize: 12, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? "#f0e6d8" : "#8a7e70" }}>{t.label}</span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto", maxHeight: "calc(100vh - 60px)" }}>
          {tabContent[tab]}
        </div>
      </div>
    </div>
  );
}
