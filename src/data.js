export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const TIER_C = { 1: "#e74c3c", 2: "#f0a030", 3: "#27ae60" };
export const STATUS_C = { "Not Started": "#5a6068", "In Progress": "#f0a030", "Done": "#2ecc71", "Blocked": "#e74c3c" };
export const PRI_C = { HIGH: "#e74c3c", MEDIUM: "#f0a030", LOW: "#27ae60" };
export const STATUS_ORDER = ["Not Started", "In Progress", "Done", "Blocked"];
export const cycleStatus = (s) => STATUS_ORDER[(STATUS_ORDER.indexOf(s) + 1) % STATUS_ORDER.length];

export const DEFAULT_DATA = {
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
  emails: [],
  linkedin: [],
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
  inbox: [],
};
