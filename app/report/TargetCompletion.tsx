"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Target } from "./types";

interface Check {
  ok: boolean;
  label: string;
}

/**
 * Scan a Target for incomplete fields. Used by the per-target completion
 * banner inside TargetsTab to surface what still needs attention.
 */
function checkTarget(t: Target): Check[] {
  const hasExploitation =
    t.exploitation.trim().length > 0 ||
    (t.exploitationSteps?.length ?? 0) > 0;
  const hasPrivesc =
    t.privesc.trim().length > 0 || (t.privescSteps?.length ?? 0) > 0;
  const hasNamedVuln = t.vulnerabilities.some((v) => v.title.trim().length > 0);

  return [
    { ok: !!t.name, label: "hostname" },
    { ok: !!t.ip, label: "IP address" },
    { ok: t.os !== "Unknown", label: "OS identified" },
    { ok: !!t.ports.trim(), label: "port scan" },
    { ok: !!t.enumeration.trim(), label: "enumeration notes" },
    { ok: hasNamedVuln, label: "vulnerability documented" },
    { ok: hasExploitation, label: "exploitation walkthrough" },
    { ok: hasPrivesc, label: "privesc walkthrough" },
    { ok: !!(t.localCaptured || t.localTxt), label: "local.txt captured" },
    { ok: !!(t.proofCaptured || t.proofTxt), label: "proof.txt captured" },
    { ok: !!t.localScreenshot, label: "local.txt screenshot" },
    { ok: !!t.proofScreenshot, label: "proof.txt screenshot" },
  ];
}

export default function TargetCompletion({ target }: { target: Target }) {
  const checks = checkTarget(target);
  const done = checks.filter((c) => c.ok).length;
  const pct = Math.round((done / checks.length) * 100);
  const missing = checks.filter((c) => !c.ok);

  const barColor = pct >= 90 ? "bg-success" : pct >= 60 ? "bg-orange" : "bg-warn";
  const textColor = pct >= 90 ? "text-success" : pct >= 60 ? "text-orange" : "text-warn";

  return (
    <div className="color-panel rounded-md p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {pct === 100 ? (
            <CheckCircle2 size={14} className="shrink-0 text-success" />
          ) : (
            <AlertTriangle size={14} className={`shrink-0 ${textColor}`} />
          )}
          <span className="font-mono text-xs text-bright">
            Target completion:
            <span className={`ml-1.5 font-bold ${textColor}`}>{done} / {checks.length}</span>
            <span className="ml-1.5 text-dim/60">({pct}%)</span>
          </span>
        </div>
        <div className="hidden md:block flex-1 max-w-xs">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface2">
            <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {missing.map((m) => (
            <span
              key={m.label}
              className="inline-flex items-center gap-1 rounded border border-warn/30 bg-warn/5 px-1.5 py-0.5 font-mono text-[10px] text-warn/90"
            >
              <span className="text-warn">·</span> needs {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
