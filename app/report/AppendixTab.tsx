"use client";

import { ReportData } from "./types";
import MarkdownEditor from "./MarkdownEditor";

interface Props {
  data: ReportData;
  update: (patch: Partial<ReportData>) => void;
}

export default function AppendixTab({ data, update }: Props) {
  return (
    <div className="space-y-6">
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-custom flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-custom" />
          Appendix
        </h3>
        <p className="text-xs text-dim leading-relaxed">
          Include any supplementary information: custom scripts, additional tool output, 
          proof file hashes, or any other information that supports your findings.
        </p>
        <MarkdownEditor
          value={data.appendix}
          onChange={(next) => update({ appendix: next })}
          placeholder={`Appendix A: Custom Scripts
---
[Include any custom scripts or exploits used]

Appendix B: Proof Hashes
---
Machine 1 - local.txt: <hash>
Machine 1 - proof.txt: <hash>
...

Appendix C: Additional Tool Output
---
[Any other relevant output]`}
          minHeight={300}
          mono
        />
      </div>

      {/* Proof Summary Table */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-success flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          Proof Summary
        </h3>
        <div className="overflow-hidden rounded border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface2 text-dim font-mono text-xs">
                <th className="px-4 py-2 text-left">Target</th>
                <th className="px-4 py-2 text-left">IP</th>
                <th className="px-4 py-2 text-left">local.txt</th>
                <th className="px-4 py-2 text-left">proof.txt</th>
                <th className="px-4 py-2 text-center">local 📷</th>
                <th className="px-4 py-2 text-center">proof 📷</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.targets.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 font-mono text-core">{t.name || "—"}</td>
                  <td className="px-4 py-2 font-mono text-sm">{t.ip || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-warn">{t.localTxt || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-success">{t.proofTxt || "—"}</td>
                  <td className="px-4 py-2 text-center">
                    {t.localScreenshot ? <span className="text-success">✓</span> : <span className="text-red">✗</span>}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {t.proofScreenshot ? <span className="text-success">✓</span> : <span className="text-red">✗</span>}
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
