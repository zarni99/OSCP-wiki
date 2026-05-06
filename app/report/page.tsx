"use client";

import { FileText, Shield, Target, Network, Paperclip, Download, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ReportData, ReportTab, emptyReport, Target as TargetType } from "./types";
import CoverTab from "./CoverTab";
import SummaryTab from "./SummaryTab";
import TargetsTab from "./TargetsTab";
import ADChainTab from "./ADChainTab";
import AppendixTab from "./AppendixTab";
import { exportReport } from "./exportPdf";

const STORAGE_KEY = "oscp-report-v2";

const tabs: { id: ReportTab; label: string; icon: typeof FileText }[] = [
  { id: "cover", label: "Cover Page", icon: Shield },
  { id: "summary", label: "Summary & Methodology", icon: FileText },
  { id: "targets", label: "Target Walkthroughs", icon: Target },
  { id: "ad-chain", label: "AD Attack Chain", icon: Network },
  { id: "appendix", label: "Appendix", icon: Paperclip },
];

export default function ReportPage() {
  const [data, setData] = useState<ReportData>(emptyReport());
  const [activeTab, setActiveTab] = useState<ReportTab>("cover");
  const [activeTarget, setActiveTarget] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setData({ ...emptyReport(), ...parsed });
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loaded]);

  const update = (patch: Partial<ReportData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const setTargets = (fn: React.SetStateAction<TargetType[]>) => {
    setData((prev) => ({
      ...prev,
      targets: typeof fn === "function" ? fn(prev.targets) : fn,
    }));
  };

  const resetReport = () => {
    if (confirm("Reset all report data? This cannot be undone.")) {
      setData(emptyReport());
      setActiveTarget(0);
    }
  };

  // Completion stats
  const totalTargets = data.targets.length;
  const ownedTargets = data.targets.filter((t) => t.proofTxt).length;
  const userTargets = data.targets.filter((t) => t.localTxt).length;
  const totalVulns = data.targets.reduce((s, t) => s + t.vulnerabilities.filter((v) => v.title).length, 0);
  const hasAD = data.targets.some((t) => t.isAD);

  // Completion checks
  const checks = [
    { label: "Candidate info", ok: !!(data.candidateName && data.osid) },
    { label: "Executive summary", ok: !!data.executiveSummary },
    { label: "Methodology", ok: !!data.methodology },
    { label: "At least 1 target", ok: data.targets.some((t) => t.name && t.ip) },
    { label: "Vulnerability documented", ok: totalVulns > 0 },
    { label: "Exploitation steps", ok: data.targets.some((t) => t.exploitation) },
    { label: "Proof flags captured", ok: data.targets.some((t) => t.proofTxt) },
    { label: "Proof screenshots", ok: data.targets.some((t) => t.proofScreenshot) },
  ];
  const completionPct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-gradient-brand">Report Builder</h1>
          <p className="text-xs text-dim mt-1">Professional OSCP+ Penetration Test Report</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetReport}
            className="rounded border border-border px-3 py-2 text-sm text-dim hover:border-red/40 hover:text-red transition"
          >
            <Trash2 size={14} className="inline mr-1" />
            Reset
          </button>
          <button
            onClick={() => exportReport(data)}
            className="rounded border border-core/50 bg-gradient-to-r from-core/15 to-violet/10 px-4 py-2 text-sm text-core hover:border-core hover:shadow-[0_0_12px_rgba(73,184,255,0.2)] transition"
          >
            <Download size={14} className="inline mr-1" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="color-panel rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Progress Ring */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(158,134,255,0.15)" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={completionPct >= 80 ? "#66ffb2" : completionPct >= 50 ? "#ffd166" : "#ff5f7f"} strokeWidth="3" strokeDasharray={`${completionPct}, 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-bright">{completionPct}%</span>
            </div>
            <div>
              <p className="text-xs text-dim font-mono">COMPLETION</p>
              <p className="text-sm text-bright">{checks.filter((c) => c.ok).length}/{checks.length} checks</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div><span className="text-dim">Targets:</span> <span className="text-core font-mono">{totalTargets}</span></div>
            <div><span className="text-dim">Vulns:</span> <span className="text-warn font-mono">{totalVulns}</span></div>
            <div><span className="text-dim">User shells:</span> <span className="text-warn font-mono">{userTargets}</span></div>
            <div><span className="text-dim">Root/SYSTEM:</span> <span className="text-success font-mono">{ownedTargets}</span></div>
          </div>

          <div className="h-8 w-px bg-border hidden lg:block" />

          {/* Checklist */}
          <div className="hidden lg:grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs">
            {checks.map((c) => (
              <div key={c.label} className="flex items-center gap-1.5">
                {c.ok ? (
                  <CheckCircle2 size={12} className="text-success" />
                ) : (
                  <AlertCircle size={12} className="text-dim/40" />
                )}
                <span className={c.ok ? "text-bright" : "text-dim/60"}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-t-md border border-b-0 px-4 py-2 text-sm transition ${
                isActive
                  ? "border-violet/40 bg-surface2 text-bright shadow-[0_-1px_6px_rgba(158,134,255,0.1)]"
                  : "border-transparent text-dim hover:text-bright hover:bg-surface/50"
              }`}
            >
              <Icon size={14} className={isActive ? "text-core" : ""} />
              {tab.label}
              {tab.id === "ad-chain" && hasAD && (
                <span className="h-1.5 w-1.5 rounded-full bg-adblue" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "cover" && <CoverTab data={data} update={update} />}
        {activeTab === "summary" && <SummaryTab data={data} update={update} />}
        {activeTab === "targets" && (
          <TargetsTab
            targets={data.targets}
            activeIdx={activeTarget}
            setActiveIdx={setActiveTarget}
            setTargets={setTargets}
          />
        )}
        {activeTab === "ad-chain" && <ADChainTab data={data} update={update} />}
        {activeTab === "appendix" && <AppendixTab data={data} update={update} />}
      </div>
    </div>
  );
}
