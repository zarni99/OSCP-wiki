"use client";

import { ChangeEvent, useState } from "react";
import { Plus, X, Upload, Camera, ChevronDown, ChevronUp, Server } from "lucide-react";
import { ExploitStep, Target, Vulnerability, Screenshot, SEVERITY_COLORS, emptyVulnerability, emptyTarget, generateId } from "./types";
import { compressImage } from "./utils";
import MarkdownEditor from "./MarkdownEditor";
import StepEditor from "./StepEditor";
import TargetCompletion from "./TargetCompletion";

const field = "rounded border border-violet/40 bg-surface px-3 py-2 text-bright placeholder:text-dim/60 focus:border-core/60 outline-none";
const label = "block mb-1 text-xs font-mono uppercase tracking-wider text-dim";

interface Props {
  targets: Target[];
  activeIdx: number;
  setActiveIdx: (i: number) => void;
  setTargets: React.Dispatch<React.SetStateAction<Target[]>>;
}

export default function TargetsTab({ targets, activeIdx, setActiveIdx, setTargets }: Props) {
  // Hooks must run on every render — never branch before them.
  const [expandedVulns, setExpandedVulns] = useState<Record<string, boolean>>({});
  const [showExploitFreeform, setShowExploitFreeform] = useState(false);
  const [showPrivescFreeform, setShowPrivescFreeform] = useState(false);

  // Empty state — show a CTA to add the first target. Happens after the
  // Exam Dashboard tracker removes them all.
  if (targets.length === 0) {
    return (
      <div className="color-panel rounded-lg p-8 text-center">
        <p className="text-sm text-dim mb-3">No targets yet.</p>
        <button
          onClick={() => setTargets([emptyTarget()])}
          className="inline-flex items-center gap-1.5 rounded border border-orange/50 bg-orange/10 px-3 py-1.5 font-mono text-xs text-orange hover:bg-orange/15"
        >
          <Plus size={11} /> Add first target
        </button>
      </div>
    );
  }
  const target = targets[activeIdx] ?? targets[0];

  const toggleVuln = (id: string) =>
    setExpandedVulns((prev) => ({ ...prev, [id]: !(prev[id] ?? false) }));

  const isVulnExpanded = (v: Vulnerability) => {
    // Auto-expand when the vuln has no title yet (just added, needs editing).
    if (expandedVulns[v.id] !== undefined) return expandedVulns[v.id];
    return !v.title;
  };

  const updateTarget = (patch: Partial<Target>) => {
    setTargets((prev) => prev.map((t, i) => (i === activeIdx ? { ...t, ...patch } : t)));
  };

  const updateVuln = (vulnId: string, patch: Partial<Vulnerability>) => {
    updateTarget({
      vulnerabilities: target.vulnerabilities.map((v) => (v.id === vulnId ? { ...v, ...patch } : v)),
    });
  };

  const addTarget = () => {
    setTargets((prev) => [...prev, emptyTarget()]);
    setActiveIdx(targets.length);
  };

  const removeTarget = (idx: number) => {
    if (targets.length === 1) return;
    setTargets((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx(Math.max(0, activeIdx > idx ? activeIdx - 1 : activeIdx === idx ? 0 : activeIdx));
  };

  const handleScreenshot = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const data = await Promise.all(
      files.map(async (file): Promise<Screenshot> => {
        const dataUrl = await compressImage(file);
        return { id: generateId(), name: file.name, dataUrl, caption: "" };
      }),
    );
    updateTarget({ screenshots: [...target.screenshots, ...data] });
    e.target.value = "";
  };

  const handleProofScreenshot = async (e: ChangeEvent<HTMLInputElement>, type: "localScreenshot" | "proofScreenshot") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImage(file);
    updateTarget({
      [type]: {
        id: generateId(),
        name: file.name,
        dataUrl,
        caption: type === "localScreenshot" ? "local.txt proof" : "proof.txt proof",
      },
    });
    e.target.value = "";
  };

  const statusColor = (t: Target) => {
    const localOk = !!(t.localCaptured || t.localTxt);
    const proofOk = !!(t.proofCaptured || t.proofTxt);
    if (localOk && proofOk) return "bg-success";
    if (localOk) return "bg-warn";
    return "bg-dim/40";
  };

  return (
    <div className="space-y-4">
      {/* Target Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {targets.map((t, idx) => (
          <button
            key={t.id}
            onClick={() => setActiveIdx(idx)}
            aria-label={`Select ${t.name || `Target ${idx + 1}`}${t.isAD ? " (Active Directory)" : ""}`}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${
              idx === activeIdx
                ? "border-core/60 bg-core/10 text-core shadow-[0_0_8px_rgba(73,184,255,0.15)]"
                : "border-border text-dim hover:border-violet/40 hover:text-bright"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${statusColor(t)}`}
              aria-label={
                (t.localCaptured || t.localTxt) && (t.proofCaptured || t.proofTxt)
                  ? "fully owned"
                  : (t.localCaptured || t.localTxt)
                    ? "user shell only"
                    : "not owned"
              }
            />
            <Server size={12} aria-hidden="true" />
            {t.name || `Target ${idx + 1}`}
            {t.isAD && <span className="rounded bg-adblue/20 px-1 py-0.5 font-mono text-[9px] text-adblue">AD</span>}
            {targets.length > 1 && (
              <X
                size={12}
                aria-label={`Remove ${t.name || `Target ${idx + 1}`}`}
                role="button"
                tabIndex={0}
                className="text-dim hover:text-red"
                onClick={(e) => { e.stopPropagation(); removeTarget(idx); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); removeTarget(idx); } }}
              />
            )}
          </button>
        ))}
        <button onClick={addTarget} className="inline-flex items-center gap-1 rounded-md border border-dashed border-violet/40 px-3 py-1.5 text-sm text-dim hover:text-violet hover:border-violet">
          <Plus size={14} /> Add Target
        </button>
      </div>

      {/* Per-target completion banner */}
      <TargetCompletion target={target} />

      {/* Target Info */}
      <div className="color-panel rounded-lg p-5 space-y-4">
        <h3 className="font-heading text-lg text-core flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-core" />
          Target Information
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className={label}>Hostname</label>
            <input value={target.name} onChange={(e) => updateTarget({ name: e.target.value })} placeholder="DC01 / WEB01" className={`${field} w-full`} spellCheck={false} />
          </div>
          <div>
            <label className={label}>IP Address</label>
            <input value={target.ip} onChange={(e) => updateTarget({ ip: e.target.value })} placeholder="192.168.x.x" className={`${field} w-full font-mono`} spellCheck={false} />
          </div>
          <div>
            <label className={label}>Operating System</label>
            <select value={target.os} onChange={(e) => updateTarget({ os: e.target.value as Target["os"] })} className={`${field} w-full`}>
              <option value="Unknown">Unknown</option><option value="Linux">Linux</option><option value="Windows">Windows</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={target.isAD} onChange={(e) => updateTarget({ isAD: e.target.checked })} className="accent-adblue" />
            <span className="text-adblue font-mono text-xs">ACTIVE DIRECTORY TARGET</span>
          </label>
        </div>
      </div>

      {/* Service Enumeration */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-violet flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet" />
          Service Enumeration
        </h3>
        <div>
          <label className={label}>Open Ports</label>
          <textarea value={target.ports} onChange={(e) => updateTarget({ ports: e.target.value })} placeholder={"PORT      STATE  SERVICE       VERSION\n22/tcp    open   ssh           OpenSSH 8.9p1\n80/tcp    open   http          Apache 2.4.52\n445/tcp   open   microsoft-ds  Windows Server 2019"} className={`${field} min-h-[120px] w-full resize-y font-mono text-xs`} spellCheck={false} />
        </div>
        <div>
          <label className={label}>Enumeration Notes</label>
          <MarkdownEditor
            value={target.enumeration}
            onChange={(next) => updateTarget({ enumeration: next })}
            placeholder="Document your enumeration methodology, tools used, and findings. Include gobuster/feroxbuster results, SNMP walks, SMB enumeration, etc. Paste or drag screenshots inline."
            minHeight={140}
          />
        </div>
      </div>

      {/* Vulnerabilities */}
      <div className="color-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg text-warn flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warn" />
            Vulnerability Analysis
          </h3>
          <button onClick={() => updateTarget({ vulnerabilities: [...target.vulnerabilities, emptyVulnerability()] })} className="inline-flex items-center gap-1 rounded border border-dashed border-warn/40 px-2 py-1 text-xs text-dim hover:text-warn hover:border-warn">
            <Plus size={12} /> Add Vulnerability
          </button>
        </div>
        {target.vulnerabilities.map((vuln, vi) => {
          const open = isVulnExpanded(vuln);
          const sevClass = SEVERITY_COLORS[vuln.severity] ?? "text-dim";
          return (
            <div key={vuln.id} className="rounded-md border border-border bg-surface/50 overflow-hidden">
              {/* Collapsible header */}
              <button
                type="button"
                onClick={() => toggleVuln(vuln.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface2/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-dim/70 shrink-0">#{vi + 1}</span>
                  <span className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${sevClass}`}>
                    {vuln.severity}
                  </span>
                  <span className="truncate font-mono text-sm text-bright">
                    {vuln.title || <span className="italic text-dim/60">untitled vulnerability</span>}
                  </span>
                  {vuln.cvss && (
                    <span className="shrink-0 font-mono text-[10px] text-dim">CVSS {vuln.cvss}</span>
                  )}
                  {vuln.cve && (
                    <span className="shrink-0 font-mono text-[10px] text-core">{vuln.cve}</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {target.vulnerabilities.length > 1 && (
                    <span
                      role="button"
                      aria-label={`Remove vulnerability: ${vuln.title || "untitled"}`}
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!confirm(`Remove vulnerability "${vuln.title || "untitled"}"?`)) return;
                        updateTarget({ vulnerabilities: target.vulnerabilities.filter((v) => v.id !== vuln.id) });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          if (!confirm(`Remove vulnerability "${vuln.title || "untitled"}"?`)) return;
                          updateTarget({ vulnerabilities: target.vulnerabilities.filter((v) => v.id !== vuln.id) });
                        }
                      }}
                      className="text-xs text-dim hover:text-red cursor-pointer px-1"
                    >
                      <X size={12} aria-hidden="true" />
                    </span>
                  )}
                  {open ? <ChevronUp size={14} className="text-dim" /> : <ChevronDown size={14} className="text-dim" />}
                </div>
              </button>

              {open && (
                <div className="border-t border-border p-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className={label}>Title</label>
                      <input value={vuln.title} onChange={(e) => updateVuln(vuln.id, { title: e.target.value })} placeholder="e.g. SQL Injection in Login Form" className={`${field} w-full`} spellCheck={false} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={label}>Severity</label>
                        <select value={vuln.severity} onChange={(e) => updateVuln(vuln.id, { severity: e.target.value as Vulnerability["severity"] })} className={`${field} w-full text-xs`}>
                          <option>Critical</option><option>High</option><option>Medium</option><option>Low</option><option>Informational</option>
                        </select>
                      </div>
                      <div>
                        <label className={label}>CVSS</label>
                        <input value={vuln.cvss} onChange={(e) => updateVuln(vuln.id, { cvss: e.target.value })} placeholder="9.8" className={`${field} w-full font-mono`} spellCheck={false} />
                      </div>
                      <div>
                        <label className={label}>CVE</label>
                        <input value={vuln.cve} onChange={(e) => updateVuln(vuln.id, { cve: e.target.value })} placeholder="CVE-2024-XXXX" className={`${field} w-full font-mono text-xs`} spellCheck={false} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={label}>Description</label>
                    <MarkdownEditor
                      value={vuln.description}
                      onChange={(next) => updateVuln(vuln.id, { description: next })}
                      placeholder="Detailed description of the vulnerability..."
                      minHeight={80}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className={label}>Impact</label>
                      <MarkdownEditor
                        value={vuln.impact}
                        onChange={(next) => updateVuln(vuln.id, { impact: next })}
                        placeholder="What is the impact of this vulnerability?"
                        minHeight={60}
                      />
                    </div>
                    <div>
                      <label className={label}>Remediation</label>
                      <MarkdownEditor
                        value={vuln.remediation}
                        onChange={(next) => updateVuln(vuln.id, { remediation: next })}
                        placeholder="How should this be remediated?"
                        minHeight={60}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exploitation */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg text-post flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-post" />
            Exploitation (Initial Access)
          </h3>
          <button
            type="button"
            onClick={() => setShowExploitFreeform((v) => !v)}
            className="font-mono text-[10px] text-dim hover:text-violet"
          >
            {showExploitFreeform || target.exploitation ? "hide" : "show"} free-form markdown
          </button>
        </div>
        <p className="text-xs text-dim">
          Document the exact steps to achieve initial access. Each step has a command, output, and optional screenshot — the PDF renders these as numbered steps with figure references.
        </p>
        <StepEditor
          steps={target.exploitationSteps ?? []}
          onChange={(next: ExploitStep[]) => updateTarget({ exploitationSteps: next })}
          accent="text-post"
        />
        {(showExploitFreeform || target.exploitation) && (
          <div className="pt-2 border-t border-border">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-dim">
              Free-form markdown (legacy / overflow)
            </p>
            <MarkdownEditor
              value={target.exploitation}
              onChange={(next) => updateTarget({ exploitation: next })}
              placeholder="Unstructured notes, output dumps, or full markdown walkthrough. Rendered in the PDF after the structured steps."
              minHeight={120}
              mono
            />
          </div>
        )}
      </div>

      {/* Privilege Escalation */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg text-success flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            Privilege Escalation
          </h3>
          <button
            type="button"
            onClick={() => setShowPrivescFreeform((v) => !v)}
            className="font-mono text-[10px] text-dim hover:text-violet"
          >
            {showPrivescFreeform || target.privesc ? "hide" : "show"} free-form markdown
          </button>
        </div>
        <p className="text-xs text-dim">Document the privilege escalation vector and exact steps to achieve root/SYSTEM access.</p>
        <StepEditor
          steps={target.privescSteps ?? []}
          onChange={(next: ExploitStep[]) => updateTarget({ privescSteps: next })}
          accent="text-success"
        />
        {(showPrivescFreeform || target.privesc) && (
          <div className="pt-2 border-t border-border">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-dim">
              Free-form markdown (legacy / overflow)
            </p>
            <MarkdownEditor
              value={target.privesc}
              onChange={(next) => updateTarget({ privesc: next })}
              placeholder="Unstructured notes or full markdown walkthrough."
              minHeight={120}
              mono
            />
          </div>
        )}
      </div>

      {/* Post-Exploitation */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-adblue flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-adblue" />
          Post-Exploitation
        </h3>
        <MarkdownEditor
          value={target.postExploitation}
          onChange={(next) => updateTarget({ postExploitation: next })}
          placeholder="Document any post-exploitation activities: credential harvesting, lateral movement preparation, persistence, etc."
          minHeight={140}
        />
      </div>

      {/* Proof / Flags */}
      <div className="color-panel rounded-lg p-5 space-y-4">
        <h3 className="font-heading text-lg text-success flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          Proof of Exploitation
        </h3>
        <p className="text-xs text-dim">
          Provide the flag values and screenshots showing <code className="text-core">whoami</code>, <code className="text-core">hostname</code>, <code className="text-core">ip addr</code>/<code className="text-core">ipconfig</code>, and the flag file contents.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {/* local.txt */}
          <div className="rounded-md border border-warn/40 bg-warn/5 p-4 space-y-2">
            <label className="block font-mono text-xs text-warn uppercase tracking-wider">local.txt</label>
            <input value={target.localTxt} onChange={(e) => updateTarget({ localTxt: e.target.value })} placeholder="flag hash..." className="w-full rounded border border-warn/40 bg-surface px-3 py-2 font-mono text-sm text-warn placeholder:text-dim/40 focus:border-warn outline-none" spellCheck={false} />
            {target.localScreenshot ? (
              <div className="relative">
                <img src={target.localScreenshot.dataUrl} alt="local.txt proof" className="rounded border border-border max-h-32 w-full object-cover" />
                <button onClick={() => updateTarget({ localScreenshot: null })} aria-label="Remove local.txt screenshot" className="absolute top-1 right-1 rounded bg-bg/80 p-0.5"><X size={12} className="text-red" aria-hidden="true" /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 cursor-pointer rounded border border-dashed border-warn/30 p-3 text-xs text-dim hover:text-warn hover:border-warn">
                <Camera size={14} /> Screenshot proof
                <input type="file" accept="image/*" onChange={(e) => handleProofScreenshot(e, "localScreenshot")} className="hidden" />
              </label>
            )}
          </div>
          {/* proof.txt */}
          <div className="rounded-md border border-success/40 bg-success/5 p-4 space-y-2">
            <label className="block font-mono text-xs text-success uppercase tracking-wider">proof.txt</label>
            <input value={target.proofTxt} onChange={(e) => updateTarget({ proofTxt: e.target.value })} placeholder="flag hash..." className="w-full rounded border border-success/40 bg-surface px-3 py-2 font-mono text-sm text-success placeholder:text-dim/40 focus:border-success outline-none" spellCheck={false} />
            {target.proofScreenshot ? (
              <div className="relative">
                <img src={target.proofScreenshot.dataUrl} alt="proof.txt proof" className="rounded border border-border max-h-32 w-full object-cover" />
                <button onClick={() => updateTarget({ proofScreenshot: null })} aria-label="Remove proof.txt screenshot" className="absolute top-1 right-1 rounded bg-bg/80 p-0.5"><X size={12} className="text-red" aria-hidden="true" /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 cursor-pointer rounded border border-dashed border-success/30 p-3 text-xs text-dim hover:text-success hover:border-success">
                <Camera size={14} /> Screenshot proof
                <input type="file" accept="image/*" onChange={(e) => handleProofScreenshot(e, "proofScreenshot")} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Screenshots */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-dim flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-dim" />
          Supporting Screenshots
        </h3>
        <label className="flex items-center justify-center gap-2 cursor-pointer rounded border border-dashed border-violet/40 bg-surface2 p-5 text-sm text-dim hover:text-violet hover:border-violet">
          <Upload size={16} /> Upload screenshots
          <input type="file" accept="image/*" multiple onChange={handleScreenshot} className="hidden" />
        </label>
        {target.screenshots.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {target.screenshots.map((s) => (
              <div key={s.id} className="rounded-md border border-border bg-surface/50 p-2 space-y-2">
                <img src={s.dataUrl} alt={s.name} className="h-28 w-full rounded object-cover" />
                <input
                  value={s.caption}
                  onChange={(e) => updateTarget({ screenshots: target.screenshots.map((i) => (i.id === s.id ? { ...i, caption: e.target.value } : i)) })}
                  placeholder="Caption / Figure description"
                  className="w-full rounded border border-border bg-surface px-2 py-1 text-xs focus:border-violet/60 outline-none"
                  spellCheck={false}
                />
                <button onClick={() => updateTarget({ screenshots: target.screenshots.filter((i) => i.id !== s.id) })} className="text-xs text-red hover:text-red/80">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Notes */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-dim flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-dim" />
          Additional Notes
        </h3>
        <MarkdownEditor
          value={target.notes}
          onChange={(next) => updateTarget({ notes: next })}
          placeholder="Any additional notes, observations, or cleanup steps..."
          minHeight={120}
        />
      </div>
    </div>
  );
}
