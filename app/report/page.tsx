"use client";

import { FileText, Shield, Target, Network, Paperclip, Download, Trash2, CheckCircle2, AlertCircle, Upload, Save, Cloud, FileCode2 } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ReportTab, emptyReport, Target as TargetType } from "./types";
import CoverTab from "./CoverTab";
import SummaryTab from "./SummaryTab";
import TargetsTab from "./TargetsTab";
import ADChainTab from "./ADChainTab";
import AppendixTab from "./AppendixTab";
import { exportReport } from "./exportPdf";
import { exportReportMarkdown } from "./exportMarkdown";
import { defaultBackupFilename, downloadFile, estimateSize, formatBytes, relativeTime, safeMergeReport } from "./utils";
import { useReport } from "@/components/ReportProvider";

/** Renders "Xs ago" and re-renders itself every 10s without causing the parent to re-render. */
function RelativeTime({ from }: { from: number }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 10_000);
    return () => window.clearInterval(id);
  }, []);
  return <>{relativeTime(from)}</>;
}

const tabs: { id: ReportTab; label: string; icon: typeof FileText }[] = [
  { id: "cover", label: "Cover Page", icon: Shield },
  { id: "summary", label: "Summary & Methodology", icon: FileText },
  { id: "targets", label: "Target Walkthroughs", icon: Target },
  { id: "ad-chain", label: "AD Attack Chain", icon: Network },
  { id: "appendix", label: "Appendix", icon: Paperclip },
];

export default function ReportPage() {
  const { data, loaded, lastSaved, saving, setData, update, saveNow } = useReport();
  const [activeTab, setActiveTab] = useState<ReportTab>("cover");
  const [activeTarget, setActiveTarget] = useState(0);
  const importRef = useRef<HTMLInputElement>(null);

  // Warn before closing/refreshing while there are unsaved changes.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saving]);

  // Ctrl/Cmd+S → manual save with toast.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (saveNow()) toast.success("Saved");
        else toast.error("Save failed");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveNow]);

  const exportJson = () => {
    downloadFile(defaultBackupFilename(data.osid), JSON.stringify(data, null, 2));
    toast.success("Backup exported");
  };

  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large (max 50 MB)");
      return;
    }
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("Not valid JSON — check the file and try again");
        return;
      }
      const merged = safeMergeReport(parsed);
      if (!merged) {
        toast.error("File doesn't look like a report backup (missing targets or candidateName)");
        return;
      }
      if (!confirm("Importing will replace your current report data. Continue?")) return;
      setData(merged);
      setActiveTarget(0);
      toast.success("Report imported");
    } catch (err) {
      console.error(err);
      toast.error("Could not read file — it may be corrupted");
    }
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
  const ownedTargets = data.targets.filter((t) => t.proofCaptured || t.proofTxt).length;
  const userTargets = data.targets.filter((t) => t.localCaptured || t.localTxt).length;
  const totalVulns = data.targets.reduce((s, t) => s + t.vulnerabilities.filter((v) => v.title).length, 0);
  const hasAD = data.targets.some((t) => t.isAD);

  // Completion checks
  const checks = [
    { label: "Candidate info", ok: !!(data.candidateName && data.osid) },
    { label: "Executive summary", ok: !!data.executiveSummary },
    { label: "Methodology", ok: !!data.methodology },
    { label: "At least 1 target", ok: data.targets.some((t) => t.name && t.ip) },
    { label: "Vulnerability documented", ok: totalVulns > 0 },
    { label: "Exploitation steps", ok: data.targets.some((t) => t.exploitation || (t.exploitationSteps?.length ?? 0) > 0) },
    { label: "Proof flags captured", ok: data.targets.some((t) => t.proofTxt) },
    { label: "Proof screenshots", ok: data.targets.some((t) => t.proofScreenshot) },
  ];
  const completionPct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-gradient-brand flex items-center gap-3">
            Report Builder
            {data.useOfficialTemplate && (
              <span className="rounded border border-orange/50 bg-orange/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-orange">
                Official OSCP Template
              </span>
            )}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-dim">
            <span>Professional OSCP+ Penetration Test Report</span>
            {/* Save indicator */}
            <span className="flex items-center gap-1.5 font-mono">
              {saving ? (
                <>
                  <Cloud size={11} className="text-warn animate-pulse" />
                  <span className="text-warn">saving…</span>
                </>
              ) : lastSaved ? (
                <>
                  <Save size={11} className="text-success" />
                  <span className="text-success/80">saved · <RelativeTime from={lastSaved} /></span>
                  <span className="text-dim/60">· {formatBytes(estimateSize(data))}</span>
                </>
              ) : null}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden file input for JSON import */}
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={importJson}
          />
          <button
            onClick={() => importRef.current?.click()}
            title="Import report from JSON backup"
            className="rounded border border-border px-3 py-2 text-sm text-dim hover:border-violet/50 hover:text-violet transition"
          >
            <Upload size={14} className="inline mr-1" />
            Import
          </button>
          <button
            onClick={exportJson}
            title="Download report as JSON backup"
            className="rounded border border-border px-3 py-2 text-sm text-dim hover:border-violet/50 hover:text-violet transition"
          >
            <Download size={14} className="inline mr-1" />
            JSON
          </button>
          <button
            onClick={resetReport}
            className="rounded border border-border px-3 py-2 text-sm text-dim hover:border-red/40 hover:text-red transition"
          >
            <Trash2 size={14} className="inline mr-1" />
            Reset
          </button>
          <button
            onClick={() => {
              exportReportMarkdown(data);
              toast.success("Markdown exported");
            }}
            title="Download report as Markdown (.md)"
            className="rounded border border-border px-3 py-2 text-sm text-dim hover:border-violet/50 hover:text-violet transition"
          >
            <FileCode2 size={14} className="inline mr-1" />
            Export MD
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
      <div className="color-panel rounded-lg p-4 space-y-3">
        {/* Top row: ring + counts */}
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
        </div>

        {/* Checklist — full-width row below, always visible */}
        <div className="border-t border-border pt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4 text-xs">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-1.5">
              {c.ok ? (
                <CheckCircle2 size={11} className="shrink-0 text-success" />
              ) : (
                <AlertCircle size={11} className="shrink-0 text-dim/30" />
              )}
              <span className={c.ok ? "text-bright" : "text-dim/50"}>{c.label}</span>
            </div>
          ))}
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
            activeIdx={Math.min(activeTarget, Math.max(0, data.targets.length - 1))}
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
