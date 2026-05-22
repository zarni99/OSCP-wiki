"use client";

import { CheckCircle2, FileLock2, Shield } from "lucide-react";
import { ReportData } from "./types";

const field = "rounded border border-violet/40 bg-surface px-3 py-2 text-bright placeholder:text-dim/60 focus:border-core/60 outline-none";
const label = "block mb-1 text-xs font-mono uppercase tracking-wider text-dim";

interface Props {
  data: ReportData;
  update: (patch: Partial<ReportData>) => void;
}

export default function CoverTab({ data, update }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="color-panel rounded-lg p-6 text-center space-y-3">
        <Shield size={40} className="mx-auto text-core" />
        <h2 className="font-heading text-2xl text-gradient-brand">
          Offensive Security
        </h2>
        <p className="font-heading text-lg text-violet">
          OSCP+ Penetration Test Report
        </p>
        <div className="mx-auto h-px w-48 bg-gradient-to-r from-transparent via-violet/50 to-transparent" />
        <p className="text-xs text-dim font-mono">CONFIDENTIAL</p>
      </div>

      {/* Candidate Information */}
      <div className="color-panel rounded-lg p-5 space-y-4">
        <h3 className="font-heading text-lg text-core flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-core" />
          Candidate Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label}>Full Name</label>
            <input value={data.candidateName} onChange={(e) => update({ candidateName: e.target.value })} placeholder="John Doe" className={`${field} w-full`} spellCheck={false} autoComplete="off" />
          </div>
          <div>
            <label className={label}>OS-ID</label>
            <input value={data.osid} onChange={(e) => update({ osid: e.target.value })} placeholder="OS-XXXXX" className={`${field} w-full`} spellCheck={false} autoComplete="off" />
          </div>
          <div>
            <label className={label}>Email Address</label>
            <input value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="candidate@email.com" className={`${field} w-full`} spellCheck={false} autoComplete="off" />
          </div>
          <div>
            <label className={label}>Exam Date</label>
            <input type="date" value={data.examDate} onChange={(e) => update({ examDate: e.target.value })} className={`${field} w-full`} />
          </div>
          <div>
            <label className={label}>Report Date</label>
            <input type="date" value={data.reportDate} onChange={(e) => update({ reportDate: e.target.value })} className={`${field} w-full`} />
          </div>
          <div>
            <label className={label}>Report Version</label>
            <input value={data.version} onChange={(e) => update({ version: e.target.value })} placeholder="1.0" className={`${field} w-full`} spellCheck={false} autoComplete="off" />
          </div>
        </div>
      </div>

      {/* Export Template */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-orange flex items-center gap-2">
          <FileLock2 size={16} />
          Export Template
        </h3>
        <p className="text-xs text-dim leading-relaxed">
          Pick the section structure used when generating the PDF and Markdown exports.
          The Official OSCP Template matches Offsec&apos;s PWK report format exactly, including
          required boilerplate (Objective, Requirements, Recommendations) and the 4.X.1–4.X.6 finding structure.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <label
            className={`cursor-pointer rounded-md border p-4 transition ${
              !data.useOfficialTemplate
                ? "border-core/60 bg-core/5 shadow-[0_0_8px_rgba(73,184,255,0.1)]"
                : "border-border hover:border-violet/40"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="radio"
                name="template"
                checked={!data.useOfficialTemplate}
                onChange={() => update({ useOfficialTemplate: false })}
                className="mt-1 accent-core"
              />
              <div className="flex-1">
                <p className="font-mono text-sm text-bright flex items-center gap-2">
                  Flexible
                  {!data.useOfficialTemplate && <CheckCircle2 size={12} className="text-core" />}
                </p>
                <p className="mt-1 text-xs text-dim leading-relaxed">
                  Free-form structure. Sections numbered 1.0 → N.0. Good for practice runs and labs.
                </p>
              </div>
            </div>
          </label>

          <label
            className={`cursor-pointer rounded-md border p-4 transition ${
              data.useOfficialTemplate
                ? "border-orange/60 bg-orange/5 shadow-[0_0_8px_rgba(204,144,24,0.15)]"
                : "border-border hover:border-violet/40"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="radio"
                name="template"
                checked={!!data.useOfficialTemplate}
                onChange={() => update({ useOfficialTemplate: true })}
                className="mt-1 accent-orange"
              />
              <div className="flex-1">
                <p className="font-mono text-sm text-bright flex items-center gap-2">
                  Official OSCP Template
                  {data.useOfficialTemplate && <CheckCircle2 size={12} className="text-orange" />}
                </p>
                <p className="mt-1 text-xs text-dim leading-relaxed">
                  Offsec PWK report structure. Required for OSCP+ submissions. Adds Objective &amp;
                  Requirements boilerplate, uses 4.X.1–4.X.6 finding subsections, renames
                  &quot;Exploitation&quot; → &quot;Initial Access&quot; and &quot;Post-Exploitation&quot; → &quot;Maintaining Access&quot;.
                </p>
              </div>
            </div>
          </label>
        </div>
        {data.useOfficialTemplate && (
          <p className="rounded border border-orange/30 bg-orange/5 px-3 py-2 font-mono text-[11px] text-orange/90">
            <strong>Official template active.</strong> The PDF/Markdown will follow Offsec&apos;s exact section
            ordering and include required boilerplate sentences. You can switch back anytime — your data
            stays the same.
          </p>
        )}
      </div>

      {/* Document Control */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-violet flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet" />
          Document Control
        </h3>
        <div className="overflow-hidden rounded border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface2 text-dim font-mono text-xs">
                <th className="px-4 py-2 text-left">Field</th>
                <th className="px-4 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="px-4 py-2 text-dim">Title</td><td className="px-4 py-2">OSCP+ Penetration Test Report</td></tr>
              <tr><td className="px-4 py-2 text-dim">Author</td><td className="px-4 py-2">{data.candidateName || "—"}</td></tr>
              <tr><td className="px-4 py-2 text-dim">OS-ID</td><td className="px-4 py-2 font-mono text-core">{data.osid || "—"}</td></tr>
              <tr><td className="px-4 py-2 text-dim">Version</td><td className="px-4 py-2">{data.version || "1.0"}</td></tr>
              <tr><td className="px-4 py-2 text-dim">Classification</td><td className="px-4 py-2 text-red font-mono text-xs">CONFIDENTIAL</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
