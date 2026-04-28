import { useState, useEffect, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ═══ STORAGE ═══
import { loadData as load, saveData as sv } from "./storage.js";

// ═══ BRAND COLORS ═══
const C = {
  navy: "#0D1B2A", mid: "#1A2F45", gold: "#C8A96E", cream: "#F7F4EF", red: "#AA2621",
  bg1: "#0D1B2A", bg2: "#142536", cardBg: "rgba(26,47,69,0.55)",
  cardBorder: "rgba(200,169,110,0.12)", textPrimary: "#F7F4EF", textSecondary: "#8A9BB5",
  textDim: "#5A6E85", inputBg: "rgba(13,27,42,0.8)", inputBorder: "rgba(200,169,110,0.2)",
};
const TC = { 1: C.red, 2: C.gold, 3: "#2ecc71" };
const SC = { "Not Started": "#5A6E85", "In Progress": C.gold, Done: "#2ecc71", Blocked: C.red };
const PC = { High: C.red, Medium: C.gold, Low: "#2ecc71" };

// ═══ UTILS ═══
const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SO = ["Not Started","In Progress","Done","Blocked"];
const cyc = s => SO[(SO.indexOf(s)+1)%SO.length];
const td = () => new Date().toISOString().split("T")[0];
const fD = d => { if(!d) return ""; const p=d.split("-"); return `${parseInt(p[1])}/${parseInt(p[2])}`; };
const isOD = d => d && d < td();
const isDTW = d => { if(!d) return false; const e=new Date(); e.setDate(e.getDate()+7); return d>=td()&&d<=e.toISOString().split("T")[0]; };
const moI = () => new Date().getMonth();
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

// ═══ FONTS ═══
const fl = document.createElement("link");
fl.href = "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700;9..40,800&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap";
fl.rel = "stylesheet";
if (!document.querySelector('link[href*="DM+Sans"]')) document.head.appendChild(fl);
const ff = "'DM Sans','IBM Plex Sans',system-ui,sans-serif";
const fb = "'IBM Plex Sans','DM Sans',system-ui,sans-serif";

// ═══ PLAYBOOK ═══
const mk = (desc, pri="Medium", due="") => ({ desc, status:"Not Started", priority:pri, due });
const PROSPECT_PB = {
  1: [mk("Research company — size, news, acquisitions, funding","High"),mk("Identify 3-5 decision-makers (VP+, Procurement, Facilities, Ops)","High"),mk("Enrich contacts in Apollo — verified emails","High"),mk("Map locations/projects to serviceable geography","High"),mk("Research current FF&E vendors and contracts","Medium"),mk("Craft personalized outreach angle","High"),mk("Send initial outreach to primary contact","High"),mk("Connect with decision-makers on LinkedIn","Medium"),mk("Follow up on initial outreach (1 week)","High"),mk("Second follow-up or new angle (2 weeks)","Medium"),mk("Book discovery meeting","High"),mk("Prepare tailored capabilities presentation","Medium"),mk("Post-meeting: send proposal or next steps","High")],
  2: [mk("Research company — size, projects, decision-makers","High"),mk("Identify 2-3 key contacts","High"),mk("Enrich contacts in Apollo","High"),mk("Craft outreach angle","High"),mk("Send initial outreach","High"),mk("Connect on LinkedIn","Medium"),mk("Follow up (1 week)","Medium"),mk("Book discovery meeting","High"),mk("Send proposal or capabilities overview","Medium")],
  3: [mk("Research company and key contact","Medium"),mk("Find contact info — Apollo or LinkedIn","Medium"),mk("Send introductory outreach","Medium"),mk("Follow up (1-2 weeks)","Low"),mk("Book meeting if interest shown","Low")],
};
const genPT = tier => JSON.parse(JSON.stringify(PROSPECT_PB[tier]||PROSPECT_PB[2]));
const SHOW_PB = [mk("Confirm registration and booth","High"),mk("Book hotel and travel","Medium"),mk("Prep booth materials — banners, samples, signage","High"),mk("Create industry-specific collateral","Medium"),mk("Pre-show outreach — email attendees / schedule meetings","High"),mk("Attend show — capture leads","High"),mk("Post-show: enter leads into CRM within 48 hrs","High"),mk("Post-show: follow-up emails within 1 week","High"),mk("Schedule calls for warm leads","Medium")];
const genST = () => JSON.parse(JSON.stringify(SHOW_PB));

// ═══ DEFAULT DATA ═══
const DEF = {
  scorecard: {
    outreach: { metrics: [
      { name:"Website Views",weight:.15,goal:1147,values:{Jan:1074,Feb:905}},
      { name:"Co. LinkedIn Impressions",weight:.20,goal:1732,values:{Jan:1941,Feb:619}},
      { name:"Marketing Contacts",weight:.30,goal:30,values:{Jan:148,Feb:315}},
      { name:"Marketing Email Opens",weight:.15,goal:1178,values:{Jan:1454,Feb:1286}},
      { name:"Pamphlets Sent",weight:.10,goal:22,values:{Jan:10,Feb:0}},
      { name:"LinkedIn Followers",weight:.10,goal:22,values:{Jan:30,Feb:32}},
    ]},
    cx: { metrics: [
      { name:"Industry Emails (6 pts/mo)",weight:.30,goal:6,values:{Jan:6,Feb:6}},
      { name:"Website Content (qtrly)",weight:.20,goal:1,values:{Jan:1,Feb:1}},
      { name:"Catalog/Trifold (qtrly)",weight:.20,goal:1,values:{Jan:1,Feb:0}},
      { name:"Post Install Follow-Through",weight:.30,goal:1,values:{Jan:0,Feb:0}},
    ]}
  },
  prospecting: [
    {id:"p1",name:"Welltower / StoryPoint / Ventas",tier:1,cat:"Senior Living",rev:"$14B+ acquisitions",timeline:"Q2 2026",notes:"StoryPoint: 33 communities OH/MI/TN. Welltower acquiring 700 communities ($14B). Ventas $2.2B. All RIDEA contracts. 28% growth in 80+ pop.",contacts:[{name:"Tim Bryant",title:"President, StoryPoint",email:"",status:"Not in Apollo",loc:"Ohio"}],tasks:[mk("Find Tim Bryant on LinkedIn; add to Apollo","High"),mk("Map StoryPoint communities to geography","High"),mk("Research Welltower acquisition targets","Medium"),mk("ID VP Ops, Procurement, Regional Directors","Medium"),mk("Build Welltower procurement list (Toledo HQ)","Medium"),mk("Research Ventas acquisitions for local overlap","Medium"),mk("Craft RIDEA transition outreach angle","Medium"),mk("Prepare multi-community capabilities deck","Medium")]},
    {id:"p2",name:"H.O.P.E. Campus / The Centers",tier:1,cat:"Institutional",rev:"$14M renovation",timeline:"Immediate",notes:"$14M campus renovation 11401 Lorain Ave Cleveland. Residential, school, cafeteria, clinical, admin. Christie = former Dir. Property Mgmt.",contacts:[{name:"Christie Tatman-Stroh",title:"CAO",email:"christie.tatmanstroh@thecentersohio.org",status:"Added 3/18",loc:"Cleveland, OH"}],tasks:[mk("Reach out to Christie Tatman-Stroh","High"),mk("Research GC and architect","High"),mk("Contact Cuyahoga County procurement","Medium"),mk("Prepare FF&E proposal","Medium"),mk("Determine procurement path","Medium"),mk("ID COO, Facilities Dir contacts","Low")]},
    {id:"p3",name:"Edward Rose & Sons",tier:2,cat:"Multifamily",rev:"$250M revenue",timeline:"Q2 2026",notes:"13 contacts in Apollo. 9 finished sequences, 2 unsent, 1 bounced. HQ Bloomfield Hills MI.",contacts:[{name:"13 contacts in Apollo",title:"Various — Director+",email:"Multiple",status:"In DB",loc:"Bloomfield Hills, MI"}],tasks:[mk("Review 13 Apollo contacts — warm signals","High"),mk("Activate 2 unsent contacts","High"),mk("Research development projects","Medium"),mk("Target Dir. Purchasing, VP Construction","Medium"),mk("Develop FF&E package pitch","Medium"),mk("Investigate vendor list process","Low")]},
    {id:"p4",name:"Town Square Adult Day",tier:2,cat:"Senior Living",rev:"Standardization",timeline:"Q2-Q3 2026",notes:"1950s themed adult day centers. 200% headcount growth. Standardization = recurring revenue.",contacts:[{name:"Gerry Gavin",title:"Dir. Biz Dev",email:"ggavin@townsquare.net",status:"Added 3/18",loc:"NJ"}],tasks:[mk("Reach out to Gerry Gavin","High"),mk("Study townsquare.net concept","Medium"),mk("Develop standardization proposal","Medium"),mk("Pitch efficiency angle","Medium"),mk("Offer proof-of-concept","Low")]},
    {id:"p5",name:"Aria Senior Living",tier:2,cat:"Senior Living",rev:"Local operator",timeline:"Active",notes:"Derek Hansen, Owner/Operator Gates Mills OH. Warm intro via Mike Cozart N2.",contacts:[{name:"Derek Hansen",title:"Owner/Operator",email:"derek@ariacares.com",status:"In DB — 0 outreach",loc:"Gates Mills, OH"}],tasks:[mk("Follow up Mike Cozart for intro","High"),mk("Direct email if intro stalls","Medium"),mk("Research Aria communities","Low"),mk("Apollo sequence backup","Low")]},
    {id:"p6",name:"Sunrise of Parma",tier:2,cat:"Senior Living",rev:"National chain",timeline:"Fix Sendgrid",notes:"Rima seq FAILED — Sendgrid issue. Never received outreach. HQ McLean VA. Dual-track: local ED + national.",contacts:[{name:"Rima Hansen",title:"Executive Director",email:"rima.hansen@sunriseseniorliving.com",status:"Seq FAILED",loc:"Cleveland, OH"}],tasks:[mk("FIX SENDGRID EMAIL ISSUE","High"),mk("Re-add Rima to sequence","High"),mk("Engage Rima LinkedIn","Medium"),mk("Research refresh cycles","Low"),mk("ID national procurement","Low")]},
    {id:"p7",name:"SLK Capital / Ridgeville Farms",tier:3,cat:"Development",rev:"Emerging",timeline:"Q2 2026",notes:"Ryan Kozak, SLK Capital. Ridgeville Farms 7691 Avon Belden Rd. RDL Architects.",contacts:[{name:"Ryan Kozak",title:"Principal",email:"",status:"Not in Apollo",loc:"N. Ridgeville"}],tasks:[mk("Research SLK & Ryan Kozak","Medium"),mk("Determine Ridgeville scope","Medium"),mk("Reach out to RDL Architects","Medium"),mk("Add Ryan to Apollo","Low"),mk("Send cold outreach","Low")]},
    {id:"p8",name:"Kirk Gibson Foundation",tier:3,cat:"Nonprofit",rev:"Relationship play",timeline:"Q2 2026",notes:"Parkinson's Wellness. CEO Steve Annear. Wellness center Farmington Hills MI, 60K visits/yr.",contacts:[{name:"Steve Annear",title:"CEO",email:"steve@kirkgibsonfoundation.org",status:"Added 3/18",loc:"Birmingham, MI"}],tasks:[mk("Cold email Steve Annear","Medium"),mk("Offer FF&E/signage donation","Low"),mk("Attend foundation event","Low"),mk("Research facility needs","Low")]},
  ],
  winLossLog: [],
  showScoring: {
    weights: { industry: 20, cost: 25, travel: 20, oppCost: 10, quality: 15, dealer: 10 },
  },
  verticals: [
    {name:"Commercial",margin25:20,goal26:34,indAvg:43,gap:14,notes:"Largest margin gap. High event ROI potential."},
    {name:"Church / Faith",margin25:25,goal26:32,indAvg:40,gap:8,notes:"Near-zero revenue today. Strong growth target."},
    {name:"Senior Living",margin25:25,goal26:31,indAvg:45,gap:6,notes:"High industry margin. Intentional growth vertical."},
    {name:"Healthcare",margin25:28,goal26:30,indAvg:40,gap:2,notes:"Revenue nearly zero in 2025. Rebuilding required."},
    {name:"Affordable Housing",margin25:30,goal26:35,indAvg:35,gap:5,notes:"At industry avg now. Margin discipline key."},
    {name:"Library",margin25:22,goal26:27,indAvg:40,gap:5,notes:"Steady vertical. Modest growth target."},
    {name:"Government",margin25:17,goal26:25,indAvg:35,gap:8,notes:"Lowest margin. De-prioritized for event investment."},
    {name:"Education",margin25:20,goal26:25,indAvg:35,gap:5,notes:"Intentionally softened. Lower event priority."},
  ],
  tradeShows: [
    {id:"ts1",name:"NeOHcon",ind:"Commercial",city:"Cleveland, OH",date:"2026-10-21",cost:282,dist:10,repType:"Mixed",reps:2,overnight:false,quality:"Low",dealer:"No",scores:{industry:10,cost:10,travel:10,oppCost:4,quality:2,dealer:10},total:8.8,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts2",name:"OASC",ind:"Senior Living",city:"Newark, OH",date:"2026-03-11",cost:300,dist:40,repType:"Mixed",reps:2,overnight:false,quality:"Low",dealer:"No",scores:{industry:8,cost:10,travel:10,oppCost:4,quality:2,dealer:10},total:8.6,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts3",name:"ToledoCon",ind:"Commercial",city:"Toledo, OH",date:"2026-11-05",cost:0,dist:80,repType:"Mixed",reps:2,overnight:false,quality:"Low",dealer:"No",scores:{industry:10,cost:10,travel:7,oppCost:4,quality:2,dealer:10},total:8.05,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts5",name:"Design Ohio",ind:"Commercial",city:"Akron, OH",date:"2026-02-18",cost:650,dist:30,repType:"Mixed",reps:2,overnight:false,quality:"Low",dealer:"No",scores:{industry:10,cost:6,travel:10,oppCost:4,quality:2,dealer:10},total:7.2,status:"CONFIRMED",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts6",name:"OALA",ind:"Senior Living",city:"Columbus, OH",date:"2026-04-23",cost:1650,dist:20,repType:"Mixed",reps:2,overnight:false,quality:"Low",dealer:"No",scores:{industry:8,cost:4,travel:10,oppCost:4,quality:2,dealer:10},total:6.2,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts7",name:"ASHE Ohio",ind:"Healthcare",city:"Columbus, OH",date:"2026-05-14",cost:1325,dist:20,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Unknown",scores:{industry:8,cost:4,travel:10,oppCost:4,quality:6,dealer:0},total:6.1,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts8",name:"NAIOP Northern Ohio",ind:"Commercial",city:"Cleveland, OH",date:"2026-09-10",cost:1500,dist:15,repType:"Mixed",reps:2,overnight:false,quality:"Low",dealer:"Unknown",scores:{industry:10,cost:4,travel:10,oppCost:4,quality:2,dealer:0},total:5.9,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts9",name:"Vistage / GCP",ind:"Commercial",city:"Cleveland, OH",date:"2026-03-19",cost:1500,dist:15,repType:"Mixed",reps:2,overnight:false,quality:"Low",dealer:"Unknown",scores:{industry:10,cost:4,travel:10,oppCost:4,quality:2,dealer:0},total:5.9,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts10",name:"OHFA Annual",ind:"Affordable Housing",city:"Columbus, OH",date:"2026-06-03",cost:1500,dist:20,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Unknown",scores:{industry:6,cost:4,travel:10,oppCost:4,quality:6,dealer:0},total:5.9,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts11",name:"OHCA",ind:"Senior Living",city:"Westerville, OH",date:"2026-05-11",cost:2825,dist:30,repType:"Mixed",reps:2,overnight:false,quality:"High",dealer:"Yes",scores:{industry:8,cost:1,travel:10,oppCost:4,quality:10,dealer:5},total:5.55,status:"RECOMMENDED",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts12",name:"Ohio Housing",ind:"Affordable Housing",city:"Columbus, OH",date:"2026-12-02",cost:3100,dist:10,repType:"Mixed",reps:2,overnight:false,quality:"High",dealer:"Yes",scores:{industry:6,cost:1,travel:10,oppCost:4,quality:10,dealer:5},total:5.35,status:"CONFIRMED",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts13",name:"OLC",ind:"Library",city:"Sandusky, OH",date:"2026-10-07",cost:1500,dist:70,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Yes",scores:{industry:5,cost:4,travel:7,oppCost:4,quality:6,dealer:5},total:5.3,status:"CONFIRMED",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts14",name:"Ohio CDC Conference",ind:"Affordable Housing",city:"Various (OH)",date:"2026-10-14",cost:1500,dist:100,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Unknown",scores:{industry:6,cost:4,travel:7,oppCost:4,quality:6,dealer:0},total:5.15,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts15",name:"LeadingAge Ohio",ind:"Senior Living",city:"Columbus, OH",date:"2026-08-18",cost:2699,dist:20,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Unknown",scores:{industry:8,cost:1,travel:10,oppCost:4,quality:6,dealer:0},total:4.9,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts16",name:"OHA Annual",ind:"Healthcare",city:"Columbus, OH",date:"2026-06-15",cost:4000,dist:20,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Unknown",scores:{industry:8,cost:1,travel:10,oppCost:4,quality:6,dealer:0},total:4.9,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts17",name:"EFA",ind:"Senior Living",city:"Phoenix, AZ",date:"2026-03-15",cost:753,dist:1200,repType:"Mixed",reps:2,overnight:true,quality:"Low",dealer:"Yes",scores:{industry:8,cost:6,travel:0,oppCost:2,quality:2,dealer:5},total:3.95,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts18",name:"TCN National",ind:"Church / Faith",city:"Baltimore, MD",date:"2026-09-21",cost:1299,dist:375,repType:"Mixed",reps:2,overnight:true,quality:"High",dealer:"Unknown",scores:{industry:8,cost:4,travel:1,oppCost:2,quality:10,dealer:0},total:3.95,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts19",name:"Ohio GFOA",ind:"Government",city:"Columbus, OH",date:"2026-06-10",cost:1200,dist:150,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Unknown",scores:{industry:2,cost:4,travel:2,oppCost:4,quality:6,dealer:0},total:3.5,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts20",name:"Ohio SHRM",ind:"Commercial",city:"Columbus, OH",date:"2026-09-23",cost:2999,dist:150,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Unknown",scores:{industry:10,cost:1,travel:2,oppCost:4,quality:6,dealer:0},total:3.1,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts21",name:"AHF Live",ind:"Affordable Housing",city:"Chicago, IL",date:"2026-11-09",cost:6950,dist:300,repType:"Mixed",reps:2,overnight:true,quality:"High",dealer:"No",scores:{industry:6,cost:1,travel:1,oppCost:2,quality:10,dealer:10},total:3.05,status:"CONFIRMED",leads:0,meetings:0,revenue:0,tasks:[mk("Coordinate Triumph booth","High"),mk("Book hotel + travel","Medium"),mk("Prep signage materials","High")]},
    {id:"ts22",name:"LeadingAge National",ind:"Senior Living",city:"Washington, DC",date:"2026-10-25",cost:4500,dist:370,repType:"Mixed",reps:2,overnight:true,quality:"High",dealer:"Unknown",scores:{industry:8,cost:1,travel:1,oppCost:2,quality:10,dealer:0},total:2.75,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts23",name:"OASBO Annual",ind:"Education",city:"Columbus, OH",date:"2026-04-14",cost:2040,dist:150,repType:"Mixed",reps:2,overnight:false,quality:"Medium",dealer:"Unknown",scores:{industry:3,cost:1,travel:2,oppCost:4,quality:6,dealer:0},total:2.4,status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:[]},
    {id:"ts24",name:"ED Spaces",ind:"Education",city:"Kansas City, MO",date:"2026-11-04",cost:4000,dist:500,repType:"Mixed",reps:2,overnight:true,quality:"Low",dealer:"Yes",scores:{industry:3,cost:1,travel:0,oppCost:2,quality:2,dealer:5},total:1.45,status:"NOT RECOMMENDED",leads:0,meetings:0,revenue:0,tasks:[]},
  ],
  emailChecklist: MO.reduce((a,m)=>{a[m]={target:8,sent:0};return a;},{}),
  linkedinChecklist: MO.reduce((a,m)=>{a[m]={target:10,posted:0};return a;},{}),
  rebrand: [
    {id:"rb1",phase:"1. LOGO",task:"Logo concepts",start:"2026-03-01",end:"2026-03-15",owner:"Designer/Josh",status:"Not Started",priority:"High"},
    {id:"rb2",phase:"1. LOGO",task:"Logo refinement & selection",start:"2026-03-15",end:"2026-03-31",owner:"Team/Zack",status:"Not Started",priority:"High"},
    {id:"rb3",phase:"1. LOGO",task:"Final logo files",start:"2026-04-01",end:"2026-04-07",owner:"Designer",status:"Not Started",priority:"Medium"},
    {id:"rb4",phase:"2. COLORS",task:"Brand color palette",start:"2026-04-08",end:"2026-04-15",owner:"Claude/Josh",status:"Not Started",priority:"High"},
    {id:"rb5",phase:"2. COLORS",task:"Brand guidelines doc",start:"2026-04-15",end:"2026-04-30",owner:"Claude",status:"Not Started",priority:"Medium"},
    {id:"rb6",phase:"3. WEBSITE",task:"Sitemap & wireframes",start:"2026-05-01",end:"2026-05-15",owner:"Claude",status:"Not Started",priority:"High"},
    {id:"rb7",phase:"3. WEBSITE",task:"Homepage design",start:"2026-05-15",end:"2026-05-31",owner:"Claude",status:"Not Started",priority:"High"},
    {id:"rb8",phase:"3. WEBSITE",task:"Industry pages (8)",start:"2026-06-01",end:"2026-06-30",owner:"Claude",status:"Not Started",priority:"Medium"},
    {id:"rb9",phase:"3. WEBSITE",task:"Portfolio pages",start:"2026-07-01",end:"2026-07-15",owner:"Claude/Josh",status:"Not Started",priority:"Medium"},
    {id:"rb10",phase:"3. WEBSITE",task:"Photos",start:"2026-07-15",end:"2026-07-31",owner:"Claude",status:"Not Started",priority:"Medium"},
    {id:"rb11",phase:"3. WEBSITE",task:"Testing & QA",start:"2026-08-01",end:"2026-08-15",owner:"Team",status:"Not Started",priority:"High"},
    {id:"rb12",phase:"3. WEBSITE",task:"Launch",start:"2026-08-15",end:"2026-08-31",owner:"Josh",status:"Not Started",priority:"High"},
    {id:"rb13",phase:"4. COLLATERAL",task:"Materials update",start:"2026-09-01",end:"2026-09-07",owner:"Josh",status:"Not Started",priority:"Medium"},
    {id:"rb14",phase:"4. COLLATERAL",task:"Business cards",start:"2026-09-01",end:"2026-09-15",owner:"Josh",status:"Not Started",priority:"Low"},
    {id:"rb15",phase:"4. COLLATERAL",task:"Trade show banners",start:"2026-09-15",end:"2026-10-01",owner:"Josh",status:"Not Started",priority:"High"},
  ],
  signage: {
    targets:{Q1:200000,Q2:300000,Q3:350000,Q4:350000},
    actuals:{Q1:0,Q2:0,Q3:0,Q4:0},
    tactics:[mk("Trade Show Signage Presence","High"),mk("Triumph AHF Booth Partnership","High"),mk("'One Stop Shop' Messaging","High"),mk("Related Affordable Case Studies","Medium"),mk("Email Campaign — Signage Focus","Medium"),mk("LinkedIn — Signage spotlights","Medium"),mk("Architect/GC Outreach","High"),mk("Website Signage Page","High")]
  },
  outreach: [],
  budget: {
    categories: [
      {id:"mktg",name:"Marketing (materials, swag, print)",annual:24000},
      {id:"trade",name:"Trade Shows",annual:20000},
      {id:"ads",name:"Advertising + Promotion",annual:1000},
      {id:"hubspot",name:"HubSpot",annual:1320.60},
      {id:"va",name:"VA Fees (Q1 only)",annual:3000},
      {id:"rebrand",name:"Rebrand Reserve (Q2-Q4 VA reallocation)",annual:9000},
    ],
    totalAnnual: 58320.60,
    actuals: {}
  },
  weeklyHours: {
    categories:[{id:"outreach",name:"Outreach Emails",target:5},{id:"emails",name:"Monthly Emails",target:2.5},{id:"signage",name:"Signage Program",target:4.5},{id:"website",name:"Website Redesign",target:4},{id:"branding",name:"Branding",target:2.5},{id:"tradeshows",name:"Trade Shows",target:3},{id:"linkedin",name:"LinkedIn",target:1.5},{id:"other_outreach",name:"Other Outreach",target:1.5},{id:"postinstall",name:"Post-Install",target:.5},{id:"photos",name:"Photo Program",target:.5},{id:"adhoc",name:"Ad-Hoc/Reactive",target:2.5}],
    targetHours:25, weeks:{}
  },
  leadershipFeedback: [],
  inbox: [],
};

// ═══ STYLES ═══
const S = {
  card:{background:C.cardBg,border:`1px solid ${C.cardBorder}`,borderRadius:14,padding:"16px 20px"},
  kpi:{background:`linear-gradient(135deg,${C.mid} 0%,${C.navy} 100%)`,border:`1px solid ${C.cardBorder}`,borderRadius:14,padding:"14px 18px",position:"relative",overflow:"hidden"},
  input:{background:C.inputBg,border:`1px solid ${C.inputBorder}`,borderRadius:8,padding:"8px 12px",color:C.cream,fontSize:13,width:"100%",outline:"none",fontFamily:fb},
  select:{background:C.inputBg,border:`1px solid ${C.inputBorder}`,borderRadius:8,padding:"7px 10px",color:C.cream,fontSize:12,outline:"none",fontFamily:fb,cursor:"pointer"},
  btn:{background:"rgba(200,169,110,0.15)",border:`1px solid rgba(200,169,110,0.3)`,color:C.gold,padding:"7px 14px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:fb},
  btnP:{background:"rgba(200,169,110,0.25)",border:`1px solid rgba(200,169,110,0.5)`,color:C.cream,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:fb},
  btnD:{background:"rgba(170,38,33,0.12)",border:"1px solid rgba(170,38,33,0.25)",color:C.red,padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:fb},
  badge:c=>({fontSize:10,padding:"2px 10px",borderRadius:6,background:`${c}1a`,color:c,fontWeight:600,whiteSpace:"nowrap",fontFamily:fb}),
  section:{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontFamily:ff},
  dim:{fontSize:11,color:C.textDim,fontFamily:fb},
  sub:{fontSize:11,color:C.textSecondary,fontFamily:fb},
};

const Pill = ({children,color}) => <span style={S.badge(color)}>{children}</span>;

// ═══ EDITABLE (click to edit) ═══
const Editable = ({value,onSave,style,tag:Tag="span"}) => {
  const [editing,setEditing]=useState(false);const [v,setV]=useState(value);const ref=useRef(null);
  useEffect(()=>{if(editing&&ref.current)ref.current.focus();},[editing]);
  if(!editing) return <Tag style={{...style,cursor:"pointer",borderBottom:`1px dashed rgba(200,169,110,0.2)`}} onClick={()=>{setV(value);setEditing(true);}} title="Click to edit">{value||"(click to edit)"}</Tag>;
  return <input ref={ref} value={v} onChange={e=>setV(e.target.value)} onBlur={()=>{onSave(v);setEditing(false);}} onKeyDown={e=>{if(e.key==="Enter"){onSave(v);setEditing(false);}if(e.key==="Escape")setEditing(false);}} style={{...S.input,...style,padding:"2px 6px"}} />;
};

// ═══ NUMBER INPUT (fixes single-char bug) ═══
const NumInput = ({value,onChange,style,...props}) => {
  const [local,setLocal]=useState(String(value||""));
  useEffect(()=>{setLocal(String(value||""));},[value]);
  return <input {...props} value={local} onChange={e=>{setLocal(e.target.value);}} onBlur={()=>{const n=parseFloat(local);onChange(isNaN(n)?0:n);}} onKeyDown={e=>{if(e.key==="Enter"){const n=parseFloat(local);onChange(isNaN(n)?0:n);}}} style={style} />;
};

// ═══ TASK ROW ═══
const TaskRow = ({task,onCycle,onDelete,onSetPri,onSetDue,compact}) => {
  const od=isOD(task.due)&&task.status!=="Done";
  return <div style={{display:"flex",alignItems:"center",gap:8,background:od?`${C.red}0a`:task.status==="Done"?"rgba(46,204,113,0.03)":C.cardBg,border:`1px solid ${od?`${C.red}30`:task.status==="Done"?"rgba(46,204,113,0.10)":C.cardBorder}`,borderRadius:10,padding:compact?"7px 12px":"10px 14px",marginBottom:3}}>
    <div onClick={onCycle} style={{width:20,height:20,borderRadius:6,background:SC[task.status],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700,cursor:"pointer",flexShrink:0}}>
      {task.status==="Done"?"✓":task.status==="In Progress"?"→":task.status==="Blocked"?"!":"○"}
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:compact?12:13,color:task.status==="Done"?C.textDim:C.cream,textDecoration:task.status==="Done"?"line-through":"none",fontFamily:fb}}>{task.desc}</div>
      {task.due&&<span style={{fontSize:9,color:od?C.red:C.textSecondary,fontFamily:fb}}>{od?"OVERDUE ":""}Due {fD(task.due)}</span>}
    </div>
    {!compact&&onSetPri&&<select value={task.priority||"Medium"} onChange={e=>onSetPri(e.target.value)} onClick={e=>e.stopPropagation()} style={{...S.select,width:78,fontSize:10,padding:"3px 5px"}}><option>High</option><option>Medium</option><option>Low</option></select>}
    {!compact&&onSetDue&&<input type="date" value={task.due||""} onChange={e=>onSetDue(e.target.value)} onClick={e=>e.stopPropagation()} style={{...S.input,width:120,fontSize:10,padding:"3px 6px"}} />}
    <Pill color={PC[task.priority]||C.gold}>{(task.priority||"Med").slice(0,3)}</Pill>
    {onDelete&&<button onClick={onDelete} style={{...S.btnD,padding:"2px 7px",fontSize:9}}>✕</button>}
  </div>;
};

const AddTask = ({onAdd}) => {
  const [v,setV]=useState("");const [p,setP]=useState("Medium");const [d,setD]=useState("");
  return <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
    <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&v.trim()){onAdd(v.trim(),p,d);setV("");setD("");}}} placeholder="New task..." style={{...S.input,flex:1,minWidth:180}} />
    <select value={p} onChange={e=>setP(e.target.value)} style={{...S.select,width:78}}><option>High</option><option>Medium</option><option>Low</option></select>
    <input type="date" value={d} onChange={e=>setD(e.target.value)} style={{...S.input,width:125}} />
    <button onClick={()=>{if(v.trim()){onAdd(v.trim(),p,d);setV("");setD("");}}} style={S.btnP}>+ Add</button>
  </div>;
};

// ═══ TABS ═══
const TABS = [
  {id:"today",label:"Today",icon:"☀️"},{id:"myweek",label:"My Week",icon:"⏱️"},{id:"scorecard",label:"8421 Goals",icon:"🎯"},
  {id:"prospecting",label:"Prospecting",icon:"🔍"},{id:"outreach",label:"Outreach",icon:"📤"},{id:"tradeshows",label:"Trade Shows",icon:"🎪"},
  {id:"emails",label:"Emails",icon:"📧"},{id:"linkedin",label:"LinkedIn",icon:"💼"},
  {id:"rebrand",label:"Rebrand",icon:"🎨"},{id:"signage",label:"Signage",icon:"🪧"},{id:"budget",label:"Budget",icon:"💰"},
  {id:"winloss",label:"Win/Loss",icon:"🏆"},{id:"leadership",label:"Leadership",icon:"📋"},{id:"inbox",label:"Inbox",icon:"📥"},
];

// ═══ MAIN APP ═══
export default function App() {
  const [data,setData]=useState(null);const [tab,setTab]=useState("today");const [loading,setLoading]=useState(true);const [detail,setDetail]=useState(null);const [showNewProspect,setShowNewProspect]=useState(false);const sr=useRef(null);
  useEffect(()=>{load().then(d=>{setData(d&&typeof d==='object'&&!Array.isArray(d)?d:DEF);setLoading(false);});},[]);
  const up=useCallback(fn=>{setData(prev=>{const next=fn(JSON.parse(JSON.stringify(prev)));if(sr.current)clearTimeout(sr.current);sr.current=setTimeout(()=>sv(next),400);return next;});},[]);

  if(loading||!data) return <div style={{background:C.navy,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:C.gold,fontFamily:ff}}>Loading...</div>;

  // Gather tasks
  const allT=[];
  data.prospecting.forEach(p=>p.tasks.forEach((t,i)=>allT.push({...t,source:"Prospecting",parent:p.name,path:["p",p.id,i]})));
  data.rebrand.forEach((t,i)=>allT.push({...t,desc:t.task,source:"Rebrand",parent:t.phase,path:["r",i]}));
  data.signage.tactics.forEach((t,i)=>allT.push({...t,source:"Signage",parent:"Signage",path:["s",i]}));
  data.tradeShows.forEach(ts=>(ts.tasks||[]).forEach((t,i)=>allT.push({...t,source:"Trade Show",parent:ts.name,path:["t",ts.id,i]})));
  const overdue=allT.filter(t=>isOD(t.due)&&t.status!=="Done");
  const dtw=allT.filter(t=>isDTW(t.due)&&t.status!=="Done");
  const hiAct=allT.filter(t=>t.priority==="High"&&t.status!=="Done"&&!isOD(t.due));
  const doneN=allT.filter(t=>t.status==="Done").length;
  const cycP=path=>up(d=>{if(path[0]==="p"){const p=d.prospecting.find(x=>x.id===path[1]);p.tasks[path[2]].status=cyc(p.tasks[path[2]].status);}else if(path[0]==="r"){d.rebrand[path[1]].status=cyc(d.rebrand[path[1]].status);}else if(path[0]==="s"){d.signage.tactics[path[1]].status=cyc(d.signage.tactics[path[1]].status);}else if(path[0]==="t"){const ts=d.tradeShows.find(x=>x.id===path[1]);ts.tasks[path[2]].status=cyc(ts.tasks[path[2]].status);}return d;});
  const calcSc=(metrics,month)=>{let s=0;metrics.forEach(m=>{const v=m.values[month];if(v!==undefined&&m.goal>0)s+=m.weight*(v/m.goal);});return s;};

  // ═══ TODAY ═══
  const TodayTab=()=>{const cm=MO[moI()];const oS=calcSc(data.scorecard.outreach.metrics,cm);const cS=calcSc(data.scorecard.cx.metrics,cm);const eS=data.emailChecklist?.[cm]?.sent||0;const lP=data.linkedinChecklist?.[cm]?.posted||0;const nxt=data.tradeShows.filter(t=>t.date>=td()).sort((a,b)=>a.date.localeCompare(b.date))[0];
    return <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
        {[{l:"Overdue",v:overdue.length,c:overdue.length>0?C.red:"#2ecc71"},{l:"Due This Week",v:dtw.length,c:C.cream},{l:`Emails (${cm})`,v:`${eS}/8`,c:eS>=8?"#2ecc71":C.cream},{l:`LinkedIn (${cm})`,v:`${lP}/10`,c:lP>=10?"#2ecc71":C.cream},{l:"Next Show",v:nxt?nxt.name:"—",c:C.cream,s:true}].map((k,i)=>
          <div key={i} style={S.kpi}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1.5,fontFamily:ff}}>{k.l}</div><div style={{fontSize:k.s?14:24,fontWeight:800,color:k.c,fontFamily:ff,marginTop:k.s?4:0}}>{k.v}</div>{k.s&&nxt&&<div style={{fontSize:9,color:C.textSecondary,fontFamily:fb}}>{nxt.date}</div>}</div>
        )}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          {overdue.length>0&&<div style={{marginBottom:16}}><div style={{...S.section,color:C.red}}>Overdue ({overdue.length})</div>{overdue.slice(0,8).map((t,i)=><TaskRow key={i} task={t} compact onCycle={()=>cycP(t.path)} />)}</div>}
          {dtw.length>0&&<div style={{marginBottom:16}}><div style={S.section}>Due This Week ({dtw.length})</div>{dtw.slice(0,8).map((t,i)=><TaskRow key={i} task={t} compact onCycle={()=>cycP(t.path)} />)}</div>}
          <div><div style={S.section}>High Priority — Active ({hiAct.length})</div>{hiAct.slice(0,10).map((t,i)=>
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
              <div onClick={()=>cycP(t.path)} style={{width:18,height:18,borderRadius:5,background:SC[t.status],display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff",fontWeight:700,cursor:"pointer",flexShrink:0}}>{t.status==="In Progress"?"→":"○"}</div>
              <div style={{flex:1,fontSize:12,color:C.cream,fontFamily:fb}}>{t.desc}</div>
              <span style={{fontSize:9,color:C.textDim,fontFamily:fb}}>{t.parent}</span>
            </div>
          )}</div>
        </div>
        <div>
          <div style={{marginBottom:16}}><div style={S.section}>Prospect Follow-ups</div>
            {data.prospecting.filter(p=>p.tasks.some(t=>t.status==="In Progress"||(t.priority==="High"&&t.status==="Not Started"))).slice(0,5).map(p=>{
              const hi=p.tasks.filter(t=>t.priority==="High"&&t.status!=="Done").length;
              return <div key={p.id} onClick={()=>{setTab("prospecting");setDetail(p.id);}} style={{...S.card,padding:"10px 14px",marginBottom:5,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(200,169,110,0.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.cardBorder}>
                <div><div style={{fontSize:13,fontWeight:600,color:C.cream,fontFamily:ff}}>{p.name}</div><div style={S.dim}>{p.contacts[0]?.name}</div></div>
                <div style={{display:"flex",gap:5}}><Pill color={TC[p.tier]}>T{p.tier}</Pill>{hi>0&&<Pill color={C.red}>{hi}</Pill>}</div>
              </div>;
            })}
          </div>
          <div style={{marginBottom:16}}><div style={S.section}>Upcoming Shows</div>
            {data.tradeShows.filter(t=>t.date>=td()&&t.status!=="REMOVE").sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4).map(ts=>{
              const inc=(ts.tasks||[]).filter(t=>t.status!=="Done").length;
              return <div key={ts.id} style={{...S.card,padding:"10px 14px",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:13,fontWeight:600,color:C.cream,fontFamily:ff}}>{ts.name}</div><div style={S.dim}>{ts.date} · {ts.loc}</div></div>
                <div style={{display:"flex",gap:5}}>{inc>0&&<Pill color={C.gold}>{inc} prep</Pill>}<Pill color={PC[ts.pri]||C.gold}>{ts.pri}</Pill></div>
              </div>;
            })}
          </div>
          {/* Leadership Feedback - Open Items */}
          {(()=>{const openLF=(data.leadershipFeedback||[]).filter(i=>i.status!=="Done");return openLF.length>0?<div style={{marginBottom:16}}><div style={S.section}>📋 Leadership Feedback ({openLF.length} open)</div>
            {openLF.slice(0,5).map((item,i)=>{const typeC={"Feedback":C.gold,"Task Request":C.red,"Comment":"#5DADE2","Approval":"#2ecc71","Question":"#8A9BB5"};
              return <div key={item.id} onClick={()=>setTab("leadership")} style={{...S.card,padding:"8px 14px",marginBottom:4,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(200,169,110,0.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.cardBorder}>
                <div><div style={{fontSize:12,color:C.cream,fontFamily:fb}}>{item.text.length>60?item.text.slice(0,60)+"...":item.text}</div><div style={S.dim}>{item.from} · {item.date}</div></div>
                <div style={{display:"flex",gap:5}}><Pill color={typeC[item.type]||C.gold}>{item.type}</Pill><Pill color={item.status==="In Progress"?"#5DADE2":C.gold}>{item.status}</Pill></div>
              </div>;
            })}{openLF.length>5&&<div style={{fontSize:10,color:C.textDim,textAlign:"center",marginTop:4,fontFamily:fb}}>+{openLF.length-5} more</div>}
          </div>:null;})()}
          <div style={S.card}><div style={S.section}>{MO[moI()]} Scorecard</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["Outreach",oS],["CX",cS]].map(([l,s])=><div key={l} style={{background:C.navy,borderRadius:10,padding:10,textAlign:"center"}}>
                <div style={{fontSize:9,color:C.textSecondary,fontFamily:ff}}>{l}</div>
                <div style={{fontSize:22,fontWeight:800,color:s>=1?"#2ecc71":s>0?C.gold:C.textDim,fontFamily:ff}}>{s>0?s.toFixed(2):"—"}</div>
              </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
  };

  // ═══ SCORECARD ═══
  const ScorecardTab=()=>{
    const renderM=(title,metrics,path)=><div style={{...S.card,marginBottom:14}}><div style={S.section}>{title}</div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
      <th style={{textAlign:"left",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>Metric</th>
      <th style={{textAlign:"center",padding:"6px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,width:42,fontFamily:fb}}>Wt</th>
      <th style={{textAlign:"center",padding:"6px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,width:50,fontFamily:fb}}>Goal</th>
      {MO.map(m=><th key={m} style={{textAlign:"center",padding:"6px 2px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,width:50,fontFamily:fb}}>{m}</th>)}
    </tr></thead><tbody>
      {metrics.map((m,mi)=><tr key={mi}>
        <td style={{padding:"5px 8px",color:C.cream,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontSize:11,fontFamily:fb}}>{m.name}</td>
        <td style={{textAlign:"center",color:C.textSecondary,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontFamily:fb}}>{(m.weight*100).toFixed(0)}%</td>
        <td style={{textAlign:"center",color:C.gold,fontWeight:600,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontFamily:fb}}>{m.goal.toLocaleString()}</td>
        {MO.map(month=>{const val=m.values[month];const r=val!==undefined&&m.goal>0?val/m.goal:null;const cl=r===null?C.textDim:r>=1?"#2ecc71":r>=.7?C.gold:C.red;
          return <td key={month} style={{textAlign:"center",padding:"3px 1px",borderBottom:`1px solid rgba(200,169,110,0.05)`}}>
            <NumInput type="number" value={val!==undefined?val:""} placeholder="—" onChange={v=>up(d=>{d.scorecard[path].metrics[mi].values[month]=v===0?undefined:v;return d;})} style={{background:val!==undefined?`${cl}18`:"transparent",border:`1px solid ${val!==undefined?`${cl}44`:C.cardBorder}`,borderRadius:5,padding:"3px 1px",color:C.cream,fontSize:11,width:44,textAlign:"center",outline:"none",fontFamily:fb}} />
          </td>;})}
      </tr>)}
      <tr><td colSpan={3} style={{padding:"6px 8px",fontWeight:700,color:C.gold,borderTop:`2px solid rgba(200,169,110,0.2)`,fontSize:11,fontFamily:ff}}>SCORE (≥1.0)</td>
        {MO.map(month=>{const s=calcSc(metrics,month);const has=metrics.some(m=>m.values[month]!==undefined);
          return <td key={month} style={{textAlign:"center",padding:"6px 2px",borderTop:`2px solid rgba(200,169,110,0.2)`}}>
            {has?<span style={{fontWeight:800,fontSize:12,color:s>=1?"#2ecc71":s>=.7?C.gold:C.red,fontFamily:ff}}>{s.toFixed(2)}</span>:<span style={{color:C.textDim}}>—</span>}
          </td>;})}
      </tr>
    </tbody></table></div></div>;
    return <div><h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>8421 Goals — Monthly Scorecard</h2><div style={{...S.sub,marginBottom:14}}>Signage: $1.2M · FF&E: $13.8M · Outreach ≥1.0 · CX ≥1.0</div>{renderM("Outreach Metrics",data.scorecard.outreach.metrics,"outreach")}{renderM("Customer Experience Metrics",data.scorecard.cx.metrics,"cx")}</div>;
  };

  // ═══ PROSPECTING ═══
  const ProspectingTab=()=>{
    if(detail){const proj=data.prospecting.find(p=>p.id===detail);if(!proj){setDetail(null);return null;}const pi=data.prospecting.indexOf(proj);const done=proj.tasks.filter(t=>t.status==="Done").length;
      return <div>
        <button onClick={()=>setDetail(null)} style={S.btn}>← Back</button>
        <div style={{...S.card,margin:"10px 0 14px"}}><div style={{display:"flex",justifyContent:"space-between"}}><div>
          <div style={{display:"flex",gap:6,marginBottom:4,alignItems:"center"}}>
            <select value={proj.tier} onChange={e=>up(d=>{d.prospecting[pi].tier=Number(e.target.value);return d;})} style={{...S.select,width:70,fontSize:10,padding:"3px 6px",background:`${TC[proj.tier]}1a`,color:TC[proj.tier],border:`1px solid ${TC[proj.tier]}44`,fontWeight:700}}><option value={1}>Tier 1</option><option value={2}>Tier 2</option><option value={3}>Tier 3</option></select>
            <Editable value={proj.cat} onSave={v=>up(d=>{d.prospecting[pi].cat=v;return d;})} style={{fontSize:11,color:C.textSecondary,fontFamily:fb}} />
          </div>
          <Editable value={proj.name} onSave={v=>up(d=>{d.prospecting[pi].name=v;return d;})} tag="h2" style={{margin:0,fontSize:19,fontWeight:700,color:C.cream,fontFamily:ff}} />
          <div style={{display:"flex",gap:12,marginTop:4}}><Editable value={proj.rev} onSave={v=>up(d=>{d.prospecting[pi].rev=v;return d;})} style={S.dim} /><Editable value={proj.timeline} onSave={v=>up(d=>{d.prospecting[pi].timeline=v;return d;})} style={S.dim} /></div>
        </div><div style={{textAlign:"right"}}><div style={{fontSize:26,fontWeight:800,color:TC[proj.tier],fontFamily:ff}}>{proj.tasks.length?Math.round(done/proj.tasks.length*100):0}%</div><div style={S.dim}>complete</div></div></div></div>
        <div style={S.section}>Contacts</div>
        {proj.contacts.map((c,ci)=><div key={ci} style={{...S.card,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px"}}><div><Editable value={c.name} onSave={v=>up(d=>{d.prospecting[pi].contacts[ci].name=v;return d;})} style={{fontSize:13,fontWeight:700,color:C.cream,fontFamily:ff}} /><Editable value={c.title} onSave={v=>up(d=>{d.prospecting[pi].contacts[ci].title=v;return d;})} style={{...S.dim,display:"block",marginTop:2}} /><Editable value={c.email} onSave={v=>up(d=>{d.prospecting[pi].contacts[ci].email=v;return d;})} style={{fontSize:11,color:C.gold,display:"block",marginTop:1,fontFamily:fb}} /></div><div style={{display:"flex",gap:6}}><Pill color={c.email?"#2ecc71":C.red}>{c.status}</Pill><button onClick={()=>up(d=>{d.prospecting[pi].contacts.splice(ci,1);return d;})} style={S.btnD}>✕</button></div></div>)}
        <button onClick={()=>up(d=>{d.prospecting[pi].contacts.push({name:"New Contact",title:"",email:"",status:"New",loc:""});return d;})} style={{...S.btn,marginBottom:14,marginTop:4}}>+ Add Contact</button>
        <div style={S.section}>Notes</div>
        <textarea value={proj.notes||""} onChange={e=>up(d=>{d.prospecting[pi].notes=e.target.value;return d;})} placeholder="Meeting notes, intel, call-back dates..." rows={3} style={{...S.input,resize:"vertical",marginBottom:14,lineHeight:1.5}} />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={S.section}>Tasks</div>
          <button onClick={()=>{const outcome=prompt("Outcome: Won, Lost, or Stalled?");if(!outcome)return;const reason=prompt("One-line reason:");up(d=>{if(!d.winLossLog)d.winLossLog=[];d.winLossLog.unshift({id:uid(),name:proj.name,tier:proj.tier,cat:proj.cat,outcome,reason:reason||"",date:td(),contacts:proj.contacts});d.prospecting.splice(pi,1);return d;});setDetail(null);}} style={{...S.btn,fontSize:11,padding:"5px 12px",marginBottom:10}}>🏆 Log Outcome & Archive</button>
        </div>
        {proj.tasks.map((t,i)=><TaskRow key={i} task={t} onCycle={()=>up(d=>{d.prospecting[pi].tasks[i].status=cyc(d.prospecting[pi].tasks[i].status);return d;})} onDelete={()=>up(d=>{d.prospecting[pi].tasks.splice(i,1);return d;})} onSetPri={v=>up(d=>{d.prospecting[pi].tasks[i].priority=v;return d;})} onSetDue={v=>up(d=>{d.prospecting[pi].tasks[i].due=v;return d;})} />)}
        <AddTask onAdd={(desc,p,d)=>up(dd=>{dd.prospecting[pi].tasks.push(mk(desc,p,d));return dd;})} />
      </div>;
    }
    // ── NEW PROSPECT INLINE FORM ──
    const NewProspectForm=()=>{const [n,setN]=useState("");const [t,setT]=useState("2");const [c,setC]=useState("Senior Living");
      return <div style={{...S.card,marginBottom:14,padding:"14px 18px"}}><div style={{...S.section,marginBottom:8}}>New Opportunity</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:2,minWidth:200}}><div style={{fontSize:10,color:C.textSecondary,marginBottom:3}}>Name</div><input value={n} onChange={e=>setN(e.target.value)} placeholder="Company or opportunity name" style={S.input} /></div>
          <div style={{width:80}}><div style={{fontSize:10,color:C.textSecondary,marginBottom:3}}>Tier</div><select value={t} onChange={e=>setT(e.target.value)} style={S.select}><option value="1">Tier 1</option><option value="2">Tier 2</option><option value="3">Tier 3</option></select></div>
          <div style={{flex:1,minWidth:120}}><div style={{fontSize:10,color:C.textSecondary,marginBottom:3}}>Category</div><select value={c} onChange={e=>setC(e.target.value)} style={S.select}><option>Senior Living</option><option>Multifamily</option><option>Institutional</option><option>Development</option><option>Nonprofit</option><option>Library</option><option>A&D</option><option>Affordable Housing</option><option>Commercial</option><option>Other</option></select></div>
          <button onClick={()=>{if(!n.trim())return;const tier=Number(t);up(d=>{d.prospecting.push({id:uid(),name:n.trim(),tier,cat:c,rev:"",timeline:"",notes:"",contacts:[{name:"(add contact)",title:"",email:"",status:"New",loc:""}],tasks:genPT(tier)});return d;});setN("");setShowNewProspect(false);}} style={S.btnP}>Create</button>
          <button onClick={()=>setShowNewProspect(false)} style={S.btn}>Cancel</button>
        </div>
      </div>;
    };
    return <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{margin:0,fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Prospecting Pipeline</h2>
        <button onClick={()=>setShowNewProspect(true)} style={S.btnP}>+ New Opportunity</button>
      </div>
      {showNewProspect&&<NewProspectForm />}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {data.prospecting.map((p,pi)=>{const done=p.tasks.filter(t=>t.status==="Done").length;const pct=p.tasks.length?Math.round(done/p.tasks.length*100):0;const hi=p.tasks.filter(t=>t.priority==="High"&&t.status!=="Done").length;
          return <div key={p.id} style={{...S.card,cursor:"pointer",position:"relative",overflow:"hidden",transition:"all 0.15s"}} onClick={()=>setDetail(p.id)} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(200,169,110,0.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.cardBorder}>
            <div style={{position:"absolute",top:0,left:0,width:`${pct}%`,height:3,background:TC[p.tier],borderRadius:"14px 0 0 0"}} />
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{fontSize:13,fontWeight:700,color:C.cream,fontFamily:ff}}>{p.name}</div><div style={{display:"flex",gap:5}}><Pill color={TC[p.tier]}>T{p.tier}</Pill><button onClick={e=>{e.stopPropagation();if(confirm(`Delete "${p.name}"?`))up(d=>{d.prospecting.splice(pi,1);return d;});}} style={{...S.btnD,padding:"1px 6px",fontSize:9}}>✕</button></div></div>
            <div style={S.dim}>{p.cat} · {p.rev}</div>
            <div style={{display:"flex",gap:6,alignItems:"center",marginTop:6}}><div style={{flex:1,height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:TC[p.tier],borderRadius:2}} /></div><span style={{fontSize:11,fontWeight:700,color:TC[p.tier],fontFamily:ff}}>{pct}%</span></div>
            <div style={{...S.dim,marginTop:5,display:"flex",gap:10}}><span>✅ {done}/{p.tasks.length}</span>{hi>0&&<span style={{color:C.red}}>🔥 {hi} high</span>}</div>
          </div>;
        })}
      </div>
    </div>;
  };

  // ═══ OUTREACH ═══
  const OutreachTab=()=>{
    const [showNew,setShowNew]=useState(false);const [nf,setNf]=useState({name:"",filters:"",listSize:"",emailLink:"",openRate:"",ctr:"",sender:"",status:"Active",notes:"",contacts:[]});
    const campaigns=data.outreach||[];
    return <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Outreach Campaigns</h2><div style={S.sub}>Apollo → HubSpot → Targeted Emails from Brittany & Alyssa</div></div>
        <button onClick={()=>setShowNew(true)} style={S.btnP}>+ New Campaign</button>
      </div>
      {showNew&&<div style={{...S.card,marginBottom:14}}>
        <div style={{...S.section,marginBottom:8}}>New Campaign</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><div style={{fontSize:10,color:C.textSecondary,marginBottom:3}}>Campaign Name</div><input value={nf.name} onChange={e=>setNf({...nf,name:e.target.value})} placeholder="e.g., Senior Living Ohio Q2" style={S.input} /></div>
          <div><div style={{fontSize:10,color:C.textSecondary,marginBottom:3}}>Sender</div><select value={nf.sender} onChange={e=>setNf({...nf,sender:e.target.value})} style={S.select}><option value="">Select...</option><option>Brittany</option><option>Alyssa</option></select></div>
          <div style={{gridColumn:"1/-1"}}><div style={{fontSize:10,color:C.textSecondary,marginBottom:3}}>Apollo Search Filters / Tags</div><input value={nf.filters} onChange={e=>setNf({...nf,filters:e.target.value})} placeholder="e.g., Senior Living, Ohio, VP+, 50-500 employees, buying intent: high" style={S.input} /></div>
          <div><div style={{fontSize:10,color:C.textSecondary,marginBottom:3}}>List Size</div><input type="number" value={nf.listSize} onChange={e=>setNf({...nf,listSize:e.target.value})} placeholder="0" style={S.input} /></div>
          <div><div style={{fontSize:10,color:C.textSecondary,marginBottom:3}}>HubSpot Email Link</div><input value={nf.emailLink} onChange={e=>setNf({...nf,emailLink:e.target.value})} placeholder="https://app.hubspot.com/..." style={S.input} /></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{if(!nf.name.trim())return;up(d=>{if(!d.outreach)d.outreach=[];d.outreach.unshift({id:uid(),name:nf.name.trim(),filters:nf.filters,listSize:Number(nf.listSize)||0,emailLink:nf.emailLink,openRate:0,ctr:0,sender:nf.sender,status:"Active",notes:"",contacts:[],date:td()});return d;});setNf({name:"",filters:"",listSize:"",emailLink:"",openRate:"",ctr:"",sender:"",status:"Active",notes:"",contacts:[]});setShowNew(false);}} style={S.btnP}>Create Campaign</button>
          <button onClick={()=>setShowNew(false)} style={S.btn}>Cancel</button>
        </div>
      </div>}
      {campaigns.length===0&&!showNew?<div style={{...S.card,textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:8}}>📤</div><div style={{fontSize:13,color:C.textSecondary,fontFamily:fb}}>No outreach campaigns yet</div><div style={S.dim}>Create your first Apollo → HubSpot campaign above.</div></div>:
        campaigns.map((camp,ci)=>{
          return <div key={camp.id} style={{...S.card,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><div style={{fontSize:15,fontWeight:700,color:C.cream,fontFamily:ff}}>{camp.name}</div><div style={S.dim}>{camp.date} · Sent from: {camp.sender||"TBD"}</div></div>
              <div style={{display:"flex",gap:6}}><Pill color={camp.status==="Active"?"#2ecc71":camp.status==="Paused"?C.gold:C.textDim}>{camp.status}</Pill><button onClick={()=>up(d=>{d.outreach.splice(ci,1);return d;})} style={S.btnD}>✕</button></div>
            </div>
            {camp.filters&&<div style={{background:C.navy,borderRadius:8,padding:"8px 12px",marginBottom:10}}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1,marginBottom:4,fontFamily:ff}}>Apollo Filters</div><div style={{fontSize:12,color:C.cream,fontFamily:fb}}>{camp.filters}</div></div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:10}}>
              {[["List Size","listSize","number"],["Open Rate %","openRate","number"],["CTR %","ctr","number"],["Status","status","select"]].map(([l,k,t])=>
                <div key={k}><div style={{fontSize:9,color:C.textSecondary,marginBottom:3,fontFamily:fb}}>{l}</div>
                  {t==="select"?<select value={camp[k]} onChange={e=>up(d=>{d.outreach[ci][k]=e.target.value;return d;})} style={S.select}><option>Active</option><option>Paused</option><option>Complete</option><option>Draft</option></select>
                  :<NumInput type="number" value={camp[k]||""} placeholder="0" onChange={v=>up(d=>{d.outreach[ci][k]=v;return d;})} style={S.input} />}
                </div>
              )}
            </div>
            {camp.emailLink&&<div style={{marginBottom:8}}><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>HubSpot Link</div><a href={camp.emailLink} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:C.gold,fontFamily:fb}}>{camp.emailLink}</a></div>}
            <div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Notes</div>
            <textarea value={camp.notes||""} onChange={e=>up(d=>{d.outreach[ci].notes=e.target.value;return d;})} placeholder="Campaign notes..." rows={2} style={{...S.input,resize:"vertical",marginBottom:8}} />
            <div style={{...S.section,marginTop:4}}>Target Contacts</div>
            {(camp.contacts||[]).map((ct,cti)=><div key={cti} style={{display:"flex",gap:8,alignItems:"center",padding:"4px 0",borderBottom:`1px solid ${C.cardBorder}`}}>
              <span style={{fontSize:12,color:C.cream,fontFamily:fb,flex:1}}>{ct.name}</span><span style={{fontSize:11,color:C.textSecondary,fontFamily:fb}}>{ct.title}</span><span style={{fontSize:11,color:C.gold,fontFamily:fb}}>{ct.email}</span>
              <button onClick={()=>up(d=>{d.outreach[ci].contacts.splice(cti,1);return d;})} style={{...S.btnD,padding:"1px 5px",fontSize:8}}>✕</button>
            </div>)}
            <div style={{display:"flex",gap:6,marginTop:6}}>
              {[["Name","name"],["Title","title"],["Email","email"]].map(([l,k])=><input key={k} id={`oc-${camp.id}-${k}`} placeholder={l} style={{...S.input,flex:1,fontSize:11}} />)}
              <button onClick={()=>{const n=document.getElementById(`oc-${camp.id}-name`);const t=document.getElementById(`oc-${camp.id}-title`);const e=document.getElementById(`oc-${camp.id}-email`);if(!n.value.trim())return;up(d=>{if(!d.outreach[ci].contacts)d.outreach[ci].contacts=[];d.outreach[ci].contacts.push({name:n.value.trim(),title:t.value.trim(),email:e.value.trim()});return d;});n.value="";t.value="";e.value="";}} style={S.btnP}>+</button>
            </div>
          </div>;
        })
      }
    </div>;
  };

  // ═══ TRADE SHOWS ═══
  const TradeShowsTab=()=>{
    const ws=data.showScoring?.weights||{industry:20,cost:25,travel:20,oppCost:10,quality:15,dealer:10};
    const calcTotal=(scores)=>{if(!scores)return 0;return((ws.industry*(scores.industry||0)+ws.cost*(scores.cost||0)+ws.travel*(scores.travel||0)+ws.oppCost*(scores.oppCost||0)+ws.quality*(scores.quality||0)+ws.dealer*(scores.dealer||0))/100);};
    const sorted=[...data.tradeShows].sort((a,b)=>(b.total||calcTotal(b.scores))-(a.total||calcTotal(a.scores)));
    const confirmed=data.tradeShows.filter(t=>["CONFIRMED","RECOMMENDED"].includes(t.status));
    const totalBudget=confirmed.reduce((s,t)=>s+(t.cost||0),0);
    const [exp,setExp]=useState(null);const [showWeights,setShowWeights]=useState(false);const [showVert,setShowVert]=useState(false);const [showNew,setShowNew]=useState(false);
    const [nf,setNf]=useState({name:"",ind:"Commercial",city:"",cost:0,dist:0,overnight:false,quality:"Low",dealer:"No",date:""});
    const verts=data.verticals||DEF.verticals;
    const statusC={"CONFIRMED":"#2ecc71","RECOMMENDED":C.gold,"EVALUATE":"#5DADE2","OPTIONAL":"#8A9BB5","NOT RECOMMENDED":C.red,"TBD":"#8A9BB5","COMPLETED":"#2ecc71"};
    const scoreColor=s=>s>=7?"#2ecc71":s>=5?C.gold:s>=3?"#8A9BB5":C.red;

    return <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div><h2 style={{margin:0,fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Trade Show Evaluation</h2>
          <div style={S.sub}>{confirmed.length} confirmed/recommended · Budget: ${totalBudget.toLocaleString()} of $20,000 ({(20000-totalBudget)>=0?`$${(20000-totalBudget).toLocaleString()} buffer`:`$${Math.abs(20000-totalBudget).toLocaleString()} over`})</div></div>
        <div style={{display:"flex",gap:6}}><button onClick={()=>setShowWeights(!showWeights)} style={S.btn}>⚙️ Weights</button><button onClick={()=>setShowVert(!showVert)} style={S.btn}>📊 Verticals</button><button onClick={()=>setShowNew(true)} style={S.btnP}>+ Evaluate Show</button></div>
      </div>

      {/* Weights Editor */}
      {showWeights&&<div style={{...S.card,marginBottom:12}}><div style={S.section}>Scoring Weights (must total 100%)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
          {[["Industry","industry"],["Cost","cost"],["Travel","travel"],["Opp Cost","oppCost"],["Quality","quality"],["Dealer","dealer"]].map(([l,k])=>
            <div key={k}><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>{l}</div>
              <NumInput type="number" value={ws[k]} onChange={v=>up(d=>{if(!d.showScoring)d.showScoring={weights:{...ws}};d.showScoring.weights[k]=v;return d;})} style={{...S.input,textAlign:"center"}} />
            </div>
          )}
        </div>
        <div style={{fontSize:10,color:Object.values(ws).reduce((a,b)=>a+b,0)===100?"#2ecc71":C.red,marginTop:6,fontFamily:fb}}>Total: {Object.values(ws).reduce((a,b)=>a+b,0)}%</div>
      </div>}

      {/* Vertical Strategy */}
      {showVert&&<div style={{...S.card,marginBottom:12}}><div style={S.section}>Vertical Strategy — Margin Goals</div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>{["Vertical","2025 Margin","2026 Goal","Ind. Avg","Gap","Notes"].map(h=><th key={h} style={{textAlign:"left",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>{h}</th>)}</tr></thead>
          <tbody>{verts.map((v,i)=><tr key={i}>
            <td style={{padding:"5px 8px",color:C.cream,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontSize:12,fontWeight:600,fontFamily:fb}}>{v.name}</td>
            <td style={{padding:"5px 8px",color:C.textSecondary,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontSize:11,fontFamily:fb}}>{v.margin25}%</td>
            <td style={{padding:"5px 8px",color:C.gold,fontWeight:600,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontSize:11,fontFamily:fb}}>{v.goal26}%</td>
            <td style={{padding:"5px 8px",color:C.textSecondary,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontSize:11,fontFamily:fb}}>{v.indAvg}%</td>
            <td style={{padding:"5px 8px",borderBottom:`1px solid rgba(200,169,110,0.05)`,fontSize:11,fontFamily:fb}}><span style={{color:v.gap>=8?C.red:v.gap>=5?C.gold:"#2ecc71",fontWeight:700}}>+{v.gap}pts</span></td>
            <td style={{padding:"5px 8px",color:C.textDim,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontSize:10,fontFamily:fb}}>{v.notes}</td>
          </tr>)}</tbody>
        </table></div>
      </div>}

      {/* Add New Show Form */}
      {showNew&&<div style={{...S.card,marginBottom:12}}><div style={S.section}>Evaluate New Show</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Show Name</div><input value={nf.name} onChange={e=>setNf({...nf,name:e.target.value})} style={S.input} /></div>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Industry</div><select value={nf.ind} onChange={e=>setNf({...nf,ind:e.target.value})} style={S.select}>{["Commercial","Church / Faith","Senior Living","Healthcare","Affordable Housing","Library","Government","Education"].map(v=><option key={v}>{v}</option>)}</select></div>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>City</div><input value={nf.city} onChange={e=>setNf({...nf,city:e.target.value})} style={S.input} /></div>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Cost ($)</div><NumInput value={nf.cost} onChange={v=>setNf({...nf,cost:v})} style={S.input} /></div>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Distance (mi)</div><NumInput value={nf.dist} onChange={v=>setNf({...nf,dist:v})} style={S.input} /></div>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Overnight?</div><select value={nf.overnight?"Yes":"No"} onChange={e=>setNf({...nf,overnight:e.target.value==="Yes"})} style={S.select}><option>No</option><option>Yes</option></select></div>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Attendee Quality</div><select value={nf.quality} onChange={e=>setNf({...nf,quality:e.target.value})} style={S.select}><option>Low</option><option>Medium</option><option>High</option></select></div>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Dealer Presence</div><select value={nf.dealer} onChange={e=>setNf({...nf,dealer:e.target.value})} style={S.select}><option>No</option><option>Yes</option><option>Unknown</option></select></div>
          <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3}}>Show Date</div><input type="date" value={nf.date||""} onChange={e=>setNf({...nf,date:e.target.value})} style={S.input} /></div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{if(!nf.name.trim())return;const indMap={"Commercial":10,"Church / Faith":8,"Senior Living":8,"Healthcare":8,"Affordable Housing":6,"Library":5,"Government":2,"Education":3};const costS=nf.cost<=300?10:nf.cost<=750?6:nf.cost<=1500?4:1;const travS=nf.dist<=50?10:nf.dist<=100?7:nf.dist<=200?2:nf.dist<=400?1:0;const oppS=nf.overnight?2:4;const qualS=nf.quality==="High"?10:nf.quality==="Medium"?6:2;const dealS=nf.dealer==="Yes"?5:nf.dealer==="No"?10:0;const scores={industry:indMap[nf.ind]||5,cost:costS,travel:travS,oppCost:oppS,quality:qualS,dealer:dealS};const total=calcTotal(scores);
            up(d=>{d.tradeShows.push({id:uid(),name:nf.name.trim(),ind:nf.ind,city:nf.city,cost:nf.cost,dist:nf.dist,date:nf.date,repType:"Mixed",reps:2,overnight:nf.overnight,quality:nf.quality,dealer:nf.dealer,scores,total:+total.toFixed(2),status:"EVALUATE",leads:0,meetings:0,revenue:0,tasks:genST()});return d;});
            setNf({name:"",ind:"Commercial",city:"",cost:0,dist:0,overnight:false,quality:"Low",dealer:"No",date:""});setShowNew(false);}} style={S.btnP}>Score & Add</button>
          <button onClick={()=>setShowNew(false)} style={S.btn}>Cancel</button>
        </div>
      </div>}

      {/* Show List — sorted by score */}
      {sorted.map(ts=>{const isE=exp===ts.id;const tsi=data.tradeShows.indexOf(ts);const score=ts.total||calcTotal(ts.scores);
        return <div key={ts.id} style={{...S.card,marginBottom:6,padding:0,overflow:"hidden"}}>
          <div onClick={()=>setExp(isE?null:ts.id)} style={{padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,borderRadius:10,background:`${scoreColor(score)}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:16,fontWeight:800,color:scoreColor(score),fontFamily:ff}}>{score.toFixed(1)}</span>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:14,fontWeight:700,color:C.cream,fontFamily:ff}}>{ts.name}</span><Pill color={statusC[ts.status]||C.gold}>{ts.status}</Pill></div>
              <div style={{...S.dim,marginTop:2}}>{ts.ind} · {ts.city} · ${(ts.cost||0).toLocaleString()} · {ts.dist||"?"}mi {ts.overnight?"· Overnight":""}{ts.date?` · 📅 ${ts.date}`:""}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {ts.leads>0&&<div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:C.cream,fontFamily:ff}}>{ts.leads}</div><div style={{fontSize:7,color:C.textSecondary}}>LEADS</div></div>}
              {ts.revenue>0&&<div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:C.gold,fontFamily:ff}}>${(ts.revenue/1000).toFixed(0)}K</div><div style={{fontSize:7,color:C.textSecondary}}>REV</div></div>}
              <span style={{fontSize:12,color:C.textSecondary}}>{isE?"▲":"▼"}</span>
            </div>
          </div>
          {isE&&<div style={{padding:"0 16px 14px",borderTop:`1px solid ${C.cardBorder}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,margin:"10px 0"}}>
              <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3,fontFamily:fb}}>Show Date</div><input type="date" value={ts.date||""} onChange={e=>up(d=>{d.tradeShows[tsi].date=e.target.value;return d;})} style={S.input} /></div>
              <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3,fontFamily:fb}}>Industry</div><select value={ts.ind} onChange={e=>up(d=>{d.tradeShows[tsi].ind=e.target.value;return d;})} style={S.select}>{["Commercial","Church / Faith","Senior Living","Healthcare","Affordable Housing","Library","Government","Education"].map(v=><option key={v}>{v}</option>)}</select></div>
              <div><div style={{fontSize:9,color:C.textSecondary,marginBottom:3,fontFamily:fb}}>Cost ($)</div><NumInput type="number" value={ts.cost||""} onChange={v=>up(d=>{d.tradeShows[tsi].cost=v;return d;})} style={S.input} /></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6,margin:"10px 0"}}>{[["Industry",ts.scores?.industry],["Cost",ts.scores?.cost],["Travel",ts.scores?.travel],["Opp Cost",ts.scores?.oppCost],["Quality",ts.scores?.quality],["Dealer",ts.scores?.dealer]].map(([l,v])=>
              <div key={l} style={{background:C.navy,borderRadius:8,padding:"6px 8px",textAlign:"center"}}><div style={{fontSize:8,color:C.textSecondary}}>{l}</div><div style={{fontSize:16,fontWeight:800,color:v>=7?"#2ecc71":v>=4?C.gold:C.red,fontFamily:ff}}>{v||0}</div></div>
            )}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,margin:"8px 0"}}>
              {[["Leads","leads"],["Meetings","meetings"],["Revenue ($)","revenue"],["Status","status"]].map(([l,k])=>
                <div key={k}><div style={{fontSize:9,color:C.textSecondary,marginBottom:3,fontFamily:fb}}>{l}</div>
                  {k==="status"?<select value={ts[k]} onChange={e=>up(d=>{d.tradeShows[tsi][k]=e.target.value;return d;})} style={S.select}>{["CONFIRMED","RECOMMENDED","EVALUATE","OPTIONAL","NOT RECOMMENDED","TBD","COMPLETED"].map(s=><option key={s}>{s}</option>)}</select>
                  :<NumInput type="number" value={ts[k]||""} placeholder="0" onChange={v=>up(d=>{d.tradeShows[tsi][k]=v;return d;})} style={S.input} />}
                </div>)}
            </div>
            <div style={{...S.section,marginTop:10}}>Prep & Follow-up</div>
            {(ts.tasks||[]).map((t,ti)=><TaskRow key={ti} task={t} compact onCycle={()=>up(d=>{d.tradeShows[tsi].tasks[ti].status=cyc(d.tradeShows[tsi].tasks[ti].status);return d;})} onDelete={()=>up(d=>{d.tradeShows[tsi].tasks.splice(ti,1);return d;})} />)}
            <AddTask onAdd={(desc,p,d)=>up(dd=>{if(!dd.tradeShows[tsi].tasks)dd.tradeShows[tsi].tasks=[];dd.tradeShows[tsi].tasks.push(mk(desc,p,d));return dd;})} />
            <div style={{marginTop:8}}><button onClick={()=>{if(confirm(`Delete "${ts.name}"?`))up(d=>{d.tradeShows.splice(tsi,1);return d;});}} style={S.btnD}>Delete Show</button></div>
          </div>}
        </div>;
      })}

      {/* Budget Summary */}
      <div style={{...S.card,marginTop:14}}><div style={S.section}>Budget Summary — Confirmed & Recommended Shows</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          <div style={{background:C.navy,borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:9,color:C.textSecondary}}>Committed</div><div style={{fontSize:22,fontWeight:800,color:C.cream,fontFamily:ff}}>${totalBudget.toLocaleString()}</div></div>
          <div style={{background:C.navy,borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:9,color:C.textSecondary}}>Budget</div><div style={{fontSize:22,fontWeight:800,color:C.gold,fontFamily:ff}}>$20,000</div></div>
          <div style={{background:C.navy,borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:9,color:C.textSecondary}}>{(20000-totalBudget)>=0?"Buffer":"Over Budget"}</div><div style={{fontSize:22,fontWeight:800,color:(20000-totalBudget)>=0?"#2ecc71":C.red,fontFamily:ff}}>${Math.abs(20000-totalBudget).toLocaleString()}</div></div>
        </div>
        {confirmed.length>0&&<table style={{width:"100%",borderCollapse:"collapse"}}><tbody>
          {confirmed.sort((a,b)=>(b.total||0)-(a.total||0)).map(ts=><tr key={ts.id}>
            <td style={{padding:"5px 8px",color:C.cream,fontSize:12,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontFamily:fb}}>{ts.name}</td>
            <td style={{padding:"5px 8px",color:C.textSecondary,fontSize:11,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontFamily:fb}}>{ts.ind}</td>
            <td style={{padding:"5px 8px",color:C.gold,fontSize:12,fontWeight:600,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontFamily:fb,textAlign:"right"}}>${(ts.cost||0).toLocaleString()}</td>
            <td style={{padding:"5px 8px",borderBottom:`1px solid rgba(200,169,110,0.05)`,textAlign:"right"}}><span style={{fontSize:12,fontWeight:700,color:scoreColor(ts.total||0),fontFamily:ff}}>{(ts.total||0).toFixed(1)}</span></td>
          </tr>)}
        </tbody></table>}
      </div>

      {/* Recommendation Engine */}
      <RecommendationEngine shows={data.tradeShows} verts={data.verticals||DEF.verticals} calcTotal={calcTotal} scoreColor={scoreColor} up={up} />
    </div>;
  };

  const RecommendationEngine=({shows,verts,calcTotal,scoreColor,up})=>{
    const [budget,setBudget]=useState(20000);
    const vertGap={};verts.forEach(v=>{vertGap[v.name]=v.gap||0;});
    const maxGap=Math.max(...Object.values(vertGap),1);

    // Score every show — no filtering by status
    const allScored=shows.map(t=>{
      const base=t.total||calcTotal(t.scores);
      const vBoost=(vertGap[t.ind]||0)/maxGap*1.5;
      return{...t,base,boosted:+(base+vBoost).toFixed(2)};
    }).sort((a,b)=>b.boosted-a.boosted);

    // Get month from date
    const getMo=s=>s.date?new Date(s.date+"T12:00:00").getMonth():-1;

    // Build the annual plan — spend the full budget
    const buildPlan=bgt=>{
      const pool=[...allScored];
      const plan=[];let spent=0;const moCt={};

      // Pass 1: Pick top shows by boosted score, max 2/month initially
      for(const s of pool){
        if(spent+(s.cost||0)>bgt)continue;
        const mo=getMo(s);const mk=mo>=0?MO[mo]:"TBD";
        if((moCt[mk]||0)>=2)continue;
        plan.push(s);spent+=(s.cost||0);moCt[mk]=(moCt[mk]||0)+1;
      }

      // Pass 2: Fill priority vertical gaps (gap ≥5) if budget allows
      const planIds=new Set(plan.map(s=>s.id));
      const priV=verts.filter(v=>v.gap>=5).map(v=>v.name);
      const covV=()=>new Set(plan.map(s=>s.ind));
      for(const mv of priV.filter(v=>!covV().has(v))){
        const c=pool.find(s=>s.ind===mv&&!planIds.has(s.id)&&spent+(s.cost||0)<=bgt);
        if(c){plan.push(c);spent+=(c.cost||0);planIds.add(c.id);const mo=getMo(c);const mk=mo>=0?MO[mo]:"TBD";moCt[mk]=(moCt[mk]||0)+1;}
      }

      // Pass 3: If >$500 remaining, keep adding shows (relax to 3/month) until budget nearly spent
      if(bgt-spent>500){
        for(const s of pool){
          if(planIds.has(s.id)||spent+(s.cost||0)>bgt)continue;
          const mo=getMo(s);const mk=mo>=0?MO[mo]:"TBD";
          if((moCt[mk]||0)>=3)continue;
          plan.push(s);spent+=(s.cost||0);planIds.add(s.id);moCt[mk]=(moCt[mk]||0)+1;
          if(bgt-spent<300)break;
        }
      }

      // Sort plan chronologically
      plan.sort((a,b)=>{const aM=getMo(a);const bM=getMo(b);return(aM===-1?99:aM)-(bM===-1?99:bM);});
      const finalCov=[...covV()];
      return{plan,spent,moCt,covV:finalCov,missingPri:priV.filter(v=>!finalCov.includes(v)),notIn:allScored.filter(s=>!planIds.has(s.id))};
    };

    const p=buildPlan(budget);

    // Group by month for calendar
    const planByMo={};MO.forEach(m=>{planByMo[m]=[];});
    p.plan.forEach(s=>{const mo=getMo(s);const mk=mo>=0?MO[mo]:"TBD";(planByMo[mk]=planByMo[mk]||[]).push(s);});
    const moCost=m=>(planByMo[m]||[]).reduce((s,x)=>s+(x.cost||0),0);
    const maxMoC=Math.max(...MO.map(moCost),1);

    return <div style={{...S.card,marginTop:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:8}}>
        <div><div style={S.section}>Claude's Recommended 2026 Trade Show Plan</div><div style={{fontSize:10,color:C.textDim,fontFamily:fb}}>Full annual plan optimized for score, vertical strategy, calendar spacing, and budget utilization. Adjust budget to see the plan change.</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:C.textSecondary,fontFamily:fb}}>Budget: $</span><NumInput type="number" value={budget} onChange={v=>setBudget(v)} style={{...S.input,width:90,textAlign:"center"}} /></div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,margin:"14px 0"}}>
        {[["Shows",p.plan.length,C.cream],["Spend","$"+p.spent.toLocaleString(),C.gold],["Remaining","$"+(budget-p.spent).toLocaleString(),(budget-p.spent)>=0&&(budget-p.spent)<1000?"#2ecc71":(budget-p.spent)<0?C.red:C.gold],["Verticals",p.covV.length+"/"+verts.length,C.cream],["Avg Score",(p.plan.reduce((s,x)=>s+x.base,0)/Math.max(p.plan.length,1)).toFixed(1),C.gold]].map(([l,v,c])=>
          <div key={l} style={{background:C.navy,borderRadius:10,padding:"8px 6px",textAlign:"center"}}><div style={{fontSize:8,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1,fontFamily:ff}}>{l}</div><div style={{fontSize:16,fontWeight:800,color:c,fontFamily:ff,marginTop:2}}>{v}</div></div>)}
      </div>

      {p.missingPri.length>0&&<div style={{background:`${C.red}0a`,border:`1px solid ${C.red}30`,borderRadius:10,padding:"8px 14px",marginBottom:12,fontSize:11,color:C.red,fontFamily:fb}}>⚠️ Priority verticals without coverage: {p.missingPri.join(", ")}. No available shows in these verticals fit the remaining budget.</div>}

      {/* 12-month calendar grid */}
      <div style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:1.5,marginBottom:8,fontFamily:ff}}>ANNUAL CALENDAR</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        {MO.map(m=>{const ms=planByMo[m]||[];const cost=moCost(m);
          return <div key={m} style={{background:ms.length>0?C.cardBg:"rgba(26,47,69,0.2)",border:`1px solid ${ms.length>0?C.cardBorder:"rgba(200,169,110,0.04)"}`,borderRadius:12,padding:"10px 12px",minHeight:70}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontSize:13,fontWeight:700,color:ms.length>0?C.gold:C.textDim,fontFamily:ff}}>{m}</span>
              <div style={{textAlign:"right"}}>
                {cost>0&&<div style={{fontSize:10,fontWeight:700,color:C.gold,fontFamily:fb}}>${cost.toLocaleString()}</div>}
                {ms.length>0&&<div style={{fontSize:8,color:C.textSecondary,fontFamily:fb}}>{ms.length} show{ms.length>1?"s":""}</div>}
              </div>
            </div>
            {ms.map(s=><div key={s.id} style={{background:`${C.gold}12`,border:`1px solid ${C.gold}28`,borderRadius:8,padding:"6px 8px",marginBottom:3}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,fontWeight:600,color:C.cream,fontFamily:fb}}>{s.name}</span>
                <span style={{fontSize:10,fontWeight:800,color:scoreColor(s.base),fontFamily:ff}}>{s.base.toFixed(1)}</span>
              </div>
              <div style={{fontSize:9,color:C.textSecondary,fontFamily:fb}}>{s.ind} · ${(s.cost||0).toLocaleString()}</div>
            </div>)}
            {ms.length===0&&<div style={{fontSize:9,color:C.textDim,textAlign:"center",marginTop:8,fontFamily:fb}}>Open month</div>}
          </div>;
        })}
      </div>

      {/* Monthly cost bars */}
      <div style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:1.5,marginBottom:8,fontFamily:ff}}>MONTHLY COST</div>
      <div style={{display:"flex",gap:3,alignItems:"flex-end",height:70,marginBottom:16}}>
        {MO.map(m=>{const cost=moCost(m);const h=cost>0?Math.max(10,cost/maxMoC*60):3;
          return <div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            {cost>0&&<span style={{fontSize:8,color:C.gold,fontFamily:fb,fontWeight:600}}>${(cost/1000).toFixed(1)}K</span>}
            <div style={{width:"100%",height:h,background:cost>0?C.gold:`${C.textDim}15`,borderRadius:3}} />
            <span style={{fontSize:8,color:C.textSecondary,fontFamily:fb}}>{m}</span>
          </div>;
        })}
      </div>

      {/* Full ranked table */}
      <div style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:1.5,marginBottom:8,fontFamily:ff}}>FULL RECOMMENDED LIST ({p.plan.length} SHOWS)</div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}><thead><tr>
        {["#","Show","Vertical","City","Cost","Score","Boosted","Month"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 8px",color:C.textSecondary,fontSize:9,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>{h}</th>)}
      </tr></thead><tbody>
        {p.plan.map((s,i)=>{const mo=s.date?new Date(s.date+"T12:00:00").toLocaleDateString("en-US",{month:"short"}):"TBD";const vG=vertGap[s.ind]||0;
          return <tr key={s.id} style={{background:i%2===0?"transparent":`${C.mid}44`}}>
            <td style={{padding:"5px 8px",color:C.textSecondary,fontSize:11,fontFamily:fb}}>{i+1}</td>
            <td style={{padding:"5px 8px",color:C.cream,fontSize:12,fontWeight:600,fontFamily:fb}}>{s.name}</td>
            <td style={{padding:"5px 8px",fontSize:11,fontFamily:fb}}><span style={{color:C.textSecondary}}>{s.ind}</span> <span style={{fontSize:9,color:vG>=8?C.red:vG>=5?C.gold:"#2ecc71"}}>(+{vG}pts)</span></td>
            <td style={{padding:"5px 8px",color:C.textDim,fontSize:10,fontFamily:fb}}>{s.city}</td>
            <td style={{padding:"5px 8px",color:C.gold,fontSize:11,fontWeight:600,fontFamily:fb}}>${(s.cost||0).toLocaleString()}</td>
            <td style={{padding:"5px 8px"}}><span style={{fontSize:12,fontWeight:700,color:scoreColor(s.base),fontFamily:ff}}>{s.base.toFixed(1)}</span></td>
            <td style={{padding:"5px 8px",fontSize:10,color:C.gold,fontFamily:fb}}>→ {s.boosted.toFixed(1)}</td>
            <td style={{padding:"5px 8px",color:C.textSecondary,fontSize:11,fontFamily:fb}}>{mo}</td>
          </tr>;
        })}
        <tr style={{borderTop:`2px solid ${C.gold}33`}}>
          <td colSpan={4} style={{padding:"6px 8px",fontWeight:700,color:C.gold,fontSize:11,fontFamily:ff}}>TOTAL</td>
          <td style={{padding:"6px 8px",fontWeight:800,color:C.gold,fontSize:12,fontFamily:ff}}>${p.spent.toLocaleString()}</td>
          <td colSpan={3} style={{padding:"6px 8px",color:C.textSecondary,fontSize:10,fontFamily:fb}}>of ${budget.toLocaleString()} (${budget-p.spent>=0?`$${(budget-p.spent).toLocaleString()} remaining`:`over by $${Math.abs(budget-p.spent).toLocaleString()}`})</td>
        </tr>
      </tbody></table>

      {/* Vertical coverage */}
      <div style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:1.5,marginBottom:8,fontFamily:ff}}>VERTICAL COVERAGE</div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
        {verts.map(v=>{const ct=p.plan.filter(s=>s.ind===v.name).length;
          return <span key={v.name} style={{...S.badge(ct>0?"#2ecc71":v.gap>=5?C.red:C.textDim),padding:"4px 12px",fontSize:10}}>
            {v.name} {ct>0?`(${ct} show${ct>1?"s":""})`:v.gap>=5?"⚠️ gap":"—"}
          </span>;
        })}
      </div>

      {/* Not included */}
      {p.notIn.length>0&&<div>
        <div style={{fontSize:11,fontWeight:700,color:C.textDim,letterSpacing:1.5,marginBottom:6,fontFamily:ff}}>NOT INCLUDED ({p.notIn.length})</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>
          {p.notIn.map(s=><span key={s.id} style={{fontSize:10,color:C.textDim,padding:"3px 10px",background:`${C.textDim}12`,borderRadius:6,fontFamily:fb}}>
            {s.name} ({s.base.toFixed(1)}) · ${(s.cost||0).toLocaleString()}
          </span>)}
        </div>
      </div>}

      {/* Apply */}
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{if(confirm("Apply this plan? Sets recommended shows to RECOMMENDED.")){up(d=>{const ids=new Set(p.plan.map(s=>s.id));d.tradeShows.forEach(ts=>{if(ids.has(ts.id)&&ts.status!=="CONFIRMED"&&ts.status!=="COMPLETED")ts.status="RECOMMENDED";else if(!ids.has(ts.id)&&ts.status==="RECOMMENDED")ts.status="EVALUATE";});return d;});}}} style={S.btnP}>Apply This Plan</button>
        <span style={{fontSize:10,color:C.textDim,alignSelf:"center",fontFamily:fb}}>Sets recommended → RECOMMENDED, doesn't touch CONFIRMED</span>
      </div>
    </div>;
  };

  // ═══ CHECKLISTS ═══
  const ChecklistTab=({title,sub,dataKey,valKey,target})=><div><h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>{title}</h2><div style={{...S.sub,marginBottom:14}}>{sub}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
      {MO.map(m=>{const d=data[dataKey]?.[m]||{target,[valKey]:0};const v=d[valKey]||0;const pct=target>0?Math.min(100,Math.round(v/target*100)):0;const cur=m===MO[moI()];
        return <div key={m} style={{...S.card,border:cur?`1px solid rgba(200,169,110,0.35)`:S.card.border,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:14,fontWeight:700,color:cur?C.gold:C.cream,fontFamily:ff}}>{m}</span>
            <span style={{fontSize:20,fontWeight:800,color:pct>=100?"#2ecc71":pct>0?C.gold:C.textDim,fontFamily:ff}}>{pct}%</span>
          </div>
          <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden",marginBottom:8}}><div style={{width:`${pct}%`,height:"100%",background:pct>=100?"#2ecc71":C.gold,borderRadius:3,transition:"width 0.3s"}} /></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11,color:C.textSecondary,fontFamily:fb}}>{valKey==="sent"?"Sent":"Posted"}:</span>
            <NumInput type="number" value={v||""} placeholder="0" onChange={val=>up(dd=>{if(!dd[dataKey])dd[dataKey]={};if(!dd[dataKey][m])dd[dataKey][m]={target,[valKey]:0};dd[dataKey][m][valKey]=val;return dd;})} style={{...S.input,width:48,textAlign:"center",padding:"4px"}} />
            <span style={{fontSize:11,color:C.textSecondary,fontFamily:fb}}>/ {target}</span>
          </div>
        </div>;
      })}
    </div>
  </div>;

  // ═══ REBRAND ═══
  const RebrandTab=()=>{const phases=[...new Set(data.rebrand.map(t=>t.phase))];const phC={"1. LOGO":C.red,"2. COLORS":C.gold,"3. WEBSITE":"#5DADE2","4. COLLATERAL":"#2ecc71"};
    return <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div><h2 style={{margin:0,fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Rebrand Timeline</h2><div style={S.sub}>$9K · Mar–Oct 2026 · Wix</div></div>
        <button onClick={()=>{const t=prompt("Task:");if(t)up(d=>{d.rebrand.push({id:uid(),phase:"Other",task:t,start:"",end:"",owner:"Josh",status:"Not Started",priority:"Medium"});return d;});}} style={S.btnP}>+ Add</button></div>
      <div style={{...S.card,marginBottom:14,padding:"14px 18px"}}><div style={{display:"flex",gap:0}}>{["Mar","Apr","May","Jun","Jul","Aug","Sep","Oct"].map((m,i)=>{const mp=data.rebrand.filter(t=>{const s=t.start?parseInt(t.start.split("-")[1]):0;const e=t.end?parseInt(t.end.split("-")[1]):0;return(i+3)>=s&&(i+3)<=e;});const ap=mp.length>0?mp[0].phase:null;return <div key={m} style={{flex:1,textAlign:"center"}}><div style={{fontSize:10,color:C.textSecondary,marginBottom:4,fontFamily:fb}}>{m}</div><div style={{height:8,background:ap?`${phC[ap]||"#555"}66`:"rgba(255,255,255,0.03)",borderRadius:i===0?"5px 0 0 5px":i===7?"0 5px 5px 0":0}} /></div>;})}</div>
        <div style={{display:"flex",gap:12,marginTop:8,justifyContent:"center"}}>{Object.entries(phC).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:C.textSecondary,fontFamily:fb}}><div style={{width:8,height:8,borderRadius:2,background:v}} />{k}</div>)}</div></div>
      {phases.map(phase=>{const items=data.rebrand.filter(t=>t.phase===phase);const done=items.filter(t=>t.status==="Done").length;
        return <div key={phase} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{fontSize:13,fontWeight:700,color:C.gold,fontFamily:ff}}>{phase}</div><span style={S.sub}>{done}/{items.length}</span></div>
          {items.map(t=>{const gi=data.rebrand.indexOf(t);return <TaskRow key={t.id} task={{...t,desc:t.task,due:t.end}} onCycle={()=>up(d=>{d.rebrand[gi].status=cyc(d.rebrand[gi].status);return d;})} onDelete={()=>up(d=>{d.rebrand.splice(gi,1);return d;})} onSetPri={v=>up(d=>{d.rebrand[gi].priority=v;return d;})} onSetDue={v=>up(d=>{d.rebrand[gi].end=v;return d;})} />;})}</div>;
      })}
    </div>;
  };

  // ═══ SIGNAGE ═══
  const SignageTab=()=>{const qD=["Q1","Q2","Q3","Q4"].map(q=>({name:q,target:data.signage.targets[q]/1000,actual:data.signage.actuals[q]/1000}));
    return <div><h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Signage Growth — $250K → $1.2M</h2><div style={{...S.sub,marginBottom:14}}>40% Margin · Triumph · Related Affordable</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={S.card}><div style={S.section}>Quarterly ($K)</div><ResponsiveContainer height={180}><BarChart data={qD}><CartesianGrid strokeDasharray="3 3" stroke={C.cardBorder} /><XAxis dataKey="name" tick={{fill:C.textSecondary,fontSize:11,fontFamily:fb}} axisLine={false} /><YAxis tick={{fill:C.textSecondary,fontSize:11}} axisLine={false} /><Tooltip contentStyle={{background:C.navy,border:`1px solid ${C.cardBorder}`,borderRadius:8,color:C.cream,fontSize:12,fontFamily:fb}} /><Bar dataKey="target" fill={`${C.gold}33`} radius={[5,5,0,0]} name="Target" /><Bar dataKey="actual" fill={C.gold} radius={[5,5,0,0]} name="Actual" /></BarChart></ResponsiveContainer></div>
        <div style={S.card}><div style={S.section}>Quarterly Actuals</div>{["Q1","Q2","Q3","Q4"].map(q=><div key={q} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:12,color:C.textSecondary,width:28,fontFamily:fb}}>{q}</span><span style={{fontSize:11,color:C.textDim,width:75,fontFamily:fb}}>Tgt: ${(data.signage.targets[q]/1000).toFixed(0)}K</span><NumInput type="number" value={data.signage.actuals[q]||""} placeholder="0" onChange={v=>up(d=>{d.signage.actuals[q]=v;return d;})} style={{...S.input,width:100}} /></div>)}</div>
      </div>
      <div style={S.section}>Growth Tactics</div>
      {data.signage.tactics.map((t,i)=><TaskRow key={i} task={t} onCycle={()=>up(d=>{d.signage.tactics[i].status=cyc(d.signage.tactics[i].status);return d;})} onDelete={()=>up(d=>{d.signage.tactics.splice(i,1);return d;})} onSetPri={v=>up(d=>{d.signage.tactics[i].priority=v;return d;})} onSetDue={v=>up(d=>{d.signage.tactics[i].due=v;return d;})} />)}
      <AddTask onAdd={(desc,p,d)=>up(dd=>{dd.signage.tactics.push(mk(desc,p,d));return dd;})} />
    </div>;
  };

  // ═══ MY WEEK ═══
  const MyWeekTab=()=>{const wh=data.weeklyHours||DEF.weeklyHours;const cats=wh.categories||DEF.weeklyHours.categories;const target=wh.targetHours||25;
    const getWK=(off=0)=>{const d=new Date();d.setDate(d.getDate()+(off*7));const day=d.getDay();const mon=new Date(d);mon.setDate(d.getDate()-(day===0?6:day-1));return mon.toISOString().split("T")[0];};
    const [wo,setWo]=useState(0);const wk=getWK(wo);const wd=(wh.weeks||{})[wk]||{};const days=["Mon","Tue","Wed","Thu","Fri"];
    const dayT=days.map(d=>cats.reduce((s,c)=>s+((wd[c.id]||{})[d]||0),0));const catT=cats.map(c=>days.reduce((s,d)=>s+((wd[c.id]||{})[d]||0),0));const gt=catT.reduce((s,v)=>s+v,0);const pct=target>0?Math.min(100,Math.round(gt/target*100)):0;
    const setH=(cid,day,val)=>up(d=>{if(!d.weeklyHours)d.weeklyHours=JSON.parse(JSON.stringify(DEF.weeklyHours));if(!d.weeklyHours.weeks)d.weeklyHours.weeks={};if(!d.weeklyHours.weeks[wk])d.weeklyHours.weeks[wk]={};if(!d.weeklyHours.weeks[wk][cid])d.weeklyHours.weeks[wk][cid]={};d.weeklyHours.weeks[wk][cid][day]=val;return d;});
    const hist=[];for(let i=4;i>=0;i--){const k=getWK(-i);const w=(wh.weeks||{})[k]||{};const total=cats.reduce((s,c)=>s+days.reduce((s2,d)=>s2+((w[c.id]||{})[d]||0),0),0);hist.push({week:k.split("-").slice(1).map(x=>parseInt(x)).join("/"),hours:total,target});}
    const wkLabel=new Date(wk+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
    return <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div><h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>My Week — Hour Tracker</h2><div style={S.sub}>25 hrs/week target · Flex to 28-30 during peak weeks</div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><button onClick={()=>setWo(w=>w-1)} style={S.btn}>←</button><span style={{fontSize:13,fontWeight:600,color:C.cream,fontFamily:ff,minWidth:90,textAlign:"center"}}>Wk of {wkLabel}</span><button onClick={()=>setWo(w=>w+1)} style={S.btn}>→</button>{wo!==0&&<button onClick={()=>setWo(0)} style={{...S.btn,fontSize:10}}>Today</button>}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        <div style={S.kpi}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1.5,fontFamily:ff}}>This Week</div><div style={{fontSize:28,fontWeight:800,color:gt>target?C.gold:gt>0?C.cream:C.textDim,fontFamily:ff}}>{gt}h</div><div style={{fontSize:10,color:C.textSecondary,fontFamily:fb}}>of {target}h</div></div>
        <div style={S.kpi}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1.5,fontFamily:ff}}>Completion</div><div style={{fontSize:28,fontWeight:800,color:pct>=100?"#2ecc71":pct>0?C.gold:C.textDim,fontFamily:ff}}>{pct}%</div></div>
        <div style={S.kpi}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1.5,fontFamily:ff}}>Remaining</div><div style={{fontSize:28,fontWeight:800,color:gt>=target?"#2ecc71":C.cream,fontFamily:ff}}>{Math.max(0,target-gt)}h</div></div>
      </div>
      <div style={{...S.card,marginBottom:16}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
        <th style={{textAlign:"left",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb,minWidth:140}}>Category</th>
        {days.map(d=><th key={d} style={{textAlign:"center",padding:"6px 4px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb,width:58}}>{d}</th>)}
        <th style={{textAlign:"center",padding:"6px 4px",color:C.gold,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:ff,width:50,fontWeight:700}}>Total</th>
        <th style={{textAlign:"center",padding:"6px 4px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb,width:50}}>Target</th>
        <th style={{width:28,borderBottom:`1px solid ${C.cardBorder}`}}></th>
      </tr></thead><tbody>
        {cats.map((c,ci)=><tr key={c.id}>
          <td style={{padding:"3px 8px",borderBottom:`1px solid rgba(200,169,110,0.05)`}}>
            <Editable value={c.name} onSave={v=>up(d=>{if(!d.weeklyHours)d.weeklyHours=JSON.parse(JSON.stringify(DEF.weeklyHours));d.weeklyHours.categories[ci].name=v;return d;})} style={{fontSize:11,color:C.cream,fontFamily:fb}} />
          </td>
          {days.map(d=><td key={d} style={{textAlign:"center",padding:"3px 2px",borderBottom:`1px solid rgba(200,169,110,0.05)`}}>
            <NumInput type="number" step="0.5" min="0" max="12" value={(wd[c.id]||{})[d]||""} placeholder="—" onChange={v=>setH(c.id,d,v)} style={{background:(wd[c.id]||{})[d]?`${C.gold}18`:"transparent",border:`1px solid ${C.cardBorder}`,borderRadius:5,padding:"4px 2px",color:C.cream,fontSize:11,width:44,textAlign:"center",outline:"none",fontFamily:fb}} />
          </td>)}
          <td style={{textAlign:"center",padding:"5px 4px",borderBottom:`1px solid rgba(200,169,110,0.05)`,fontWeight:700,color:catT[ci]>c.target?C.gold:catT[ci]>0?C.cream:C.textDim,fontFamily:ff,fontSize:12}}>{catT[ci]>0?catT[ci]:"—"}</td>
          <td style={{textAlign:"center",padding:"3px 2px",borderBottom:`1px solid rgba(200,169,110,0.05)`}}>
            <NumInput type="number" step="0.5" min="0" value={c.target} onChange={v=>up(d=>{if(!d.weeklyHours)d.weeklyHours=JSON.parse(JSON.stringify(DEF.weeklyHours));d.weeklyHours.categories[ci].target=v;return d;})} style={{background:`${C.gold}12`,border:`1px solid ${C.gold}28`,borderRadius:5,padding:"3px 2px",color:C.textSecondary,fontSize:11,width:44,textAlign:"center",outline:"none",fontFamily:fb}} />
          </td>
          <td style={{padding:"3px 2px",borderBottom:`1px solid rgba(200,169,110,0.05)`,textAlign:"center"}}>
            <button onClick={()=>up(d=>{if(!d.weeklyHours)d.weeklyHours=JSON.parse(JSON.stringify(DEF.weeklyHours));d.weeklyHours.categories.splice(ci,1);return d;})} style={{...S.btnD,padding:"1px 5px",fontSize:8}}>✕</button>
          </td>
        </tr>)}
        <tr><td style={{padding:"6px 8px",fontWeight:700,color:C.gold,borderTop:`2px solid rgba(200,169,110,0.2)`,fontSize:11,fontFamily:ff}}>DAILY TOTAL</td>
          {dayT.map((t,i)=><td key={i} style={{textAlign:"center",padding:"6px 4px",borderTop:`2px solid rgba(200,169,110,0.2)`,fontWeight:800,fontSize:12,color:t>0?C.cream:C.textDim,fontFamily:ff}}>{t>0?t:"—"}</td>)}
          <td style={{textAlign:"center",padding:"6px 4px",borderTop:`2px solid rgba(200,169,110,0.2)`,fontWeight:800,fontSize:14,color:gt>target?C.gold:"#2ecc71",fontFamily:ff}}>{gt}</td>
          <td style={{textAlign:"center",padding:"6px 4px",borderTop:`2px solid rgba(200,169,110,0.2)`,fontWeight:700,fontSize:12,color:C.gold,fontFamily:ff}}>{target}</td>
          <td style={{borderTop:`2px solid rgba(200,169,110,0.2)`}}></td>
        </tr>
      </tbody></table></div>
      <button onClick={()=>up(d=>{if(!d.weeklyHours)d.weeklyHours=JSON.parse(JSON.stringify(DEF.weeklyHours));d.weeklyHours.categories.push({id:uid(),name:"New Category",target:1});return d;})} style={{...S.btn,marginTop:8,fontSize:11}}>+ Add Category</button>
      </div>
      <div style={S.card}><div style={S.section}>Weekly History</div><ResponsiveContainer height={150}><BarChart data={hist}><CartesianGrid strokeDasharray="3 3" stroke={C.cardBorder} /><XAxis dataKey="week" tick={{fill:C.textSecondary,fontSize:10,fontFamily:fb}} axisLine={false} /><YAxis tick={{fill:C.textSecondary,fontSize:10}} axisLine={false} domain={[0,30]} /><Tooltip contentStyle={{background:C.navy,border:`1px solid ${C.cardBorder}`,borderRadius:8,color:C.cream,fontSize:12,fontFamily:fb}} /><Bar dataKey="hours" fill={C.gold} radius={[5,5,0,0]} name="Hours" /><Bar dataKey="target" fill={`${C.gold}22`} radius={[5,5,0,0]} name="Target" /></BarChart></ResponsiveContainer></div>
    </div>;
  };

  // ═══ BUDGET ═══
  const BudgetTab=()=>{
    const bud=data.budget||DEF.budget;
    const cats=bud.categories||DEF.budget.categories;
    const totalAnnual=cats.reduce((s,c)=>s+c.annual,0);
    const acts=bud.actuals||{};
    const totalSpent=Object.values(acts).reduce((s,mo)=>s+Object.values(mo).reduce((s2,v)=>s2+v,0),0);
    const cm=MO[moI()];
    const moSpent=m=>Object.values(acts[m]||{}).reduce((s,v)=>s+v,0);
    const catSpent=catId=>MO.reduce((s,m)=>s+((acts[m]||{})[catId]||0),0);
    const maxMoSpend=Math.max(...MO.map(moSpent),1);

    return <div>
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Marketing Budget — 2026</h2>
      <div style={{...S.sub,marginBottom:14}}>Total Annual: ${totalAnnual.toLocaleString(undefined,{minimumFractionDigits:2})} · Monthly Avg: ${(totalAnnual/12).toLocaleString(undefined,{minimumFractionDigits:2})}</div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
        {[["Annual Budget","$"+totalAnnual.toLocaleString(undefined,{minimumFractionDigits:0}),C.gold],["Spent YTD","$"+totalSpent.toLocaleString(undefined,{minimumFractionDigits:0}),C.cream],["Remaining","$"+(totalAnnual-totalSpent).toLocaleString(undefined,{minimumFractionDigits:0}),(totalAnnual-totalSpent)>=0?"#2ecc71":C.red],["% Used",totalAnnual>0?Math.round(totalSpent/totalAnnual*100)+"%":"0%",totalSpent/totalAnnual>.9?C.red:totalSpent/totalAnnual>.7?C.gold:C.cream]].map(([l,v,c])=>
          <div key={l} style={S.kpi}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1.5,fontFamily:ff}}>{l}</div><div style={{fontSize:22,fontWeight:800,color:c,fontFamily:ff}}>{v}</div></div>
        )}
      </div>

      {/* Budget breakdown table */}
      <div style={{...S.card,marginBottom:16}}>
        <div style={S.section}>Budget by Category</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr>
          <th style={{textAlign:"left",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>Category</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>Annual Budget</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>Monthly Avg</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>Spent YTD</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>Remaining</th>
          <th style={{textAlign:"right",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb}}>%</th>
          <th style={{width:30,borderBottom:`1px solid ${C.cardBorder}`}}></th>
        </tr></thead><tbody>
          {cats.map((c,ci)=>{const spent=catSpent(c.id);const rem=c.annual-spent;const pct=c.annual>0?Math.round(spent/c.annual*100):0;
            return <tr key={c.id}>
              <td style={{padding:"4px 8px",borderBottom:`1px solid rgba(200,169,110,0.05)`}}>
                <Editable value={c.name} onSave={v=>up(d=>{if(!d.budget)d.budget=JSON.parse(JSON.stringify(DEF.budget));d.budget.categories[ci].name=v;return d;})} style={{fontSize:12,fontWeight:500,color:C.cream,fontFamily:fb}} />
              </td>
              <td style={{padding:"4px 8px",borderBottom:`1px solid rgba(200,169,110,0.05)`,textAlign:"right"}}>
                <NumInput type="number" value={c.annual} onChange={v=>up(d=>{if(!d.budget)d.budget=JSON.parse(JSON.stringify(DEF.budget));d.budget.categories[ci].annual=v;return d;})} style={{background:`${C.gold}12`,border:`1px solid ${C.gold}28`,borderRadius:5,padding:"3px 6px",color:C.gold,fontSize:12,fontWeight:600,width:90,textAlign:"right",outline:"none",fontFamily:fb}} />
              </td>
              <td style={{padding:"6px 8px",color:C.textSecondary,fontSize:11,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontFamily:fb,textAlign:"right"}}>${(c.annual/12).toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0})}</td>
              <td style={{padding:"6px 8px",color:spent>0?C.cream:C.textDim,fontSize:12,fontWeight:spent>0?600:400,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontFamily:fb,textAlign:"right"}}>${spent.toLocaleString()}</td>
              <td style={{padding:"6px 8px",color:rem>=0?"#2ecc71":C.red,fontSize:12,fontWeight:600,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontFamily:fb,textAlign:"right"}}>${rem.toLocaleString()}</td>
              <td style={{padding:"6px 8px",borderBottom:`1px solid rgba(200,169,110,0.05)`,textAlign:"right"}}>
                <span style={{fontSize:11,fontWeight:700,color:pct>90?C.red:pct>70?C.gold:pct>0?C.cream:C.textDim,fontFamily:ff}}>{pct}%</span>
              </td>
              <td style={{padding:"4px 4px",borderBottom:`1px solid rgba(200,169,110,0.05)`,textAlign:"center"}}>
                <button onClick={()=>up(d=>{if(!d.budget)d.budget=JSON.parse(JSON.stringify(DEF.budget));d.budget.categories.splice(ci,1);return d;})} style={{...S.btnD,padding:"2px 6px",fontSize:8}}>✕</button>
              </td>
            </tr>;
          })}
          <tr style={{borderTop:`2px solid ${C.gold}33`}}>
            <td style={{padding:"6px 8px",fontWeight:700,color:C.gold,fontSize:12,fontFamily:ff}}>TOTAL</td>
            <td style={{padding:"6px 8px",fontWeight:800,color:C.gold,fontSize:12,fontFamily:ff,textAlign:"right"}}>${totalAnnual.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            <td style={{padding:"6px 8px",color:C.textSecondary,fontSize:11,fontFamily:fb,textAlign:"right"}}>${(totalAnnual/12).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
            <td style={{padding:"6px 8px",fontWeight:800,color:C.cream,fontSize:12,fontFamily:ff,textAlign:"right"}}>${totalSpent.toLocaleString()}</td>
            <td style={{padding:"6px 8px",fontWeight:800,color:(totalAnnual-totalSpent)>=0?"#2ecc71":C.red,fontSize:12,fontFamily:ff,textAlign:"right"}}>${(totalAnnual-totalSpent).toLocaleString()}</td>
            <td style={{padding:"6px 8px",fontWeight:800,color:C.cream,fontSize:12,fontFamily:ff,textAlign:"right"}}>{totalAnnual>0?Math.round(totalSpent/totalAnnual*100):0}%</td>
            <td></td>
          </tr>
        </tbody></table>
        <button onClick={()=>up(d=>{if(!d.budget)d.budget=JSON.parse(JSON.stringify(DEF.budget));d.budget.categories.push({id:uid(),name:"New Category",annual:0});return d;})} style={{...S.btn,marginTop:8,fontSize:11}}>+ Add Category</button>
      </div>

      {/* Monthly spending input */}
      <div style={{...S.card,marginBottom:16}}>
        <div style={S.section}>Monthly Spending — Log Actuals</div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr>
            <th style={{textAlign:"left",padding:"6px 8px",color:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb,minWidth:140}}>Category</th>
            {MO.map(m=><th key={m} style={{textAlign:"center",padding:"6px 3px",color:m===cm?C.gold:C.textSecondary,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:fb,width:52}}>{m}</th>)}
            <th style={{textAlign:"center",padding:"6px 4px",color:C.gold,fontSize:10,borderBottom:`1px solid ${C.cardBorder}`,fontFamily:ff,fontWeight:700,width:55}}>Total</th>
          </tr></thead>
          <tbody>
            {cats.map(c=>{const cTotal=catSpent(c.id);
              return <tr key={c.id}>
                <td style={{padding:"5px 8px",color:C.cream,borderBottom:`1px solid rgba(200,169,110,0.05)`,fontSize:11,fontFamily:fb}}>{c.name.split("(")[0].trim()}</td>
                {MO.map(m=><td key={m} style={{textAlign:"center",padding:"3px 1px",borderBottom:`1px solid rgba(200,169,110,0.05)`}}>
                  <NumInput type="number" value={(acts[m]||{})[c.id]||""} placeholder="—" onChange={v=>up(d=>{if(!d.budget)d.budget=JSON.parse(JSON.stringify(DEF.budget));if(!d.budget.actuals)d.budget.actuals={};if(!d.budget.actuals[m])d.budget.actuals[m]={};d.budget.actuals[m][c.id]=v;return d;})}
                    style={{background:(acts[m]||{})[c.id]?`${C.gold}18`:"transparent",border:`1px solid ${C.cardBorder}`,borderRadius:5,padding:"3px 1px",color:C.cream,fontSize:11,width:44,textAlign:"center",outline:"none",fontFamily:fb}} />
                </td>)}
                <td style={{textAlign:"center",padding:"5px 4px",borderBottom:`1px solid rgba(200,169,110,0.05)`,fontWeight:700,color:cTotal>0?C.cream:C.textDim,fontFamily:ff,fontSize:12}}>{cTotal>0?"$"+cTotal.toLocaleString():"—"}</td>
              </tr>;
            })}
            <tr><td style={{padding:"6px 8px",fontWeight:700,color:C.gold,borderTop:`2px solid rgba(200,169,110,0.2)`,fontSize:11,fontFamily:ff}}>MONTHLY TOTAL</td>
              {MO.map(m=>{const mt=moSpent(m);return <td key={m} style={{textAlign:"center",padding:"6px 2px",borderTop:`2px solid rgba(200,169,110,0.2)`,fontWeight:800,fontSize:11,color:mt>0?C.cream:C.textDim,fontFamily:ff}}>{mt>0?"$"+mt.toLocaleString():"—"}</td>;})}
              <td style={{textAlign:"center",padding:"6px 4px",borderTop:`2px solid rgba(200,169,110,0.2)`,fontWeight:800,fontSize:13,color:C.gold,fontFamily:ff}}>${totalSpent.toLocaleString()}</td>
            </tr>
          </tbody>
        </table></div>
      </div>

      {/* Monthly spend bar chart */}
      <div style={{...S.card}}>
        <div style={S.section}>Monthly Spend vs Budget</div>
        <ResponsiveContainer height={160}>
          <BarChart data={MO.map(m=>({name:m,spent:moSpent(m),budget:totalAnnual/12}))}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.cardBorder} />
            <XAxis dataKey="name" tick={{fill:C.textSecondary,fontSize:10,fontFamily:fb}} axisLine={false} />
            <YAxis tick={{fill:C.textSecondary,fontSize:10}} axisLine={false} />
            <Tooltip contentStyle={{background:C.navy,border:`1px solid ${C.cardBorder}`,borderRadius:8,color:C.cream,fontSize:12,fontFamily:fb}} formatter={v=>"$"+v.toLocaleString()} />
            <Bar dataKey="budget" fill={`${C.gold}22`} radius={[5,5,0,0]} name="Monthly Avg Budget" />
            <Bar dataKey="spent" fill={C.gold} radius={[5,5,0,0]} name="Actual Spend" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>;
  };

  // ═══ WIN/LOSS ═══
  const WinLossTab=()=>{const log=data.winLossLog||[];const OC={Won:"#2ecc71",Lost:C.red,Stalled:C.gold};const w=log.filter(l=>l.outcome==="Won").length;const l2=log.filter(l=>l.outcome==="Lost").length;const st=log.filter(l=>l.outcome==="Stalled").length;
    return <div><h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Win/Loss Log</h2><div style={{...S.sub,marginBottom:14}}>Log from Prospecting → "Log Outcome & Archive"</div>
      {log.length>0&&<div style={{display:"flex",gap:10,marginBottom:16}}>{[["Won",w,"#2ecc71"],["Lost",l2,C.red],["Stalled",st,C.gold]].map(([l,v,c])=><div key={l} style={{...S.kpi,flex:1,textAlign:"center"}}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1.5,fontFamily:ff}}>{l}</div><div style={{fontSize:28,fontWeight:800,color:c,fontFamily:ff}}>{v}</div></div>)}<div style={{...S.kpi,flex:1,textAlign:"center"}}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1.5,fontFamily:ff}}>Win Rate</div><div style={{fontSize:28,fontWeight:800,color:C.cream,fontFamily:ff}}>{(w+l2)>0?`${Math.round(w/(w+l2)*100)}%`:"—"}</div></div></div>}
      {log.length===0?<div style={{...S.card,textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:8}}>🏆</div><div style={{fontSize:13,color:C.textSecondary,fontFamily:fb}}>No outcomes logged yet</div></div>:
        log.map((e,i)=><div key={e.id} style={{...S.card,marginBottom:6,display:"flex",alignItems:"center",gap:14,padding:"12px 16px"}}>
          <div style={{width:40,height:40,borderRadius:10,background:`${OC[e.outcome]||"#888"}1a`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:18}}>{e.outcome==="Won"?"✅":e.outcome==="Lost"?"❌":"⏸️"}</span></div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:C.cream,fontFamily:ff}}>{e.name}</div><div style={{fontSize:12,color:C.textSecondary,fontFamily:fb,marginTop:2}}>{e.reason||"(no reason)"}</div><div style={S.dim}>{e.cat} · T{e.tier} · {e.date}</div></div>
          <Pill color={OC[e.outcome]||"#888"}>{e.outcome}</Pill><button onClick={()=>up(d=>{(d.winLossLog||[]).splice(i,1);return d;})} style={S.btnD}>✕</button>
        </div>)
      }
    </div>;
  };

  // ═══ LEADERSHIP FEEDBACK ═══
  const LeadershipTab=()=>{
    const [v,setV]=useState("");const [from,setFrom]=useState("Matt");const [type,setType]=useState("Feedback");
    const items=data.leadershipFeedback||[];
    const typeC={"Feedback":C.gold,"Task Request":C.red,"Comment":"#5DADE2","Approval":"#2ecc71","Question":"#8A9BB5"};
    return <div>
      <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Leadership Feedback</h2>
      <div style={{...S.sub,marginBottom:14}}>Comments, task requests, and feedback from senior leadership.</div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        <select value={from} onChange={e=>setFrom(e.target.value)} style={{...S.select,width:100}}>
          <option>Matt</option><option>Brittany</option><option>Alyssa</option><option>Zack</option><option>Jelena</option>
        </select>
        <select value={type} onChange={e=>setType(e.target.value)} style={{...S.select,width:120}}>
          <option>Feedback</option><option>Task Request</option><option>Comment</option><option>Approval</option><option>Question</option>
        </select>
        <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&v.trim()){up(d=>{if(!d.leadershipFeedback)d.leadershipFeedback=[];d.leadershipFeedback.unshift({id:uid(),text:v.trim(),from,type,date:td(),status:"Open",response:""});return d;});setV("");}}} placeholder="Add feedback, request, or comment..." style={{...S.input,flex:1,minWidth:200}} />
        <button onClick={()=>{if(v.trim()){up(d=>{if(!d.leadershipFeedback)d.leadershipFeedback=[];d.leadershipFeedback.unshift({id:uid(),text:v.trim(),from,type,date:td(),status:"Open",response:""});return d;});setV("");}}} style={S.btnP}>+ Add</button>
      </div>
      {/* Summary */}
      {items.length>0&&<div style={{display:"flex",gap:10,marginBottom:14}}>
        {[["Open",items.filter(i=>i.status==="Open").length,C.gold],["In Progress",items.filter(i=>i.status==="In Progress").length,"#5DADE2"],["Done",items.filter(i=>i.status==="Done").length,"#2ecc71"]].map(([l,ct,c])=>
          <div key={l} style={{...S.kpi,flex:1,textAlign:"center"}}><div style={{fontSize:9,color:C.textSecondary,textTransform:"uppercase",letterSpacing:1,fontFamily:ff}}>{l}</div><div style={{fontSize:22,fontWeight:800,color:ct>0?c:C.textDim,fontFamily:ff}}>{ct}</div></div>
        )}
      </div>}
      {items.length===0?<div style={{...S.card,textAlign:"center",padding:40}}>
        <div style={{fontSize:36,marginBottom:8}}>📋</div>
        <div style={{fontSize:13,color:C.textSecondary,fontFamily:fb}}>No feedback yet</div>
        <div style={S.dim}>Use the form above to log feedback from Matt, Brittany, Alyssa, or Zack.</div>
      </div>:
        items.map((item,i)=><div key={item.id} style={{...S.card,marginBottom:6,padding:"12px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:13,fontWeight:700,color:C.cream,fontFamily:ff}}>{item.from}</span>
              <Pill color={typeC[item.type]||C.gold}>{item.type}</Pill>
              <select value={item.status} onChange={e=>up(d=>{(d.leadershipFeedback||[])[i].status=e.target.value;return d;})} style={{...S.select,fontSize:10,padding:"2px 8px",background:item.status==="Done"?"rgba(46,204,113,0.12)":item.status==="In Progress"?"rgba(93,173,226,0.12)":"rgba(200,169,110,0.12)",border:`1px solid ${item.status==="Done"?"rgba(46,204,113,0.3)":item.status==="In Progress"?"rgba(93,173,226,0.3)":`${C.gold}44`}`,color:item.status==="Done"?"#2ecc71":item.status==="In Progress"?"#5DADE2":C.gold}}>
                <option>Open</option><option>In Progress</option><option>Done</option>
              </select>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:10,color:C.textDim,fontFamily:fb}}>{item.date}</span>
              <button onClick={()=>up(d=>{(d.leadershipFeedback||[]).splice(i,1);return d;})} style={{...S.btnD,padding:"2px 6px",fontSize:8}}>✕</button>
            </div>
          </div>
          <div style={{fontSize:13,color:item.status==="Done"?C.textDim:C.cream,fontFamily:fb,marginBottom:6,textDecoration:item.status==="Done"?"line-through":"none"}}>{item.text}</div>
          <textarea value={item.response||""} onChange={e=>up(d=>{(d.leadershipFeedback||[])[i].response=e.target.value;return d;})} placeholder="Your response or notes..." rows={1} style={{...S.input,resize:"vertical",fontSize:11,padding:"6px 10px",lineHeight:1.4}} />
        </div>)
      }
    </div>;
  };

  // ═══ INBOX ═══
  const InboxTab=()=>{const [v,setV]=useState("");const [cat,setCat]=useState("Idea");
    return <div><h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:700,color:C.cream,fontFamily:ff}}>Inbox — Capture Zone</h2><div style={{...S.sub,marginBottom:14}}>Dump ideas, leads, notes.</div>
      <div style={{display:"flex",gap:6,marginBottom:14}}><select value={cat} onChange={e=>setCat(e.target.value)} style={S.select}>{["Idea","Lead","Note","Follow-up","Resource"].map(c=><option key={c}>{c}</option>)}</select>
        <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&v.trim()){up(d=>{d.inbox.unshift({id:uid(),text:v.trim(),cat,date:td(),done:false});return d;});setV("");}}} placeholder="Quick capture..." style={{...S.input,flex:1}} />
        <button onClick={()=>{if(v.trim()){up(d=>{d.inbox.unshift({id:uid(),text:v.trim(),cat,date:td(),done:false});return d;});setV("");}}} style={S.btnP}>+ Capture</button>
      </div>
      {data.inbox.length===0?<div style={{...S.card,textAlign:"center",padding:40}}><div style={{fontSize:36,marginBottom:8}}>📥</div><div style={{fontSize:13,color:C.textSecondary,fontFamily:fb}}>Empty inbox</div></div>:
        data.inbox.map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:8,...S.card,padding:"8px 14px",marginBottom:3,opacity:item.done?.5:1}}>
          <div onClick={()=>up(d=>{d.inbox[i].done=!d.inbox[i].done;return d;})} style={{width:20,height:20,borderRadius:6,background:item.done?"#2ecc71":C.textDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700,cursor:"pointer",flexShrink:0}}>{item.done?"✓":"○"}</div>
          <div style={{flex:1}}><div style={{fontSize:13,color:item.done?C.textDim:C.cream,textDecoration:item.done?"line-through":"none",fontFamily:fb}}>{item.text}</div><div style={S.dim}>{item.date}</div></div>
          <Pill color={C.gold}>{item.cat}</Pill><button onClick={()=>up(d=>{d.inbox.splice(i,1);return d;})} style={S.btnD}>✕</button>
        </div>)
      }
    </div>;
  };

  // ═══ RENDER ═══
  const content={today:<TodayTab/>,myweek:<MyWeekTab/>,scorecard:<ScorecardTab/>,prospecting:<ProspectingTab/>,outreach:<OutreachTab/>,tradeshows:<TradeShowsTab/>,
    emails:<ChecklistTab title="Email Marketing — Monthly Checklist" sub="Target: 8/month (6 industry + 2 Uplifting) · AH → C&U → SL → Library → Comm/HC → A&D" dataKey="emailChecklist" valKey="sent" target={8} />,
    linkedin:<ChecklistTab title="LinkedIn — Monthly Checklist" sub="Target: 10 posts/month · 2-3/week · POV, Process, Project Moment, Human, Reflection" dataKey="linkedinChecklist" valKey="posted" target={10} />,
    rebrand:<RebrandTab/>,signage:<SignageTab/>,budget:<BudgetTab/>,winloss:<WinLossTab/>,leadership:<LeadershipTab/>,inbox:<InboxTab/>};

  return <div style={{background:`linear-gradient(145deg,${C.navy} 0%,${C.bg2} 40%,${C.navy} 100%)`,minHeight:"100vh",color:C.cream,fontFamily:fb}}>
    <div style={{background:`linear-gradient(90deg,rgba(200,169,110,0.08) 0%,rgba(13,27,42,0) 100%)`,borderBottom:`1px solid ${C.cardBorder}`,padding:"12px 22px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:9,letterSpacing:4,color:C.gold,textTransform:"uppercase",fontWeight:600,fontFamily:ff}}>Contract Source</div><h1 style={{margin:0,fontSize:18,fontWeight:700,color:C.cream,fontFamily:ff}}>2026 Marketing Command Center</h1></div>
        <div style={{display:"flex",gap:8}}><span style={{fontSize:9,color:C.textDim,alignSelf:"center",fontFamily:fb}}>Auto-saves</span><button onClick={async()=>{await sv(data);alert("Saved!");}} style={S.btn}>💾</button><button onClick={()=>{if(confirm("Reset ALL data?")){setData(DEF);sv(DEF);}}} style={S.btnD}>Reset</button></div>
      </div>
    </div>
    <div style={{display:"flex",minHeight:"calc(100vh - 55px)"}}>
      <div style={{width:170,background:`${C.mid}88`,borderRight:`1px solid ${C.cardBorder}`,padding:"10px 0",flexShrink:0,overflowY:"auto"}}>
        {TABS.map(t=><div key={t.id} onClick={()=>{setTab(t.id);setDetail(null);setShowNewProspect(false);}} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 16px",cursor:"pointer",background:tab===t.id?`${C.gold}14`:"transparent",borderLeft:tab===t.id?`3px solid ${C.gold}`:"3px solid transparent",transition:"background 0.1s"}} onMouseEnter={e=>{if(tab!==t.id)e.currentTarget.style.background=`${C.gold}0a`;}} onMouseLeave={e=>{if(tab!==t.id)e.currentTarget.style.background="transparent";}}>
          <span style={{fontSize:15}}>{t.icon}</span><span style={{fontSize:12,fontWeight:tab===t.id?700:400,color:tab===t.id?C.cream:C.textSecondary,fontFamily:ff}}>{t.label}</span>
          {t.id==="today"&&overdue.length>0&&<span style={{background:C.red,color:"#fff",fontSize:9,fontWeight:700,borderRadius:10,padding:"1px 6px",marginLeft:"auto",fontFamily:ff}}>{overdue.length}</span>}
          {t.id==="leadership"&&(data.leadershipFeedback||[]).filter(i=>i.status!=="Done").length>0&&<span style={{background:C.gold,color:C.navy,fontSize:9,fontWeight:700,borderRadius:10,padding:"1px 6px",marginLeft:"auto",fontFamily:ff}}>{(data.leadershipFeedback||[]).filter(i=>i.status!=="Done").length}</span>}
        </div>)}
      </div>
      <div style={{flex:1,padding:"18px 22px",overflowY:"auto",maxHeight:"calc(100vh - 55px)"}}>{content[tab]}</div>
    </div>
  </div>;
}
