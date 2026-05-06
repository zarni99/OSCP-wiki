"use client";

import { ReportData } from "./types";

const field = "rounded border border-violet/40 bg-surface px-3 py-2 text-bright placeholder:text-dim/60 focus:border-core/60 outline-none";
const label = "block mb-1 text-xs font-mono uppercase tracking-wider text-dim";
const textarea = `${field} min-h-[140px] w-full resize-y`;

interface Props {
  data: ReportData;
  update: (patch: Partial<ReportData>) => void;
}

export default function SummaryTab({ data, update }: Props) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-core flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-core" />
          1.0 — Executive Summary
        </h3>
        <p className="text-xs text-dim leading-relaxed">
          Provide a high-level overview of the penetration test. Summarize the scope, key findings,
          overall security posture, and the number of machines compromised during the exam.
        </p>
        <div>
          <label className={label}>Executive Summary</label>
          <textarea
            value={data.executiveSummary}
            onChange={(e) => update({ executiveSummary: e.target.value })}
            placeholder={`Example:\n\nI was tasked with performing an internal penetration test towards the Offensive Security Exam environment. The objective was to evaluate the security posture of the exam network and identify exploitable vulnerabilities.\n\nDuring the assessment, I was able to gain access to X out of Y target machines. The targets included both standalone systems and an Active Directory domain environment...\n\nOverall, several critical and high-severity vulnerabilities were identified...`}
            className={`${textarea} min-h-[200px]`}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Methodology */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-violet flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet" />
          2.0 — Methodology
        </h3>
        <p className="text-xs text-dim leading-relaxed">
          Describe the systematic approach used during the penetration test. This should cover
          each phase of the assessment methodology.
        </p>
        <div>
          <label className={label}>Testing Methodology</label>
          <textarea
            value={data.methodology}
            onChange={(e) => update({ methodology: e.target.value })}
            placeholder="Describe the methodology used..."
            className={`${textarea} min-h-[200px]`}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Tools Used */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-success flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          Tools Used
        </h3>
        <div>
          <label className={label}>Tools & Software</label>
          <textarea
            value={data.toolsUsed}
            onChange={(e) => update({ toolsUsed: e.target.value })}
            placeholder="List tools used during the assessment..."
            className={`${textarea} min-h-[100px]`}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Findings Overview */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-warn flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-warn" />
          Findings Overview
        </h3>
        <div className="overflow-hidden rounded border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface2 text-dim font-mono text-xs">
                <th className="px-4 py-2 text-left">Target</th>
                <th className="px-4 py-2 text-left">IP</th>
                <th className="px-4 py-2 text-left">OS</th>
                <th className="px-4 py-2 text-center">Vulns</th>
                <th className="px-4 py-2 text-center">local.txt</th>
                <th className="px-4 py-2 text-center">proof.txt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.targets.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 font-mono text-core">{t.name || "—"}</td>
                  <td className="px-4 py-2 font-mono">{t.ip || "—"}</td>
                  <td className="px-4 py-2">{t.os}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="rounded-full bg-violet/20 px-2 py-0.5 text-xs font-mono text-violet">
                      {t.vulnerabilities.filter(v => v.title).length}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {t.localTxt ? <span className="text-success">✓</span> : <span className="text-dim">—</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {t.proofTxt ? <span className="text-success">✓</span> : <span className="text-dim">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
