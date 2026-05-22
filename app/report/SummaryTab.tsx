"use client";

import { ReportData } from "./types";
import MarkdownEditor from "./MarkdownEditor";

const label = "block mb-1 text-xs font-mono uppercase tracking-wider text-dim";

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
          <MarkdownEditor
            value={data.executiveSummary}
            onChange={(next) => update({ executiveSummary: next })}
            placeholder={`Example:\n\nI was tasked with performing an internal penetration test towards the Offensive Security Exam environment. The objective was to evaluate the security posture of the exam network and identify exploitable vulnerabilities.\n\nDuring the assessment, I was able to gain access to X out of Y target machines. The targets included both standalone systems and an Active Directory domain environment...\n\nOverall, several critical and high-severity vulnerabilities were identified...`}
            minHeight={200}
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
          <MarkdownEditor
            value={data.methodology}
            onChange={(next) => update({ methodology: next })}
            placeholder="Describe the methodology used..."
            minHeight={200}
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
          <MarkdownEditor
            value={data.toolsUsed}
            onChange={(next) => update({ toolsUsed: next })}
            placeholder="List tools used during the assessment..."
            minHeight={100}
            preview={false}
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
