// src/Pages/Admin/Analytics.tsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ComposedChart, RadialBarChart, RadialBar, Treemap,
} from "recharts";
import {
  Eye, Layers, FileText, MessageSquare, Cpu, Star, RefreshCw, LayoutDashboard, Lightbulb, BarChart3,
  Activity, Clock, Inbox, Target, Tag, Link2, TrendingUp, Zap, PieChart as PieIcon, Award,
  FolderTree, CalendarDays, Gauge, GitBranch, Users, ShieldCheck, Flame, Rocket, AlertTriangle,
} from "lucide-react";

import { useTheme } from "../../ThemeContext";
import { useGetProjectStatsQuery, useGetProjectsQuery } from "../../Features/Apis/Projects.Api";
import { useGetPostStatsQuery, useGetPostsQuery } from "../../Features/Apis/PostApi";
import { useGetMessageStatsQuery, useGetMessagesQuery } from "../../Features/Apis/Contact.Api";
import { useGetFaqStatsQuery } from "../../Features/Apis/FAQs.Api";
import { useGetSkillsQuery } from "../../Features/Apis/Skills.Api";
import { useGetTechnologiesByCategoryQuery } from "../../Features/Apis/Technologies.Api";
import { useGetTestimonialStatsQuery, useGetTestimonialsAdminQuery } from "../../Features/Apis/Testimonials.Api";

/* ---------- colours ---------- */
type Colors = {
  base: string; text: string; primary: string; secondary: string; accent: string;
  good: string; warn: string; bad: string; info: string; palette: string[];
  status: Record<string, string>; tone: (t: Tone) => string;
};
type Tone = "good" | "warn" | "tip";
const ColorCtx = createContext<Colors>(null as unknown as Colors);
const useC = () => useContext(ColorCtx);

/* ---------- helpers ---------- */
const EASE = [0.2, 0.7, 0.2, 1] as const;
const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (k: string) => new Date(`${k}-01T00:00:00`).toLocaleString("en", { month: "short" });
const lastMonths = (n: number) => {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const x = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
  });
};
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const num = (n?: number | null) => (n ?? 0).toLocaleString();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const daysAgo = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 864e5));
const ago = (iso: string) => {
  const d = daysAgo(iso);
  return d === 0 ? "today" : d === 1 ? "yesterday" : d < 30 ? `${d} days ago` : `${Math.floor(d / 30)} months ago`;
};
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = ["12a","1a","2a","3a","4a","5a","6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p","6p","7p","8p","9p","10p","11p"];

/* ---------- small building blocks ---------- */
function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 800, 1);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [to]);
  return <span>{Math.round(v).toLocaleString()}</span>;
}

function Tile({ title, note, icon, children, className = "", right }: {
  title: string; note?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; right?: React.ReactNode;
}) {
  const { text, primary } = useC();
  return (
    <section className={`min-w-0 rounded-xl border p-4 sm:p-5 ${className}`} style={{ borderColor: `${text}1a`, backgroundColor: `${text}06` }}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {icon && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${primary}1f`, color: primary }}>{icon}</span>}
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-tight">{title}</h3>
            {note && <p className="mt-0.5 text-xs opacity-60">{note}</p>}
          </div>
        </div>
        {right}
      </header>
      {children}
    </section>
  );
}

const Empty = ({ msg = "Nothing here yet" }: { msg?: string }) => <div className="py-10 text-center text-sm opacity-50">{msg}</div>;

const Chip = ({ children, color, pulse }: { children: React.ReactNode; color: string; pulse?: boolean }) => (
  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${pulse ? "animate-pulse" : ""}`} style={{ backgroundColor: `${color}22`, color }}>{children}</span>
);

const Stars = ({ n }: { n: number | null }) => {
  const { warn, text } = useC();
  if (!n) return <span className="text-xs opacity-50">no rating</span>;
  return <span aria-label={`${n} out of 5`} style={{ color: warn }}>{"★".repeat(n)}<span style={{ color: `${text}30` }}>{"★".repeat(5 - n)}</span></span>;
};

function Meter({ label, value, color, hint }: { label: string; value: number; color: string; hint?: string }) {
  const { text } = useC();
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="truncate font-medium">{label}</span>
        <span className="shrink-0 text-xs font-bold tabular-nums">{value}%{hint ? <span className="ml-1.5 font-normal opacity-55">{hint}</span> : null}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: `${text}14` }}>
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, value)}%` }} transition={{ duration: 0.8, ease: EASE }} />
      </div>
    </div>
  );
}

function RankRow({ rank, name, value, max, color, extra }: { rank: number; name: string; value: number; max: number; color: string; extra?: React.ReactNode }) {
  const { text } = useC();
  return (
    <div className="grid grid-cols-[22px_1fr_auto] items-center gap-x-3 gap-y-1.5 border-b py-2.5 text-sm last:border-0" style={{ borderColor: `${text}12` }}>
      <span className="text-xs font-bold opacity-45">{rank}</span>
      <span className="truncate font-medium">{name}</span>
      <span className="flex items-center gap-2 font-bold tabular-nums">{extra}{num(value)}</span>
      <div className="col-start-2 col-end-4 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: `${text}12` }}>
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${pct(value, max)}%` }} transition={{ duration: 0.7, delay: rank * 0.04, ease: EASE }} />
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, icon, spark, color, trend }: {
  label: string; value: number; sub: string; icon: React.ReactNode; spark?: number[]; color: string; trend?: number;
}) {
  const { text, good, bad } = useC();
  return (
    <div className="relative min-w-0 overflow-hidden rounded-xl border p-3.5" style={{ borderColor: `${text}1a`, backgroundColor: `${text}06` }}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold opacity-70"><span style={{ color }}>{icon}</span>{label}</span>
        {trend !== undefined && <Chip color={trend > 0 ? good : trend < 0 ? bad : `${text}88`}>{trend > 0 ? "+" : ""}{trend} this month</Chip>}
      </div>
      <p className="mt-2 text-3xl font-extrabold leading-none tabular-nums"><CountUp to={value} /></p>
      <p className="mt-1 truncate text-[11px] opacity-55">{sub}</p>
      {spark && spark.some((x) => x > 0) && (
        <div className="mt-2 h-9">
          <ResponsiveContainer>
            <AreaChart data={spark.map((v, i) => ({ i, v }))} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
              <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.18} isAnimationActive={false} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ---------- charts ---------- */
function useChartStyle() {
  const { base, text } = useC();
  return {
    tip: { contentStyle: { background: base, border: `1px solid ${text}30`, borderRadius: 10, color: text, fontSize: 12 }, itemStyle: { color: text }, labelStyle: { color: text, fontWeight: 700 }, cursor: { fill: `${text}10` } },
    tick: { fontSize: 11, fill: `${text}99` },
    grid: `${text}1f`,
    legend: { fontSize: 12, color: text },
  };
}
type Series = { key: string; color: string };

function Donut({ data, mobile, center }: { data: { name: string; value: number; color?: string }[]; mobile: boolean; center?: string }) {
  const { palette, text } = useC();
  const cs = useChartStyle();
  const d = data.filter((x) => x.value > 0);
  if (!d.length) return <Empty />;
  const total = d.reduce((s, x) => s + x.value, 0);
  return (
    <div className="relative h-56 sm:h-60">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={d} dataKey="value" nameKey="name" innerRadius={mobile ? 44 : 54} outerRadius={mobile ? 72 : 84} paddingAngle={2} cornerRadius={4} isAnimationActive={false}>
            {d.map((e, i) => <Cell key={e.name} fill={e.color ?? palette[i % palette.length]} stroke="none" />)}
          </Pie>
          <Tooltip {...cs.tip} /><Legend wrapperStyle={cs.legend} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-xl font-extrabold leading-none">{total.toLocaleString()}</p>
        <p className="text-[10px]" style={{ color: `${text}88` }}>{center ?? "total"}</p>
      </div>
    </div>
  );
}

/* ✅ NEW: Pie chart (no inner radius) */
function PieSmall({ data, mobile, unit }: { data: { name: string; value: number; color?: string }[]; mobile: boolean; unit?: string }) {
  const { palette } = useC();
  const cs = useChartStyle();
  const d = data.filter((x) => x.value > 0);
  if (!d.length) return <Empty />;
  return (
    <div className="h-56 sm:h-60">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={d} dataKey="value" nameKey="name" outerRadius={mobile ? 76 : 90} paddingAngle={1} isAnimationActive={false} label={({ value }) => `${value}${unit ?? ""}`}>
            {d.map((e, i) => <Cell key={e.name} fill={e.color ?? palette[i % palette.length]} stroke="none" />)}
          </Pie>
          <Tooltip {...cs.tip} /><Legend wrapperStyle={cs.legend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ✅ NEW: Radial bar chart */
function RadialBars({ data, unit }: { data: { name: string; value: number; color: string }[]; unit?: string }) {
  const { text } = useC();
  const cs = useChartStyle();
  const d = data.filter((x) => x.value > 0);
  if (!d.length) return <Empty />;
  return (
    <div className="h-60">
      <ResponsiveContainer>
        <RadialBarChart data={d} innerRadius="20%" outerRadius="100%" startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, Math.max(...d.map((x) => x.value), 1)]} tick={false} />
          <RadialBar dataKey="value" background={{ fill: `${text}0d` }} cornerRadius={6} isAnimationActive={false}>
            {d.map((e) => <Cell key={e.name} fill={e.color} />)}
          </RadialBar>
          <Tooltip {...cs.tip} formatter={(v) => `${v}${unit ?? ""}`} />
          <Legend wrapperStyle={cs.legend} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}

function HBar({ data, color, unit, mobile }: { data: { name: string; value: number }[]; color: string; unit?: string; mobile: boolean }) {
  const cs = useChartStyle();
  if (!data.length) return <Empty />;
  return (
    <div className="h-60">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 12 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={cs.grid} />
          <XAxis type="number" allowDecimals={false} tick={cs.tick} />
          <YAxis type="category" dataKey="name" width={mobile ? 78 : 108} tick={cs.tick} />
          <Tooltip {...cs.tip} formatter={(v) => `${v}${unit ?? ""}`} />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function VBar({ data, keys, stacked, height = 240 }: { data: Record<string, string | number>[]; keys: Series[]; stacked?: boolean; height?: number }) {
  const cs = useChartStyle();
  if (!data.length) return <Empty />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={cs.grid} />
          <XAxis dataKey="name" tick={cs.tick} /><YAxis allowDecimals={false} width={28} tick={cs.tick} />
          <Tooltip {...cs.tip} />{keys.length > 1 && <Legend wrapperStyle={cs.legend} />}
          {keys.map((k) => <Bar key={k.key} dataKey={k.key} fill={k.color} stackId={stacked ? "a" : undefined} radius={stacked ? 0 : [6, 6, 0, 0]} isAnimationActive={false} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ✅ NEW: Composed chart (bar + line together) */
function Combo({ data, bars, lines, height = 260 }: {
  data: Record<string, string | number>[];
  bars: Series[]; lines: Series[]; height?: number;
}) {
  const cs = useChartStyle();
  if (!data.length) return <Empty />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={cs.grid} />
          <XAxis dataKey="name" tick={cs.tick} />
          <YAxis yAxisId="left" allowDecimals={false} width={28} tick={cs.tick} />
          <YAxis yAxisId="right" orientation="right" allowDecimals={false} width={28} tick={cs.tick} />
          <Tooltip {...cs.tip} />
          <Legend wrapperStyle={cs.legend} />
          {bars.map((k) => <Bar key={k.key} yAxisId="left" dataKey={k.key} fill={k.color} radius={[4, 4, 0, 0]} isAnimationActive={false} />)}
          {lines.map((k) => <Line key={k.key} yAxisId="right" type="monotone" dataKey={k.key} stroke={k.color} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function Trend({ data, keys, kind = "area", height = 260 }: { data: Record<string, string | number>[]; keys: Series[]; kind?: "area" | "line"; height?: number }) {
  const cs = useChartStyle();
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke={cs.grid} />
      <XAxis dataKey="name" tick={cs.tick} /><YAxis allowDecimals={false} width={28} tick={cs.tick} />
      <Tooltip {...cs.tip} />{keys.length > 1 && <Legend wrapperStyle={cs.legend} />}
    </>
  );
  return (
    <div style={{ height }}>
      <ResponsiveContainer>
        {kind === "area" ? (
          <AreaChart data={data}>
            <defs>{keys.map((k) => (
              <linearGradient key={k.key} id={`g-${k.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity={0.4} /><stop offset="100%" stopColor={k.color} stopOpacity={0} /></linearGradient>
            ))}</defs>
            {common}
            {keys.map((k) => <Area key={k.key} type="monotone" dataKey={k.key} stroke={k.color} strokeWidth={2.5} fill={`url(#g-${k.key})`} isAnimationActive={false} />)}
          </AreaChart>
        ) : (
          <LineChart data={data}>
            {common}
            {keys.map((k) => <Line key={k.key} type="monotone" dataKey={k.key} stroke={k.color} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />)}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function Dots({ data, color, xLabel, yLabel }: { data: { x: number; y: number; name: string }[]; color: string; xLabel: string; yLabel: string }) {
  const cs = useChartStyle();
  const { base, text } = useC();
  if (data.length < 2) return <Empty msg="Needs at least 2 items" />;
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 18, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={cs.grid} />
          <XAxis type="number" dataKey="x" name={xLabel} tick={cs.tick} label={{ value: xLabel, position: "insideBottom", offset: -10, fontSize: 11, fill: `${text}99` }} />
          <YAxis type="number" dataKey="y" name={yLabel} tick={cs.tick} width={36} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => active && payload?.length ? (
            <div className="rounded-lg border px-3 py-2 text-xs" style={{ background: base, borderColor: `${text}30`, color: text }}>
              <p className="font-bold">{payload[0].payload.name}</p><p>{xLabel}: {payload[0].payload.x}</p><p>{yLabel}: {payload[0].payload.y}</p>
            </div>) : null} />
          <Scatter data={data} fill={color} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function SkillRadar({ data }: { data: { category: string; proficiency: number }[] }) {
  const { primary, text } = useC();
  const cs = useChartStyle();
  if (!data.length) return <Empty />;
  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke={cs.grid} /><PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: text }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: `${text}77` }} stroke={cs.grid} />
          <Radar dataKey="proficiency" stroke={primary} fill={primary} fillOpacity={0.35} isAnimationActive={false} />
          <Tooltip {...cs.tip} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ✅ NEW: Treemap for tag distribution */
function TagsTreemap({ data }: { data: { name: string; size: number }[] }) {
  const { palette, text } = useC();
  if (!data.length) return <Empty />;
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <Treemap data={data} dataKey="size" stroke="none" aspectRatio={4 / 3} isAnimationActive={false}
          content={({ x, y, width, height, index, name, size }) => (
            <g>
              <rect x={x} y={y} width={width} height={height} style={{ fill: palette[(index ?? 0) % palette.length], stroke: `${text}30` }} rx={6} />
              {width > 60 && height > 30 && (
                <text x={x + 8} y={y + 18} fill="#fff" fontSize={11} fontWeight={700}>
                  {name} ({size})
                </text>
              )}
            </g>
          )} />
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- insights ---------- */
type Insight = { tone: Tone; icon: string; title: string; text: string };

function InsightRow({ it }: { it: Insight }) {
  const { text, tone } = useC();
  const c = tone(it.tone);
  return (
    <div className="relative flex gap-3 overflow-hidden rounded-xl border p-4" style={{ borderColor: `${text}1a`, backgroundColor: `${text}06` }}>
      <span className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: c }} />
      <span className="text-xl leading-none">{it.icon}</span>
      <div className="min-w-0"><p className="text-sm font-bold leading-snug">{it.title}</p><p className="mt-1 text-sm leading-relaxed opacity-70">{it.text}</p></div>
    </div>
  );
}

/* ==========================================
   PAGE
========================================== */
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "content", label: "Content", icon: Layers },
  { id: "skills", label: "Skills", icon: Cpu },
  { id: "inbox", label: "Inbox & trust", icon: Inbox },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function Analytics() {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const t = theme as unknown as Record<string, string>;
  const base = t["base-100"], text = t["base-content"], primary = t.primary, secondary = t.secondary || t.primary;
  const accent = t.accent || secondary;
  const good = t.success || "#10b981", warn = t.warning || "#f59e0b", bad = t.error || "#fb7185", info = t.info || "#38bdf8";

  const colors: Colors = useMemo(() => ({
    base, text, primary, secondary, accent, good, warn, bad, info,
    palette: [primary, secondary, accent, info, warn, bad, good],
    status: { published: primary, draft: warn, archived: `${text}66`, new: bad, read: info, replied: good },
    tone: (k) => (k === "good" ? good : k === "warn" ? warn : info),
  }), [base, text, primary, secondary, accent, good, warn, bad, info]);

  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 640px)").matches);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 640px)");
    const f = () => setMobile(q.matches);
    q.addEventListener("change", f);
    return () => q.removeEventListener("change", f);
  }, []);

  const [tab, setTab] = useState<TabId>("overview");
  const [range, setRange] = useState<6 | 12>(6);

  /* ----- data ----- */
  const projectStats = useGetProjectStatsQuery();
  const postStats = useGetPostStatsQuery();
  const msgStats = useGetMessageStatsQuery();
  const faqStats = useGetFaqStatsQuery();
  const testiStats = useGetTestimonialStatsQuery();
  const projects = useGetProjectsQuery({ limit: 100, sortBy: "viewCount", sortOrder: "desc" });
  const posts = useGetPostsQuery({ limit: 100 });
  const messages = useGetMessagesQuery({ limit: 100, sortBy: "createdAt", sortOrder: "desc" });
  const skills = useGetSkillsQuery();
  const techs = useGetTechnologiesByCategoryQuery();
  const testis = useGetTestimonialsAdminQuery();
  const queries = [projectStats, postStats, msgStats, faqStats, testiStats, projects, posts, messages, skills, techs, testis];

  const loading = [projectStats, postStats, msgStats, projects, posts, skills].some((q) => q.isLoading);
  const refreshing = queries.some((q) => q.isFetching);
  const failed = queries.filter((q) => q.isError).length;
  const updatedAt = Math.max(0, ...queries.map((q) => q.fulfilledTimeStamp ?? 0));
  const refreshAll = () => queries.forEach((q) => q.refetch());

  const ps = projectStats.data?.data, po = postStats.data?.data, ms = msgStats.data?.data;
  const fs = faqStats.data?.data, ts = testiStats.data?.data;

  const projectList = projects.data?.data ?? [];
  const postList = useMemo(() => (posts.data?.data ?? []).filter((p) => !p.deletedAt), [posts.data]);
  const msgList = messages.data?.data ?? [];
  const skillList = skills.data?.data ?? [];
  const testiList = testis.data?.data ?? [];

  const d = useMemo(() => {
    const S = colors.status;
    const projectStatus = [{ name: "Published", value: ps?.published ?? 0, color: S.published }, { name: "Draft", value: ps?.draft ?? 0, color: S.draft }, { name: "Archived", value: ps?.archived ?? 0, color: S.archived }];
    const postStatus = [{ name: "Published", value: po?.published ?? 0, color: S.published }, { name: "Drafts", value: po?.drafts ?? 0, color: S.draft }];
    const msgStatus = (["new", "read", "replied", "archived"] as const).map((k) => ({ name: cap(k), value: ms?.[k] ?? 0, color: S[k] }));
    const sortedProjects = [...projectList].sort((a, b) => b.viewCount - a.viewCount);
    const sortedPosts = [...postList].sort((a, b) => b.viewCount - a.viewCount);
    const viewsSplit = [{ name: "Projects", value: ps?.totalViews ?? 0, color: colors.primary }, { name: "Posts", value: po?.totalViews ?? 0, color: colors.secondary }];

    const byCat: Record<string, { total: number; n: number; years: number }> = {};
    skillList.forEach((s) => { const c = s.technology.category; byCat[c] ??= { total: 0, n: 0, years: 0 }; byCat[c].total += s.proficiency; byCat[c].n += 1; byCat[c].years += s.yearsExperience; });
    const radar = Object.entries(byCat).map(([k, v]) => ({ category: cap(k), proficiency: Math.round(v.total / v.n) }));
    const skillCount = Object.entries(byCat).map(([k, v]) => ({ name: cap(k), value: v.n }));
    const yearsByCat = Object.entries(byCat).map(([k, v]) => ({ name: cap(k), Years: v.years }));
    const sortedSkills = [...skillList].sort((a, b) => b.proficiency - a.proficiency);
    const avgSkill = skillList.length ? Math.round(skillList.reduce((s, x) => s + x.proficiency, 0) / skillList.length) : 0;
    const totalYears = skillList.reduce((s, x) => s + x.yearsExperience, 0);
    const levels = [
      { name: "Beginner (0-40)", lo: 0, hi: 40 }, { name: "Learning (41-60)", lo: 41, hi: 60 },
      { name: "Good (61-80)", lo: 61, hi: 80 }, { name: "Expert (81-100)", lo: 81, hi: 100 },
    ].map((b) => ({ name: b.name.split(" ")[0], Skills: skillList.filter((s) => s.proficiency >= b.lo && s.proficiency <= b.hi).length }));
    const skillDots = skillList.map((s) => ({ x: s.yearsExperience, y: s.proficiency, name: s.technology.name }));
    const techCats = Object.entries(techs.data?.data ?? {}).map(([k, v]) => ({ name: cap(k), value: v?.length ?? 0 }));
    const techTotal = techCats.reduce((s, x) => s + x.value, 0);

    const m12 = lastMonths(12);
    const all = [...projectList, ...postList];
    const cumulative = m12.map((m) => ({ name: monthLabel(m), Content: all.filter((x) => monthKey(x.createdAt) <= m).length }));
    const timeline = lastMonths(range).map((m) => ({
      name: monthLabel(m),
      Projects: projectList.filter((p) => monthKey(p.createdAt) === m).length,
      Posts: postList.filter((p) => monthKey(p.createdAt) === m).length,
      Messages: msgList.filter((x) => monthKey(x.createdAt) === m).length,
    }));
    const spark6 = lastMonths(6).map((m) => ({
      p: projectList.filter((x) => monthKey(x.createdAt) === m).length,
      o: postList.filter((x) => monthKey(x.createdAt) === m).length,
      m: msgList.filter((x) => monthKey(x.createdAt) === m).length,
    }));
    const thisM = timeline[timeline.length - 1], prevM = timeline[timeline.length - 2];
    const sum = (x: { Projects: number; Posts: number; Messages: number }) => x.Projects + x.Posts + x.Messages;
    const compare = thisM && prevM ? ["Projects", "Posts", "Messages"].map((k) => ({ name: k, "This month": thisM[k as "Projects"], "Last month": prevM[k as "Projects"] })) : [];

    /* ✅ NEW: monthly views vs content (composed chart) */
    const viewsByMonth = lastMonths(range).map((m) => {
      const mp = projectList.filter((x) => monthKey(x.createdAt) === m);
      const mo = postList.filter((x) => monthKey(x.createdAt) === m);
      return {
        name: monthLabel(m),
        Content: mp.length + mo.length,
        Views: mp.reduce((s, x) => s + x.viewCount, 0) + mo.reduce((s, x) => s + x.viewCount, 0),
      };
    });

    const likes = postList.reduce((s, p) => s + (p.reactions?.like ?? 0), 0);
    const fires = postList.reduce((s, p) => s + (p.reactions?.fire ?? 0), 0);
    const rated = postList.filter((p) => p.ratings && p.ratings.count > 0);
    const rc = rated.reduce((s, p) => s + (p.ratings?.count ?? 0), 0);
    const avgPostRating = rc ? rated.reduce((s, p) => s + (p.ratings?.avg ?? 0) * (p.ratings?.count ?? 0), 0) / rc : null;
    const rt = postList.map((p) => p.readingTime).filter((x): x is number => !!x);
    const avgRead = rt.length ? Math.round(rt.reduce((a, b) => a + b, 0) / rt.length) : 0;
    const postDots = postList.filter((p) => p.readingTime).map((p) => ({ x: p.readingTime as number, y: p.viewCount, name: p.title }));
    const tagMap: Record<string, number> = {};
    postList.forEach((p) => p.tags?.forEach((x) => { tagMap[x.name] = (tagMap[x.name] ?? 0) + 1; }));
    const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
    /* ✅ NEW: tag treemap data */
    const tagTree = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, size]) => ({ name, size }));

    /* ✅ NEW: reading time buckets */
    const readBuckets = [
      { name: "< 3 min", lo: 0, hi: 2 }, { name: "3-5 min", lo: 3, hi: 5 },
      { name: "6-10 min", lo: 6, hi: 10 }, { name: "> 10 min", lo: 11, hi: 999 },
    ].map((b) => ({ name: b.name, Posts: rt.filter((x) => x >= b.lo && x <= b.hi).length }));

    const techUse: Record<string, number> = {};
    const projectTechIds = new Set<string>();
    projectList.forEach((p) => p.techs?.forEach((x) => { techUse[x.technology.name] = (techUse[x.technology.name] ?? 0) + 1; projectTechIds.add(x.technologyId); }));
    const topProjectTechs = Object.entries(techUse).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
    const linkMap: Record<string, number> = {};
    projectList.forEach((p) => p.links?.forEach((l) => { const k = l.type.replace(/_/g, " "); linkMap[k] = (linkMap[k] ?? 0) + 1; }));
    const linkTypes = Object.entries(linkMap).map(([name, value]) => ({ name: cap(name), value }));
    const ratedIds = new Set(skillList.map((s) => s.techId));
    const unratedNames = [...new Set(projectList.flatMap((p) => p.techs ?? []).filter((x) => !ratedIds.has(x.technologyId)).map((x) => x.technology.name))];
    const idleStrong = sortedSkills.filter((s) => s.proficiency >= 75 && !projectTechIds.has(s.techId)).map((s) => s.technology.name);
    const weakUsed = skillList.filter((s) => s.proficiency < 60 && projectTechIds.has(s.techId)).map((s) => s.technology.name);
    const coverage = [
      { name: "Rated", value: [...projectTechIds].filter((id) => ratedIds.has(id)).length, color: colors.primary },
      { name: "Not rated", value: [...projectTechIds].filter((id) => !ratedIds.has(id)).length, color: colors.warn },
    ];

    /* ✅ NEW: tech coverage by category (donut with rated/unrated) */
    const catCoverage = Object.entries(byCat).map(([cat, v]) => {
      const ids = skillList.filter((s) => s.technology.category === cat).map((s) => s.techId);
      const inProjects = ids.filter((id) => projectTechIds.has(id)).length;
      return { name: cap(cat), "In projects": inProjects, "Not used": ids.length - inProjects };
    });

    const open = msgList.filter((m) => m.status === "new" || m.status === "read");
    const oldestOpen = open.length ? Math.max(...open.map((m) => daysAgo(m.createdAt))) : 0;
    const weekday = WEEK.map((name, i) => ({ name, Messages: msgList.filter((m) => new Date(m.createdAt).getDay() === i).length }));
    const ageBuckets = [{ name: "Today", lo: 0, hi: 0 }, { name: "1-3 days", lo: 1, hi: 3 }, { name: "4-7 days", lo: 4, hi: 7 }, { name: "Over a week", lo: 8, hi: 99999 }]
      .map((b) => ({ name: b.name, "Waiting for reply": open.filter((m) => { const a = daysAgo(m.createdAt); return a >= b.lo && a <= b.hi; }).length }));

    /* ✅ NEW: hourly distribution of messages */
    const hourly = HOURS.map((h, i) => ({ name: h, Messages: msgList.filter((m) => new Date(m.createdAt).getHours() === i).length }));

    const ratingDist = [1, 2, 3, 4, 5].map((r) => ({ name: `${r} star`, Testimonials: testiList.filter((x) => x.rating === r).length }));
    const latestTestis = [...testiList]
      .filter((x) => !!x.createdAt)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, 5);

    return {
      projectStatus, postStatus, msgStatus, sortedProjects, sortedPosts, viewsSplit, radar, skillCount, yearsByCat, sortedSkills, avgSkill, totalYears,
      levels, skillDots, techCats, techTotal, cumulative, timeline, spark6, thisM, prevM, sum, compare, viewsByMonth,
      trend: thisM && prevM ? sum(thisM) - sum(prevM) : 0, likes, fires, avgPostRating, avgRead, postDots, topTags, tagTree, readBuckets,
      topProjectTechs, linkTypes, unratedNames, idleStrong, weakUsed, coverage, catCoverage, oldestOpen, openCount: open.length, weekday, hourly, ageBuckets, ratingDist, latestTestis,
      reactionData: [{ name: "Likes", value: likes, color: info }, { name: "Fire", value: fires, color: warn }],
    };
  }, [colors, ps, po, ms, projectList, postList, msgList, skillList, techs.data, testiList, range, info, warn]);

  const totalViews = (ps?.totalViews ?? 0) + (po?.totalViews ?? 0);
  const replyRate = pct(ms?.replied ?? 0, ms?.total ?? 0);
  const projPub = pct(ps?.published ?? 0, ps?.total ?? 0);
  const postPub = pct(po?.published ?? 0, po?.total ?? 0);
  const testiPub = pct(ts?.published ?? 0, ts?.total ?? 0);
  const engagement = po?.totalViews ? +(((d.likes + d.fires) / po.totalViews) * 100).toFixed(1) : 0;
  const activeMonths = lastMonths(3).filter((m) => [...projectList, ...postList].some((x) => monthKey(x.createdAt) === m)).length;
  const avgProjectViews = ps?.published ? Math.round(ps.totalViews / ps.published) : 0;
  const avgPostViews = po?.published ? Math.round(po.totalViews / po.published) : 0;

  const scoreParts = [
    ps?.total ? { label: "Projects are live", value: projPub, color: primary } : null,
    po?.total ? { label: "Posts are live", value: postPub, color: secondary } : null,
    ms?.total ? { label: "Messages answered", value: replyRate, color: accent } : null,
    skillList.length ? { label: "Average skill level", value: d.avgSkill, color: info } : null,
    ts?.total ? { label: "Testimonials shown", value: testiPub, color: warn } : null,
    projectList.length || postList.length ? { label: "Posted in last 3 months", value: pct(activeMonths, 3), color: good } : null,
  ].filter((x): x is { label: string; value: number; color: string } => x !== null);
  const health = scoreParts.length ? Math.round(scoreParts.reduce((a, b) => a + b.value, 0) / scoreParts.length) : 0;
  const healthWord = health >= 80 ? "Excellent" : health >= 60 ? "Good" : health >= 40 ? "Needs work" : "Just starting";

  /* ----- insights (existing + more) ----- */
  const insights: Insight[] = [];
  const add = (i: Insight) => insights.push(i);
  const topProject = d.sortedProjects[0], topPost = d.sortedPosts[0];

  if (topProject && ps?.totalViews && topProject.viewCount > 0) {
    const share = pct(topProject.viewCount, ps.totalViews);
    add(share >= 50
      ? { tone: "warn", icon: "🎯", title: "One project gets most of your visits", text: `“${topProject.title}” gets ${share}% of all project views. Link your other projects from it so visitors look around more.` }
      : { tone: "good", icon: "🏆", title: "Visits are well spread out", text: `Your top project “${topProject.title}” gets ${share}% of project views. Your other work is getting looked at too.` });
  }
  if (topPost && topPost.viewCount > 0)
    add({ tone: "tip", icon: "✍️", title: "Write more like your best post", text: `“${topPost.title}” has ${num(topPost.viewCount)} views${topPost.tags?.length ? ` and is tagged ${topPost.tags.map((x) => x.name).slice(0, 3).join(", ")}` : ""}. Try writing a follow-up on the same topic.` });
  if (ms) {
    if (d.openCount > 0 && d.oldestOpen >= 3)
      add({ tone: "warn", icon: "📬", title: `${d.openCount} message${d.openCount > 1 ? "s" : ""} still need a reply`, text: `The oldest one has waited ${d.oldestOpen} days. Fast replies help you win clients.` });
    else if (ms.total)
      add({ tone: "good", icon: "💬", title: "Your inbox is in good shape", text: `You replied to ${replyRate}% of ${num(ms.total)} messages${d.openCount ? ` and ${d.openCount} are still open` : ""}.` });
    else add({ tone: "tip", icon: "📭", title: "No messages yet", text: "Add a clear button or contact line on your project pages so people can reach you." });
  }
  if (ps && ps.draft > 0) add({ tone: "tip", icon: "🚀", title: "You have unfinished work", text: `${ps.draft} project draft${ps.draft > 1 ? "s" : ""}${po?.drafts ? ` and ${po.drafts} post draft${po.drafts > 1 ? "s" : ""}` : ""} are not live yet. Publishing one is the quickest way to add new content.` });
  if (ps && ps.published > 0 && ps.featured === 0) add({ tone: "warn", icon: "⭐", title: "No project is featured", text: "Feature your 2 or 3 best projects so visitors see them first." });
  const zeroView = d.sortedProjects.filter((p) => p.status === "published" && p.viewCount === 0).length;
  if (zeroView) add({ tone: "warn", icon: "👻", title: `${zeroView} live project${zeroView > 1 ? "s have" : " has"} no views`, text: "Check the picture, title and links, or feature it on your home page." });
  if (d.unratedNames.length) add({ tone: "tip", icon: "🧩", title: "Some tools in your projects have no skill level", text: `${d.unratedNames.slice(0, 4).join(", ")} are used in your projects but missing from your skills. Add them so both sections match.` });
  if (d.idleStrong.length) add({ tone: "tip", icon: "💡", title: "Strong skills that no project shows", text: `You rate ${d.idleStrong.slice(0, 3).join(", ")} at 75% or more, but no project uses them. Build something to prove it.` });
  if (d.weakUsed.length) add({ tone: "warn", icon: "🔧", title: "Low skill level on tools you use", text: `${d.weakUsed.slice(0, 3).join(", ")} are used in projects but rated under 60%. Update the level or practise more.` });
  if (d.avgSkill) {
    const best = [...d.radar].sort((a, b) => b.proficiency - a.proficiency)[0], worst = [...d.radar].sort((a, b) => a.proficiency - b.proficiency)[0];
    if (best && worst && best.category !== worst.category)
      add({ tone: "good", icon: "💪", title: `${best.category} is your strongest area`, text: `It averages ${best.proficiency}%. Your weakest area is ${worst.category} at ${worst.proficiency}%, so that is where you can grow most.` });
  }
  if (postList.length || projectList.length)
    add(activeMonths === 3
      ? { tone: "good", icon: "🔥", title: "You post steadily", text: "You added something new in each of the last 3 months. Keep it up." }
      : { tone: "warn", icon: "📉", title: "You have slowed down", text: `You added content in only ${activeMonths} of the last 3 months. One small post a month keeps your site fresh.` });
  if (d.thisM && d.prevM)
    add({ tone: d.trend >= 0 ? "good" : "tip", icon: d.trend >= 0 ? "📈" : "🌙", title: "This month compared with last month", text: `${d.sum(d.thisM)} new items this month, ${d.sum(d.prevM)} last month (${d.trend >= 0 ? "+" : ""}${d.trend}).` });
  if (d.likes + d.fires > 0 && po?.totalViews)
    add({ tone: "good", icon: "❤️", title: "Readers like your posts", text: `${engagement}% of post views end in a reaction (${d.likes} likes, ${d.fires} fire).${d.avgPostRating ? ` Readers rate your posts ${d.avgPostRating.toFixed(1)} out of 5.` : ""}` });
  if (ts?.total)
    add(ts.avgRating !== null && ts.avgRating >= 4.5
      ? { tone: "good", icon: "🌟", title: "Great proof from clients", text: `${ts.avgRating.toFixed(1)} out of 5 from ${ts.total} testimonials, and ${ts.published} are shown on your site.` }
      : { tone: "tip", icon: "🗣️", title: "Show more testimonials", text: `${ts.unpublished} testimonial${ts.unpublished === 1 ? " is" : "s are"} hidden${ts.avgRating ? ` (average ${ts.avgRating.toFixed(1)} out of 5)` : ""}. Publish the best ones.` });
  else add({ tone: "tip", icon: "🗣️", title: "No testimonials yet", text: "Ask your last client for two lines. It is the easiest way to build trust." });
  if (d.avgRead) add({ tone: "tip", icon: "⏱️", title: "Average reading time", text: `Your posts take ${d.avgRead} minutes to read. ${d.avgRead > 8 ? "Shorter posts may keep more readers." : "That is a good length for most readers."}` });

  /* ✅ NEW insights */
  if (d.topProjectTechs.length) {
    const top = d.topProjectTechs[0];
    add({ tone: "good", icon: "🛠️", title: `Your signature stack is ${top.name}`, text: `You've used ${top.name} in ${top.value} project${top.value === 1 ? "" : "s"} — more than any other tool. That's what people associate with your work.` });
  }
  if (d.topTags.length) {
    const tag = d.topTags[0];
    add({ tone: "tip", icon: "🏷️", title: `Your go-to topic is “${tag.name}”`, text: `${tag.value} post${tag.value === 1 ? " uses" : "s use"} this tag. Consider a dedicated series or landing page around it.` });
  }
  if (d.cumulative.length >= 2) {
    const last = d.cumulative[d.cumulative.length - 1], prev = d.cumulative[d.cumulative.length - 2];
    const added = last.Content - prev.Content;
    if (added > 0) add({ tone: "good", icon: "📚", title: `Your library grew by ${added} this month`, text: `Total content is now ${last.Content} items. New work compounds — search engines and visitors both reward fresh additions.` });
  }
  if (d.readBuckets.length && d.avgRead) {
    const bestBucket = [...d.readBuckets].sort((a, b) => b.Posts - a.Posts)[0];
    if (bestBucket.Posts > 0) add({ tone: "tip", icon: "📖", title: `Most posts are ${bestBucket.name} reads`, text: `${bestBucket.Posts} post${bestBucket.Posts === 1 ? "" : "s"} fall in this range. Consistency in length helps readers know what to expect.` });
  }
  if (d.weekday.length) {
    const busiest = [...d.weekday].sort((a, b) => b.Messages - a.Messages)[0];
    if (busiest.Messages > 0) add({ tone: "tip", icon: "📅", title: `People write most on ${busiest.name}`, text: `${busiest.Messages} message${busiest.Messages === 1 ? "" : "s"} arrived on this day. Schedule replies around that rhythm.` });
  }
  if (d.hourly.length) {
    const peak = [...d.hourly].sort((a, b) => b.Messages - a.Messages)[0];
    if (peak.Messages >= 2) add({ tone: "tip", icon: "⏰", title: `Inbox peaks around ${peak.name}`, text: `You get most messages in this hour. Checking once at ${peak.name} keeps replies under a day.` });
  }
  if (d.linkTypes.length) {
    const top = [...d.linkTypes].sort((a, b) => b.value - a.value)[0];
    add({ tone: "good", icon: "🔗", title: `Most links are “${top.name}”`, text: `You've added ${top.value} ${top.name} link${top.value === 1 ? "" : "s"} across projects. Consider adding a demo or docs link if you only have code.` });
  }
  if (d.viewsByMonth.some((v) => v.Views > 0)) {
    const best = [...d.viewsByMonth].sort((a, b) => b.Views - a.Views)[0];
    add({ tone: "good", icon: "📊", title: `Your best month was ${best.name}`, text: `${best.Views.toLocaleString()} views that month. Look at what you published then and repeat it.` });
  }

  const warnings = insights.filter((i) => i.tone === "warn");
  const urgent = (warnings.length ? warnings : insights).slice(0, 3);
  const badges: Partial<Record<TabId, number>> = { insights: warnings.length, inbox: d.openCount };

  if (loading)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6" style={{ backgroundColor: base, color: text }}>
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full border-2 border-dashed opacity-15" style={{ borderColor: primary }} />
          <div className="absolute inset-2 animate-spin rounded-full border-t-2" style={{ borderColor: primary }} />
        </div>
        <p className="text-xs opacity-50">Loading your numbers...</p>
      </div>
    );

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((x) => x.id === tab);
    if (e.key === "ArrowRight") setTab(TABS[(i + 1) % TABS.length].id);
    if (e.key === "ArrowLeft") setTab(TABS[(i - 1 + TABS.length) % TABS.length].id);
  };
  const grid = "grid grid-cols-1 gap-4 lg:grid-cols-12";
  const gap = "mt-4";

  return (
    <ColorCtx.Provider value={colors}>
      <main className="min-h-screen" style={{ backgroundColor: base, color: text, overflowX: "clip" }}>
        <style>{`.an-noscroll{scrollbar-width:none;-ms-overflow-style:none}.an-noscroll::-webkit-scrollbar{display:none}`}</style>

        <header className="mx-auto flex w-full max-w-[1400px] flex-wrap items-end justify-between gap-4 px-4 pb-4 pt-6 sm:px-6 lg:px-10">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Analytics</h1>
            <p className="mt-1 text-sm opacity-60">
              How your portfolio is doing{updatedAt ? ` · updated ${new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border px-3 py-2 sm:flex" style={{ borderColor: `${text}1a` }}>
              <span className="text-xs opacity-60">Health</span>
              <span className="text-lg font-extrabold leading-none" style={{ color: primary }}>{health}</span>
              <span className="text-xs font-semibold">{healthWord}</span>
            </div>
            <button onClick={refreshAll} disabled={refreshing} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: primary, color: base }}>
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Updating" : "Refresh"}
            </button>
          </div>
        </header>

        <div className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ borderColor: `${text}1a`, backgroundColor: `${base}e6` }}>
          <div role="tablist" aria-label="Analytics sections" onKeyDown={onTabKey} className="an-noscroll mx-auto flex w-full max-w-[1400px] gap-1 overflow-x-auto px-2 sm:px-6 lg:px-10">
            {TABS.map(({ id, label, icon: Icon }) => {
              const on = tab === id, badge = badges[id];
              return (
                <button key={id} role="tab" id={`tab-${id}`} aria-selected={on} aria-controls={`panel-${id}`} tabIndex={on ? 0 : -1} onClick={() => setTab(id)}
                  className="relative inline-flex shrink-0 items-center gap-2 px-3.5 py-3.5 text-sm font-semibold transition-opacity sm:px-4" style={{ opacity: on ? 1 : 0.6 }}>
                  <Icon size={16} style={{ color: on ? primary : undefined }} />
                  {label}
                  {!!badge && <span className="rounded-full px-1.5 text-[10px] font-bold" style={{ backgroundColor: id === "insights" ? `${warn}33` : `${bad}33`, color: id === "insights" ? warn : bad }}>{badge}</span>}
                  {on && <motion.span layoutId="tabLine" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full" style={{ backgroundColor: primary }} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1400px] px-4 pb-20 pt-5 sm:px-6 lg:px-10">
          {failed > 0 && (
            <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: `${bad}66`, backgroundColor: `${bad}14`, color: bad }}>
              {failed} part{failed > 1 ? "s" : ""} of this page could not load. Please sign in as admin and make sure the server is running.
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}
              initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {tab === "overview" && (
                <>
                  <div className={grid}>
                    <Tile className="lg:col-span-5" title="Portfolio health" note="Average of the six checks below" icon={<Activity size={16} />}>
                      <div className="flex flex-col items-center gap-5 sm:flex-row">
                        <div className="relative h-36 w-36 shrink-0">
                          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                            <circle cx="100" cy="100" r="82" fill="none" strokeWidth="14" stroke={`${text}14`} />
                            <motion.circle cx="100" cy="100" r="82" fill="none" strokeWidth="14" strokeLinecap="round" stroke={primary}
                              initial={{ pathLength: 0 }} animate={{ pathLength: health / 100 }} transition={{ duration: 1, ease: EASE }} />
                          </svg>
                          <div className="absolute inset-0 grid place-items-center text-center">
                            <div><p className="text-4xl font-extrabold leading-none"><CountUp to={health} /></p><p className="mt-1 text-xs font-semibold" style={{ color: primary }}>{healthWord}</p></div>
                          </div>
                        </div>
                        <div className="w-full space-y-3">
                          {scoreParts.length ? scoreParts.map((p) => <Meter key={p.label} label={p.label} value={p.value} color={p.color} />) : <Empty />}
                        </div>
                      </div>
                    </Tile>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
                      <Kpi label="Total views" value={totalViews} sub="projects and posts" icon={<Eye size={14} />} color={primary} />
                      <Kpi label="Projects" value={ps?.total ?? 0} sub={`${ps?.published ?? 0} live, ${ps?.featured ?? 0} featured`} icon={<Layers size={14} />} color={primary} spark={d.spark6.map((x) => x.p)} trend={d.thisM?.Projects} />
                      <Kpi label="Posts" value={po?.total ?? 0} sub={`${po?.published ?? 0} live, ${po?.featured ?? 0} featured`} icon={<FileText size={14} />} color={secondary} spark={d.spark6.map((x) => x.o)} trend={d.thisM?.Posts} />
                      <Kpi label="Messages" value={ms?.total ?? 0} sub={`${ms?.new ?? 0} new, ${replyRate}% answered`} icon={<MessageSquare size={14} />} color={accent} spark={d.spark6.map((x) => x.m)} trend={d.thisM?.Messages} />
                      <Kpi label="Skills" value={skillList.length} sub={`${d.avgSkill}% average level`} icon={<Cpu size={14} />} color={info} />
                      <Kpi label="Testimonials" value={ts?.total ?? 0} sub={ts?.avgRating != null ? `${ts.avgRating.toFixed(1)} out of 5` : "no ratings yet"} icon={<Star size={14} />} color={warn} />
                    </div>
                  </div>

                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-4" title="Needs your attention" note="Do these first" icon={<Target size={16} />}>
                      <div className="space-y-3">{urgent.length ? urgent.map((it) => <InsightRow key={it.title} it={it} />) : <Empty />}</div>
                      {insights.length > urgent.length && (
                        <button onClick={() => setTab("insights")} className="mt-3 text-sm font-semibold underline underline-offset-4" style={{ color: primary }}>See all {insights.length} insights</button>
                      )}
                    </Tile>
                    <Tile className="lg:col-span-8" title="What you added each month" note="New projects, posts and messages" icon={<TrendingUp size={16} />}
                      right={
                        <div className="inline-flex shrink-0 rounded-lg p-0.5" style={{ backgroundColor: `${text}0d` }}>
                          {([6, 12] as const).map((n) => (
                            <button key={n} onClick={() => setRange(n)} className="rounded-md px-3 py-1 text-xs font-semibold" style={{ backgroundColor: range === n ? primary : "transparent", color: range === n ? base : text }}>{n} months</button>
                          ))}
                        </div>
                      }>
                      <Trend data={d.timeline} height={mobile ? 230 : 280} keys={[{ key: "Projects", color: primary }, { key: "Posts", color: secondary }, { key: "Messages", color: accent }]} />
                    </Tile>
                  </div>

                  {/* ✅ NEW: Composed chart — content vs views */}
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-12" title="Content vs views" note="Did adding more content this month drive more views?" icon={<Gauge size={16} />}>
                      <Combo data={d.viewsByMonth} bars={[{ key: "Content", color: primary }]} lines={[{ key: "Views", color: accent }]} height={mobile ? 240 : 280} />
                    </Tile>
                  </div>

                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-6" title="Total content over time" note="Projects and posts together, last 12 months" icon={<BarChart3 size={16} />}>
                      <Trend kind="line" data={d.cumulative} keys={[{ key: "Content", color: primary }]} height={240} />
                    </Tile>
                    <Tile className="lg:col-span-6" title="Stacked monthly activity" note="How each month is made up" icon={<Layers size={16} />}>
                      <VBar stacked data={d.timeline} keys={[{ key: "Projects", color: primary }, { key: "Posts", color: secondary }, { key: "Messages", color: accent }]} />
                    </Tile>
                  </div>

                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-4" title="Where views come from" icon={<PieIcon size={16} />}><Donut mobile={mobile} data={d.viewsSplit} center="views" /></Tile>
                    <Tile className="lg:col-span-4" title="This month and last month" note="Side by side" icon={<Clock size={16} />}>
                      <VBar data={d.compare} keys={[{ key: "This month", color: primary }, { key: "Last month", color: `${text}55` }]} />
                    </Tile>
                    <Tile className="lg:col-span-4" title="Quick numbers" icon={<Zap size={16} />}>
                      {[
                        ["Average views per live project", num(avgProjectViews)], ["Average views per live post", num(avgPostViews)],
                        ["Average reading time", d.avgRead ? `${d.avgRead} min` : "none"], ["Readers who react", `${engagement}%`],
                        ["Combined years of experience", `${d.totalYears}`], ["Questions in your FAQ", num(fs?.total)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 border-b py-2.5 text-sm last:border-0" style={{ borderColor: `${text}12` }}>
                          <span className="opacity-70">{k}</span><span className="font-bold tabular-nums">{v}</span>
                        </div>
                      ))}
                    </Tile>
                  </div>

                  {/* ✅ NEW: Radial bars for content health */}
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-6" title="Content health bars" note="Percent of each area that's live" icon={<ShieldCheck size={16} />}>
                      <RadialBars data={[
                        { name: "Projects live", value: projPub, color: primary },
                        { name: "Posts live", value: postPub, color: secondary },
                        { name: "Replies", value: replyRate, color: accent },
                        { name: "Testimonials shown", value: testiPub, color: warn },
                        { name: "Average skill", value: d.avgSkill, color: info },
                      ]} unit="%" />
                    </Tile>
                    <Tile className="lg:col-span-6" title="Skill coverage" note="How many project tools also have a rated skill" icon={<GitBranch size={16} />}>
                      <Donut mobile={mobile} data={d.coverage} center="tools" />
                    </Tile>
                  </div>
                </>
              )}

              {tab === "insights" && (
                <div className="space-y-8">
                  {([
                    ["warn", "Fix these first", "Things that may be costing you visits or clients."],
                    ["tip", "Ideas to try", "Small steps that can help your portfolio grow."],
                    ["good", "Going well", "Keep doing these things."],
                  ] as const).map(([tn, title, sub]) => {
                    const items = insights.filter((i) => i.tone === tn);
                    return (
                      <section key={tn}>
                        <div className="mb-3 flex items-center gap-3">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors.tone(tn) }} />
                          <h2 className="text-lg font-bold">{title}</h2><Chip color={colors.tone(tn)}>{items.length}</Chip>
                          <span className="hidden text-sm opacity-55 sm:inline">{sub}</span>
                        </div>
                        {items.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{items.map((it) => <InsightRow key={it.title} it={it} />)}</div>
                          : <p className="rounded-xl border px-4 py-5 text-sm opacity-60" style={{ borderColor: `${text}1a` }}>Nothing in this group right now.</p>}
                      </section>
                    );
                  })}
                </div>
              )}

              {tab === "content" && (
                <>
                  <div className={grid}>
                    <Tile className="lg:col-span-4" title="Projects by status" icon={<Layers size={16} />}><Donut mobile={mobile} data={d.projectStatus} center="projects" /></Tile>
                    <Tile className="lg:col-span-4" title="Posts by status" icon={<FileText size={16} />}><Donut mobile={mobile} data={d.postStatus} center="posts" /></Tile>
                    <Tile className="lg:col-span-4" title="Project links by type" note="Code, demo, docs and more" icon={<Link2 size={16} />}><PieSmall mobile={mobile} data={d.linkTypes} /></Tile>
                  </div>
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-6" title="Most viewed projects" note="Bar shows size compared with the best one" icon={<Eye size={16} />}>
                      {d.sortedProjects.length ? d.sortedProjects.slice(0, 8).map((p, i) => (
                        <RankRow key={p.id} rank={i + 1} name={p.title} value={p.viewCount} max={d.sortedProjects[0].viewCount || 1} color={colors.status[p.status] ?? primary}
                          extra={<Chip color={colors.status[p.status] ?? primary}>{p.status}</Chip>} />
                      )) : <Empty />}
                    </Tile>
                    <Tile className="lg:col-span-6" title="Most viewed posts" note="Bar shows size compared with the best one" icon={<Eye size={16} />}>
                      {d.sortedPosts.length ? d.sortedPosts.slice(0, 8).map((p, i) => (
                        <RankRow key={p.id} rank={i + 1} name={p.title} value={p.viewCount} max={d.sortedPosts[0].viewCount || 1} color={secondary}
                          extra={p.readingTime ? <Chip color={secondary}>{p.readingTime} min</Chip> : null} />
                      )) : <Empty />}
                    </Tile>
                  </div>
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-6" title="Tools used in projects" note="How many projects use each tool" icon={<Cpu size={16} />}><HBar mobile={mobile} data={d.topProjectTechs} color={accent} unit=" projects" /></Tile>
                    <Tile className="lg:col-span-6" title="Most used post tags" icon={<Tag size={16} />}><HBar mobile={mobile} data={d.topTags} color={warn} unit=" posts" /></Tile>
                  </div>

                  {/* ✅ NEW: Tag treemap + reading time buckets */}
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-6" title="Tag cloud" note="Bigger boxes = more posts with this tag" icon={<FolderTree size={16} />}>
                      <TagsTreemap data={d.tagTree} />
                    </Tile>
                    <Tile className="lg:col-span-6" title="Reading time distribution" note="How long your posts take to read" icon={<CalendarDays size={16} />}>
                      <VBar data={d.readBuckets} keys={[{ key: "Posts", color: primary }]} height={260} />
                    </Tile>
                  </div>

                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-7" title="Do longer posts get more views?" note="Each dot is one post" icon={<Activity size={16} />}>
                      <Dots data={d.postDots} color={secondary} xLabel="Minutes to read" yLabel="Views" />
                    </Tile>
                    <Tile className="lg:col-span-5" title="Post reactions" note={engagement ? `${engagement}% of views lead to a reaction` : "Likes and fire"} icon={<Star size={16} />}><Donut mobile={mobile} data={d.reactionData} center="reactions" /></Tile>
                  </div>
                </>
              )}

              {tab === "skills" && (
                <>
                  <div className={grid}>
                    <Tile className="lg:col-span-5" title="Strength by area" note="Average level, 0 to 100" icon={<Target size={16} />}><SkillRadar data={d.radar} /></Tile>
                    <Tile className="lg:col-span-7" title="Your top skills" note="Level and years of experience" icon={<Cpu size={16} />}>
                      {d.sortedSkills.length ? d.sortedSkills.slice(0, 8).map((s, i) => (
                        <RankRow key={s.id} rank={i + 1} name={s.technology.name} value={s.proficiency} max={100} color={colors.palette[i % colors.palette.length]}
                          extra={<Chip color={colors.palette[i % colors.palette.length]}>{s.yearsExperience} yrs</Chip>} />
                      )) : <Empty />}
                    </Tile>
                  </div>
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-4" title="How many skills at each level" icon={<BarChart3 size={16} />}><VBar data={d.levels} keys={[{ key: "Skills", color: primary }]} /></Tile>
                    <Tile className="lg:col-span-4" title="Experience and level" note="Does more time mean a higher level?" icon={<Activity size={16} />}><Dots data={d.skillDots} color={accent} xLabel="Years" yLabel="Level" /></Tile>
                    <Tile className="lg:col-span-4" title="Years of experience by area" icon={<Clock size={16} />}><VBar data={d.yearsByCat} keys={[{ key: "Years", color: secondary }]} /></Tile>
                  </div>

                  {/* ✅ NEW: Category coverage + radial bars */}
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-6" title="Skills used vs unused by area" note="Rated skills that also appear in a project" icon={<GitBranch size={16} />}>
                      <VBar stacked data={d.catCoverage} keys={[
                        { key: "In projects", color: primary },
                        { key: "Not used", color: `${text}55` },
                      ]} height={260} />
                    </Tile>
                    <Tile className="lg:col-span-6" title="Skill progress ring" note="Your proficiency snapshots" icon={<Gauge size={16} />}>
                      <RadialBars data={d.sortedSkills.slice(0, 6).map((s, i) => ({
                        name: s.technology.name,
                        value: s.proficiency,
                        color: colors.palette[i % colors.palette.length],
                      }))} unit="%" />
                    </Tile>
                  </div>

                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-4" title="Skills by area" icon={<PieIcon size={16} />}><Donut mobile={mobile} data={d.skillCount} center="skills" /></Tile>
                    <Tile className="lg:col-span-4" title="All tools in your catalogue" note={`${d.techTotal} tools in total`} icon={<Layers size={16} />}><Donut mobile={mobile} data={d.techCats} center="tools" /></Tile>
                    <Tile className="lg:col-span-4" title="Project tools with a skill level" note="Tools used in projects that you have rated" icon={<Link2 size={16} />}><Donut mobile={mobile} data={d.coverage} center="tools" /></Tile>
                  </div>
                </>
              )}

              {tab === "inbox" && (
                <>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                    <Kpi label="New messages" value={ms?.new ?? 0} sub="not opened yet" icon={<Inbox size={14} />} color={bad} />
                    <Kpi label="Read" value={ms?.read ?? 0} sub="opened, no reply" icon={<Eye size={14} />} color={info} />
                    <Kpi label="Replied" value={ms?.replied ?? 0} sub={`${replyRate}% of all`} icon={<MessageSquare size={14} />} color={good} />
                    <Kpi label="Archived" value={ms?.archived ?? 0} sub="put away" icon={<Layers size={14} />} color={`${text}99`} />
                    <Kpi label="Testimonials" value={ts?.total ?? 0} sub={`${ts?.published ?? 0} shown`} icon={<Star size={14} />} color={warn} />
                    <Kpi label="FAQ questions" value={fs?.total ?? 0} sub="on your site" icon={<Lightbulb size={14} />} color={primary} />
                  </div>
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-7" title="Latest messages" note={d.openCount ? `${d.openCount} still need a reply` : "You are all caught up"} icon={<Inbox size={16} />}>
                      {msgList.length ? msgList.slice(0, 6).map((m) => (
                        <div key={m.id} className="border-b py-3 last:border-0" style={{ borderColor: `${text}12` }}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{m.name}</p>
                            <Chip color={colors.status[m.status] ?? primary} pulse={m.status === "new"}>{m.status} · {ago(m.createdAt)}</Chip>
                          </div>
                          <p className="mt-0.5 truncate text-sm opacity-60">{m.subject ? `${m.subject}: ` : ""}{m.message}</p>
                        </div>
                      )) : <Empty msg="No messages yet" />}
                    </Tile>
                    <Tile className="lg:col-span-5" title="Messages by status" icon={<PieIcon size={16} />}><Donut mobile={mobile} data={d.msgStatus} center="messages" /></Tile>
                  </div>
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-4" title="Which day people write" note="Messages by day of the week" icon={<CalendarDays size={16} />}><VBar data={d.weekday} keys={[{ key: "Messages", color: accent }]} /></Tile>
                    <Tile className="lg:col-span-4" title="How long messages wait" note="Only messages with no reply" icon={<Clock size={16} />}><VBar data={d.ageBuckets} keys={[{ key: "Waiting for reply", color: bad }]} /></Tile>
                    <Tile className="lg:col-span-4" title="Messages each month" icon={<TrendingUp size={16} />}>
                      <Trend data={d.timeline} keys={[{ key: "Messages", color: accent }]} height={240} />
                    </Tile>
                  </div>

                  {/* ✅ NEW: hourly heat distribution */}
                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-12" title="When messages arrive" note="Messages by hour of day — find your inbox rhythm" icon={<Clock size={16} />}>
                      <VBar data={d.hourly} keys={[{ key: "Messages", color: primary }]} height={220} />
                    </Tile>
                  </div>

                  <div className={`${grid} ${gap}`}>
                    <Tile className="lg:col-span-7" title="Latest testimonials" note={ts?.avgRating != null ? `Average ${ts.avgRating.toFixed(1)} out of 5` : undefined} icon={<Star size={16} />}>
                      {d.latestTestis.length ? d.latestTestis.map((x) => (
                        <div key={x.id} className="border-b py-3 last:border-0" style={{ borderColor: `${text}12` }}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{x.authorName}{x.company ? <span className="font-normal opacity-60"> · {x.company}</span> : null}</p>
                            <Stars n={x.rating} />
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-sm opacity-65">{x.content}</p>
                          <div className="mt-1"><Chip color={x.isPublished ? primary : `${text}88`}>{x.isPublished ? "shown" : "hidden"}</Chip></div>
                        </div>
                      )) : <Empty msg="No testimonials yet" />}
                    </Tile>
                    <div className="space-y-4 lg:col-span-5">
                      <Tile title="Testimonial ratings" icon={<BarChart3 size={16} />}>
                        {testiList.length ? <VBar data={d.ratingDist} keys={[{ key: "Testimonials", color: warn }]} height={200} /> : <Empty />}
                      </Tile>
                      <Tile title="Shown on your site" icon={<Eye size={16} />}>
                        <Donut mobile={mobile} data={[{ name: "Shown", value: ts?.published ?? 0, color: primary }, { name: "Hidden", value: ts?.unpublished ?? 0, color: `${text}55` }]} center="testimonials" />
                      </Tile>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </ColorCtx.Provider>
  );
}